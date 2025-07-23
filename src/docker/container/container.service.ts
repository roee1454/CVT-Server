import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as DockerClient from 'dockerode'
import { ContainerInfo } from 'src/types/types';
import { DockerService } from '../docker.service';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs'
import * as tar from 'tar-fs'
import * as path from 'path'
import type { ImageBuildOptions } from 'dockerode'
import { Observable, Subject } from 'rxjs';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ContainerEntity } from './container.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContainerService {
    private readonly dockerClient: DockerClient;
    private readonly logger = new Logger(DockerService.name)
    private buildLogStreams: Map<string, Subject<MessageEvent>> = new Map();

    constructor (private readonly dockerService: DockerService, @InjectRepository(ContainerEntity) private readonly containerRepository: Repository<ContainerEntity>) {
        this.dockerClient = this.dockerService.getDockerClient()
    }

    getBuildLogStream(buildId: string): Observable<MessageEvent> {
        if (!this.buildLogStreams.has(buildId)) {
        this.buildLogStreams.set(buildId, new Subject<MessageEvent>());
        }
        return this.buildLogStreams.get(buildId)!.asObservable();
    }

    listDatabaseContainers() {
        return this.containerRepository.find();
    }

    private insertContainer(containerInfo: ContainerInfo) {
        return this.containerRepository.insert({ ...containerInfo, environmentVariables: containerInfo.environmentVariables as any || [""] });
    }

    private getContainerByBuildId(buildId: string) {
        return this.containerRepository.findOneBy({ buildId });
    }

    private emitLog(buildId: string, line: string) {
        const stream = this.buildLogStreams.get(buildId);
        if (stream) {
            stream.next({ data: line } as any);
        }
    }

    public async listAllocatedPorts() {
        try {
            const containers = await this.dockerClient.listContainers()
            return containers.map(container => {
                return container.Ports.map(port => ({ publicPort: port.PublicPort, privatePort: port.PrivatePort, type: port.Type, ip: port.IP }))
            }).flat(1)
        } catch(err) {
            this.logger.error(err)
            throw new InternalServerErrorException(err)
        }
    }

    private async isPublicPortAllocated(publicPort: string) {
        try {
            const allocatedPorts = await this.listAllocatedPorts();
            return allocatedPorts.some(port => port.publicPort === parseInt(publicPort))
        } catch (err) {
            this.logger.error(err)
            throw new InternalServerErrorException(err)
        }
    }

    public async listContainers() {
        return await this.dockerClient.listContainers({ all: true });
    }

    public async getContainerState(id: string) {
        return (await this.dockerClient.getContainer(id).inspect()).State.Status
    }

    public async restartContainer(id: string) {
        try {
            await this.dockerClient.getContainer(id).restart();
            return `Container ${id} restarted!`
        } catch (err) {
            console.error(err)
            throw new InternalServerErrorException("Failed to restart container")
        }
    }

    public async createContainer(containerInfo: ContainerInfo) {
        this.logger.log(`Starts to create a new container...`);
        
        if (!containerInfo.hostPort || !this.isPublicPortAllocated(containerInfo.hostPort)) {
            throw new BadRequestException("Error, port is already allocated, please choose a different port!")
        }

        try {
            await this.insertContainer(containerInfo)
            return containerInfo.buildId;
        } catch (err) {
            this.logger.error(err);
            throw new InternalServerErrorException(`Failed to create container row on database table. ${err}`)
        }
    }

    public async buildContainer(buildId: string, file: Express.Multer.File) {
    const tempDir = `./files/docker/container/temp/${buildId}`;
    const extractedDir = path.join(tempDir, path.parse(file.originalname).name);

    try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
        await fs.promises.mkdir(tempDir, { recursive: true });

        if (file.mimetype === "application/x-zip-compressed" || file.mimetype === "application/zip") {
            try {
                const zip = new AdmZip(file.path);
                this.logger.log("Created AdmZip instance");

                for (const entry of zip.getEntries()) {
                    if (entry.entryName.includes("..")) {
                        this.emitLog(buildId, "[BUILD_ERROR]");
                        this.emitLog(buildId, "Zip file contains invalid path traversal entries")
                        throw new Error("Zip file contains invalid path traversal entries");
                    }
                }

                zip.extractAllTo(tempDir, true);
                this.logger.log("Extracted zip content");

                await fs.promises.rm(file.path);
                this.logger.log("Deleted uploaded zip file");
            } catch (zipErr) {
                this.logger.error(`ZIP extraction failed: ${zipErr.message}`);
                this.emitLog(buildId, "[BUILD_ERROR]");
                this.emitLog(buildId, `ZIP extraction failed: ${zipErr.message}`)
                throw new InternalServerErrorException("Invalid ZIP file or extraction error");
            }
        } else {
            throw new BadRequestException("Unsupported file type, only ZIP files are allowed");
        }
        
        const dockerfilePath = path.join(extractedDir, "Dockerfile");
        const dockerfileExists = await fs.promises
            .access(dockerfilePath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

        if (!dockerfileExists) {
            this.emitLog(buildId, "[BUILD_ERROR]");
            this.emitLog(buildId, `Missing Dockerfile at ${dockerfilePath}`)
            this.logger.error(`Missing Dockerfile at ${dockerfilePath}`);
            throw new InternalServerErrorException("Dockerfile not found in extracted archive");
        }

        const tarStream = tar.pack(extractedDir);
        this.logger.log("Created tar stream from extracted directory");

        const containerInfo = await this.getContainerByBuildId(buildId);
        if (!containerInfo) {
            throw new InternalServerErrorException("Failed to fetch container info from build ID");
        }

        const buildOptions: ImageBuildOptions = {
            t: containerInfo.image,
            networkmode: "bridge",
            dockerfile: "Dockerfile",
        };

        this.emitLog(buildId, "[BUILD_START]");

        const buildStream = await this.dockerClient.buildImage(tarStream, buildOptions);

        return await new Promise((resolve, reject) => {
            this.dockerClient.modem.followProgress(
                buildStream,
                async (err, result) => {
                    try {
                        if (err) {
                            this.emitLog(buildId, `Build failed: ${err.message}`);
                            this.emitLog(buildId, "[BUILD_ERROR]");
                            this.logger.error(`Docker build error: ${err.message}`);
                            return reject(err);
                        }

                        this.logger.log(`Image build completed`);
                        if (result?.length) {
                            this.logger.log(`Final build output: ${JSON.stringify(result[result.length - 1])}`);
                        }

                        const images = await this.dockerClient.listImages();
                        const imageExists = images.some(img =>
                            img.RepoTags?.includes(`${containerInfo.image}:latest`)
                        );

                        if (!imageExists) {
                            this.emitLog(buildId, `Image ${containerInfo.image}:latest not found`);
                            this.emitLog(buildId, "[BUILD_ERROR]");
                            throw new Error(`Image ${containerInfo.image}:latest not found after build`);
                        }

                        const container = await this.dockerClient.createContainer({
                            name: containerInfo.name,
                            Image: containerInfo.image,
                            Hostname: "localhost",
                            HostConfig: {
                                PortBindings: {
                                    [`${containerInfo.hostPort}/tcp`]: [
                                        {
                                            HostPort: containerInfo.hostPort,
                                            HostIp: "0.0.0.0",
                                        },
                                    ],
                                },
                            },
                            ExposedPorts: {
                                [`${containerInfo.hostPort}/tcp`]: {},
                            },
                        });

                        this.emitLog(buildId, "[BUILD_COMPLETE]");
                        this.emitLog(buildId, `ContainerId-${container.id}`);

                        const inspected = await container.inspect();

                        await this.containerRepository.update(containerInfo.id, {
                            ...containerInfo,
                            containerId: container.id,
                            state: inspected.State.Status,
                        });

                        return resolve(container);
                    } catch (innerErr) {
                        this.logger.error(`Container creation failed: ${innerErr.message}`);
                        this.emitLog(buildId, "[BUILD_ERROR]");
                        return reject(innerErr);
                    } finally {
                        try {
                            await fs.promises.rm(tempDir, { recursive: true, force: true });
                            this.logger.log(`Cleaned up temp folder for build ${buildId}`);
                        } catch (cleanupErr) {
                            this.logger.warn(`Failed to clean up temp dir: ${cleanupErr.message}`);
                        }
                    }
                },
                event => {
                    if (event?.stream) {
                        const line = event.stream.trim();
                        this.logger.log(line);
                        this.emitLog(buildId, line);
                    }
                }
            );
        });
    } catch (err) {
        this.logger.error(`Container build failed for buildId ${buildId}: ${err.message}`);
        throw new InternalServerErrorException("Failed to create a new container for this host");
    }
}

    public async startContainer(id: string) {
        try {
            await this.dockerClient.getContainer(id).start();
            return `Container ${id} started!`
        } catch (err) {
            console.error(err)
            throw new InternalServerErrorException("Failed to start container")
        }
    }

    public async stopContainer(id: string) {
        try {
            await this.dockerClient.getContainer(id).stop();
            return `Container ${id} stopped!`
        } catch (err) {
            console.error(err)
            throw new InternalServerErrorException("Failed to stop container")
        }
    }
    
    public async removeContainer(id: string) {
        try {
            await this.dockerClient.getContainer(id).remove();
            await this.containerRepository.delete({ containerId: id } as FindOptionsWhere<ContainerEntity>)
            return `Container ${id} removed!`
        } catch (err) {
            console.error(err)
            throw new InternalServerErrorException("Failed to restart container")
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES, { name: "container-health-check" })
    private async healthCheckContainers() {
        const containers = await this.dockerClient.listContainers({ all: true })
        for (const container of containers) {
            try {
              await this.healthCheckContainer(container.Id)
            } catch (err) {
                this.logger.error(`Container "${container.Id}" did not pass health check`)
            }
        }
    }


    private async healthCheckContainer(containerId: string) {
        this.logger.log(`Checking container "${containerId}..."`)
        try {
            const container = this.dockerClient.getContainer(containerId)
            const info = await container.inspect();
            if (info.State.Running) {
                this.logger.log(`Container "${containerId}" is already running`)
            } else if (info.State.Paused) {
                this.logger.log(`Container "${containerId}" is not paused, attempting to resume...`)
                await container.unpause();
                this.logger.log(`Container "${containerId}" started successfully.`)
            } else {
                this.logger.log(`Container "${containerId}" is not running, attempting to restart...`)
                await container.restart();
                this.logger.log(`Container "${containerId}" started successfully.`)
            }
            return await container.inspect()
        } catch (err) {
            this.logger.error(`Failed to health check container ${containerId}:`, err.message || err)
            throw err;
        }
    }
}

import { Body, Controller, Get, HttpCode, Param, Post, Sse, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContainerService } from './container.service';
import { ContainerInfo } from 'src/types/types';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Observable } from 'rxjs';
import { TechGuard } from 'src/auth/auth.guard';

@Controller('docker/container')
export class ContainerController {
    constructor (private readonly containerService: ContainerService) {}
    @Get("ls")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async listContainers() {
        return await this.containerService.listDatabaseContainers()
    }

    @Sse('build-logs/:buildId')
    @UseGuards(TechGuard)
    getLogs(@Param('buildId') buildId: string): Observable<MessageEvent> {
        return this.containerService.getBuildLogStream(buildId);
    }

    @Post("new")
    @HttpCode(200)
    @UseGuards(TechGuard)
    public async createContainer(@Body() containerInfo: ContainerInfo) {
        return await this.containerService.createContainer(containerInfo)
    }

    @Post("new/build/:buildId")
    @UseInterceptors(FileInterceptor("file", { storage: multer.diskStorage({
        destination(_, _file, callback) {
            callback(null, `./files/docker/container/temp`)
        },
        filename(_, file, callback) {
            callback(null, file.originalname)
        }
    })}))
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async buildContainer(@Param("buildId") buildId: string, @UploadedFile() containerFile: Express.Multer.File) {
        return await this.containerService.buildContainer(buildId, containerFile);
    }

    @Get("state/:id")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async getContainerState(@Param("id") id: string) {
        return await this.containerService.getContainerState(id);
    }

    @Get("restart/:id")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async restartContainer(@Param("id") id: string) {
        return await this.containerService.restartContainer(id)
    }

    @Get("start/:id")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async startContainer(@Param("id") id: string) {
        return await this.containerService.startContainer(id)
    }

    @Get("stop/:id")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async stopContainer(@Param("id") id: string) {
        return await this.containerService.stopContainer(id)
    }

    @Get("remove/:id")
    @UseGuards(TechGuard)
    @HttpCode(200)
    public async removeContainer(@Param("id") id: string) {
        return await this.containerService.removeContainer(id)
    }
}
import { Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';

@Injectable()
export class DockerService {
    
    private dockerClient: Dockerode;
    
    constructor() { this.dockerClient = new Dockerode({ socketPath: "/var/run/docker.sock" }) }
    
    public getDockerClient(): Dockerode {
        return this.dockerClient
    }
}

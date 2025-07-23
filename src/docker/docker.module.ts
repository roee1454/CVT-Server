import { Module } from '@nestjs/common';
import { ContainerModule } from './container/container.module';
import { DockerService } from './docker.service';

@Module({
    imports: [ContainerModule],
    providers: [DockerService],
})

export class DockerModule {}

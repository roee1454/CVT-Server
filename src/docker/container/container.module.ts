import { Module } from '@nestjs/common';
import { ContainerController } from './container.controller';
import { ContainerService } from './container.service';
import { DockerService } from '../docker.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareEntity } from 'src/software/software.entity';
import { SoftwareService } from 'src/software/software.service';
import { ContainerEntity } from './container.entity';
import { FileEntity } from 'src/files/files.entity';
import { FilesService } from 'src/files/files.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SoftwareEntity, ContainerEntity, FileEntity])],
  controllers: [ContainerController],
  providers: [ContainerService, DockerService, SoftwareService, FilesService],
  exports: [ContainerService]
})
export class ContainerModule {}

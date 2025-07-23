import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { FilesModule } from 'src/files/files.module';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/files.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ProjectEntity, FileEntity]), FilesModule],
  controllers: [ProjectController],
  providers: [ProjectService, FilesService]
})
export class ProjectModule {}

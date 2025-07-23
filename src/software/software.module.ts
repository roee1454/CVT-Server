import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareEntity } from './software.entity';
import { SoftwareController } from './software.controller';
import { SoftwareService } from './software.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/user/user.entity';
import { FilesModule } from 'src/files/files.module';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/files.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SoftwareEntity, UserEntity, FileEntity]), FilesModule],
  controllers: [SoftwareController],
  providers: [SoftwareService, AuthService, UserService, JwtService, FilesService],
  exports: [SoftwareService]
})

export class SoftwareModule {}
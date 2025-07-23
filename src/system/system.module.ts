import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemEntity } from './system.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { FilesService } from 'src/files/files.service';
import { FilesModule } from 'src/files/files.module';
import { FileEntity } from 'src/files/files.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemEntity, FileEntity]), AuthModule],
  controllers: [SystemController],
  providers: [SystemService, AuthService, FilesService]
})
export class SystemModule {}

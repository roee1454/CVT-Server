import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './files.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), AuthModule],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}

import { BadRequestException, Controller, Delete, Get, Header, Param, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { TechGuard } from 'src/auth/auth.guard';
import { FileSizeValidationPipe, FileTypeValidationPipe } from './files.pipe';
import * as multer from 'multer';
import { Response } from 'express';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {};
    
    @Post("guides")
    @UseInterceptors(FilesInterceptor("files", 15, { storage: multer.diskStorage({
        destination: "./files/guides",
        filename: (_, file, callback) => {
            return callback(null, `${new Date().toISOString()}-${Buffer.from(file.originalname, "latin1").toString("utf8")}`);
        }
    })}))
    @UseGuards(TechGuard)
    public async uploadGuides(@UploadedFiles(new FileTypeValidationPipe(), new FileSizeValidationPipe()) files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException("No files uploaded!");
        }
        return await this.filesService.uploadFiles(files)
    }

    @Get("guides")
    public async getGuideFiles() {
      return await this.filesService.getFiles("./files/guides");
    }

    @Get()
    public async getFilesByDirectory(
        @Query('directory') directory: string,
    ) {
        if (!directory) {
        throw new BadRequestException("Directory parameter is required");
        }
        return await this.filesService.getFiles(directory);
    }

    @Get(':id')
    public async getFileById(@Param('id') id: string) {
        return await this.filesService.getFileById(id);
    }

    @Get('view/:id')
    public async viewFileById(@Param('id') id: string, @Res() response: Response) {
        return await this.filesService.viewFileById(id, response);
    }


    @Get('download/:id')
    @Header('Content-Type', 'application/octet-stream')
    public async downloadFileById(@Param('id') id: string) {
        return await this.filesService.downloadFileById(id);
    }


    @Get('download/dir/:dir')
    @Header('Content-Type', 'application/octet-stream')
    public async downloadZipFromDirectory(@Param('dir') dir: string) {
        return await this.filesService.downloadZipFromDirectory(`./files/${dir}`);
    }

    @Delete(':id')
    @UseGuards(TechGuard)
    public async removeFile(@Param('id') fileId: string) {
        if (!fileId) {
            throw new BadRequestException("`id` parameter is required");
        }
        return await this.filesService.removeFile(fileId);
    }

    @Delete('directory')
    @UseGuards(TechGuard)
    public async removeFilesByDirectory(@Query('directory') directory: string) {
        if (!directory) {
        throw new BadRequestException("Directory parameter is required");
        }
        return await this.filesService.removeFilesByDirectory(directory);
    }
}
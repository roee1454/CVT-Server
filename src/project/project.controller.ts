import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard, TechGuard } from 'src/auth/auth.guard';
import { FileSizeValidationPipe, FileTypeValidationPipe } from 'src/files/files.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer'
import { FilesService } from 'src/files/files.service';
import * as fs from 'fs'
import { Response } from 'express';
import { CreateNewProjectDto, UpdateProjectDto } from 'src/types/types';

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService, private readonly filesService: FilesService) {};
    @Get(":id")
    @HttpCode(200)
    @UseGuards(AuthGuard)
    public async findOne(@Param("id") id: string) {
        return await this.projectService.findOne(id);
    }

    @Get("")
    @HttpCode(200)
    @UseGuards(AuthGuard)
    public async findAll() {
        return await this.projectService.findAll();
    }

    @Post("new")
    @HttpCode(200)
    @UseGuards(TechGuard)
    public async create(@Body() createProjectDto: CreateNewProjectDto) {
        return await this.projectService.create(createProjectDto);
    }

    @Put(":id")
    @HttpCode(200)
    @UseGuards(TechGuard)
    public async update(@Body() updateProjectDto: UpdateProjectDto, @Param("id") id: string) {
        return await this.projectService.update(id, updateProjectDto);
    }

    @Delete(":id")
    @HttpCode(200)
    @UseGuards(TechGuard)
    public async remove(@Param("id") id: string) {
        return await this.projectService.remove(id);
    }

    @Post(":id/files")
    @UseGuards(TechGuard)
    @UseInterceptors(FilesInterceptor("files", 15, { storage: multer.diskStorage({
        destination: (req, _, callback) => {
            const projectId = req.params.id;
            const path = `./files/projects/${projectId}`
            fs.mkdirSync(path, { recursive: true });
            callback(null, path);
        },
        filename: (_, file, callback) => {
            return callback(null, `${new Date().toISOString()}-${file.originalname}`);
        }
    })}))
    public async uploadFiles(@UploadedFiles(new FileSizeValidationPipe(), new FileTypeValidationPipe()) files: Express.Multer.File[]) {
        return await this.filesService.uploadFiles(files)
    }

    @Delete(":id/files/:fileId")
    @UseGuards(TechGuard)
    public async removeFile(@Param("fileId") fileId: string) {
        return await this.filesService.removeFile(fileId)
    }

    @Get(":id/files")
    @HttpCode(200)
    public async getFiles(@Param("id") id: string) {
        return await this.filesService.getFiles(`./files/projects/${id}`)
    }

    @Get(":id/files/zip")
    @HttpCode(200)
    public async downloadZip(@Param("id") id: string) {
        return await this.filesService.downloadZipFromDirectory(`./files/projects/${id}`)
    }

    @Get(":id/files/:fileId")
    @HttpCode(200)
    public async downloadFile(@Param("fileId") fileId: string) {
        return await this.filesService.downloadFileById(fileId)
    }
}
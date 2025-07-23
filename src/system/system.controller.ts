import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateSystemDto, UpdateSystemDto } from 'src/types/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { SystemService } from './system.service';
import { TechGuard } from 'src/auth/auth.guard';
import * as multer from 'multer';
import { FileSizeValidationPipe, FileTypeValidationPipe } from 'src/files/files.pipe';

const storage = multer.diskStorage({
    destination(_, _file, callback) {
        callback(null, `./files/system/images`)
    },
    filename(_, file, callback) {
        callback(null, file.originalname)
    }
})

@Controller('system')
export class SystemController {
    constructor (
        private systemService: SystemService
    ) {}

    @Get("ls")
    public async findAllSystems() {
        return await this.systemService.findAllSystems();
    }

    @Get(":id")
    public async findSystem(@Param("id") id: string) {
        return await this.systemService.findSystem(id);
    }
    
    @Post("new")
    @UseGuards(TechGuard)
    @UseInterceptors(FileInterceptor("image", { storage }))
    public async insertSystem(@Body() createSystemDto: CreateSystemDto, @UploadedFile(new FileSizeValidationPipe(), new FileTypeValidationPipe()) image: Express.Multer.File) {
        return await this.systemService.insertSystem(createSystemDto, image);
    }

    @Put(":id")
    @UseGuards(TechGuard)
    public async updateSystem(@Param("id") id: string, @Body() updateSystemDto: UpdateSystemDto) {
        return await this.systemService.updateSystem(id, updateSystemDto);
    }

    @Delete(":id")
    @UseGuards(TechGuard)
    public async deleteSystem(@Param('id') id: string) {
        return await this.systemService.deleteSystem(id);
    }
}

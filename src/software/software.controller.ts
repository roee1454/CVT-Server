import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SoftwareService } from './software.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CreateSoftwareDto } from 'src/types/types';


@Controller('software')
export class SoftwareController {
    constructor(private readonly softwareService: SoftwareService) {}
    @Post("new")
    @UseInterceptors(FileInterceptor("image", { storage: multer.diskStorage({
        destination(_, _file, callback) {
            callback(null, `./files/software/images`)
        },
        filename(_, file, callback) {
            callback(null, file.originalname)
        }
    })}))
    @HttpCode(200)
    public async createSoftware(@Body() createSoftwareDto: CreateSoftwareDto, @UploadedFile() image: Express.Multer.File) {
        return await this.softwareService.create({ ...createSoftwareDto, containers: [] }, image);
    } 

    @Get("ls")
    @HttpCode(200)
    public async listSoftware() {
        return await this.softwareService.findAll();
    }

    @Put(":softwareId")
    @HttpCode(200)
    public async updateSoftware(@Param("softwareId") softwareId: string, @Body() data: CreateSoftwareDto) {
        return await this.softwareService.update(softwareId, data);
    }

    @Delete(":softwareId")
    @HttpCode(200)
    public async deleteSoftware(@Param("softwareId") softwareId: string) {
        return await this.softwareService.remove(softwareId);
    }
}

import { Injectable } from '@nestjs/common';
import { SoftwareEntity } from './software.entity';
import { Repository, UpdateResult, ArrayContains } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class SoftwareService {
    constructor(
        @InjectRepository(SoftwareEntity) 
        private projectRepository: Repository<SoftwareEntity>,
        private readonly fileService: FilesService
    ) {}

    findAll(): Promise<SoftwareEntity[]> {
        return this.projectRepository.find();
    }

    findOneByTitle(title: string): Promise<SoftwareEntity | null> {
        return this.projectRepository.findOne({ where: { title } })
    }

    findOneByContainer(containerId: string): Promise<SoftwareEntity | null> {
        return this.projectRepository.findOne({ where: { containers: ArrayContains([containerId]) } })
    }

    findOne(id: string): Promise<SoftwareEntity | null> {
        return this.projectRepository.findOne({ where: { id } })
    }

    async create(softwareData: Partial<SoftwareEntity>, image: Express.Multer.File) {
        const [uploadedFile] = await this.fileService.uploadFiles([image]);
        return this.projectRepository.insert({...softwareData, imageId: uploadedFile.id});
    }

    update(id: string, projectData: Partial<SoftwareEntity>): Promise<UpdateResult> {
        return this.projectRepository.update(id, { ...projectData })
    }

    async remove(id: string): Promise<void> {
        await this.projectRepository.delete(id);
    }
}
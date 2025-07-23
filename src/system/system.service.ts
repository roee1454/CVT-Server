import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemEntity } from './system.entity';
import { Repository } from 'typeorm';
import { CreateSystemDto, UpdateSystemDto } from 'src/types/types';
import { createSystemSchema } from 'src/types/schemas';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class SystemService {
    private logger = new Logger(SystemService.name);
    constructor(
        @InjectRepository(SystemEntity) 
        private systemRepository: Repository<SystemEntity>,
        private fileService: FilesService
    ) {}

    public findAllSystems() {
        return this.systemRepository.find();
    }

    public findSystem(id: string) {
        return this.systemRepository.findOne({ where: { id } });
    }

    public async insertSystem(createSystemDto: CreateSystemDto, file: Express.Multer.File) {
        this.logger.log(createSystemDto)
        
        if (!createSystemSchema.safeParse({ ...createSystemDto, contacts: JSON.parse(createSystemDto.contacts as any) }).success) {
            this.logger.error(`Failed to parse schema because: ${createSystemSchema.safeParse(createSystemDto).error}`)
            throw new BadRequestException("Error: invalid `system` schema");
        }

        try {
            const result = await this.fileService.uploadFiles([file]);
            return await this.systemRepository.insert({ ...createSystemDto, imageId: result[0].id });
        } catch (err: any) {
            this.logger.error(err);
            throw new InternalServerErrorException(err);
        }
    }

    public updateSystem(id: string, updateSystemDto: UpdateSystemDto) {
        const { image, ...other } = updateSystemDto as any;
        return this.systemRepository.update(id, { ...other });
    }

    public deleteSystem(id: string) {
        return this.systemRepository.delete(id);
    }
}

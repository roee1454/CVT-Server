import { Injectable } from '@nestjs/common';
import { ProjectEntity } from './project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ProjectService {

    constructor(@InjectRepository(ProjectEntity) private readonly projectRepository: Repository<ProjectEntity>) {}

    findAll(): Promise<ProjectEntity[]> {
        return this.projectRepository.find();
    }

    findOne(id: string): Promise<ProjectEntity | null> {
        return this.projectRepository.findOne({ where: { id } })
    }

    create(data: Partial<ProjectEntity>): Promise<InsertResult> {
        return this.projectRepository.insert({ ...data })
    }

    update(id: string, data: Partial<ProjectEntity>): Promise<UpdateResult> {
        return this.projectRepository.update(id, { ...data })
    }

    async remove(id: string): Promise<void> {
        await this.projectRepository.delete(id);
    }
}

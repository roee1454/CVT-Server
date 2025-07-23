import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { InsertResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>) {}

    findAll(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    findOneByEmail(email: string): Promise<UserEntity | null> {
        return this.usersRepository.findOne({ where: { email } })
    }


    findOne(id: string): Promise<UserEntity | null> {
        return this.usersRepository.findOne({ where: { id } })
    }

    create(userData: Partial<UserEntity>): Promise<InsertResult> {
        return this.usersRepository.insert({ ...userData })
    }

    update(id: string, userData: Partial<UserEntity>): Promise<UpdateResult> {
        return this.usersRepository.update(id, { ...userData })
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}

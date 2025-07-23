import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult } from 'typeorm';
import { AuthGuard, TechGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(TechGuard)
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(TechGuard)
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @UseGuards(TechGuard)
  async create(@Body() userData: Omit<UserEntity, 'id'>): Promise<InsertResult> {
    const existingUser = await this.userService.findOneByEmail(userData.email);
    if (existingUser) {
      throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
    }

    const result = await this.userService.create({ ...userData });

    return result;
  }

  @Put(':id')
  @UseGuards(TechGuard)
  async update(@Param('id') id: string, @Body() userData: Partial<UserEntity>): Promise<UserEntity | null> {
    const existingUser = await this.userService.findOne(id);
    if (!existingUser) throw new NotFoundException(`User with ID ${id} not found`);
    
    await this.userService.update(id, userData);
    return await this.userService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(TechGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.userService.remove(id);
    return { message: `User with ID ${id} has been successfully deleted` };
  }
}
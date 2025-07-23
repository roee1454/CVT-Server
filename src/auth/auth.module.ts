import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { AdminGuard, AuthGuard, TechGuard } from './auth.guard';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, TechGuard, AuthGuard, AdminGuard],
  exports: [AuthService, UserService, JwtService, TechGuard, AuthGuard, AdminGuard]
})
export class AuthModule {}

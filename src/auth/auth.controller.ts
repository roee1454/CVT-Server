import { Body, Controller, Get, HttpCode, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { CreateUserDto, LoginUserDto, PasswordResetDto } from 'src/types/types';
import { AuthGuard, TechGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post("/login")
    @HttpCode(200)   
    public async login(@Res({ passthrough: true }) response: Response, @Body() loginUserDto: LoginUserDto) {
        return await this.authService.loginUser(response, loginUserDto);
    }

    @UseGuards(TechGuard)
    @Put("password-reset/:id")
    @HttpCode(200)
    public async passwordRest(@Body() passwordResetDto: PasswordResetDto, @Param("id") id: string) {
        return await this.authService.passwordReset(passwordResetDto, id);
    }

    @Post("/register")
    @HttpCode(200)   
    public async register(@Res({ passthrough: true }) response: Response, @Body() createUserDto: CreateUserDto) {
        return await this.authService.registerUser(response, createUserDto)
    }

    @Get("/logout")
    @HttpCode(200)
    public async logout(@Res({ passthrough: true }) response: Response) {
        return await this.authService.logout(response)
    }

    @Get("/me")
    @HttpCode(200)
    public async me(@Req() request: Request) {
        return await this.authService.getCurrentUser(request);
    }
}

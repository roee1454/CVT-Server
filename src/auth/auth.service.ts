import { Injectable, BadRequestException, ForbiddenException, InternalServerErrorException, UnauthorizedException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, PasswordResetDto } from 'src/types/types';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt'
import { createUserDtoSchema, loginUserDtoSchema, passwordResetSchema } from 'src/types/schemas';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    private readonly tokenExpiresIn = 60 * 60 * 24 * 30;

    private validateRegisterSchema(createUserDto: CreateUserDto): boolean {
        try {
            const result = createUserDtoSchema.safeParse(createUserDto);
            return result.success
        } catch (e) {
            throw new BadRequestException(e)
        }
    }

    private validateLoginSchema(createUserDto: LoginUserDto): boolean {
        try {
            const result = loginUserDtoSchema.safeParse(createUserDto);
            return result.success
        } catch (e) {
            throw new BadRequestException(e)
        }
    }

    private async encryptPassword(password: string): Promise<string> {
        const hashSalt = await bcrypt.genSalt();
        return await bcrypt.hash(password, hashSalt);
    }

    public validateToken(token: string) {
        return this.jwtService.verify(token, { secret: process.env.AUTH_SECRET_KEY })
    }

    public async passwordReset(passwordResetDto: PasswordResetDto, id: string) {
        if (!passwordResetSchema.safeParse(passwordResetDto).success) {
            throw new BadRequestException("Invalid or weak password, make sure you fill it with the correct secuirty level")
        }

        try {
            const hashSalt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(passwordResetDto.newPassword, hashSalt);
            await this.userService.update(id, { hash });
            return id;
        } catch (err) {
            throw new InternalServerErrorException("Failed to replace old password hash.")
        }

    }

    public async registerUser(response: Response, createUserDto: CreateUserDto): Promise<string> {
        if (!this.validateRegisterSchema(createUserDto)) {
            this.logger.log("Invalid schema")
            throw new BadRequestException("Invalid data schema")
        } 
        
        if (await this.userService.findOneByEmail(createUserDto.email)) {
            throw new ForbiddenException("User already exists for this email, please login!")
        }

        const hash = await this.encryptPassword(createUserDto.hash);

        if (!hash) throw new InternalServerErrorException("Something is wrong with us now, please try again later.");

        await this.userService.create({ ...createUserDto, hash, active: true, createdAt: new Date(), role: "user" });

        const user = await this.userService.findOneByEmail(createUserDto.email)

        if (!user) {
            throw new InternalServerErrorException(`Failed to create a user using given data: ${JSON.stringify(createUserDto)}`)
        }

        const token = await this.jwtService.signAsync(
            { id: user.id }, 
            { 
                secret: process.env.AUTH_SECRET_KEY,
                expiresIn: this.tokenExpiresIn 
            }
        );
        
        response.setHeader('Set-Cookie', []);
        
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (this.tokenExpiresIn * 1000));
        response.setHeader(
            "Set-Cookie", 
            `token=${token}; HttpOnly; Path=/; Expires=${expiryDate.toUTCString()}; SameSite=None; Secure=False;`
        );
        
        return token;
    }

    public async loginUser(response: Response, loginUserDto: LoginUserDto): Promise<string> {
        if (!this.validateLoginSchema(loginUserDto)) {
            throw new BadRequestException("Invalid data schema")
        } 

        const user = await this.userService.findOneByEmail(loginUserDto.email)
        if (!user) {
            throw new ForbiddenException("User does not exist")
        }

        if (!bcrypt.compareSync(loginUserDto.hash, user.hash)) {
            throw new UnauthorizedException("Invalid data schema")
        }

        const token = await this.jwtService.signAsync(
            { id: user.id }, 
            { 
                secret: process.env.AUTH_SECRET_KEY,
                expiresIn: this.tokenExpiresIn 
            }
        );  
        
        response.setHeader('Set-Cookie', []);
        
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (this.tokenExpiresIn * 1000));
        
        response.setHeader(
            "Set-Cookie", 
            `token=${token}; HttpOnly; Path=/; Expires=${expiryDate.toUTCString()}; SameSite=None; Secure=False;`
        );
        
        return token;
    }

    public async logout(response: Response) {
        response.setHeader('Set-Cookie', []);
        response.setHeader(
            "Set-Cookie", 
            "token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure=False;"
        );
    }

    public async getCurrentUser(request: Request) {
        const token = request.cookies["token"]
        
        if (!token || typeof token !== "string") {
            throw new NotFoundException("User is not found!")
        }

        let payload: { id: string };

        try {
            payload = await this.jwtService.verifyAsync(token, { secret: process.env.AUTH_SECRET_KEY })
        } catch (err) {
            throw new ConflictException("Malformed JWT Error: invalid token")
        }

        if (!payload.id || typeof payload.id !== "string") {
            throw new NotFoundException("User is not found!")
        }

        const user = await this.userService.findOne(payload.id);

        return user;
    }
}
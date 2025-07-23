import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, 
    ForbiddenException,
    Logger,} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name)
    constructor(private readonly authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest() as Request;
            const token = request.cookies["token"];
            if (!token) {
                throw new UnauthorizedException('Please provide token');
            }
            const resp = await this.authService.validateToken(token);
            (request as any).decodedData = resp;
            return true;
        } catch (error) {
            this.logger.error('Auth error - ', error.message);
            throw new ForbiddenException(error.message || 'session expired! Please sign In');
        }
    }
}

@Injectable()
export class AdminGuard implements CanActivate {
    private readonly logger = new Logger(AdminGuard.name)
    constructor(private readonly authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest() as Request;
            const token = request.cookies["token"];
            
            if (!token) {
                this.logger.warn('Please provide an auth token')
                throw new UnauthorizedException('Please provide an auth token');
            }
            
            const resp = await this.authService.validateToken(token);
            if (!resp.id || !resp.id.id) {
                this.logger.warn("Invalid auth token")
                throw new UnauthorizedException(`Invalid auth token`)
            }

            const user = await this.authService.getCurrentUser(request);
            if (!user || typeof user.role !== "string" || user.role !== "admin") {
                this.logger.warn(`Unauthorized role: "${user?.role}" for endpoint that requires at least role: admin`)
                throw new UnauthorizedException(`Unauthorized role: "${user?.role}" for endpoint that requires at least role: admin`)
            };

            (request as any).decodedData = resp;
            return true;
        } catch (error) {
            this.logger.error('Auth error - ', error.message);
            throw new ForbiddenException(error.message || 'session expired! Please sign In');
        }
    }
}

@Injectable()
export class TechGuard implements CanActivate {
    private readonly logger = new Logger(TechGuard.name)
    constructor(private readonly authService: AuthService) {};
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest() as Request;
            const token = request.cookies["token"];
            if (!token) {
                this.logger.warn("Please provide an auth token")
                throw new UnauthorizedException('Please provide an auth token');
            }

            const resp = await this.authService.validateToken(token);
            if (!resp.id) {
                this.logger.warn("Invalid auth token")
                throw new UnauthorizedException(`Invalid auth token`)
            }

            const user = await this.authService.getCurrentUser(request);
            if (!user || typeof user.role !== "string" || user.role === "user") {
                this.logger.warn(`Unauthorized role: "${user?.role}" for endpoint that requires at least role: tech`)
                throw new UnauthorizedException(`Unauthorized role: "${user?.role}" for endpoint that requires at least role: tech`)
            };

            (request as any).decodedData = resp;
            return true;
        } catch (error) {
            this.logger.error('Auth error - ', error.message);
            throw new ForbiddenException(error.message || 'session expired! Please sign In');
        }
    }
}
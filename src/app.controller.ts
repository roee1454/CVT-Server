import { Controller, Get, HttpCode } from '@nestjs/common'
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appSerivce: AppService) {}
    @Get()
    @HttpCode(200)
    public helloWorld() {
        return this.appSerivce.helloWorld();
    }
}
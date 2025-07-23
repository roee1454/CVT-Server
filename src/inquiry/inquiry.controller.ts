import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { InquiryService } from './inquiry.service';

@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {};
    @Post("send")
    @HttpCode(200)
    @UseGuards(AuthGuard)
    public async sendInquiry(@Body() inquiry: any) {
        return this.inquiryService.sendInquiry(inquiry);
    }
}

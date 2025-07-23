import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TechGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from 'src/types/types';

@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) {};

    @Get("ls")
    public async listMembers() {
        return await this.memberService.listMembers();
    }

    @Post("new")
    @UseGuards(TechGuard)
    public async newMember(memberDto: CreateMemberDto) {
        return await this.memberService.newMember(memberDto);
    }

    @Put(":id")
    @UseGuards(TechGuard)
    public async updateMember(@Param("id") memberId: string, memberDto: UpdateMemberDto) {
        return await this.memberService.updateMember(memberId, memberDto);
    }
}

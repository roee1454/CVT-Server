import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from './member.entity';
import { Repository } from 'typeorm';
import { CreateMemberDto, UpdateMemberDto } from 'src/types/types';
import { createMemberSchema, updateMemberSchema } from 'src/types/schemas';

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(MemberEntity) 
        private memberRepository: Repository<MemberEntity>
    ) {};

    listMembers() {
        return this.memberRepository.find();
    };

    getMember(memberId: string) {
        return this.memberRepository.findOne({ where: { id: memberId } })
    }

    newMember(memberDto: CreateMemberDto) {
        if (!createMemberSchema.safeParse(memberDto).success) {
            throw new BadRequestException("Invalid member data schema")
        }
        return this.memberRepository.insert(memberDto);
    }

    updateMember(memberId: string, memberDto: UpdateMemberDto) {
        if (!updateMemberSchema.safeParse(memberDto).success) {
            throw new BadRequestException("Invalid member data schema")
        }
        return this.memberRepository.update({ id: memberId }, memberDto);
    }

    deleteMember(memberId: string) {
        return this.memberRepository.delete({ id: memberId })
    }
}

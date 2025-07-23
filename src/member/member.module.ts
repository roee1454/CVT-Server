import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './member.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
  providers: [MemberService]
})
export class MemberModule {}

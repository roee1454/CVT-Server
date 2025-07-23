import { Module } from '@nestjs/common';
import { CatelogController } from './catelog.controller';
import { CatelogService } from './catelog.service';

@Module({
  controllers: [CatelogController],
  providers: [CatelogService]
})
export class CatelogModule {}

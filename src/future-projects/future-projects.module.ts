import { Module } from '@nestjs/common';
import { FutureProjectsController } from './future-projects.controller';
import { FutureProjectsService } from './future-projects.service';

@Module({
  controllers: [FutureProjectsController],
  providers: [FutureProjectsService]
})
export class FutureProjectsModule {}

import { Module } from '@nestjs/common';
import { AiAdvisorController } from './ai-advisor.controller';
import { AiAdvisorService } from './ai-advisor.service';
import { DatabaseModule } from '../../database/database.module';
import { AiModelsModule } from '../ai-models/ai-models.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, AiModelsModule, ConfigModule],
  controllers: [AiAdvisorController],
  providers: [AiAdvisorService],
  exports: [AiAdvisorService],
})
export class AiAdvisorModule {}

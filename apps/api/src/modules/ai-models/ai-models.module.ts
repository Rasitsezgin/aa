import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AiModelsService } from './ai-models.service';
import { AiModelsController } from './ai-models.controller';
import { AdvisorService } from './advisor.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AiModelsController],
  providers: [AiModelsService, AdvisorService],
  exports: [AiModelsService, AdvisorService],
})
export class AiModelsModule {}

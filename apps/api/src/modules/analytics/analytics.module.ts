import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DatabaseModule } from '../../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule], // Removed AiModule temporarily
  controllers: [AnalyticsController],
  providers: [], // Temporarily removed AnalyticsService
  exports: [],
})
export class AnalyticsModule {}

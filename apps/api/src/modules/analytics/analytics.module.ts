import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DatabaseModule } from '../../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule], // Removed AiModule temporarily
  controllers: [AnalyticsController],
  providers: [AnalyticsService], // Temporarily removed AnalyticsService
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

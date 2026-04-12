import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../../database/database.module';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AiModule } from '../ai/ai.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [DatabaseModule, AiModule, AnalyticsModule],
  controllers: [AdminController, AiAssistantController],
  providers: [AdminService, AdminGuard, AiAssistantService],
  exports: [AdminService, AiAssistantService],
})
export class AdminModule { }

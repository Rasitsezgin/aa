import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulerService } from './scheduler.service';
import { ReportJobProcessor } from './processors/report-job.processor';
import { SyncJobProcessor } from './processors/sync-job.processor';
import { EmailJobProcessor } from './processors/email-job.processor';
import { DatabaseModule } from '../../database/database.module';
import { MarketIntelligenceModule } from '../market-intelligence/market-intelligence.module';

@Module({
  imports: [
    DatabaseModule,
    MarketIntelligenceModule,
    BullModule.registerQueue(
      { name: 'reports' },
      { name: 'sync' },
      { name: 'emails' },
      { name: 'scheduled-tasks' },
    ),
  ],
  providers: [
    SchedulerService,
    ReportJobProcessor,
    SyncJobProcessor,
    EmailJobProcessor,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}

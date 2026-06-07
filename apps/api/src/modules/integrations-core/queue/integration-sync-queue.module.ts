import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MarketplaceModule } from '../../marketplace/marketplace.module';
import {
  INTEGRATION_SYNC_QUEUE,
  IntegrationSyncQueueService,
} from './integration-sync-queue.service';
import { IntegrationJobExecutor } from './integration-job.executor';

const schedulerEnabled = process.env.ENABLE_SCHEDULER === 'true';

/**
 * Sync kuyruk modülü — MarketplaceModule ile döngüsel bağımlılığı önlemek için ayrıldı.
 */
@Module({
  imports: [
    forwardRef(() => MarketplaceModule),
    ...(schedulerEnabled
      ? [BullModule.registerQueue({ name: INTEGRATION_SYNC_QUEUE })]
      : []),
  ],
  providers: [IntegrationJobExecutor, IntegrationSyncQueueService],
  exports: [IntegrationJobExecutor, IntegrationSyncQueueService],
})
export class IntegrationSyncQueueModule {}

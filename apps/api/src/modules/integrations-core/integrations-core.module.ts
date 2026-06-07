import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../database/database.module';
import { EncryptionModule } from '../../common/encryption.module';
import { ScrapingModule } from '../scraping/scraping.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { IntegrationSyncQueueModule } from './queue/integration-sync-queue.module';
import { TenantContextService } from './context/tenant-context.service';
import { TenantCredentialResolverService } from './credentials/tenant-credential-resolver.service';
import { TrendyolAdapter } from './adapters/marketplace/trendyol.adapter';
import { HepsiburadaAdapter } from './adapters/marketplace/hepsiburada.adapter';
import { N11Adapter } from './adapters/marketplace/n11.adapter';
import { ShopifyAdapter } from './adapters/ecommerce/shopify.adapter';
import { YurticiKargoAdapter } from './adapters/shipping/yurtici-kargo.adapter';
import { ParasutAdapter } from './adapters/accounting/parasut.adapter';
import { IntegrationAdapterRegistry } from './registry/integration-adapter.registry';
import { INTEGRATION_SYNC_QUEUE } from './queue/integration-sync-queue.service';
import { IntegrationSyncProcessor } from './queue/integration-sync.processor';
import { IntegrationsHubService } from './integrations-hub.service';
import { IntegrationsHubController } from './integrations-hub.controller';
import { TenantContextInterceptor } from './context/tenant-context.interceptor';

const schedulerEnabled = process.env.ENABLE_SCHEDULER === 'true';

@Module({
  imports: [
    DatabaseModule,
    EncryptionModule,
    ScrapingModule,
    MarketplaceModule,
    IntegrationSyncQueueModule,
    ...(schedulerEnabled
      ? [BullModule.registerQueue({ name: INTEGRATION_SYNC_QUEUE })]
      : []),
  ],
  controllers: [IntegrationsHubController],
  providers: [
    TenantContextService,
    TenantCredentialResolverService,
    TrendyolAdapter,
    HepsiburadaAdapter,
    N11Adapter,
    ShopifyAdapter,
    YurticiKargoAdapter,
    ParasutAdapter,
    IntegrationAdapterRegistry,
    IntegrationsHubService,
    ...(schedulerEnabled ? [IntegrationSyncProcessor] : []),
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
  exports: [
    TenantContextService,
    IntegrationAdapterRegistry,
    IntegrationSyncQueueModule,
    IntegrationsHubService,
  ],
})
export class IntegrationsCoreModule {}

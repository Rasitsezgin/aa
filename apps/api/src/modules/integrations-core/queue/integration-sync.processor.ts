import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../context/tenant-context.service';
import { IntegrationAdapterRegistry } from '../registry/integration-adapter.registry';
import { TenantCredentialResolverService } from '../credentials/tenant-credential-resolver.service';
import { IntegrationSyncType } from '../enums/integration-category.enum';
import { IntegrationCategory } from '../enums/integration-category.enum';
import type { IntegrationSyncJobPayload } from '../dto/integration-sync-job.dto';
import { FairQueuePolicy } from './fair-queue.policy';
import { INTEGRATION_SYNC_QUEUE } from './integration-sync-queue.service';
import { MarketplaceService } from '../../marketplace/marketplace.service';

/**
 * Multi-tenant integration sync worker.
 * Her job tenant_id bağlamında çalışır; fair-queue sayaçları güncellenir.
 */
@Processor(INTEGRATION_SYNC_QUEUE)
export class IntegrationSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(IntegrationSyncProcessor.name);
  private readonly fairQueue = new FairQueuePolicy(3);

  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly adapterRegistry: IntegrationAdapterRegistry,
    private readonly credentialResolver: TenantCredentialResolverService,
    private readonly prisma: PrismaService,
    private readonly marketplaceService: MarketplaceService,
  ) {
    super();
  }

  async process(job: Job<IntegrationSyncJobPayload>): Promise<unknown> {
    const { tenantId, integrationId, providerId, syncType, category } =
      job.data;

    this.fairQueue.onJobStart(tenantId);

    try {
      return await this.tenantContext.runAsync(
        { tenantId, integrationId },
        async () => {
          this.logger.log(
            `[${tenantId}] Sync job: ${providerId} / ${syncType}`,
          );

          if (category === IntegrationCategory.MARKETPLACE) {
            return this.processMarketplaceSync(job.data);
          }

          // Fallback: mevcut marketplace pipeline
          return this.marketplaceService.syncIntegrationByStoreId(
            tenantId,
            integrationId,
            syncType === IntegrationSyncType.ORDERS ? 'orders' : 'all',
          );
        },
      );
    } catch (error) {
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'integration.sync.error',
          resource: 'integration',
          resourceId: integrationId,
          details: {
            providerId,
            syncType,
            error: (error as Error).message,
          },
        },
      });
      throw error;
    } finally {
      this.fairQueue.onJobComplete(tenantId);
    }
  }

  private async processMarketplaceSync(payload: IntegrationSyncJobPayload) {
    // Adapter varsa normalize sync + audit log
    if (this.adapterRegistry.has(payload.providerId)) {
      try {
        const credentials =
          await this.credentialResolver.resolveIntegrationCredentials(
            payload.tenantId,
            payload.integrationId,
          );
        const adapter = this.adapterRegistry.getMarketplace(payload.providerId);
        const ctx = {
          tenantId: payload.tenantId,
          integrationId: payload.integrationId,
          providerId: payload.providerId,
          category: payload.category,
        };

        const adapterResult =
          payload.syncType === IntegrationSyncType.ORDERS ||
          payload.syncType === IntegrationSyncType.ALL
            ? await adapter.syncOrders(ctx, credentials)
            : await adapter.syncProducts(ctx, credentials);

        await this.prisma.activityLog.create({
          data: {
            tenantId: payload.tenantId,
            action: 'integration.adapter.sync',
            resource: 'integration',
            resourceId: payload.integrationId,
            details: {
              providerId: payload.providerId,
              syncType: payload.syncType,
              total: adapterResult.total,
              created: adapterResult.created,
              failed: adapterResult.failed,
            },
          },
        });
      } catch (error) {
        this.logger.warn(
          `Adapter sync audit failed for ${payload.providerId}: ${(error as Error).message}`,
        );
      }
    }

    // Kalıcı kayıt: mevcut marketplace pipeline (ürün/sipariş DB)
    const persisted = await this.marketplaceService.syncIntegrationByStoreId(
      payload.tenantId,
      payload.integrationId,
      payload.syncType === IntegrationSyncType.ORDERS ? 'orders' : 'all',
    );

    await this.prisma.integration.update({
      where: { id: payload.integrationId },
      data: { updatedAt: new Date() },
    });

    return persisted;
  }
}

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
import { INTEGRATION_SYNC_QUEUE } from './integration-sync-queue.service';
import { IntegrationJobExecutor } from './integration-job.executor';
import { MarketplaceService } from '../../marketplace/marketplace.service';
import { MarketplaceInventoryStrategy } from '../strategies/marketplace-inventory.strategy';

/**
 * Multi-tenant integration sync worker.
 * Circuit Breaker + Rate Limit + Fair Queue ile korunur.
 */
@Processor(INTEGRATION_SYNC_QUEUE)
export class IntegrationSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(IntegrationSyncProcessor.name);

  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly adapterRegistry: IntegrationAdapterRegistry,
    private readonly credentialResolver: TenantCredentialResolverService,
    private readonly prisma: PrismaService,
    private readonly marketplaceService: MarketplaceService,
    private readonly jobExecutor: IntegrationJobExecutor,
    private readonly inventoryStrategy: MarketplaceInventoryStrategy,
  ) {
    super();
  }

  async process(job: Job<IntegrationSyncJobPayload>): Promise<unknown> {
    const payload = job.data;
    const { tenantId, integrationId, providerId, syncType } = payload;

    const gate = this.jobExecutor.canExecute(payload);
    if (!gate.success) {
      this.logger.warn(`Job skipped [${tenantId}/${providerId}]: ${gate.reason}`);
      if (gate.retryAfterMs) {
        throw new Error(`retry-after:${gate.retryAfterMs}:${gate.reason}`);
      }
      return { skipped: true, reason: gate.reason };
    }

    this.jobExecutor.onJobStart(payload);

    try {
      const result = await this.tenantContext.runAsync(
        { tenantId, integrationId },
        async () => {
          this.logger.log(`[${tenantId}] Sync: ${providerId} / ${syncType}`);

          if (syncType === IntegrationSyncType.STOCK_UPDATE) {
            return this.inventoryStrategy.updateStock(payload);
          }
          if (syncType === IntegrationSyncType.PRICE_UPDATE) {
            return this.inventoryStrategy.updatePrice(payload);
          }

          switch (payload.category) {
            case IntegrationCategory.MARKETPLACE:
            case IntegrationCategory.ECOMMERCE:
            case IntegrationCategory.GLOBAL_MARKETPLACE:
              return this.processCatalogSync(payload);
            case IntegrationCategory.CARGO:
              return this.processCargoSync(payload);
            case IntegrationCategory.ERP:
              return this.processErpSync(payload);
            case IntegrationCategory.INVOICE:
              return this.processInvoiceSync(payload);
            case IntegrationCategory.SOCIAL_FEED:
              return this.processSocialFeedSync(payload);
            case IntegrationCategory.FULFILLMENT:
              return this.processFulfillmentSync(payload);
            default:
              return this.marketplaceService.syncIntegrationByStoreId(
                tenantId,
                integrationId,
                syncType === IntegrationSyncType.ORDERS ? 'orders' : 'all',
              );
          }
        },
      );

      this.jobExecutor.onJobSuccess(payload);
      return result;
    } catch (error) {
      this.jobExecutor.onJobFailure(payload, error);
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'integration.sync.error',
          resource: 'integration',
          resourceId: integrationId,
          details: {
            providerId,
            syncType,
            circuitState: this.jobExecutor.getCircuitState(tenantId, providerId),
            error: (error as Error).message,
          },
        },
      });
      throw error;
    }
  }

  private buildCtx(payload: IntegrationSyncJobPayload) {
    return {
      tenantId: payload.tenantId,
      integrationId: payload.integrationId,
      providerId: payload.providerId,
      category: payload.category,
    };
  }

  /** Pazaryeri / e-ticaret sync — adapter normalize + DB persist */
  private async processCatalogSync(payload: IntegrationSyncJobPayload) {
    if (this.adapterRegistry.has(payload.providerId)) {
      try {
        const credentials = await this.credentialResolver.resolveByProvider(
          payload.tenantId,
          payload.providerId,
          payload.integrationId,
        );
        const provider = this.adapterRegistry.get(payload.providerId);
        const ctx = this.buildCtx(payload);

        const isOrders =
          payload.syncType === IntegrationSyncType.ORDERS ||
          payload.syncType === IntegrationSyncType.ALL;

        let adapterResult: {
          total: number;
          created: number;
          failed: number;
        };

        if (isOrders && 'syncOrders' in provider) {
          adapterResult = await (
            provider as {
              syncOrders: (
                c: typeof ctx,
                cred: typeof credentials,
              ) => Promise<{ total: number; created: number; failed: number }>;
            }
          ).syncOrders(ctx, credentials);
        } else if (
          payload.category === IntegrationCategory.GLOBAL_MARKETPLACE &&
          'syncListings' in provider
        ) {
          adapterResult = await (
            provider as {
              syncListings: (
                c: typeof ctx,
                cred: typeof credentials,
              ) => Promise<{ total: number; created: number; failed: number }>;
            }
          ).syncListings(ctx, credentials);
        } else if ('syncProducts' in provider) {
          adapterResult = await (
            provider as {
              syncProducts: (
                c: typeof ctx,
                cred: typeof credentials,
              ) => Promise<{ total: number; created: number; failed: number }>;
            }
          ).syncProducts(ctx, credentials);
        } else {
          adapterResult = { total: 0, created: 0, failed: 0 };
        }

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
          `Adapter audit failed ${payload.providerId}: ${(error as Error).message}`,
        );
      }
    }

    const persisted = await this.marketplaceService.syncIntegrationByStoreId(
      payload.tenantId,
      payload.integrationId,
      payload.syncType === IntegrationSyncType.ORDERS ? 'orders' : 'all',
    );

    await this.prisma.integration.update({
      where: { id: payload.integrationId },
      data: { updatedAt: new Date() },
    }).catch(() => undefined);

    return persisted;
  }

  /** Kargo sync — ICargoProvider health check */
  private async processCargoSync(payload: IntegrationSyncJobPayload) {
    if (!this.adapterRegistry.has(payload.providerId)) {
      return { success: false, message: 'Kargo adapter bulunamadı' };
    }

    const credentials = await this.credentialResolver.resolveByProvider(
      payload.tenantId,
      payload.providerId,
      payload.integrationId,
    );
    const adapter = this.adapterRegistry.getCargo(payload.providerId);
    return adapter.testConnection(this.buildCtx(payload), credentials);
  }

  /** ERP sync — IErpProvider */
  private async processErpSync(payload: IntegrationSyncJobPayload) {
    if (!this.adapterRegistry.has(payload.providerId)) {
      return { success: false, message: 'ERP adapter bulunamadı' };
    }

    const credentials = await this.credentialResolver.resolveByProvider(
      payload.tenantId,
      payload.providerId,
      payload.integrationId,
    );
    const adapter = this.adapterRegistry.getErp(payload.providerId);
    return adapter.syncInvoices(this.buildCtx(payload), credentials);
  }

  /** E-fatura sync — IInvoiceProvider */
  private async processInvoiceSync(payload: IntegrationSyncJobPayload) {
    if (!this.adapterRegistry.has(payload.providerId)) {
      return { success: false, message: 'E-fatura adapter bulunamadı' };
    }

    const credentials = await this.credentialResolver.resolveByProvider(
      payload.tenantId,
      payload.providerId,
      payload.integrationId,
    );
    const adapter = this.adapterRegistry.getInvoice(payload.providerId);
    return adapter.syncInvoices(this.buildCtx(payload), credentials);
  }

  /** Sosyal feed sync — ISocialFeedProvider */
  private async processSocialFeedSync(payload: IntegrationSyncJobPayload) {
    if (!this.adapterRegistry.has(payload.providerId)) {
      return { success: false, message: 'Feed adapter bulunamadı' };
    }

    const credentials = await this.credentialResolver.resolveByProvider(
      payload.tenantId,
      payload.providerId,
      payload.integrationId,
    );
    const adapter = this.adapterRegistry.getSocialFeed(payload.providerId);
    return adapter.syncProductFeed(this.buildCtx(payload), credentials);
  }

  /** Fulfillment sync — IFulfillmentProvider */
  private async processFulfillmentSync(payload: IntegrationSyncJobPayload) {
    if (!this.adapterRegistry.has(payload.providerId)) {
      return { success: false, message: 'Fulfillment adapter bulunamadı' };
    }

    const credentials = await this.credentialResolver.resolveByProvider(
      payload.tenantId,
      payload.providerId,
      payload.integrationId,
    );
    const adapter = this.adapterRegistry.getFulfillment(payload.providerId);
    return adapter.syncInventory(this.buildCtx(payload), credentials);
  }
}

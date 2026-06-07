import { Injectable, Logger } from '@nestjs/common';
import { IntegrationAdapterRegistry } from '../registry/integration-adapter.registry';
import { TenantCredentialResolverService } from '../credentials/tenant-credential-resolver.service';
import type { IntegrationSyncJobPayload } from '../dto/integration-sync-job.dto';
import type { IMarketplaceProvider } from '../interfaces/providers/marketplace.provider';
import { IntegrationCategory } from '../enums/integration-category.enum';

export interface InventoryUpdateResult {
  success: boolean;
  message: string;
  sku?: string;
  providerId: string;
}

/**
 * Strategy Pattern — pazaryeri stok/fiyat güncellemelerini
 * tenant+provider adapter'ına yönlendirir.
 */
@Injectable()
export class MarketplaceInventoryStrategy {
  private readonly logger = new Logger(MarketplaceInventoryStrategy.name);

  constructor(
    private readonly registry: IntegrationAdapterRegistry,
    private readonly credentialResolver: TenantCredentialResolverService,
  ) {}

  private async resolveAdapter(
    payload: IntegrationSyncJobPayload,
  ): Promise<{
    adapter: IMarketplaceProvider;
    credentials: Awaited<
      ReturnType<TenantCredentialResolverService['resolveIntegrationCredentials']>
    >;
    ctx: {
      tenantId: string;
      integrationId: string;
      providerId: string;
      category: IntegrationCategory;
    };
  }> {
    if (!this.registry.has(payload.providerId)) {
      throw new Error(`Adapter bulunamadı: ${payload.providerId}`);
    }

    const adapter = this.registry.getMarketplace(payload.providerId);
    const credentials =
      await this.credentialResolver.resolveIntegrationCredentials(
        payload.tenantId,
        payload.integrationId,
      );

    return {
      adapter,
      credentials,
      ctx: {
        tenantId: payload.tenantId,
        integrationId: payload.integrationId,
        providerId: payload.providerId,
        category: payload.category,
      },
    };
  }

  /** Stok güncelleme — adapter.updateStock Strategy */
  async updateStock(
    payload: IntegrationSyncJobPayload,
  ): Promise<InventoryUpdateResult> {
    const sku = payload.sku?.trim();
    const quantity = payload.quantity;

    if (!sku || quantity === undefined || quantity < 0) {
      return {
        success: false,
        message: 'sku ve quantity zorunludur',
        providerId: payload.providerId,
      };
    }

    try {
      const { adapter, credentials, ctx } = await this.resolveAdapter(payload);

      if (!adapter.updateStock) {
        return {
          success: false,
          message: `${payload.providerId} stok güncellemeyi desteklemiyor`,
          providerId: payload.providerId,
          sku,
        };
      }

      const result = await adapter.updateStock(ctx, credentials, sku, quantity);
      this.logger.log(
        `[${payload.tenantId}] Stock ${sku}=${quantity} → ${payload.providerId}: ${result.message}`,
      );

      return {
        success: result.success,
        message: result.message,
        sku,
        providerId: payload.providerId,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        sku,
        providerId: payload.providerId,
      };
    }
  }

  /** Fiyat güncelleme — adapter.updatePrice Strategy */
  async updatePrice(
    payload: IntegrationSyncJobPayload,
  ): Promise<InventoryUpdateResult> {
    const sku = payload.sku?.trim();
    const price = payload.price;

    if (!sku || price === undefined || price < 0) {
      return {
        success: false,
        message: 'sku ve price zorunludur',
        providerId: payload.providerId,
      };
    }

    try {
      const { adapter, credentials, ctx } = await this.resolveAdapter(payload);

      if (!adapter.updatePrice) {
        return {
          success: false,
          message: `${payload.providerId} fiyat güncellemeyi desteklemiyor`,
          providerId: payload.providerId,
          sku,
        };
      }

      const result = await adapter.updatePrice(ctx, credentials, sku, price);
      this.logger.log(
        `[${payload.tenantId}] Price ${sku}=${price} → ${payload.providerId}: ${result.message}`,
      );

      return {
        success: result.success,
        message: result.message,
        sku,
        providerId: payload.providerId,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        sku,
        providerId: payload.providerId,
      };
    }
  }
}

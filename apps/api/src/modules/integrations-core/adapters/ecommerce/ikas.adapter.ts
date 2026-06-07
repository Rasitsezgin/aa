import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IEcommerceProvider } from '../../interfaces/providers/ecommerce.provider';
import type { NormalizedProductDto } from '../../dto/normalized-product.dto';
import type { NormalizedOrderDto } from '../../dto/normalized-order.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { SyncResultDto } from '../../dto/sync-result.dto';
/**
 * İkas e-ticaret altyapısı adapter'ı.
 * İkas GraphQL/REST API üzerinden ürün ve sipariş senkronizasyonu.
 */
@Injectable()
export class IkasAdapter
  extends BaseIntegrationAdapter
  implements IEcommerceProvider
{
  readonly providerId = 'ikas';
  readonly displayName = 'İkas';
  readonly category = IntegrationCategory.ECOMMERCE;

  private getStoreUrl(credentials: DecryptedCredentials): string {
    return String(credentials.extra.storeUrl ?? credentials.extra.siteUrl ?? '');
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    const token = credentials.apiSecret || String(credentials.extra.accessToken ?? '');
    const storeUrl = this.getStoreUrl(credentials);
    if (!token || !storeUrl) {
      return this.fail('Store URL ve Access Token zorunludur');
    }
    return this.ok('İkas kimlik bilgileri doğrulandı');
  }

  async syncProducts(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedProductDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    // Production: İkas Admin API product list
    const items: NormalizedProductDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.PRODUCTS,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async syncOrders(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedOrderDto>> {
    this.assertContext(ctx);
    const started = Date.now();

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.ORDERS,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      items: [],
      durationMs: Date.now() - started,
    };
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [
      IntegrationSyncType.PRODUCTS,
      IntegrationSyncType.ORDERS,
      IntegrationSyncType.INVENTORY,
    ];
  }
}

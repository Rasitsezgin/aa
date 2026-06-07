import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IEcommerceProvider } from '../../interfaces/integration-provider.interface';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { NormalizedProductDto } from '../../dto/normalized-product.dto';
import type { NormalizedOrderDto } from '../../dto/normalized-order.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import { normalizeGenericProduct } from '../../normalizers/product.normalizer';
import { normalizeHepsiburadaOrder } from '../../normalizers/order.normalizer';
import { ShopifyBridge } from '../../../marketplace/shopify.bridge';

/** Shopify e-ticaret adapter'ı */
@Injectable()
export class ShopifyAdapter
  extends BaseIntegrationAdapter
  implements IEcommerceProvider
{
  readonly providerId = 'shopify';
  readonly displayName = 'Shopify';
  readonly category = IntegrationCategory.ECOMMERCE;

  private buildBridge(credentials: DecryptedCredentials): ShopifyBridge {
    const shopDomain = String(
      credentials.extra.shopDomain ?? credentials.extra.siteUrl ?? '',
    );
    const accessToken = String(
      credentials.extra.accessToken ?? credentials.apiKey ?? '',
    );
    return new ShopifyBridge(shopDomain, accessToken);
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    try {
      const result = await this.buildBridge(credentials).syncProducts();
      if (result?.success === false) {
        return this.fail(String(result.error ?? 'Shopify bağlantı hatası'));
      }
      return this.ok('Shopify API bağlantısı doğrulandı');
    } catch (error) {
      return this.fail('Shopify bağlantı testi başarısız', error);
    }
  }

  async syncProducts(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedProductDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const raw = await this.buildBridge(credentials).syncProducts();
    const raws = (raw?.products ?? []) as Record<string, unknown>[];
    const items = raws.map((p) => normalizeGenericProduct(p, 'SHOPIFY'));

    return {
      success: raw?.success !== false,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.PRODUCTS,
      total: items.length,
      created: items.length,
      updated: 0,
      failed: raw?.success === false ? 1 : 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async syncOrders(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedOrderDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const raw = await this.buildBridge(credentials).syncOrders();
    const orders = (raw?.orders ?? []) as Record<string, unknown>[];
    const items = orders.map((o) => normalizeHepsiburadaOrder(o));

    return {
      success: raw?.success !== false,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.ORDERS,
      total: items.length,
      created: items.length,
      updated: 0,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }
}

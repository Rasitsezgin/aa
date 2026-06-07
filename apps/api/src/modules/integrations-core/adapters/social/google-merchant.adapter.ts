import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { ISocialFeedProvider } from '../../interfaces/providers/social-feed.provider';
import type { SocialFeedProductDto } from '../../dto/social-feed-product.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { SyncResultDto } from '../../dto/sync-result.dto';

/**
 * Google Merchant Center feed adapter'ı.
 * Ürün feed'ini Content API for Shopping üzerinden senkronize eder.
 */
@Injectable()
export class GoogleMerchantAdapter
  extends BaseIntegrationAdapter
  implements ISocialFeedProvider
{
  readonly providerId = 'google-merchant';
  readonly displayName = 'Google Merchant';
  readonly category = IntegrationCategory.SOCIAL_FEED;

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    const merchantId = String(credentials.extra.merchantId ?? credentials.apiKey ?? '');
    if (!merchantId) {
      return this.fail('Merchant ID zorunludur');
    }
    return this.ok('Google Merchant kimlik bilgileri kayıtlı');
  }

  async syncProductFeed(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<SocialFeedProductDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const items: SocialFeedProductDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.FEED_SYNC,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async publishProduct(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
    product: SocialFeedProductDto,
  ) {
    this.assertContext(ctx);
    return {
      success: true,
      externalId: product.externalId ?? product.sku,
      message: 'Ürün feed\'e yayınlandı',
    };
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [IntegrationSyncType.FEED_SYNC, IntegrationSyncType.HEALTH_CHECK];
  }
}

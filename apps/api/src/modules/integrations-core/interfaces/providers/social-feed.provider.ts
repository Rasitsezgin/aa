import type { SocialFeedProductDto } from '../../dto/social-feed-product.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Sosyal medya & feed sağlayıcıları — Facebook Mağaza, Google Merchant, Instagram.
 */
export interface ISocialFeedProvider extends IIntegrationProvider {
  syncProductFeed(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<SocialFeedProductDto>>;

  publishProduct?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    product: SocialFeedProductDto,
  ): Promise<{ success: boolean; externalId?: string; message: string }>;
}

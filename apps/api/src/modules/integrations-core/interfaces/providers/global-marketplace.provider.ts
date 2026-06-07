import type { GlobalListingDto } from '../../dto/global-listing.dto';
import type { NormalizedOrderDto } from '../../dto/normalized-order.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Yurtdışı & e-ihracat pazaryerleri — Amazon US, Zalando, Ozon, Etsy vb.
 */
export interface IGlobalMarketplaceProvider extends IIntegrationProvider {
  syncListings(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<GlobalListingDto>>;

  syncOrders(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedOrderDto>>;

  updateListingStock?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    listingId: string,
    quantity: number,
  ): Promise<{ success: boolean; message: string }>;
}

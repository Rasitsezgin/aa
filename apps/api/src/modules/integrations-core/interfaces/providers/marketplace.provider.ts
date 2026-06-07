import type { NormalizedOrderDto } from '../../dto/normalized-order.dto';
import type { NormalizedProductDto } from '../../dto/normalized-product.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Yurtiçi pazaryeri sağlayıcıları — Trendyol, HB, N11, Amazon TR vb.
 */
export interface IMarketplaceProvider extends IIntegrationProvider {
  syncProducts(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedProductDto>>;

  syncOrders(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedOrderDto>>;

  updateStock?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    sku: string,
    quantity: number,
  ): Promise<{ success: boolean; message: string }>;

  updatePrice?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    sku: string,
    price: number,
  ): Promise<{ success: boolean; message: string }>;
}

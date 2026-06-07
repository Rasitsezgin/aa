import type { IntegrationCategory } from '../enums/integration-category.enum';
import type { IntegrationSyncType } from '../enums/integration-category.enum';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from './integration-context.interface';
import type { NormalizedOrderDto } from '../dto/normalized-order.dto';
import type { NormalizedProductDto } from '../dto/normalized-product.dto';
import type { SyncResultDto } from '../dto/sync-result.dto';

/** Tüm dış sistem adapter'larının uyması gereken temel sözleşme */
export interface IIntegrationProvider {
  readonly providerId: string;
  readonly displayName: string;
  readonly category: IntegrationCategory;

  /** Bağlantı testi — kimlik bilgilerinin geçerliliğini doğrular */
  testConnection(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<{ success: boolean; message: string }>;

  /** Desteklenen sync tiplerini döner */
  supportedSyncTypes(): IntegrationSyncType[];
}

/** Pazaryeri sağlayıcıları için genişletilmiş sözleşme */
export interface IMarketplaceProvider extends IIntegrationProvider {
  syncProducts(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedProductDto>>;

  syncOrders(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedOrderDto>>;
}

/** E-ticaret altyapı sağlayıcıları */
export interface IEcommerceProvider extends IMarketplaceProvider {}

/** Kargo firması sağlayıcıları */
export interface IShippingProvider extends IIntegrationProvider {
  createShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; trackingNumber?: string; message: string }>;
}

/** E-fatura / ön muhasebe sağlayıcıları */
export interface IAccountingProvider extends IIntegrationProvider {
  syncInvoices(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<Record<string, unknown>>>;
}

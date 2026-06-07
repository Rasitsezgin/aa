import type { ErpCustomerDto, ErpStockDto, ErpInvoiceDto } from '../../dto/erp-sync.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Muhasebe & ERP sistemleri — Logo, Netsis, Nebim, Paraşüt, Mikro vb.
 */
export interface IErpProvider extends IIntegrationProvider {
  syncCustomers(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpCustomerDto>>;

  syncStock(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpStockDto>>;

  syncInvoices(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpInvoiceDto>>;

  pushOrder?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    orderId: string,
  ): Promise<{ success: boolean; erpReference?: string; message: string }>;
}

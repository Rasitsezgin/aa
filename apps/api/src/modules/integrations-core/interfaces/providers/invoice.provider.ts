import type { NormalizedInvoiceDto } from '../../dto/normalized-invoice.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * E-fatura sistemleri — Innova, Uyumsoft, Sovos, e-Logo vb.
 */
export interface IInvoiceProvider extends IIntegrationProvider {
  syncInvoices(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedInvoiceDto>>;

  createInvoice?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    orderId: string,
  ): Promise<{ success: boolean; invoiceNumber?: string; message: string }>;

  cancelInvoice?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    invoiceId: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }>;
}

/** Geriye dönük uyumluluk */
export type IAccountingProvider = IInvoiceProvider;

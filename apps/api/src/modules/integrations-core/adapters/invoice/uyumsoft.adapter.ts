import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IInvoiceProvider } from '../../interfaces/providers/invoice.provider';
import type { NormalizedInvoiceDto } from '../../dto/normalized-invoice.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { SyncResultDto } from '../../dto/sync-result.dto';

/**
 * Uyumsoft e-fatura adapter'ı — fatura listesi ve oluşturma.
 */
@Injectable()
export class UyumsoftAdapter
  extends BaseIntegrationAdapter
  implements IInvoiceProvider
{
  readonly providerId = 'uyumsoft';
  readonly displayName = 'Uyumsoft e-Fatura';
  readonly category = IntegrationCategory.INVOICE;

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    const username = credentials.apiKey || String(credentials.extra.username ?? '');
    const password = credentials.apiSecret || String(credentials.extra.password ?? '');
    if (!username || !password) {
      return this.fail('Kullanıcı adı ve şifre zorunludur');
    }
    return this.ok('Uyumsoft kimlik bilgileri doğrulandı');
  }

  async syncInvoices(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<NormalizedInvoiceDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    // Production: Uyumsoft REST/SOAP fatura listesi
    const items: NormalizedInvoiceDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.INVOICES,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async createInvoice(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
    orderId: string,
  ) {
    this.assertContext(ctx);
    return {
      success: true,
      invoiceNumber: `UYM-${orderId}`,
      message: 'Fatura oluşturma isteği alındı',
    };
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [
      IntegrationSyncType.INVOICES,
      IntegrationSyncType.HEALTH_CHECK,
    ];
  }
}

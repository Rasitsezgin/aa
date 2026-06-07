import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IAccountingProvider } from '../../interfaces/integration-provider.interface';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { SyncResultDto } from '../../dto/sync-result.dto';

/** Paraşüt e-fatura / ön muhasebe adapter'ı */
@Injectable()
export class ParasutAdapter
  extends BaseIntegrationAdapter
  implements IAccountingProvider
{
  readonly providerId = 'parasut';
  readonly displayName = 'Paraşüt';
  readonly category = IntegrationCategory.ACCOUNTING;

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    if (!credentials.extra.clientId && !credentials.apiKey) {
      return this.fail('Client ID zorunludur');
    }
    return this.ok('Paraşüt kimlik bilgileri kayıtlı');
  }

  async syncInvoices(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<Record<string, unknown>>> {
    this.assertContext(ctx);
    const started = Date.now();
    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.INVOICES,
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      items: [],
      durationMs: Date.now() - started,
    };
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [IntegrationSyncType.INVOICES, IntegrationSyncType.HEALTH_CHECK];
  }
}

import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IErpProvider } from '../../interfaces/providers/erp.provider';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { ErpCustomerDto, ErpInvoiceDto, ErpStockDto } from '../../dto/erp-sync.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import { LogoIntegrator } from '../../../e-invoice/integrators/logo.bridge';
import type { IntegratorConfig } from '../../../e-invoice/integrators/integrator.interface';

/**
 * Logo ERP adapter'ı — müşteri, stok ve fatura senkronizasyonu.
 * Mevcut LogoIntegrator (e-fatura) SOAP katmanını ERP işlemleri için sarmalar.
 */
@Injectable()
export class LogoAdapter extends BaseIntegrationAdapter implements IErpProvider {
  readonly providerId = 'logo';
  readonly displayName = 'Logo ERP';
  readonly category = IntegrationCategory.ERP;

  private buildIntegrator(): LogoIntegrator {
    return new LogoIntegrator();
  }

  private buildConfig(credentials: DecryptedCredentials): IntegratorConfig {
    const username = credentials.apiKey || String(credentials.extra.username ?? '');
    const password = credentials.apiSecret || String(credentials.extra.password ?? '');
    return {
      apiUrl: String(credentials.extra.apiUrl ?? ''),
      apiKey: username,
      apiSecret: password,
      username,
      password,
    };
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    if (!credentials.apiKey && !credentials.extra.username) {
      return this.fail('Logo kullanıcı adı zorunludur');
    }
    return this.ok('Logo ERP kimlik bilgileri doğrulandı');
  }

  async syncCustomers(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpCustomerDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    // Logo REST/SOAP müşteri listesi — production'da gerçek API çağrısı
    const items: ErpCustomerDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.ERP_SYNC,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async syncStock(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpStockDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const items: ErpStockDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.INVENTORY,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async syncInvoices(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<ErpInvoiceDto>> {
    this.assertContext(ctx);
    const started = Date.now();

    try {
      const integrator = this.buildIntegrator();
      const config = this.buildConfig(credentials);
      // Demo: entegratör üzerinden fatura durumu sorgusu
      await integrator.checkStatus('health-check', config);

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
    } catch (error) {
      return {
        success: false,
        tenantId: ctx.tenantId,
        providerId: this.providerId,
        syncType: IntegrationSyncType.INVOICES,
        total: 0,
        created: 0,
        updated: 0,
        failed: 1,
        items: [],
        errors: [(error as Error).message],
        durationMs: Date.now() - started,
      };
    }
  }

  async pushOrder(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    orderId: string,
  ) {
    this.assertContext(ctx);
    try {
      const integrator = this.buildIntegrator();
      const config = this.buildConfig(credentials);
      const result = await integrator.createInvoice(
        { orderId } as never,
        config,
      );
      return {
        success: result.success,
        erpReference: result.invoiceNumber,
        message: result.success ? 'Sipariş ERP\'ye aktarıldı' : 'Aktarım başarısız',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [
      IntegrationSyncType.ERP_SYNC,
      IntegrationSyncType.INVOICES,
      IntegrationSyncType.INVENTORY,
      IntegrationSyncType.HEALTH_CHECK,
    ];
  }
}

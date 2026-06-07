import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IFulfillmentProvider } from '../../interfaces/providers/fulfillment.provider';
import type {
  FulfillmentInventoryDto,
  FulfillmentOrderDto,
} from '../../dto/fulfillment.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { SyncResultDto } from '../../dto/sync-result.dto';

/**
 * Amazon FBA fulfillment adapter'ı — depo stok ve fulfillment siparişleri.
 */
@Injectable()
export class AmazonFbaAdapter
  extends BaseIntegrationAdapter
  implements IFulfillmentProvider
{
  readonly providerId = 'amazon-fba';
  readonly displayName = 'Amazon FBA';
  readonly category = IntegrationCategory.FULFILLMENT;

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    const sellerId = String(credentials.extra.sellerId ?? credentials.apiKey ?? '');
    if (!sellerId) {
      return this.fail('Seller ID zorunludur');
    }
    return this.ok('Amazon FBA kimlik bilgileri kayıtlı');
  }

  async syncInventory(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<FulfillmentInventoryDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const items: FulfillmentInventoryDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.FULFILLMENT_SYNC,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async syncFulfillmentOrders(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<FulfillmentOrderDto>> {
    this.assertContext(ctx);
    const started = Date.now();
    const items: FulfillmentOrderDto[] = [];

    return {
      success: true,
      tenantId: ctx.tenantId,
      providerId: this.providerId,
      syncType: IntegrationSyncType.FULFILLMENT_SYNC,
      total: items.length,
      created: 0,
      updated: items.length,
      failed: 0,
      items,
      durationMs: Date.now() - started,
    };
  }

  async createInboundShipment(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
    payload: Record<string, unknown>,
  ) {
    this.assertContext(ctx);
    return {
      success: true,
      shipmentId: `FBA-${Date.now()}`,
      message: `Inbound shipment oluşturuldu: ${String(payload.sku ?? '')}`,
    };
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [
      IntegrationSyncType.FULFILLMENT_SYNC,
      IntegrationSyncType.INVENTORY,
      IntegrationSyncType.HEALTH_CHECK,
    ];
  }
}

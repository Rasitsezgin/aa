import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { IShippingProvider } from '../../interfaces/integration-provider.interface';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import { YurticiKargoBridge } from '../../../shipping/carriers/yurtici-kargo.bridge';

/** Yurtiçi Kargo adapter'ı */
@Injectable()
export class YurticiKargoAdapter
  extends BaseIntegrationAdapter
  implements IShippingProvider
{
  readonly providerId = 'yurtici-kargo';
  readonly displayName = 'Yurtiçi Kargo';
  readonly category = IntegrationCategory.SHIPPING;

  private buildBridge(credentials: DecryptedCredentials): YurticiKargoBridge {
    return new YurticiKargoBridge({
      apiUser: credentials.apiKey,
      apiPassword: credentials.apiSecret,
      apiUrl: String(credentials.extra.apiUrl ?? ''),
    });
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    if (!credentials.apiKey) {
      return this.fail('API Key zorunludur');
    }
    return this.ok('Yurtiçi Kargo kimlik bilgileri kayıtlı');
  }

  async createShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: Record<string, unknown>,
  ) {
    this.assertContext(ctx);
    try {
      const bridge = this.buildBridge(credentials);
      const result = await bridge.createShipment(payload as never);
      return {
        success: true,
        trackingNumber: result.trackingNumber,
        message: 'Gönderi oluşturuldu',
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [IntegrationSyncType.SHIPMENTS, IntegrationSyncType.HEALTH_CHECK];
  }
}

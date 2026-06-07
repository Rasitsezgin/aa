import { Injectable } from '@nestjs/common';
import { IntegrationCategory } from '../../enums/integration-category.enum';
import { IntegrationSyncType } from '../../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../../base/base-integration.adapter';
import type { ICargoProvider } from '../../interfaces/providers/cargo.provider';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../../interfaces/integration-context.interface';
import type { CargoShipmentDto } from '../../dto/cargo-shipment.dto';
import type { CargoTrackingDto } from '../../dto/cargo-tracking.dto';
import { normalizeGenericTracking } from '../../normalizers/cargo.normalizer';
import { ArasKargoBridge } from '../../../shipping/carriers/aras-kargo.bridge';
import type { ShipmentRequest } from '../../../shipping/carriers/carrier.interface';

/**
 * Aras Kargo adapter'ı — gönderi oluşturma ve takip sorgusu.
 */
@Injectable()
export class ArasKargoAdapter
  extends BaseIntegrationAdapter
  implements ICargoProvider
{
  readonly providerId = 'aras-kargo';
  readonly displayName = 'Aras Kargo';
  readonly category = IntegrationCategory.CARGO;

  private buildBridge(credentials: DecryptedCredentials): ArasKargoBridge {
    return new ArasKargoBridge({
      apiUser: credentials.apiKey,
      apiPassword: credentials.apiSecret,
      customerCode: String(credentials.extra.customerCode ?? ''),
      apiUrl: String(credentials.extra.apiUrl ?? ''),
    });
  }

  private toShipmentRequest(dto: CargoShipmentDto): ShipmentRequest {
    return {
      senderAddress: {
        name: dto.sender.name,
        phone: dto.sender.phone,
        address: dto.sender.address,
        city: dto.sender.city,
        district: dto.sender.district,
        postalCode: dto.sender.postalCode,
        email: dto.sender.email,
      },
      receiverAddress: {
        name: dto.receiver.name,
        phone: dto.receiver.phone,
        address: dto.receiver.address,
        city: dto.receiver.city,
        district: dto.receiver.district,
        postalCode: dto.receiver.postalCode,
        email: dto.receiver.email,
      },
      weight: dto.weightKg,
      dimensions: dto.dimensions
        ? {
            length: dto.dimensions.lengthCm,
            width: dto.dimensions.widthCm,
            height: dto.dimensions.heightCm,
          }
        : undefined,
      description: dto.description,
      isCod: dto.isCod,
      codAmount: dto.codAmount,
    };
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    if (!credentials.apiKey) {
      return this.fail('API Key zorunludur');
    }
    return this.ok('Aras Kargo kimlik bilgileri kayıtlı');
  }

  async createShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: CargoShipmentDto,
  ) {
    this.assertContext(ctx);
    try {
      const bridge = this.buildBridge(credentials);
      const result = await bridge.createShipment(this.toShipmentRequest(payload));
      return {
        success: true,
        trackingNumber: result.trackingNumber,
        message: 'Gönderi oluşturuldu',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async trackShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ): Promise<CargoTrackingDto> {
    this.assertContext(ctx);
    const bridge = this.buildBridge(credentials);
    const raw = await bridge.trackShipment(trackingNumber);
    return normalizeGenericTracking(
      trackingNumber,
      'Aras Kargo',
      ctx.tenantId,
      this.providerId,
      raw as unknown as Record<string, unknown>,
    );
  }

  async cancelShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ) {
    this.assertContext(ctx);
    try {
      const bridge = this.buildBridge(credentials);
      const ok = await bridge.cancelShipment(trackingNumber);
      return {
        success: ok,
        message: ok ? 'Gönderi iptal edildi' : 'İptal başarısız',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    return [
      IntegrationSyncType.SHIPMENTS,
      IntegrationSyncType.TRACKING,
      IntegrationSyncType.HEALTH_CHECK,
    ];
  }
}

import { BadRequestException, Logger } from '@nestjs/common';
import { isSimulationAllowed } from '../../../common/simulation.util';
import {
  CarrierBridge,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResult,
  ShippingRate,
} from './carrier.interface';
import { ArasKargoClient } from './aras-kargo.client';

export interface ArasKargoBridgeConfig {
  apiUrl?: string;
  apiUser?: string;
  apiPassword?: string;
  customerCode?: string;
}

/**
 * Aras Kargo entegrasyonu — SetOrder / GetQueryJSON / CancelDispatch SOAP API.
 */
export class ArasKargoBridge implements CarrierBridge {
  readonly carrierName = 'Aras';
  private readonly logger = new Logger('ArasKargoBridge');
  private readonly config: ArasKargoBridgeConfig;

  constructor(config: ArasKargoBridgeConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl,
      apiUser: config.apiUser || process.env.ARAS_API_USER || '',
      apiPassword: config.apiPassword || process.env.ARAS_API_PASSWORD || '',
      customerCode:
        config.customerCode ||
        String(process.env.ARAS_CUSTOMER_CODE || '').trim() ||
        undefined,
    };
  }

  private hasCredentials(): boolean {
    return Boolean(this.config.apiUser?.trim() && this.config.apiPassword?.trim());
  }

  private assertShippingSimulationAllowed(): void {
    if (!this.hasCredentials() && !isSimulationAllowed('ALLOW_SIMULATED_SHIPPING')) {
      throw new BadRequestException(
        'Aras Kargo API bilgileri yapılandırılmamış. Tenant credentials veya ALLOW_SIMULATED_SHIPPING=true gerekir.',
      );
    }
  }

  private getClient(): ArasKargoClient {
    return new ArasKargoClient({
      apiUrl: this.config.apiUrl,
      apiUser: this.config.apiUser ?? '',
      apiPassword: this.config.apiPassword ?? '',
      customerCode: this.config.customerCode,
    });
  }

  private buildIntegrationCode(): string {
    return `PY${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  private calculateVolumetricWeight(request: ShipmentRequest): number {
    if (!request.dimensions) {
      return request.weight;
    }
    const desi =
      (request.dimensions.length *
        request.dimensions.width *
        request.dimensions.height) /
      3000;
    return Math.max(request.weight, desi);
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    this.assertShippingSimulationAllowed();

    this.logger.log(
      `Aras Kargo gönderi oluşturuluyor: ${request.receiverAddress.city}`,
    );

    if (!this.hasCredentials()) {
      const trackingNumber = `ARAS${Date.now()}`;
      return {
        trackingNumber,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      };
    }

    const integrationCode = this.buildIntegrationCode();
    const client = this.getClient();
    const result = await client.setOrder({
      integrationCode,
      receiverName:
        request.receiverAddress.fullName || request.receiverAddress.name,
      receiverAddress:
        request.receiverAddress.addressLine || request.receiverAddress.address,
      receiverPhone: request.receiverAddress.phone,
      receiverCity: request.receiverAddress.city,
      receiverDistrict: request.receiverAddress.district,
      weight: request.weight,
      volumetricWeight: this.calculateVolumetricWeight(request),
      description: request.description,
      isCod: request.isCod,
      codAmount: request.codAmount,
    });

    const trackingNumber =
      result.invoiceKey ||
      result.orgReceiverCustId ||
      integrationCode;

    return {
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    this.assertShippingSimulationAllowed();

    this.logger.log(`Aras Kargo takip sorgusu: ${trackingNumber}`);

    if (!this.hasCredentials()) {
      return {
        trackingNumber,
        status: 'in-transit',
        events: [
          {
            date: new Date(),
            status: 'in-transit',
            description: 'Kargo aktarma merkezinde (simülasyon)',
            location: 'İstanbul',
          },
        ],
      };
    }

    const client = this.getClient();
    return client.trackShipment(trackingNumber);
  }

  async calculateRate(request: ShipmentRequest): Promise<ShippingRate> {
    const baseCost = 35;
    const weightCost = Math.max(0, request.weight - 1) * 5;
    let desiCost = 0;
    if (request.dimensions) {
      const desi =
        (request.dimensions.length *
          request.dimensions.width *
          request.dimensions.height) /
        3000;
      desiCost = Math.max(0, desi - 1) * 5;
    }

    return {
      carrier: this.carrierName,
      serviceName: this.hasCredentials()
        ? 'Aras Kargo Standart (tahmini)'
        : 'Aras Kargo Standart (simülasyon)',
      cost: baseCost + Math.max(weightCost, desiCost),
      currency: 'TRY',
      estimatedDays: 3,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    this.logger.log(`Aras Kargo iptal: ${trackingNumber}`);

    if (!this.hasCredentials()) {
      this.assertShippingSimulationAllowed();
      return true;
    }

    const client = this.getClient();
    return client.cancelDispatch(trackingNumber);
  }
}

import { Logger } from '@nestjs/common';
import {
  CarrierBridge,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResult,
  ShippingRate,
} from './carrier.interface';

/**
 * MNG Kargo entegrasyonu.
 */
export class MngKargoBridge implements CarrierBridge {
  readonly carrierName = 'MNG';
  private readonly logger = new Logger('MngKargoBridge');
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(config: { apiUrl?: string; apiToken?: string }) {
    this.apiUrl = config.apiUrl || process.env.MNG_API_URL || '';
    this.apiToken = config.apiToken || process.env.MNG_API_TOKEN || '';
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    this.logger.log(`MNG Kargo gönderi oluşturuluyor: ${request.receiverAddress.city}`);

    const trackingNumber = `MNG${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return {
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    this.logger.log(`MNG Kargo takip sorgusu: ${trackingNumber}`);

    return {
      trackingNumber,
      status: 'in-transit',
      events: [
        {
          date: new Date(),
          status: 'in-transit',
          description: 'Kargo transfer merkezinde',
          location: 'İzmir',
        },
      ],
    };
  }

  async calculateRate(request: ShipmentRequest): Promise<ShippingRate> {
    const baseCost = 30;
    const weightCost = Math.max(0, (request.weight - 1)) * 4;
    let desiCost = 0;
    if (request.dimensions) {
      const desi = (request.dimensions.length * request.dimensions.width * request.dimensions.height) / 3000;
      desiCost = Math.max(0, (desi - 1)) * 4;
    }

    return {
      carrier: this.carrierName,
      serviceName: 'MNG Kargo Standart',
      cost: baseCost + Math.max(weightCost, desiCost),
      currency: 'TRY',
      estimatedDays: 3,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    this.logger.log(`MNG Kargo iptal: ${trackingNumber}`);
    return true;
  }
}

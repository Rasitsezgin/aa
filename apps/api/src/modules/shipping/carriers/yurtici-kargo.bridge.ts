import { Logger } from '@nestjs/common';
import {
  CarrierBridge,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResult,
  ShippingRate,
} from './carrier.interface';

/**
 * Yurtiçi Kargo entegrasyonu.
 */
export class YurticiKargoBridge implements CarrierBridge {
  readonly carrierName = 'Yurtiçi';
  private readonly logger = new Logger('YurticiKargoBridge');
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(config: {
    apiUrl?: string;
    apiUser?: string;
    apiPassword?: string;
  }) {
    this.apiUrl = config.apiUrl || process.env.YURTICI_API_URL || '';
    this.apiUser = config.apiUser || process.env.YURTICI_API_USER || '';
    this.apiPassword =
      config.apiPassword || process.env.YURTICI_API_PASSWORD || '';
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    this.logger.log(
      `Yurtiçi Kargo gönderi oluşturuluyor: ${request.receiverAddress.city}`,
    );

    const trackingNumber = `YK${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return {
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    this.logger.log(`Yurtiçi Kargo takip sorgusu: ${trackingNumber}`);

    return {
      trackingNumber,
      status: 'in-transit',
      events: [
        {
          date: new Date(),
          status: 'in-transit',
          description: 'Kargo dağıtım merkezinde',
          location: 'Ankara',
        },
      ],
    };
  }

  async calculateRate(request: ShipmentRequest): Promise<ShippingRate> {
    const baseCost = 32;
    const weightCost = Math.max(0, request.weight - 1) * 4.5;
    let desiCost = 0;
    if (request.dimensions) {
      const desi =
        (request.dimensions.length *
          request.dimensions.width *
          request.dimensions.height) /
        3000;
      desiCost = Math.max(0, desi - 1) * 4.5;
    }

    return {
      carrier: this.carrierName,
      serviceName: 'Yurtiçi Kargo Standart',
      cost: baseCost + Math.max(weightCost, desiCost),
      currency: 'TRY',
      estimatedDays: 2,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    this.logger.log(`Yurtiçi Kargo iptal: ${trackingNumber}`);
    return true;
  }
}

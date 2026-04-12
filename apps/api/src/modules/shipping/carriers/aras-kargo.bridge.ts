import { Logger } from '@nestjs/common';
import {
  CarrierBridge,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResult,
  ShippingRate,
} from './carrier.interface';

/**
 * Aras Kargo entegrasyonu.
 * Gerçek API çağrıları, Aras Kargo SOAP/REST API dökümantasyonuna göre yapılmalıdır.
 * Bu implementasyon proje yapısını hazırlar ve test ortamında çalışır.
 */
export class ArasKargoBridge implements CarrierBridge {
  readonly carrierName = 'Aras';
  private readonly logger = new Logger('ArasKargoBridge');
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(config: {
    apiUrl?: string;
    apiUser?: string;
    apiPassword?: string;
  }) {
    this.apiUrl = config.apiUrl || process.env.ARAS_API_URL || '';
    this.apiUser = config.apiUser || process.env.ARAS_API_USER || '';
    this.apiPassword =
      config.apiPassword || process.env.ARAS_API_PASSWORD || '';
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    this.logger.log(
      `Aras Kargo gönderi oluşturuluyor: ${request.receiverAddress.city}`,
    );

    // Aras Kargo SOAP/REST API entegrasyonu gerekli
    // API bilgileri: this.apiUrl, this.apiUser, this.apiPassword
    // Entegrasyon tamamlanınca createShipment, trackShipment, calculateRate metotları aktifleştir

    if (!this.apiUrl || !this.apiUser) {
      this.logger.warn(
        'Aras Kargo API bilgileri eksik. ARAS_API_URL ve ARAS_API_USER ortam değişkenlerini ayarlayın.',
      );
    }

    const trackingNumber = `ARAS${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return {
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    this.logger.log(`Aras Kargo takip sorgusu: ${trackingNumber}`);

    // TODO: Gerçek Aras Kargo API çağrısı
    return {
      trackingNumber,
      status: 'in-transit',
      events: [
        {
          date: new Date(),
          status: 'in-transit',
          description: 'Kargo aktarma merkezinde',
          location: 'İstanbul',
        },
      ],
    };
  }

  async calculateRate(request: ShipmentRequest): Promise<ShippingRate> {
    // Aras Kargo basit fiyatlandırma (gerçek API'den alınacak)
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
      serviceName: 'Aras Kargo Standart',
      cost: baseCost + Math.max(weightCost, desiCost),
      currency: 'TRY',
      estimatedDays: 3,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    this.logger.log(`Aras Kargo iptal: ${trackingNumber}`);
    // TODO: Gerçek API çağrısı
    return true;
  }
}

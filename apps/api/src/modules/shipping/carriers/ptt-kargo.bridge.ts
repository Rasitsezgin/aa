import { Logger } from '@nestjs/common';
import {
  CarrierBridge,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResult,
  ShippingRate,
} from './carrier.interface';

/**
 * PTT Kargo entegrasyonu.
 */
export class PttKargoBridge implements CarrierBridge {
  readonly carrierName = 'PTT';
  private readonly logger = new Logger('PttKargoBridge');
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor(config: {
    apiUrl?: string;
    apiUser?: string;
    apiPassword?: string;
  }) {
    this.apiUrl = config.apiUrl || process.env.PTT_API_URL || '';
    this.apiUser = config.apiUser || process.env.PTT_API_USER || '';
    this.apiPassword = config.apiPassword || process.env.PTT_API_PASSWORD || '';
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    this.logger.log(`PTT Kargo gönderi oluşturuluyor: ${request.receiverAddress.city}`);

    // PTT Kargo SOAP XML Yapısı (Simüle/Hazırlık)
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ptt="http://ptt.gov.tr/kabul">
        <soapenv:Header/>
        <soapenv:Body>
          <ptt:kabulEkle>
            <ptt:kullanici>${this.apiUser}</ptt:kullanici>
            <ptt:sifre>${this.apiPassword}</ptt:sifre>
            <ptt:gonderi>
              <ptt:alici_adi>${request.receiverAddress.fullName || request.receiverAddress.name}</ptt:alici_adi>
              <ptt:alici_adresi>${request.receiverAddress.addressLine || request.receiverAddress.address}</ptt:alici_adresi>
              <ptt:alici_il>${request.receiverAddress.city}</ptt:alici_il>
              <ptt:agirlik>${request.weight}</ptt:agirlik>
            </ptt:gonderi>
          </ptt:kabulEkle>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const trackingNumber = `PTT${Date.now()}`;
    return {
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    this.logger.log(`PTT Kargo takip sorgusu: ${trackingNumber}`);

    return {
      trackingNumber,
      status: 'in-transit',
      events: [
        {
          date: new Date(),
          status: 'in-transit',
          description: 'Kargo işleme merkezinde',
          location: 'Ankara',
        },
      ],
    };
  }

  async calculateRate(request: ShipmentRequest): Promise<ShippingRate> {
    const baseCost = 25; // PTT genelde daha ekonomik
    const weightCost = Math.max(0, request.weight - 1) * 3.5;
    let desiCost = 0;
    if (request.dimensions) {
      const desi =
        (request.dimensions.length *
          request.dimensions.width *
          request.dimensions.height) /
        3000;
      desiCost = Math.max(0, desi - 1) * 3.5;
    }

    return {
      carrier: this.carrierName,
      serviceName: 'PTT Kargo Standart',
      cost: baseCost + Math.max(weightCost, desiCost),
      currency: 'TRY',
      estimatedDays: 4,
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    this.logger.log(`PTT Kargo iptal: ${trackingNumber}`);
    return true;
  }
}

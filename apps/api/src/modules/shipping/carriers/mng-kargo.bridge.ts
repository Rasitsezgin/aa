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

    // MNG Kargo SOAP XML Yapısı (Simüle/Hazırlık)
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mng="http://mngkargo.com.tr/SiparisService">
        <soapenv:Header/>
        <soapenv:Body>
          <mng:SiparisGirisi>
            <mng:pUser>${this.apiToken}</mng:pUser>
            <mng:pSiparisNo>${Date.now()}</mng:pSiparisNo>
            <mng:pAliciAdi>${request.receiverAddress.fullName || request.receiverAddress.name}</mng:pAliciAdi>
            <mng:pAliciAdres>${request.receiverAddress.addressLine || request.receiverAddress.address}</mng:pAliciAdres>
            <mng:pAliciSehir>${request.receiverAddress.city}</mng:pAliciSehir>
          </mng:SiparisGirisi>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const trackingNumber = `MNG${Date.now()}`;
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
    const weightCost = Math.max(0, request.weight - 1) * 4;
    let desiCost = 0;
    if (request.dimensions) {
      const desi =
        (request.dimensions.length *
          request.dimensions.width *
          request.dimensions.height) /
        3000;
      desiCost = Math.max(0, desi - 1) * 4;
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

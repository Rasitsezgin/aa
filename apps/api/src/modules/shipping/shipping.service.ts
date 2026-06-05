import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServiceType } from '@prisma/client';
import {
  CarrierBridge,
  ShipmentRequest,
  ShippingRate,
  ArasKargoBridge,
  YurticiKargoBridge,
  MngKargoBridge,
  PttKargoBridge,
} from './carriers';
import { CreateShipmentDto, CalculateRateDto } from './dto/shipping.dto';
import { TenantCredentialsService } from '../tenant-credentials/tenant-credentials.service';

/** Kargo firması adı ↔ ServiceType eşleştirmesi */
const CARRIER_SERVICE_MAP: Record<string, ServiceType> = {
  Aras: ServiceType.SHIPPING_ARAS,
  Yurtiçi: ServiceType.SHIPPING_YURTICI,
  MNG: ServiceType.SHIPPING_MNG,
  PTT: ServiceType.SHIPPING_PTT,
};

const SERVICE_CARRIER_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CARRIER_SERVICE_MAP).map(([k, v]) => [v, k]),
);

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantCredentials: TenantCredentialsService,
  ) {}

  /**
   * Tenant'ın kimlik bilgileriyle kargo bridge örneği oluştur.
   * Her istekte tenant DB'den okunur → binlerce tenant güvenle çalışır.
   */
  private async getCarrierForTenant(
    tenantId: string,
    carrierName: string,
  ): Promise<CarrierBridge> {
    const serviceType = CARRIER_SERVICE_MAP[carrierName];
    if (!serviceType) {
      const supported = Object.keys(CARRIER_SERVICE_MAP).join(', ');
      throw new BadRequestException(
        `Desteklenmeyen kargo firması: ${carrierName}. Desteklenen: ${supported}`,
      );
    }

    const creds = await this.tenantCredentials.getDecryptedCredentials(
      tenantId,
      serviceType,
    );

    const config = creds
      ? {
          apiUrl: creds.apiUrl,
          apiUser: creds.apiKey,
          apiPassword: creds.apiSecret,
          customerCode: String(creds.apiExtra?.customerCode || '').trim() || undefined,
        }
      : {};

    switch (serviceType) {
      case ServiceType.SHIPPING_ARAS:
        return new ArasKargoBridge(config);
      case ServiceType.SHIPPING_YURTICI:
        return new YurticiKargoBridge(config);
      case ServiceType.SHIPPING_MNG:
        return new MngKargoBridge(config);
      case ServiceType.SHIPPING_PTT:
        return new PttKargoBridge(config);
      default:
        throw new BadRequestException(
          `Desteklenmeyen kargo firması: ${carrierName}`,
        );
    }
  }

  /** Yeni kargo gönderisi oluştur */
  async createShipment(tenantId: string, dto: CreateShipmentDto) {
    // Sipariş kontrolü
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
    });
    if (!order) {
      throw new BadRequestException('Sipariş bulunamadı');
    }

    const carrier = await this.getCarrierForTenant(tenantId, dto.carrier);

    const request: ShipmentRequest = {
      senderAddress: dto.senderAddress,
      receiverAddress: dto.receiverAddress,
      weight: dto.weight,
      dimensions: dto.dimensions,
      description: dto.description,
      isCod: dto.isCod,
      codAmount: dto.codAmount,
    };

    // Kargo firmasına gönder
    const result = await carrier.createShipment(request);

    // DB'ye kaydet
    const shipment = await this.prisma.shipment.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        carrier: dto.carrier,
        trackingNumber: result.trackingNumber,
        status: 'shipped',
        senderAddress: dto.senderAddress as any,
        receiverAddress: dto.receiverAddress as any,
        weight: dto.weight,
        dimensions: dto.dimensions as any,
        cost: 0,
        currency: 'TRY',
        estimatedDelivery: result.estimatedDelivery,
        shippedAt: new Date(),
        events: [
          {
            date: new Date().toISOString(),
            status: 'shipped',
            description: `${dto.carrier} Kargo ile gönderildi`,
          },
        ],
      },
    });

    // Siparişi de güncelle
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber: result.trackingNumber,
        shippingProvider: dto.carrier,
      },
    });

    this.logger.log(
      `Kargo oluşturuldu: ${result.trackingNumber} (${dto.carrier}) - Sipariş: ${dto.orderId}`,
    );

    return shipment;
  }

  /** Kargo takip sorgulama */
  async trackShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) {
      throw new BadRequestException('Kargo bulunamadı');
    }
    if (!shipment.trackingNumber) {
      throw new BadRequestException('Takip numarası mevcut değil');
    }

    const carrier = await this.getCarrierForTenant(tenantId, shipment.carrier);
    const tracking = await carrier.trackShipment(shipment.trackingNumber);

    // DB'de güncelle
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: tracking.status,
        events: tracking.events as any,
        deliveredAt: tracking.deliveredAt,
      },
    });

    // Kargo teslim edildiyse siparişi de güncelle
    if (tracking.status === 'delivered') {
      await this.prisma.order.updateMany({
        where: { id: shipment.orderId, tenantId },
        data: { status: 'DELIVERED' },
      });
    }

    return tracking;
  }

  /** Takip numarasıyla kargo sorgulama */
  async trackByNumber(tenantId: string, trackingNumber: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { trackingNumber, tenantId },
    });
    if (!shipment) {
      throw new BadRequestException('Bu takip numarasına ait kargo bulunamadı');
    }

    return this.trackShipment(tenantId, shipment.id);
  }

  /** Ücret hesaplama - tüm kargo firmaları için */
  async calculateRates(
    tenantId: string,
    dto: CalculateRateDto,
  ): Promise<ShippingRate[]> {
    const request: ShipmentRequest = {
      senderAddress: {
        name: '',
        phone: '',
        address: '',
        city: 'İstanbul',
        district: '',
      },
      receiverAddress: {
        name: '',
        phone: '',
        address: '',
        city: dto.city,
        district: '',
      },
      weight: dto.weight,
      dimensions: dto.dimensions,
    };

    if (dto.carrier) {
      const carrier = await this.getCarrierForTenant(tenantId, dto.carrier);
      const rate = await carrier.calculateRate(request);
      return [rate];
    }

    // Tenant'ın aktif kargo entegrasyonlarından fiyat al
    const activeTypes = await this.tenantCredentials.getActiveServiceTypes(
      tenantId,
      'SHIPPING_',
    );

    const carrierNames = activeTypes
      .map((st) => SERVICE_CARRIER_MAP[st])
      .filter(Boolean);

    // Aktif kargo yoksa tüm desteklenen taşıyıcıları dene
    const namesToCheck =
      carrierNames.length > 0 ? carrierNames : Object.keys(CARRIER_SERVICE_MAP);

    const rates: ShippingRate[] = [];
    for (const name of namesToCheck) {
      try {
        const carrier = await this.getCarrierForTenant(tenantId, name);
        const rate = await carrier.calculateRate(request);
        rates.push(rate);
      } catch (error) {
        this.logger.warn(`${name} ücret hesaplaması başarısız: ${error}`);
      }
    }

    return rates.sort((a, b) => a.cost - b.cost);
  }

  /** Kargo iptal et */
  async cancelShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });
    if (!shipment) {
      throw new BadRequestException('Kargo bulunamadı');
    }
    if (shipment.status === 'delivered') {
      throw new BadRequestException('Teslim edilmiş kargo iptal edilemez');
    }
    if (!shipment.trackingNumber) {
      throw new BadRequestException(
        'Takip numarası olmayan kargo iptal edilemez',
      );
    }

    const carrier = await this.getCarrierForTenant(tenantId, shipment.carrier);
    await carrier.cancelShipment(shipment.trackingNumber);

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'returned' },
    });

    this.logger.log(`Kargo iptal edildi: ${shipment.trackingNumber}`);
    return { success: true, message: 'Kargo iptal edildi' };
  }

  /** Tenant'ın tüm kargolarını listele */
  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      carrier?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { status, carrier, page = 1, limit = 20 } = filters || {};

    const where: any = { tenantId };
    if (status) where.status = status;
    if (carrier) where.carrier = carrier;

    const [shipments, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return {
      shipments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Tek kargo detayı */
  async findOne(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) {
      throw new BadRequestException('Kargo bulunamadı');
    }
    return shipment;
  }

  /** Kargo istatistikleri */
  async getStats(tenantId: string) {
    const [total, byStatus, byCarrier] = await Promise.all([
      this.prisma.shipment.count({ where: { tenantId } }),
      this.prisma.shipment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.shipment.groupBy({
        by: ['carrier'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byCarrier: byCarrier.map((c) => ({
        carrier: c.carrier,
        count: c._count.id,
      })),
    };
  }
}

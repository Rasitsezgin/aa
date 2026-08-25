import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServiceType } from '@pazaryonetimi/database';
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

  /**
   * Termal Kargo Etiketi Oluşturucu (ZPL & HTML Formatı - 100x150mm)
   */
  async generateThermalLabel(
    tenantId: string,
    orderIdOrShipmentId: string,
    format: 'zpl' | 'html' = 'html',
  ) {
    // Sipariş veya kargo kaydını bul
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrShipmentId }, { marketplaceOrderId: orderIdOrShipmentId }],
        tenantId,
      },
      include: { items: true, tenant: { select: { name: true } } },
    });

    const shipment = await this.prisma.shipment.findFirst({
      where: {
        OR: [
          { id: orderIdOrShipmentId },
          { orderId: order?.id || orderIdOrShipmentId },
        ],
        tenantId,
      },
    });

    const trackingNumber =
      shipment?.trackingNumber ||
      `TRK${Date.now().toString().slice(-9)}`;
    const carrierName = shipment?.carrier || 'Yurtiçi Kargo';
    const receiverName = order?.customerName || (shipment?.receiverAddress as any)?.name || 'Alıcı';
    const receiverAddress =
      typeof order?.shippingAddress === 'string'
        ? order.shippingAddress
        : (order?.shippingAddress as any)?.address || (shipment?.receiverAddress as any)?.address || 'Adres bilgisi';
    const receiverCity =
      (order?.shippingAddress as any)?.city || (shipment?.receiverAddress as any)?.city || 'Şehir';
    const senderName = order?.tenant?.name || 'PazarYönetimi Mağazası';
    const marketplaceOrderId = order?.marketplaceOrderId || order?.id || 'SIP-001';
    const itemsSummary = order?.items
      ? order.items.map((it) => `${it.title} (x${it.quantity})`).join(', ')
      : 'Sipariş Paketi';

    if (format === 'zpl') {
      // Standart Zebra Programming Language (ZPL II) Şablonu
      const zpl = `
^XA
^PW812
^LL1218
^PON
^FO50,50^GB712,1118,4^FS
^FO80,80^A0N,40,40^FD${senderName}^FS
^FO80,130^A0N,25,25^FDPazaryeri: ${order?.platform || 'PAZARYERİ'}^FS
^FO80,165^A0N,25,25^FDSipariş No: ${marketplaceOrderId}^FS
^FO50,210^GB712,2,2^FS
^FO80,230^A0N,30,30^FDKARGO: ${carrierName.toUpperCase()}^FS
^FO80,280^BY3,3,100^BCN,100,Y,N,N^FD${trackingNumber}^FS
^FO50,440^GB712,2,2^FS
^FO80,460^A0N,25,25^FDALICI BİLGİLERİ:^FS
^FO80,500^A0N,35,35^FD${receiverName}^FS
^FO80,550^A0N,25,25^FD${receiverAddress.slice(0, 45)}^FS
^FO80,585^A0N,25,25^FD${receiverAddress.slice(45, 90)}^FS
^FO80,625^A0N,30,30^FD${receiverCity.toUpperCase()}^FS
^FO50,680^GB712,2,2^FS
^FO80,700^A0N,25,25^FDİÇERİK ÖZETİ:^FS
^FO80,735^A0N,20,20^FD${itemsSummary.slice(0, 60)}^FS
^FO500,900^BQN,2,6^FDQA,${trackingNumber}^FS
^FO80,1100^A0N,20,20^FDPazarYonetimi.com Termal Kargo Sistemi^FS
^XZ
      `.trim();

      return { format: 'zpl', data: zpl, trackingNumber };
    }

    // HTML / CSS Print Ready Template (100x150mm Termal Çıktı)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kargo Etiketi - ${trackingNumber}</title>
  <style>
    @page { size: 100mm 150mm; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 12px; box-sizing: border-box; width: 100mm; height: 150mm; background: #fff; color: #000; }
    .label-box { border: 2px solid #000; padding: 12px; height: 95%; display: flex; flex-direction: column; justify-content: space-between; border-radius: 4px; }
    .header { border-bottom: 2px solid #000; padding-bottom: 8px; }
    .sender { font-size: 14px; font-weight: bold; }
    .meta { font-size: 11px; color: #333; margin-top: 4px; }
    .barcode-section { text-align: center; padding: 12px 0; border-bottom: 2px solid #000; }
    .carrier-badge { display: inline-block; background: #000; color: #fff; padding: 3px 8px; font-weight: bold; font-size: 13px; border-radius: 3px; margin-bottom: 6px; }
    .barcode-text { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; margin-top: 4px; }
    .receiver { padding: 10px 0; border-bottom: 2px solid #000; }
    .receiver-title { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
    .receiver-name { font-size: 15px; font-weight: bold; margin: 3px 0; }
    .receiver-address { font-size: 12px; line-height: 1.3; }
    .receiver-city { font-size: 14px; font-weight: bold; margin-top: 4px; }
    .items { font-size: 10px; color: #444; padding-top: 6px; }
    .footer { font-size: 9px; text-align: center; color: #888; }
  </style>
</head>
<body onload="window.print()">
  <div class="label-box">
    <div class="header">
      <div class="sender">${senderName}</div>
      <div class="meta">${order?.platform || 'PAZARYERİ'} | Sipariş No: <strong>${marketplaceOrderId}</strong></div>
    </div>
    <div class="barcode-section">
      <div class="carrier-badge">${carrierName.toUpperCase()}</div>
      <div style="font-size: 32px; font-family: 'Libre Barcode 128', monospace; letter-spacing: 5px;">*${trackingNumber}*</div>
      <div class="barcode-text">${trackingNumber}</div>
    </div>
    <div class="receiver">
      <div class="receiver-title">Alıcı Bilgileri</div>
      <div class="receiver-name">${receiverName}</div>
      <div class="receiver-address">${receiverAddress}</div>
      <div class="receiver-city">${receiverCity.toUpperCase()}</div>
    </div>
    <div class="items">
      <strong>Paket İçeriği:</strong> ${itemsSummary}
    </div>
    <div class="footer">
      PazarYönetimi Sıfır-Tık Kargo Otomasyonu
    </div>
  </div>
</body>
</html>
    `.trim();

    return { format: 'html', data: html, trackingNumber };
  }

  /**
   * Toplu Kargo Etiketi Üretimi (Çoklu Sipariş)
   */
  async generateBulkThermalLabels(tenantId: string, orderIds: string[]) {
    const labels = await Promise.all(
      orderIds.map((id) => this.generateThermalLabel(tenantId, id, 'html')),
    );
    return {
      count: labels.length,
      labels,
    };
  }
}

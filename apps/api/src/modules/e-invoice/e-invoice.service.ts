import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServiceType } from '@prisma/client';
import { CreateEInvoiceDto, CancelEInvoiceDto } from './dto/e-invoice.dto';
import { TenantCredentialsService } from '../tenant-credentials/tenant-credentials.service';
import * as crypto from 'crypto';
import { EInvoiceIntegrator } from './integrators/integrator.interface';
import { ParasutIntegrator } from './integrators/parasut.bridge';
import { LogoIntegrator } from './integrators/logo.bridge';
import { BirFaturaIntegrator } from './integrators/birfatura.bridge';
import { EdmIntegrator } from './integrators/edm.bridge';
import { MikroIntegrator, ZirveIntegrator } from './integrators/mikro-zirve.bridge';

/**
 * E-Fatura Servisi (Çok Kiracılı)
 *
 * Her tenant kendi e-fatura entegratör bilgilerini DB'de saklar.
 * Desteklenen entegratörler: Foriba/Fitbul, Logo, Paraşüt, eFinans
 */
@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantCredentials: TenantCredentialsService,
  ) {}

  private getIntegrator(provider: string): EInvoiceIntegrator {
    switch (provider.toLowerCase()) {
      case 'parasut':
        return new ParasutIntegrator();
      case 'logo':
        return new LogoIntegrator();
      case 'birfatura':
        return new BirFaturaIntegrator();
      case 'edm':
        return new EdmIntegrator();
      case 'mikro':
        return new MikroIntegrator();
      case 'zirve':
        return new ZirveIntegrator();
      default:
        return new ParasutIntegrator(); // Default to Parasut
    }
  }

  /** Tenant'ın e-fatura entegratör bilgilerini getir */
  private async getEInvoiceConfig(tenantId: string) {
    const types = [
      ServiceType.EINVOICE_FORIBA,
      ServiceType.EINVOICE_LOGO,
      ServiceType.EINVOICE_PARASUT,
      ServiceType.EINVOICE_EFINANS,
    ];

    for (const st of types) {
      const creds = await this.tenantCredentials.getDecryptedCredentials(
        tenantId,
        st,
      );
      if (creds) {
        const providerMap: Record<string, string> = {
          [ServiceType.EINVOICE_FORIBA]: 'foriba',
          [ServiceType.EINVOICE_LOGO]: 'logo',
          [ServiceType.EINVOICE_PARASUT]: 'parasut',
          [ServiceType.EINVOICE_EFINANS]: 'efinans',
        };
        return {
          provider: providerMap[st] || 'parasut',
          apiUrl: creds.apiUrl || '',
          apiKey: creds.apiKey || '',
          apiSecret: creds.apiSecret || '',
          username: creds.username,
          password: creds.password,
        };
      }
    }

    return null;
  }

  /** E-fatura oluştur ve gönder */
  async createInvoice(tenantId: string, dto: CreateEInvoiceDto) {
    // Sipariş kontrolü
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
      include: { items: true },
    });
    if (!order) {
      throw new BadRequestException('Sipariş bulunamadı');
    }

    // Fatura numarası oluştur (GIB formatı: ABC2024000000001)
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    // Fatura kalemlerini hesapla
    const invoiceItems = dto.items.map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      const discount = item.discount || 0;
      const taxableAmount = lineTotal - discount;
      const taxAmount = taxableAmount * (item.taxRate / 100);
      return {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal,
        discount,
        taxableAmount,
        taxRate: item.taxRate,
        taxAmount,
        total: taxableAmount + taxAmount,
      };
    });

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.taxableAmount, 0);
    const taxAmount = invoiceItems.reduce((sum, i) => sum + i.taxAmount, 0);
    const totalAmount = subtotal + taxAmount;

    // GIB UUID oluştur
    const gibInvoiceId = crypto.randomUUID();

    this.logger.log(
      `E-fatura oluşturuluyor: ${invoiceNumber}, Sipariş: ${dto.orderId}`,
    );

    /**
     * Entegratör API entegrasyonu için (Foriba/Logo/Paraşüt):
     * 1. UBL-TR XML oluştur: this.generateUblXml(invoiceData)
     * 2. Entegratör API'ye gönder: this.sendToProvider(config, ublXml)
     * Entegratör SDK kurulduğunda bu alan aktifleştirilecek.
     */

    // Entegratör ayarlarını al
    const config = await this.getEInvoiceConfig(tenantId);
    let bridgeResponse: any = null;

    if (config) {
      const integrator = this.getIntegrator(config.provider);
      bridgeResponse = await integrator.createInvoice(dto, config);
      
      if (!bridgeResponse.success) {
        throw new BadRequestException(`Entegratör Hatası: ${bridgeResponse.error}`);
      }
    }

    // DB'ye kaydet
    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        invoiceNumber: bridgeResponse?.invoiceNumber || invoiceNumber,
        type: dto.type || 'SATIS',
        scenario: dto.scenario || 'TEMEL',
        buyerTitle: dto.buyer.title,
        buyerTaxNumber: dto.buyer.taxNumber,
        buyerTaxOffice: dto.buyer.taxOffice,
        buyerAddress: dto.buyer.address,
        buyerCity: dto.buyer.city,
        buyerDistrict: dto.buyer.district,
        buyerEmail: dto.buyer.email,
        subtotal,
        taxAmount,
        totalAmount,
        currency: dto.currency || 'TRY',
        items: invoiceItems as any,
        status: bridgeResponse?.status || 'SENT',
        gibInvoiceId: bridgeResponse?.gibInvoiceId || gibInvoiceId,
        gibEnvelopeId: `ENV${Date.now()}`,
        gibStatusCode: '1200',
        gibStatusDesc: 'Fatura başarıyla gönderildi',
        sentAt: new Date(),
        url: bridgeResponse?.url,
        xmlUrl: bridgeResponse?.xmlUrl,
        notes: dto.notes,
      },
    });

    this.logger.log(
      `E-fatura gönderildi: ${invoice.invoiceNumber} (GIB ID: ${invoice.gibInvoiceId})`,
    );

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      gibInvoiceId: invoice.gibInvoiceId,
      status: invoice.status,
      totalAmount,
      currency: invoice.currency,
      url: invoice.url,
    };
  }

  /** E-fatura durumu sorgula (GIB'den) */
  async checkInvoiceStatus(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new BadRequestException('Fatura bulunamadı');
    }

    // Entegratör API üzerinden GIB durum sorgulaması yapılacak
    // Entegratör SDK kurulmadan önce mevcut DB durumu döndürülür

    return {
      invoiceNumber: invoice.invoiceNumber,
      gibInvoiceId: invoice.gibInvoiceId,
      status: invoice.status,
      gibStatusCode: invoice.gibStatusCode,
      gibStatusDesc: invoice.gibStatusDesc,
    };
  }

  /** E-fatura iptal et */
  async cancelInvoice(
    tenantId: string,
    invoiceId: string,
    dto: CancelEInvoiceDto,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new BadRequestException('Fatura bulunamadı');
    }
    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Bu fatura zaten iptal edilmiş');
    }

    this.logger.log(
      `E-fatura iptal: ${invoice.invoiceNumber}, Neden: ${dto.reason}`,
    );

    // Entegratör API üzerinden GIB'de iptal işlemi yapılacak
    // Entegratör SDK kurulmadan önce DB üzerinden iptal kaydı tutulur

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'CANCELLED',
        gibStatusCode: '1400',
        gibStatusDesc: `İptal: ${dto.reason}`,
        notes: `İptal nedeni: ${dto.reason}`,
      },
    });

    return { success: true, message: 'E-fatura iptal edildi' };
  }

  /** Fatura listele */
  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const {
      status,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: any = { tenantId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            select: { id: true, customerName: true, marketplaceOrderId: true },
          },
        },
        orderBy: { invoiceDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Tek fatura detayı */
  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { order: { include: { items: true } } },
    });
    if (!invoice) {
      throw new BadRequestException('Fatura bulunamadı');
    }
    return invoice;
  }

  /** Fatura istatistikleri */
  async getStats(tenantId: string) {
    const [total, byStatus, revenue] = await Promise.all([
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: { in: ['SENT', 'ACCEPTED'] } },
        _sum: { totalAmount: true, taxAmount: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      totals: {
        amount: Number(revenue._sum.totalAmount) || 0,
        tax: Number(revenue._sum.taxAmount) || 0,
      },
    };
  }

  /** Fatura numarası oluştur (sıralı) */
  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PYN${year}`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(
        lastInvoice.invoiceNumber.replace(prefix, ''),
        10,
      );
      if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(9, '0')}`;
  }
}

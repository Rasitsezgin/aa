import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServiceType } from '@prisma/client';
import {
  CreatePaymentDto,
  Create3DPaymentDto,
  RefundPaymentDto,
  CheckInstallmentDto,
} from './dto/payment.dto';
import { TenantCredentialsService } from '../tenant-credentials/tenant-credentials.service';
import { isSimulationAllowed } from '../../common/simulation.util';
import { IyzicoGateway } from './iyzico.gateway';

/**
 * iyzico Ödeme Servisi (Çok Kiracılı)
 *
 * Her tenant kendi iyzico API bilgilerini DB'de saklar.
 * Ödeme işlemi yapılırken tenant'ın şifresi çözülmüş bilgileri kullanılır.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantCredentials: TenantCredentialsService,
  ) {}

  private assertPaymentSimulationAllowed(): void {
    if (!isSimulationAllowed('ALLOW_SIMULATED_PAYMENTS')) {
      throw new BadRequestException(
        'Ödeme işlemi production ortamında devre dışı. iyzico SDK entegrasyonu veya ALLOW_SIMULATED_PAYMENTS=true gerekir.',
      );
    }
  }

  /** Tenant'ın ödeme entegrasyon bilgilerini getir */
  private async getPaymentConfig(tenantId: string) {
    const creds = await this.tenantCredentials.getDecryptedCredentials(
      tenantId,
      ServiceType.PAYMENT_IYZICO,
    );
    return {
      apiKey: creds?.apiKey || '',
      secretKey: creds?.apiSecret || '',
      baseUrl: creds?.apiUrl || 'https://sandbox-api.iyzipay.com',
    };
  }

  private hasIyzicoCredentials(config: {
    apiKey: string;
    secretKey: string;
  }): boolean {
    return Boolean(config.apiKey && config.secretKey);
  }

  private buildIyzicoGateway(config: {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
  }) {
    return new IyzicoGateway({
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      baseUrl: config.baseUrl,
    });
  }

  /** Tek çekim ödeme */
  async createPayment(tenantId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
      include: { items: true },
    });
    if (!order) {
      throw new BadRequestException('Sipariş bulunamadı');
    }

    this.logger.log(
      `Ödeme oluşturuluyor: Sipariş ${dto.orderId}, Tutar: ${dto.amount} ${dto.currency || 'TRY'}`,
    );

    const paymentConfig = await this.getPaymentConfig(tenantId);

    if (this.hasIyzicoCredentials(paymentConfig)) {
      const gateway = this.buildIyzicoGateway(paymentConfig);
      let result;
      try {
        result = await gateway.createPayment(dto);
      } catch (error) {
        throw new BadRequestException(
          `iyzico ödeme hatası: ${(error as Error).message}`,
        );
      }

      if (result.status !== 'success') {
        throw new BadRequestException(
          result.errorMessage || 'iyzico ödeme reddedildi',
        );
      }

      const paidAmount = Number(result.paidPrice ?? dto.amount);
      const commission = Math.max(0, dto.amount - paidAmount);
      const transactionId = String(
        result.paymentId || result.paymentTransactionId || `IYZ${Date.now()}`,
      );

      const payment = await this.prisma.payment.create({
        data: {
          tenantId,
          orderId: dto.orderId,
          platform: 'iyzico',
          amount: dto.amount,
          netAmount: paidAmount,
          commission,
          currency: dto.currency || 'TRY',
          status: 'completed',
          type: 'sale',
          paymentMethod: 'credit-card',
          transactionId,
          paidAt: new Date(),
          metadata: {
            installment: dto.installment || 1,
            cardType: 'CREDIT_CARD',
            lastFourDigits: dto.card.cardNumber.slice(-4),
            buyerEmail: dto.buyer.email,
            iyzicoPaymentId: result.paymentId,
            iyzicoPaymentTransactionId: result.paymentTransactionId,
            fraudStatus: result.fraudStatus,
            provider: 'iyzipay',
          },
        },
      });

      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { paymentStatus: 'PAID' },
      });

      return {
        success: true,
        paymentId: payment.id,
        transactionId,
        status: 'completed',
        amount: dto.amount,
        currency: dto.currency || 'TRY',
        provider: 'iyzipay',
      };
    }

    this.assertPaymentSimulationAllowed();

    const transactionId = `IYZ${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        platform: 'iyzico',
        amount: dto.amount,
        netAmount: dto.amount * 0.975,
        commission: dto.amount * 0.025,
        currency: dto.currency || 'TRY',
        status: 'completed',
        type: 'sale',
        paymentMethod: 'credit-card',
        transactionId,
        paidAt: new Date(),
        metadata: {
          installment: dto.installment || 1,
          cardType: 'CREDIT_CARD',
          lastFourDigits: dto.card.cardNumber.slice(-4),
          buyerEmail: dto.buyer.email,
          provider: 'simulated',
        },
      },
    });

    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { paymentStatus: 'PAID' },
    });

    return {
      success: true,
      paymentId: payment.id,
      transactionId,
      status: 'completed',
      amount: dto.amount,
      currency: dto.currency || 'TRY',
      provider: 'simulated',
    };
  }

  /** 3D Secure ödeme başlat */
  async create3DPayment(tenantId: string, dto: Create3DPaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
    });
    if (!order) {
      throw new BadRequestException('Sipariş bulunamadı');
    }

    const paymentConfig = await this.getPaymentConfig(tenantId);
    if (this.hasIyzicoCredentials(paymentConfig)) {
      throw new BadRequestException(
        '3D Secure akışı henüz iyzipay SDK ile bağlanmadı. Tek çekim ödeme endpointini kullanın.',
      );
    }

    this.assertPaymentSimulationAllowed();

    this.logger.log(`3D Secure ödeme başlatılıyor: Sipariş ${dto.orderId}`);

    return {
      success: true,
      status: 'INIT_THREEDS',
      htmlContent:
        '<html><body><p>3D Secure doğrulama simülasyonu</p></body></html>',
      callbackUrl: dto.callbackUrl,
      provider: 'simulated',
    };
  }

  /** 3D Secure callback işle */
  async handle3DCallback(tenantId: string, paymentId: string) {
    this.assertPaymentSimulationAllowed();

    this.logger.log(`3D Secure callback: ${paymentId}`);

    // TODO: iyzipay SDK - threeDSAuth
    // Gerçek implementasyonda paymentId ile ödemeyi tamamla

    return {
      success: true,
      status: 'completed',
      paymentId,
    };
  }

  /** İade işlemi */
  async refundPayment(tenantId: string, dto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: dto.paymentTransactionId, tenantId },
    });
    if (!payment) {
      throw new BadRequestException('Ödeme işlemi bulunamadı');
    }
    if (payment.status === 'refunded') {
      throw new BadRequestException('Bu ödeme zaten iade edilmiş');
    }

    this.logger.log(
      `İade işlemi: ${dto.paymentTransactionId}, Tutar: ${dto.amount}`,
    );

    const paymentConfig = await this.getPaymentConfig(tenantId);
    const metadata = (payment.metadata || {}) as Record<string, unknown>;
    let refundTransactionId = `REF${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    if (this.hasIyzicoCredentials(paymentConfig)) {
      const gateway = this.buildIyzicoGateway(paymentConfig);
      const iyzicoTxId = String(
        metadata.iyzicoPaymentTransactionId || dto.paymentTransactionId,
      );
      let result;
      try {
        result = await gateway.refund(
          { ...dto, paymentTransactionId: iyzicoTxId },
          String(metadata.buyerIp || '127.0.0.1'),
        );
      } catch (error) {
        throw new BadRequestException(
          `iyzico iade hatası: ${(error as Error).message}`,
        );
      }

      if (result.status !== 'success') {
        throw new BadRequestException(
          String(result.errorMessage || 'iyzico iade reddedildi'),
        );
      }

      refundTransactionId = String(
        result.paymentTransactionId || refundTransactionId,
      );
    } else {
      this.assertPaymentSimulationAllowed();
    }

    // İade kaydı
    await this.prisma.payment.create({
      data: {
        tenantId,
        orderId: payment.orderId,
        platform: 'iyzico',
        amount: dto.amount,
        currency: payment.currency,
        status: 'completed',
        type: 'refund',
        paymentMethod: payment.paymentMethod,
        transactionId: refundTransactionId,
        paidAt: new Date(),
        metadata: {
          originalTransactionId: dto.paymentTransactionId,
          reason: dto.reason || 'İade talebi',
        },
      },
    });

    // Orijinal ödemeyi güncelle
    const refundedFull = dto.amount >= Number(payment.amount);
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: refundedFull ? 'refunded' : 'completed' },
    });

    // Sipariş durumunu güncelle
    if (payment.orderId) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: refundedFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });
    }

    this.logger.log(`İade başarılı: ${refundTransactionId}`);

    return {
      success: true,
      refundTransactionId,
      amount: dto.amount,
      status: refundedFull ? 'full_refund' : 'partial_refund',
    };
  }

  /** Taksit seçenekleri sorgula */
  async checkInstallments(
    tenantId: string,
    dto: CheckInstallmentDto,
  ) {
    this.logger.log(
      `Taksit sorgusu: BIN ${dto.binNumber}, Tutar: ${dto.amount}`,
    );

    const paymentConfig = await this.getPaymentConfig(tenantId);
    if (this.hasIyzicoCredentials(paymentConfig)) {
      const gateway = this.buildIyzicoGateway(paymentConfig);
      try {
        const result = await gateway.retrieveInstallments(dto);
        if (result.status === 'success') {
          return result;
        }
        throw new BadRequestException(
          String(result.errorMessage || 'Taksit sorgusu başarısız'),
        );
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(
          `iyzico taksit sorgusu hatası: ${(error as Error).message}`,
        );
      }
    }

    this.assertPaymentSimulationAllowed();

    const installmentOptions = [
      {
        installmentNumber: 1,
        totalPrice: dto.amount,
        installmentPrice: dto.amount,
      },
      {
        installmentNumber: 2,
        totalPrice: dto.amount * 1.02,
        installmentPrice: (dto.amount * 1.02) / 2,
      },
      {
        installmentNumber: 3,
        totalPrice: dto.amount * 1.035,
        installmentPrice: (dto.amount * 1.035) / 3,
      },
      {
        installmentNumber: 6,
        totalPrice: dto.amount * 1.06,
        installmentPrice: (dto.amount * 1.06) / 6,
      },
      {
        installmentNumber: 9,
        totalPrice: dto.amount * 1.09,
        installmentPrice: (dto.amount * 1.09) / 9,
      },
      {
        installmentNumber: 12,
        totalPrice: dto.amount * 1.12,
        installmentPrice: (dto.amount * 1.12) / 12,
      },
    ];

    return {
      binNumber: dto.binNumber,
      cardType: 'CREDIT_CARD',
      cardAssociation: 'VISA',
      cardFamily: 'Bonus',
      installmentOptions,
    };
  }

  /** Ödeme detayı getir */
  async getPaymentDetail(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });
    if (!payment) {
      throw new BadRequestException('Ödeme bulunamadı');
    }
    return payment;
  }

  /** Tenant'ın ödemelerini listele */
  async findAll(
    tenantId: string,
    filters?: { status?: string; type?: string; page?: number; limit?: number },
  ) {
    const { status, type, page = 1, limit = 20 } = filters || {};

    const where: any = { tenantId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Ödeme istatistikleri */
  async getStats(tenantId: string) {
    const [total, byStatus, revenue] = await Promise.all([
      this.prisma.payment.count({ where: { tenantId } }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'completed', type: 'sale' },
        _sum: { amount: true, netAmount: true, commission: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        amount: Number(s._sum.amount) || 0,
      })),
      revenue: {
        totalAmount: Number(revenue._sum.amount) || 0,
        netAmount: Number(revenue._sum.netAmount) || 0,
        commission: Number(revenue._sum.commission) || 0,
      },
    };
  }
}

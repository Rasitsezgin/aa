import { Logger } from '@nestjs/common';
import {
  CheckInstallmentDto,
  CreatePaymentDto,
  RefundPaymentDto,
} from './dto/payment.dto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require('iyzipay');

export interface IyzicoGatewayConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface IyzicoPaymentResult {
  status: string;
  errorMessage?: string;
  paymentId?: string;
  paymentTransactionId?: string;
  paidPrice?: string | number;
  installment?: number | string;
  fraudStatus?: number;
  [key: string]: unknown;
}

export class IyzicoGateway {
  private readonly logger = new Logger(IyzicoGateway.name);
  private readonly client: {
    payment: {
      create: (
        request: Record<string, unknown>,
        cb: (err: Error | null, result: IyzicoPaymentResult) => void,
      ) => void;
    };
    installmentInfo: {
      retrieve: (
        request: Record<string, unknown>,
        cb: (err: Error | null, result: Record<string, unknown>) => void,
      ) => void;
    };
    refund: {
      create: (
        request: Record<string, unknown>,
        cb: (err: Error | null, result: Record<string, unknown>) => void,
      ) => void;
    };
  };

  constructor(config: IyzicoGatewayConfig) {
    this.client = new Iyzipay({
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      uri: config.baseUrl,
    });
  }

  async createPayment(dto: CreatePaymentDto): Promise<IyzicoPaymentResult> {
    const conversationId = `PY-${dto.orderId}-${Date.now()}`;
    const price = this.formatPrice(dto.amount);
    const paidPrice = this.formatPrice(dto.amount);
    const installment = String(dto.installment || 1);

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price,
      paidPrice,
      currency: dto.currency || Iyzipay.CURRENCY.TRY,
      installment,
      basketId: dto.orderId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: dto.card.cardHolderName,
        cardNumber: dto.card.cardNumber,
        expireMonth: dto.card.expireMonth,
        expireYear: dto.card.expireYear,
        cvc: dto.card.cvc,
        registerCard: '0',
      },
      buyer: {
        id: dto.buyer.id,
        name: dto.buyer.name,
        surname: dto.buyer.surname,
        gsmNumber: dto.buyer.phone,
        email: dto.buyer.email,
        identityNumber: dto.buyer.identityNumber,
        registrationAddress: dto.buyer.address,
        ip: dto.buyer.ip || '127.0.0.1',
        city: dto.buyer.city,
        country: dto.buyer.country || 'Turkey',
      },
      shippingAddress: {
        contactName: dto.shippingAddress.contactName,
        city: dto.shippingAddress.city,
        country: dto.shippingAddress.country || 'Turkey',
        address: dto.shippingAddress.address,
        zipCode: dto.shippingAddress.zipCode || '34000',
      },
      billingAddress: {
        contactName: dto.billingAddress.contactName,
        city: dto.billingAddress.city,
        country: dto.billingAddress.country || 'Turkey',
        address: dto.billingAddress.address,
        zipCode: dto.billingAddress.zipCode || '34000',
      },
      basketItems: dto.items.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category,
        category2: 'General',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: this.formatPrice(item.price),
      })),
    };

    return this.invoke(
      this.client.payment.create.bind(this.client.payment),
      request,
    );
  }

  async retrieveInstallments(dto: CheckInstallmentDto) {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `INS-${Date.now()}`,
      binNumber: dto.binNumber,
      price: this.formatPrice(dto.amount),
    };

    return this.invoke(
      this.client.installmentInfo.retrieve.bind(this.client.installmentInfo),
      request,
    );
  }

  async refund(dto: RefundPaymentDto, ip = '127.0.0.1') {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `REF-${Date.now()}`,
      paymentTransactionId: dto.paymentTransactionId,
      price: this.formatPrice(dto.amount),
      currency: Iyzipay.CURRENCY.TRY,
      ip,
      reason: Iyzipay.REFUND_REASON.OTHER,
      description: dto.reason || 'İade talebi',
    };

    return this.invoke(
      this.client.refund.create.bind(this.client.refund),
      request,
    );
  }

  private formatPrice(amount: number): string {
    return Number(amount).toFixed(2);
  }

  private invoke<T>(
    fn: (
      request: Record<string, unknown>,
      cb: (err: Error | null, result: T) => void,
    ) => void,
    request: Record<string, unknown>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      fn(request, (err, result) => {
        if (err) {
          this.logger.error(`iyzico API hatası: ${err.message}`);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}

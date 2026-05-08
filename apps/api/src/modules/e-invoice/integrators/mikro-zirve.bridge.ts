import { Logger } from '@nestjs/common';
import { EInvoiceIntegrator, IntegratorConfig, InvoiceResponse } from './integrator.interface';
import { CreateEInvoiceDto } from '../dto/e-invoice.dto';

/**
 * Mikro Yazılım Entegratörü
 */
export class MikroIntegrator implements EInvoiceIntegrator {
  readonly name = 'Mikro';
  private readonly logger = new Logger('MikroIntegrator');

  async createInvoice(dto: CreateEInvoiceDto, config: IntegratorConfig): Promise<InvoiceResponse> {
    this.logger.log(`Mikro üzerinden fatura oluşturuluyor: ${dto.orderId}`);

    return {
      success: true,
      invoiceNumber: `MKR2024${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      gibInvoiceId: crypto.randomUUID(),
      status: 'SENT'
    };
  }

  async checkStatus(gibInvoiceId: string, config: IntegratorConfig): Promise<string> { return 'SENT'; }
  async cancelInvoice(gibInvoiceId: string, reason: string, config: IntegratorConfig): Promise<boolean> { return true; }
  async getInvoicePdf(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return `https://mikro-bulut.com/invoice/pdf/${gibInvoiceId}`;
  }
}

/**
 * Zirve Yazılım Entegratörü
 */
export class ZirveIntegrator implements EInvoiceIntegrator {
  readonly name = 'Zirve';
  private readonly logger = new Logger('ZirveIntegrator');

  async createInvoice(dto: CreateEInvoiceDto, config: IntegratorConfig): Promise<InvoiceResponse> {
    this.logger.log(`Zirve üzerinden fatura oluşturuluyor: ${dto.orderId}`);

    return {
      success: true,
      invoiceNumber: `ZRV2024${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      gibInvoiceId: crypto.randomUUID(),
      status: 'SENT'
    };
  }

  async checkStatus(gibInvoiceId: string, config: IntegratorConfig): Promise<string> { return 'SENT'; }
  async cancelInvoice(gibInvoiceId: string, reason: string, config: IntegratorConfig): Promise<boolean> { return true; }
  async getInvoicePdf(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return `https://zirve-portal.com/pdf/${gibInvoiceId}`;
  }
}

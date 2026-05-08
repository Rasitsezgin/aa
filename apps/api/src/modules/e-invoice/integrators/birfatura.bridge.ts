import { Logger } from '@nestjs/common';
import { EInvoiceIntegrator, IntegratorConfig, InvoiceResponse } from './integrator.interface';
import { CreateEInvoiceDto } from '../dto/e-invoice.dto';

/**
 * BirFatura Entegratörü
 * E-Ticaret odaklı fatura yönetimi.
 */
export class BirFaturaIntegrator implements EInvoiceIntegrator {
  readonly name = 'BirFatura';
  private readonly logger = new Logger('BirFaturaIntegrator');

  async createInvoice(dto: CreateEInvoiceDto, config: IntegratorConfig): Promise<InvoiceResponse> {
    this.logger.log(`BirFatura üzerinden fatura oluşturuluyor: ${dto.orderId}`);

    // BirFatura REST API Çağrısı (Simüle)
    // endpoint: https://api.birfatura.com/v1/Invoice/Create
    
    return {
      success: true,
      invoiceNumber: `BF${new Date().getFullYear()}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      gibInvoiceId: crypto.randomUUID(),
      status: 'SENT',
      url: `https://panel.birfatura.com/Invoice/View/${dto.orderId}`
    };
  }

  async checkStatus(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return 'SENT';
  }

  async cancelInvoice(gibInvoiceId: string, reason: string, config: IntegratorConfig): Promise<boolean> {
    return true;
  }

  async getInvoicePdf(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return `https://panel.birfatura.com/Invoice/Pdf/${gibInvoiceId}`;
  }
}

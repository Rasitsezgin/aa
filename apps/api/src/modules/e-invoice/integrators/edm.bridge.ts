import { Logger } from '@nestjs/common';
import { EInvoiceIntegrator, IntegratorConfig, InvoiceResponse } from './integrator.interface';
import { CreateEInvoiceDto } from '../dto/e-invoice.dto';

/**
 * EDM Bilişim Entegratörü
 * Kurumsal SOAP tabanlı e-fatura servisi.
 */
export class EdmIntegrator implements EInvoiceIntegrator {
  readonly name = 'EDM';
  private readonly logger = new Logger('EdmIntegrator');

  async createInvoice(dto: CreateEInvoiceDto, config: IntegratorConfig): Promise<InvoiceResponse> {
    this.logger.log(`EDM üzerinden SOAP faturası oluşturuluyor: ${dto.orderId}`);

    // EDM SOAP XML Yapısı (Simüle)
    // endpoint: https://portal.edmbilisim.com.tr/EFaturaOIB/EFaturaOIB.svc
    
    return {
      success: true,
      invoiceNumber: `EDM${new Date().getFullYear()}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      gibInvoiceId: crypto.randomUUID(),
      status: 'SENT'
    };
  }

  async checkStatus(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return 'SENT';
  }

  async cancelInvoice(gibInvoiceId: string, reason: string, config: IntegratorConfig): Promise<boolean> {
    return true;
  }

  async getInvoicePdf(gibInvoiceId: string, config: IntegratorConfig): Promise<string> {
    return `https://portal.edmbilisim.com.tr/Invoice/Pdf/${gibInvoiceId}`;
  }
}

import { CreateEInvoiceDto } from '../dto/e-invoice.dto';

export interface InvoiceResponse {
  success: boolean;
  invoiceNumber: string;
  gibInvoiceId: string;
  status: string;
  url?: string;
  xmlUrl?: string;
  error?: string;
}

export interface IntegratorConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  username?: string;
  password?: string;
}

export interface EInvoiceIntegrator {
  readonly name: string;
  createInvoice(dto: CreateEInvoiceDto, config: IntegratorConfig): Promise<InvoiceResponse>;
  checkStatus(gibInvoiceId: string, config: IntegratorConfig): Promise<string>;
  cancelInvoice(gibInvoiceId: string, reason: string, config: IntegratorConfig): Promise<boolean>;
  getInvoicePdf(gibInvoiceId: string, config: IntegratorConfig): Promise<string>;
}

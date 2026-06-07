/** Standart e-fatura modeli */
export interface NormalizedInvoiceDto {
  externalId: string;
  invoiceNumber: string;
  orderId?: string;
  orderNumber?: string;
  providerId: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled';
  totalAmount: number;
  taxAmount: number;
  currency: string;
  issuedAt: string;
  customerName?: string;
  customerTaxId?: string;
  pdfUrl?: string;
  raw?: Record<string, unknown>;
}

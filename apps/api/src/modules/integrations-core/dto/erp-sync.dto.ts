/** ERP müşteri kaydı */
export interface ErpCustomerDto {
  externalId: string;
  code: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  balance?: number;
  raw?: Record<string, unknown>;
}

/** ERP stok kaydı */
export interface ErpStockDto {
  externalId: string;
  sku: string;
  productName: string;
  warehouseCode?: string;
  quantity: number;
  reservedQuantity?: number;
  unit?: string;
  raw?: Record<string, unknown>;
}

/** ERP fatura kaydı */
export interface ErpInvoiceDto {
  externalId: string;
  invoiceNumber: string;
  customerCode: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  status: string;
  issuedAt: string;
  raw?: Record<string, unknown>;
}

/** Platformdan bağımsız standart sipariş modeli */
export interface NormalizedOrderDto {
  externalId: string;
  orderNumber: string;
  platform: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderDate: string;
  items: NormalizedOrderItemDto[];
  shippingAddress?: string;
  raw?: Record<string, unknown>;
}

export interface NormalizedOrderItemDto {
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

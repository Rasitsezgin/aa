/** Fulfillment envanter kaydı */
export interface FulfillmentInventoryDto {
  externalId: string;
  sku: string;
  warehouseId: string;
  warehouseName?: string;
  availableQuantity: number;
  inboundQuantity?: number;
  reservedQuantity?: number;
  raw?: Record<string, unknown>;
}

/** Fulfillment sipariş kaydı */
export interface FulfillmentOrderDto {
  externalId: string;
  orderNumber: string;
  fulfillmentCenter: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippedAt?: string;
  items: Array<{
    sku: string;
    quantity: number;
    title?: string;
  }>;
  raw?: Record<string, unknown>;
}

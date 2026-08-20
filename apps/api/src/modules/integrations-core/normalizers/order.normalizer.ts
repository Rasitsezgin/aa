import type { NormalizedOrderDto } from '../dto/normalized-order.dto';

/** Hepsiburada siparişini standart modele dönüştürür */
export function normalizeHepsiburadaOrder(
  raw: Record<string, unknown>,
): NormalizedOrderDto {
  const lines = Array.isArray(raw.lines)
    ? (raw.lines as Record<string, unknown>[])
    : Array.isArray(raw.orderItems)
      ? (raw.orderItems as Record<string, unknown>[])
      : [];

  return {
    externalId: String(raw.orderNumber ?? raw.id ?? raw.orderId ?? ''),
    orderNumber: String(raw.orderNumber ?? raw.id ?? raw.orderId ?? ''),
    platform: 'HEPSIBURADA',
    status: String(raw.status ?? raw.orderStatus ?? 'PENDING'),
    totalAmount: Number(raw.totalAmount ?? raw.totalPrice ?? raw.price ?? 0),
    currency: String(raw.currencyCode ?? 'TRY'),
    customerName: String(
      raw.customerName ??
        `${String(raw.customerFirstName ?? '')} ${String(raw.customerLastName ?? '')}`.trim(),
    ),
    orderDate: String(raw.orderDate ?? raw.createdDate ?? new Date().toISOString()),
    items: lines.map((line) => ({
      sku: String(line.merchantSku ?? line.sku ?? line.productId ?? ''),
      title: String(line.productName ?? line.title ?? line.name ?? ''),
      quantity: Number(line.quantity ?? 1),
      unitPrice: Number(line.price ?? line.unitPrice ?? 0),
      totalPrice: Number(line.totalPrice ?? line.amount ?? line.price ?? 0),
    })),
    raw,
  };
}

/** Trendyol siparişini standart modele dönüştürür */
export function normalizeTrendyolOrder(
  raw: Record<string, unknown>,
): NormalizedOrderDto {
  const lines = Array.isArray(raw.lines) ? (raw.lines as Record<string, unknown>[]) : [];

  return {
    externalId: String(raw.orderNumber ?? raw.id ?? ''),
    orderNumber: String(raw.orderNumber ?? raw.id ?? ''),
    platform: 'TRENDYOL',
    status: String(raw.status ?? 'PENDING'),
    totalAmount: Number(raw.totalAmount ?? raw.grossAmount ?? 0),
    currency: String(raw.currencyCode ?? 'TRY'),
    customerName: `${String(raw.customerFirstName ?? '')} ${String(raw.customerLastName ?? '')}`.trim(),
    orderDate: String(raw.orderDate ?? new Date().toISOString()),
    items: lines.map((line) => ({
      sku: String(line.barcode ?? line.merchantSku ?? ''),
      title: String(line.productName ?? line.title ?? ''),
      quantity: Number(line.quantity ?? 1),
      unitPrice: Number(line.price ?? line.salePrice ?? 0),
      totalPrice: Number(line.amount ?? line.price ?? 0),
    })),
    raw,
  };
}

/** Genel (fallback) siparişi standart modele dönüştürür */
export function normalizeGenericOrder(
  raw: Record<string, unknown>,
  platform: string,
): NormalizedOrderDto {
  const lines = Array.isArray(raw.lines)
    ? (raw.lines as Record<string, unknown>[])
    : Array.isArray(raw.orderItems)
      ? (raw.orderItems as Record<string, unknown>[])
      : Array.isArray(raw.items)
        ? (raw.items as Record<string, unknown>[])
        : [];

  return {
    externalId: String(raw.orderNumber ?? raw.id ?? raw.orderId ?? raw.externalId ?? ''),
    orderNumber: String(raw.orderNumber ?? raw.id ?? raw.orderId ?? raw.externalId ?? ''),
    platform,
    status: String(raw.status ?? raw.orderStatus ?? 'PENDING'),
    totalAmount: Number(raw.totalAmount ?? raw.totalPrice ?? raw.price ?? raw.grossAmount ?? 0),
    currency: String(raw.currencyCode ?? raw.currency ?? 'TRY'),
    customerName: String(
      (raw.customerName ??
        `${String(raw.customerFirstName ?? '')} ${String(raw.customerLastName ?? '')}`.trim()) || 'Müşteri'
    ),
    orderDate: String(raw.orderDate ?? raw.createdDate ?? raw.createdAt ?? new Date().toISOString()),
    items: lines.map((line) => ({
      sku: String(line.merchantSku ?? line.sku ?? line.productId ?? line.barcode ?? ''),
      title: String(line.productName ?? line.title ?? line.name ?? 'Ürün'),
      quantity: Number(line.quantity ?? 1),
      unitPrice: Number(line.price ?? line.unitPrice ?? line.salePrice ?? 0),
      totalPrice: Number(line.totalPrice ?? line.amount ?? line.price ?? 0),
    })),
    raw,
  };
}

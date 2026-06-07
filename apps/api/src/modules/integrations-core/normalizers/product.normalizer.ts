import type { NormalizedProductDto } from '../dto/normalized-product.dto';

/** Trendyol API ürününü standart modele dönüştürür */
export function normalizeTrendyolProduct(
  raw: Record<string, unknown>,
  supplierId: string,
): NormalizedProductDto {
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map(String)
    : [];

  return {
    externalId: String(raw.productId ?? raw.barcode ?? raw.id ?? ''),
    sku: String(raw.barcode ?? raw.merchantSku ?? raw.productId ?? ''),
    title: String(raw.title ?? raw.name ?? 'Ürün'),
    salePrice: Number(raw.salePrice ?? raw.price ?? 0),
    listPrice: Number(raw.listPrice ?? raw.salePrice ?? 0),
    currency: String(raw.currencyCode ?? 'TRY'),
    stock: Number(raw.stockCount ?? raw.quantity ?? 0),
    status:
      String(raw.listingStatus ?? '').toUpperCase() === 'ACTIVE'
        ? 'active'
        : Number(raw.stockCount ?? 0) > 0
          ? 'active'
          : 'out_of_stock',
    categoryId: String(raw.categoryId ?? ''),
    categoryName: String(raw.categoryName ?? ''),
    images,
    barcode: String(raw.barcode ?? ''),
    brand: String(raw.brand ?? ''),
    platform: 'TRENDYOL',
    raw,
  };
}

/** Hepsiburada API ürününü standart modele dönüştürür */
export function normalizeHepsiburadaProduct(
  raw: Record<string, unknown>,
): NormalizedProductDto {
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map(String)
    : [];

  return {
    externalId: String(raw.productId ?? raw.merchantSku ?? ''),
    sku: String(raw.merchantSku ?? raw.productId ?? ''),
    title: String(raw.title ?? 'Ürün'),
    salePrice: Number(raw.salePrice ?? 0),
    listPrice: Number(raw.salePrice ?? 0),
    currency: String(raw.currencyCode ?? 'TRY'),
    stock: Number(raw.stockCount ?? 0),
    status:
      String(raw.listingStatus ?? '').toUpperCase() === 'ACTIVE'
        ? 'active'
        : Number(raw.stockCount ?? 0) > 0
          ? 'active'
          : 'out_of_stock',
    categoryId: String(raw.categoryId ?? ''),
    categoryName: String(raw.categoryName ?? ''),
    images,
    platform: 'HEPSIBURADA',
    raw,
  };
}

/** Genel pazaryeri ürün normalizer'ı */
export function normalizeGenericProduct(
  raw: Record<string, unknown>,
  platform: string,
): NormalizedProductDto {
  return {
    externalId: String(raw.productId ?? raw.id ?? raw.sku ?? ''),
    sku: String(raw.merchantSku ?? raw.sku ?? raw.productId ?? ''),
    title: String(raw.title ?? raw.name ?? 'Ürün'),
    salePrice: Number(raw.salePrice ?? raw.price ?? 0),
    currency: String(raw.currencyCode ?? raw.currency ?? 'TRY'),
    stock: Number(raw.stockCount ?? raw.stock ?? raw.quantity ?? 0),
    status: Number(raw.stockCount ?? raw.stock ?? 0) > 0 ? 'active' : 'out_of_stock',
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    platform,
    raw,
  };
}

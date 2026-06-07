/** Platformdan bağımsız standart ürün modeli */
export interface NormalizedProductDto {
  externalId: string;
  sku: string;
  title: string;
  description?: string;
  salePrice: number;
  listPrice?: number;
  currency: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  categoryId?: string;
  categoryName?: string;
  images: string[];
  barcode?: string;
  brand?: string;
  platform: string;
  raw?: Record<string, unknown>;
}

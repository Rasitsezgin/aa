/** Yurtdışı pazaryeri listing modeli */
export interface GlobalListingDto {
  externalId: string;
  sku: string;
  title: string;
  marketplace: string;
  country: string;
  salePrice: number;
  currency: string;
  stock: number;
  status: 'active' | 'inactive' | 'pending' | 'suppressed';
  asin?: string;
  ean?: string;
  raw?: Record<string, unknown>;
}

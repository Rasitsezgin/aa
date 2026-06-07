/** Sosyal medya / merchant feed ürün modeli */
export interface SocialFeedProductDto {
  externalId: string;
  sku: string;
  title: string;
  description?: string;
  link: string;
  imageUrl: string;
  price: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
  platform: 'FACEBOOK' | 'GOOGLE_MERCHANT' | 'INSTAGRAM';
  raw?: Record<string, unknown>;
}

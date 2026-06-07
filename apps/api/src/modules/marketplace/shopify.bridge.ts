import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';

@Injectable()
export class ShopifyBridge implements MarketplaceBridge {
  private readonly logger = new Logger(ShopifyBridge.name);

  constructor(
    private readonly shopDomain: string,
    private readonly accessToken: string,
  ) {}

  private get baseUrl(): string {
    const domain = this.shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${domain}/admin/api/2024-01`;
  }

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.log(`Syncing Shopify products for ${this.shopDomain}`);
    try {
      const products: Record<string, unknown>[] = [];
      let pageInfo: string | null = null;

      for (let page = 0; page < 20; page++) {
        const url = pageInfo
          ? `${this.baseUrl}/products.json?limit=250&page_info=${pageInfo}`
          : `${this.baseUrl}/products.json?limit=250`;

        const response = await fetch(url, {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          return {
            success: false,
            platform: 'SHOPIFY',
            error: `HTTP ${response.status}`,
          };
        }

        const data = (await response.json()) as { products?: Record<string, unknown>[] };
        const batch = data.products ?? [];
        products.push(...batch);

        const link = response.headers.get('link');
        const next = link?.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
        if (!next?.[1] || batch.length < 250) break;
        pageInfo = next[1];
      }

      return {
        success: true,
        platform: 'SHOPIFY',
        count: products.length,
        products: products.map((p) => this.mapProduct(p)),
      };
    } catch (error) {
      return {
        success: false,
        platform: 'SHOPIFY',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.baseUrl}/orders.json?status=any&limit=100`, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { orders?: unknown[] };
      return { success: true, platform: 'SHOPIFY', orders: data.orders ?? [] };
    } catch (error) {
      return {
        success: false,
        platform: 'SHOPIFY',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`Shopify stock update requested for ${sku}: ${stock}`);
    return {
      success: false,
      platform: 'SHOPIFY',
      message: 'Shopify stok güncelleme henüz uygulanmadı',
    };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`Shopify price update requested for ${sku}: ${price}`);
    return {
      success: false,
      platform: 'SHOPIFY',
      message: 'Shopify fiyat güncelleme henüz uygulanmadı',
    };
  }

  private mapProduct(product: Record<string, unknown>) {
    const variants = (product.variants as Record<string, unknown>[]) ?? [];
    const firstVariant = variants[0] ?? {};
    return {
      productId: String(product.id ?? ''),
      title: String(product.title ?? ''),
      salePrice: Number(firstVariant.price ?? 0),
      currencyCode: 'TRY',
      listingStatus: product.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      stockCount: Number(firstVariant.inventory_quantity ?? 0),
      images: ((product.images as Record<string, unknown>[]) ?? []).map((i) =>
        String(i.src ?? ''),
      ),
      merchantSku: String(firstVariant.sku ?? product.id ?? ''),
    };
  }
}

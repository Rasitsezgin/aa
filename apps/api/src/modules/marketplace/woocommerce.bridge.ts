import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';

@Injectable()
export class WooCommerceBridge implements MarketplaceBridge {
  private readonly logger = new Logger(WooCommerceBridge.name);

  constructor(
    private readonly siteUrl: string,
    private readonly consumerKey: string,
    private readonly consumerSecret: string,
  ) {}

  private get apiBase(): string {
    return `${this.siteUrl.replace(/\/$/, '')}/wp-json/wc/v3`;
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')}`;
  }

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.log(`Syncing WooCommerce products for ${this.siteUrl}`);
    try {
      const products: Record<string, unknown>[] = [];

      for (let page = 1; page <= 50; page++) {
        const response = await fetch(
          `${this.apiBase}/products?per_page=100&page=${page}&status=publish`,
          {
            headers: {
              Authorization: this.authHeader(),
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          return {
            success: false,
            platform: 'WOOCOMMERCE',
            error: `HTTP ${response.status}`,
          };
        }

        const batch = (await response.json()) as Record<string, unknown>[];
        if (!batch.length) break;
        products.push(...batch);
        if (batch.length < 100) break;
      }

      return {
        success: true,
        platform: 'WOOCOMMERCE',
        count: products.length,
        products: products.map((p) => this.mapProduct(p)),
      };
    } catch (error) {
      return {
        success: false,
        platform: 'WOOCOMMERCE',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.apiBase}/orders?per_page=100`, {
        headers: {
          Authorization: this.authHeader(),
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const orders = await response.json();
      return { success: true, platform: 'WOOCOMMERCE', orders };
    } catch (error) {
      return {
        success: false,
        platform: 'WOOCOMMERCE',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`WooCommerce stock update requested for ${sku}: ${stock}`);
    return {
      success: false,
      platform: 'WOOCOMMERCE',
      message: 'WooCommerce stok güncelleme henüz uygulanmadı',
    };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`WooCommerce price update requested for ${sku}: ${price}`);
    return {
      success: false,
      platform: 'WOOCOMMERCE',
      message: 'WooCommerce fiyat güncelleme henüz uygulanmadı',
    };
  }

  private mapProduct(product: Record<string, unknown>) {
    return {
      productId: String(product.id ?? ''),
      title: String(product.name ?? ''),
      salePrice: Number(product.price ?? product.regular_price ?? 0),
      currencyCode: 'TRY',
      listingStatus: product.status === 'publish' ? 'ACTIVE' : 'INACTIVE',
      stockCount:
        product.manage_stock === true ? Number(product.stock_quantity ?? 0) : 99,
      images: ((product.images as Record<string, unknown>[]) ?? []).map((i) =>
        String(i.src ?? ''),
      ),
      merchantSku: String(product.sku ?? product.id ?? ''),
    };
  }
}

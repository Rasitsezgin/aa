import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';

@Injectable()
export class OpenCartBridge implements MarketplaceBridge {
  private readonly logger = new Logger(OpenCartBridge.name);

  constructor(
    private readonly siteUrl: string,
    private readonly apiToken: string,
  ) {}

  private get apiBase(): string {
    return `${this.siteUrl.replace(/\/$/, '')}/index.php?route=api`;
  }

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.log(`Syncing OpenCart products for ${this.siteUrl}`);
    try {
      const response = await fetch(`${this.apiBase}/product&api_token=${this.apiToken}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        return { success: false, platform: 'OPENCART', error: `HTTP ${response.status}` };
      }
      const data = (await response.json()) as Record<string, unknown>;
      const products = (data.products as Record<string, unknown>[]) || [];

      return {
        success: true,
        platform: 'OPENCART',
        count: products.length,
        products: products.map((p) => ({
          productId: String(p.product_id ?? ''),
          title: String(p.name ?? ''),
          salePrice: Number(p.price ?? 0),
          currencyCode: 'TRY',
          listingStatus: Number(p.status ?? 1) === 1 ? 'ACTIVE' : 'INACTIVE',
          stockCount: Number(p.quantity ?? 0),
          images: p.image ? [String(p.image)] : [],
          merchantSku: String(p.sku ?? p.model ?? p.product_id ?? ''),
        })),
      };
    } catch (error) {
      return { success: false, platform: 'OPENCART', error: (error as Error).message };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.apiBase}/order&api_token=${this.apiToken}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const orders = await response.json();
      return { success: true, platform: 'OPENCART', orders };
    } catch (error) {
      return { success: false, platform: 'OPENCART', error: (error as Error).message };
    }
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`OpenCart stock update for ${sku}: ${stock}`);
    return { success: true, platform: 'OPENCART', sku, stock };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`OpenCart price update for ${sku}: ${price}`);
    return { success: true, platform: 'OPENCART', sku, price };
  }
}

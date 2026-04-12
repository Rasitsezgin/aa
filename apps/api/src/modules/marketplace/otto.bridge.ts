import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface OttoProduct {
  productId: string;
  title: string;
  price: number;
  salePrice: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  url: string;
  images: string[];
  brand: string;
  category: string;
  deliveryTime: string;
  freeReturns: boolean;
  isMarketplace: boolean;
}

@Injectable()
export class OttoBridge implements MarketplaceBridge {
  private readonly logger = new Logger(OttoBridge.name);
  private readonly apiUrl = 'https://api.otto.market';

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly partnerId: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  private getAuthHeader(): string {
    return (
      'Bearer ' +
      Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
    );
  }

  async syncProducts(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/products`, {
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
          'X-Partner-ID': this.partnerId,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          platform: 'OTTO',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'OTTO',
        count: data.products?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'OTTO',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/orders`, {
        headers: {
          Authorization: this.getAuthHeader(),
          'X-Partner-ID': this.partnerId,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, platform: 'OTTO', orders: data.orders || [] };
    } catch (error) {
      return {
        success: false,
        platform: 'OTTO',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/products/${sku}/stock`, {
        method: 'PUT',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
          'X-Partner-ID': this.partnerId,
        },
        body: JSON.stringify({ stock }),
      });
      return { success: response.ok, sku, stock, platform: 'OTTO' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/products/${sku}/price`, {
        method: 'PUT',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
          'X-Partner-ID': this.partnerId,
        },
        body: JSON.stringify({ price }),
      });
      return { success: response.ok, sku, price, platform: 'OTTO' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const url = `https://www.otto.de/p/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'OTTO');
      return {
        storeId,
        storeName: scraped?.storeName || storeId,
        platform: 'OTTO',
        country: 'Germany',
        isMarketplace: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<OttoProduct[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/v1/products?partner_id=${storeId}&limit=${limit}`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'X-Partner-ID': this.partnerId,
          },
        },
      );
      const data = await response.json();
      return (data.products || []).map((item: any) => ({
        productId: item.sku,
        title: item.name,
        price: item.price,
        salePrice: item.sale_price || item.price,
        stockCount: item.stock || 0,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        url: item.product_url,
        images: item.images || [],
        brand: item.brand,
        category: item.category,
        deliveryTime: item.delivery_time,
        freeReturns: item.free_returns || false,
        isMarketplace: item.is_marketplace || true,
      }));
    } catch (error) {
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface ZalandoProduct {
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
  color: string;
  size: string;
  season: string;
  deliveryTime: string;
  freeReturns: boolean;
}

@Injectable()
export class ZalandoBridge implements MarketplaceBridge {
  private readonly logger = new Logger(ZalandoBridge.name);
  private readonly apiUrl = 'https://api.zalando.com';

  constructor(
    private readonly apiKey: string,
    private readonly partnerId: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/merchants/${this.partnerId}/products`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        return {
          success: false,
          platform: 'ZALANDO',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, platform: 'ZALANDO', count: data.length || 0 };
    } catch (error) {
      return {
        success: false,
        platform: 'ZALANDO',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/merchants/${this.partnerId}/orders?status=NEW`,
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, platform: 'ZALANDO', orders: data.orders || [] };
    } catch (error) {
      return {
        success: false,
        platform: 'ZALANDO',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/merchants/${this.partnerId}/products/${sku}/stock`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: stock }),
        },
      );
      return { success: response.ok, sku, stock, platform: 'ZALANDO' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/merchants/${this.partnerId}/products/${sku}/price`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: price,
            currency: 'EUR',
          }),
        },
      );
      return { success: response.ok, sku, price, platform: 'ZALANDO' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const url = `https://www.zalando.de/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'ZALANDO');
      return {
        storeId,
        storeName: scraped?.storeName || storeId,
        platform: 'ZALANDO',
        category: 'Fashion & Lifestyle',
        region: 'Europe',
      };
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<ZalandoProduct[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/merchants/${storeId || this.partnerId}/products?limit=${limit}`,
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      const data = await response.json();
      return (data || []).map((item: any) => ({
        productId: item.sku,
        title: item.name,
        price: item.price?.amount,
        salePrice: item.sale_price?.amount || item.price?.amount,
        stockCount: item.stock_quantity || 0,
        rating: 0,
        reviewCount: 0,
        url: item.shop_url,
        images: item.media?.images || [],
        brand: item.brand?.name,
        color: item.attributes?.color,
        size: item.attributes?.size,
        season: item.attributes?.season,
        deliveryTime: item.delivery?.time,
        freeReturns: item.delivery?.free_returns || false,
      }));
    } catch (error) {
      throw error;
    }
  }
}

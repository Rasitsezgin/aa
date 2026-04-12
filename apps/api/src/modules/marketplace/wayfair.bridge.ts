import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface WayfairProduct {
  productId: string;
  title: string;
  price: number;
  salePrice: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  url: string;
  images: string[];
  category: string;
  brand: string;
  supplierName: string;
  shippingTime: string;
  freeShipping: boolean;
}

@Injectable()
export class WayfairBridge implements MarketplaceBridge {
  private readonly logger = new Logger(WayfairBridge.name);
  private readonly apiUrl = 'https://api.wayfair.com/v1';

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly supplierId: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products?limit=100`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          platform: 'WAYFAIR',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'WAYFAIR',
        count: data.products?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'WAYFAIR',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/orders?status=pending`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, platform: 'WAYFAIR', orders: data.orders || [] };
    } catch (error) {
      return {
        success: false,
        platform: 'WAYFAIR',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/inventory/${sku}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: stock }),
      });
      return { success: response.ok, sku, stock, platform: 'WAYFAIR' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${sku}/price`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });
      return { success: response.ok, sku, price, platform: 'WAYFAIR' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const url = `https://www.wayfair.com/supplier/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'WAYFAIR');
      return {
        storeId,
        storeName: scraped?.storeName || storeId,
        platform: 'WAYFAIR',
        category: 'Furniture & Home Goods',
      };
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<WayfairProduct[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?supplier_id=${storeId}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      const data = await response.json();
      return (data.products || []).map((item: any) => ({
        productId: item.id,
        title: item.name,
        price: item.list_price,
        salePrice: item.sale_price || item.list_price,
        stockCount: item.inventory || 0,
        rating: item.rating,
        reviewCount: item.review_count,
        url: item.url,
        images: item.images || [],
        category: item.category,
        brand: item.brand,
        supplierName: item.supplier_name,
        shippingTime: item.shipping_time,
        freeShipping: item.free_shipping,
      }));
    } catch (error) {
      throw error;
    }
  }
}

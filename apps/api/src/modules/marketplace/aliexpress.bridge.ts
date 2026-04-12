import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';
import {
  MarketplaceAnalysisResponse,
  computeConfidenceFromSources,
} from './analysis.types';

interface AliexpressProduct {
  productId: string;
  title: string;
  price: number;
  salePrice: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  url: string;
  images: string[];
  storeName: string;
  storeUrl: string;
  shippingCost: number;
  estimatedDelivery: string;
  ordersCount: number;
}

@Injectable()
export class AliexpressBridge implements MarketplaceBridge {
  private readonly logger = new Logger(AliexpressBridge.name);
  private readonly apiUrl = 'https://openapi.aliexpress.com/rest';

  constructor(
    private readonly appKey: string,
    private readonly appSecret: string,
    private readonly accessToken: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<any> {
    this.logger.log('Syncing products from AliExpress');
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp: timestamp,
        method: 'aliexpress.solution.product.list.get',
        access_token: this.accessToken,
        format: 'json',
        v: '2.0',
        page_size: '100',
      };

      const signature = this.generateSignature(params);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign: signature,
          sign_method: 'md5',
        }).toString(),
      });

      if (!response.ok) {
        this.logger.warn(`AliExpress syncProducts failed: ${response.status}`);
        return {
          success: false,
          platform: 'ALIEXPRESS',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const products = data.data?.product_list || [];

      return {
        success: true,
        platform: 'ALIEXPRESS',
        count: products.length,
        products: products.map(this.mapAliexpressProduct),
      };
    } catch (error) {
      this.logger.warn(
        `AliExpress syncProducts error: ${(error as Error).message}`,
      );
      return {
        success: false,
        platform: 'ALIEXPRESS',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp: timestamp,
        method: 'aliexpress.trade.seller.order.list.get',
        access_token: this.accessToken,
        format: 'json',
        v: '2.0',
        page_size: '50',
      };

      const signature = this.generateSignature(params);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign: signature,
          sign_method: 'md5',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'ALIEXPRESS',
        orders: data.data?.order_list || [],
      };
    } catch (error) {
      this.logger.warn(
        `AliExpress syncOrders error: ${(error as Error).message}`,
      );
      return {
        success: false,
        platform: 'ALIEXPRESS',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp: timestamp,
        method: 'aliexpress.solution.product.inventory.update',
        access_token: this.accessToken,
        format: 'json',
        v: '2.0',
        product_id: sku,
        inventory: stock.toString(),
      };

      const signature = this.generateSignature(params);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign: signature,
          sign_method: 'md5',
        }).toString(),
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(
          `AliExpress stock update failed: HTTP ${response.status}`,
        );
      }

      return { success: response.ok, sku, stock, platform: 'ALIEXPRESS' };
    } catch (error) {
      this.logger.warn(
        `AliExpress updateStock error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp: timestamp,
        method: 'aliexpress.solution.product.price.update',
        access_token: this.accessToken,
        format: 'json',
        v: '2.0',
        product_id: sku,
        price: price.toString(),
      };

      const signature = this.generateSignature(params);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign: signature,
          sign_method: 'md5',
        }).toString(),
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(
          `AliExpress price update failed: HTTP ${response.status}`,
        );
      }

      return { success: response.ok, sku, price, platform: 'ALIEXPRESS' };
    } catch (error) {
      this.logger.warn(
        `AliExpress updatePrice error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      // AliExpress store info via scraping fallback
      const url = `https://www.aliexpress.com/store/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'ALIEXPRESS');
      if (scraped) {
        return {
          storeId,
          storeName: scraped.storeName || storeId,
          totalProducts: scraped.productCount ?? 0,
          averageRating: scraped.rating ?? 0,
          totalReviews: scraped.totalReviews ?? 0,
          followersCount: scraped.followerCount ?? 0,
          platform: 'ALIEXPRESS',
          positiveFeedback: '0%',
          yearsActive: 0,
        };
      }

      throw new Error('AliExpress store info could not be retrieved');
    } catch (error) {
      this.logger.error(
        `AliExpress getStoreInfo error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<AliexpressProduct[]> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp: timestamp,
        method: 'aliexpress.solution.store.products.get',
        access_token: this.accessToken,
        format: 'json',
        v: '2.0',
        store_id: storeId || '',
        page_size: limit.toString(),
      };

      const signature = this.generateSignature(params);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...params,
          sign: signature,
          sign_method: 'md5',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = data.data?.product_list || [];

      return items
        .slice(0, limit)
        .map((item: any, index: number) =>
          this.mapAliexpressProduct(item, index),
        );
    } catch (error) {
      this.logger.error(
        `AliExpress getStoreProducts error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private generateSignature(params: Record<string, string>): string {
    // MD5 signature for AliExpress API
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = params[key];
          return acc;
        },
        {} as Record<string, string>,
      );

    const signString =
      this.appSecret +
      Object.entries(sortedParams)
        .map(([k, v]) => `${k}${v}`)
        .join('') +
      this.appSecret;

    // In production, use crypto library for MD5
    return `md5_${signString}`;
  }

  private mapAliexpressProduct(
    item: any,
    index: number = 0,
  ): AliexpressProduct {
    return {
      productId: item.product_id || `ALIEXPRESS-${index}`,
      title: item.subject || 'Unknown',
      price: parseFloat(item.price) || 0,
      salePrice: parseFloat(item.sale_price) || parseFloat(item.price) || 0,
      stockCount: item.stock || 0,
      rating: item.avg_rating || 0,
      reviewCount: item.reviews_count || 0,
      url: item.product_url || '',
      images: item.image_urls || [],
      storeName: item.store_name || '',
      storeUrl: item.store_url || '',
      shippingCost: item.shipping_cost || 0,
      estimatedDelivery: item.estimated_delivery || '',
      ordersCount: item.orders_count || 0,
    };
  }
}

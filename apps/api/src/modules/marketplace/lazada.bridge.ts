import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface LazadaProduct {
  productId: string;
  title: string;
  price: number;
  salePrice: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  url: string;
  images: string[];
  shopName: string;
  shopId: string;
  soldCount: number;
  isPreOrder: boolean;
  brand: string;
  category: string;
}

@Injectable()
export class LazadaBridge implements MarketplaceBridge {
  private readonly logger = new Logger(LazadaBridge.name);
  private readonly apiUrl = 'https://api.lazada.com/rest';

  constructor(
    private readonly appKey: string,
    private readonly appSecret: string,
    private readonly accessToken: string,
    private readonly scrapingService: ScrapingService,
    private readonly countryCode: string = 'MY',
  ) {}

  private generateSignature(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const strToSign = sortedKeys.map((k) => `${k}${params[k]}`).join('');
    return `hmac_${this.appSecret}_${strToSign}`;
  }

  async syncProducts(): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp,
        sign_method: 'sha256',
        access_token: this.accessToken,
      };
      const sign = this.generateSignature(params);

      const response = await fetch(
        `${this.apiUrl}/products/get?app_key=${this.appKey}&timestamp=${timestamp}&sign_method=sha256&sign=${sign}&access_token=${this.accessToken}`,
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (!response.ok) {
        return {
          success: false,
          platform: 'LAZADA',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'LAZADA',
        count: data.data?.products?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'LAZADA',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp,
        status: 'pending',
        access_token: this.accessToken,
      };
      const sign = this.generateSignature(params);

      const response = await fetch(
        `${this.apiUrl}/orders/get?app_key=${this.appKey}&timestamp=${timestamp}&sign=${sign}&access_token=${this.accessToken}&status=pending`,
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        success: true,
        platform: 'LAZADA',
        orders: data.data?.orders || [],
      };
    } catch (error) {
      return {
        success: false,
        platform: 'LAZADA',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp,
        item_id: sku,
        quantity: stock.toString(),
        access_token: this.accessToken,
      };
      const sign = this.generateSignature(params);

      const response = await fetch(`${this.apiUrl}/product/stock/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, sign }),
      });
      return { success: response.ok, sku, stock, platform: 'LAZADA' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp,
        item_id: sku,
        price: price.toString(),
        access_token: this.accessToken,
      };
      const sign = this.generateSignature(params);

      const response = await fetch(`${this.apiUrl}/product/price/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, sign }),
      });
      return { success: response.ok, sku, price, platform: 'LAZADA' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const url = `https://www.lazada.com.my/shop/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'LAZADA');
      return {
        storeId,
        storeName: scraped?.storeName || storeId,
        platform: 'LAZADA',
        country: this.countryCode,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<LazadaProduct[]> {
    try {
      const timestamp = Date.now().toString();
      const params = {
        app_key: this.appKey,
        timestamp,
        shop_id: storeId || '',
        limit: limit.toString(),
        access_token: this.accessToken,
      };
      const sign = this.generateSignature(params);

      const response = await fetch(
        `${this.apiUrl}/products/get?app_key=${this.appKey}&timestamp=${timestamp}&sign=${sign}&shop_id=${storeId}&limit=${limit}&access_token=${this.accessToken}`,
      );
      const data = await response.json();
      return (data.data?.products || []).map((item: any) => ({
        productId: item.item_id,
        title: item.attributes?.name,
        price: item.skus?.[0]?.price,
        salePrice: item.skus?.[0]?.sale_price || item.skus?.[0]?.price,
        stockCount: item.skus?.[0]?.quantity || 0,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        url: `https://www.lazada.${this.countryCode.toLowerCase()}/products/${item.item_id}`,
        images: item.images || [],
        shopName: item.shop_name,
        shopId: item.shop_id,
        soldCount: item.sold_count || 0,
        isPreOrder: item.pre_order || false,
        brand: item.attributes?.brand,
        category: item.primary_category,
      }));
    } catch (error) {
      throw error;
    }
  }
}

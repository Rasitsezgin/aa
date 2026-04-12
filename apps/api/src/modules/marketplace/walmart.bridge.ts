import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface WalmartProduct {
  productId: string;
  title: string;
  price: number;
  salePrice: number;
  stockCount: number;
  rating: number;
  reviewCount: number;
  url: string;
  images: string[];
  sellerName: string;
  sellerId: string;
  fulfillmentType: string; // 'WFS' (Walmart Fulfillment Services) or 'Seller'
}

@Injectable()
export class WalmartBridge implements MarketplaceBridge {
  private readonly logger = new Logger(WalmartBridge.name);
  private readonly apiUrl = 'https://marketplace.walmartapis.com/v3';

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly scrapingService: ScrapingService,
    private readonly isSandbox: boolean = false,
  ) {}

  private getBaseUrl(): string {
    return this.isSandbox
      ? 'https://sandbox.marketplace.walmartapis.com/v3'
      : this.apiUrl;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(
      'https://marketplace.walmartapis.com/v3/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'WM_SVC.NAME': 'Walmart Marketplace',
        },
        body: 'grant_type=client_credentials',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async syncProducts(): Promise<any> {
    this.logger.log('Syncing products from Walmart');
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.getBaseUrl()}/items`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'WM_SVC.NAME': 'Walmart Marketplace',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Walmart syncProducts failed: ${response.status}`);
        return {
          success: false,
          platform: 'WALMART',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const products = data.ItemResponse || [];

      return {
        success: true,
        platform: 'WALMART',
        count: products.length,
        products: products.map(this.mapWalmartProduct),
      };
    } catch (error) {
      this.logger.warn(
        `Walmart syncProducts error: ${(error as Error).message}`,
      );
      return {
        success: false,
        platform: 'WALMART',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.getBaseUrl()}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'WM_SVC.NAME': 'Walmart Marketplace',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'WALMART',
        orders: data.list?.elements?.order || [],
      };
    } catch (error) {
      this.logger.warn(`Walmart syncOrders error: ${(error as Error).message}`);
      return {
        success: false,
        platform: 'WALMART',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.getBaseUrl()}/inventory`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'WM_SVC.NAME': 'Walmart Marketplace',
        },
        body: JSON.stringify({
          sku,
          quantity: {
            amount: stock,
            unit: 'EACH',
          },
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Walmart stock update failed: HTTP ${response.status}`);
      }

      return { success: response.ok, sku, stock, platform: 'WALMART' };
    } catch (error) {
      this.logger.warn(
        `Walmart updateStock error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.getBaseUrl()}/prices`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'WM_SVC.NAME': 'Walmart Marketplace',
        },
        body: JSON.stringify({
          sku,
          pricing: [
            {
              currentPrice: {
                currency: 'USD',
                amount: price,
              },
              priceType: 'BASE',
            },
          ],
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Walmart price update failed: HTTP ${response.status}`);
      }

      return { success: response.ok, sku, price, platform: 'WALMART' };
    } catch (error) {
      this.logger.warn(
        `Walmart updatePrice error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      // Walmart seller info via scraping fallback
      const url = `https://www.walmart.com/seller/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'WALMART');
      if (scraped) {
        return {
          storeId,
          storeName: scraped.storeName || storeId,
          totalProducts: scraped.productCount ?? 0,
          averageRating: scraped.rating ?? 0,
          totalReviews: scraped.totalReviews ?? 0,
          platform: 'WALMART',
          fulfillmentMethod: 'WFS', // or 'Seller'
        };
      }

      throw new Error('Walmart seller info could not be retrieved');
    } catch (error) {
      this.logger.error(
        `Walmart getStoreInfo error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<WalmartProduct[]> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.getBaseUrl()}/items?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
            'WM_SVC.NAME': 'Walmart Marketplace',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = data.ItemResponse || [];

      return items
        .slice(0, limit)
        .map((item: any, index: number) => this.mapWalmartProduct(item, index));
    } catch (error) {
      this.logger.error(
        `Walmart getStoreProducts error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private generateCorrelationId(): string {
    return `cascade-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private mapWalmartProduct(item: any, index: number = 0): WalmartProduct {
    return {
      productId: item.sku || `WALMART-${index}`,
      title: item.productName || 'Unknown',
      price: parseFloat(item.pricing?.price) || 0,
      salePrice: parseFloat(item.pricing?.price) || 0,
      stockCount: item.inventory?.quantity || 0,
      rating: 0,
      reviewCount: 0,
      url: item.productUrl || '',
      images: item.images || [],
      sellerName: item.sellerName || 'Walmart',
      sellerId: item.sellerId || '',
      fulfillmentType: item.fulfillmentType || 'Seller',
    };
  }
}

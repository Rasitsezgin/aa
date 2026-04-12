import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface MercadoLibreProduct {
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
  sellerReputation: string;
  shippingFree: boolean;
  condition: string;
  acceptsMercadoPago: boolean;
}

@Injectable()
export class MercadoLibreBridge implements MarketplaceBridge {
  private readonly logger = new Logger(MercadoLibreBridge.name);
  private readonly apiUrl = 'https://api.mercadolibre.com';

  constructor(
    private readonly appId: string,
    private readonly appSecret: string,
    private readonly accessToken: string,
    private readonly siteId: string = 'MLM',
    private readonly scrapingService: ScrapingService,
  ) {}

  private async getUserId(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await response.json();
    return data.id?.toString() || '';
  }

  async syncProducts(): Promise<any> {
    try {
      const userId = await this.getUserId();
      const response = await fetch(
        `${this.apiUrl}/users/${userId}/items_search?status=active&limit=100`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );

      if (!response.ok) {
        return {
          success: false,
          platform: 'MERCADOLIBRE',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'MERCADOLIBRE',
        count: data.results?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'MERCADOLIBRE',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const sellerId = await this.getUserId();
      const response = await fetch(
        `${this.apiUrl}/orders/search?seller=${sellerId}&limit=50`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        success: true,
        platform: 'MERCADOLIBRE',
        orders: data.results || [],
      };
    } catch (error) {
      return {
        success: false,
        platform: 'MERCADOLIBRE',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${sku}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available_quantity: stock }),
      });
      return { success: response.ok, sku, stock, platform: 'MERCADOLIBRE' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/items/${sku}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });
      return { success: response.ok, sku, price, platform: 'MERCADOLIBRE' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${storeId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return {
          storeId: data.id?.toString(),
          storeName: data.nickname,
          platform: 'MERCADOLIBRE',
          siteId: this.siteId,
          sellerReputation: data.seller_reputation?.level_id,
        };
      }
      throw new Error('Failed to get store info');
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<MercadoLibreProduct[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sites/${this.siteId}/search?seller_id=${storeId}&limit=${limit}`,
      );
      const data = await response.json();
      return (data.results || []).map((item: any) => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        salePrice: item.price,
        stockCount: item.available_quantity || 0,
        rating: 0,
        reviewCount: 0,
        url: item.permalink,
        images: [item.thumbnail],
        sellerName: item.seller?.nickname,
        sellerId: item.seller?.id?.toString(),
        sellerReputation: '',
        shippingFree: item.shipping?.free_shipping || false,
        condition: item.condition,
        acceptsMercadoPago: item.accepts_mercadopago || false,
      }));
    } catch (error) {
      throw error;
    }
  }
}

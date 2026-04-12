import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface BolProduct {
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
  deliveryTime: string;
  bolPlusDelivery: boolean;
  freeReturns: boolean;
  category: string;
}

@Injectable()
export class BolBridge implements MarketplaceBridge {
  private readonly logger = new Logger(BolBridge.name);
  private readonly apiUrl = 'https://api.bol.com/retailer-demo';

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly scrapingService: ScrapingService,
    private readonly isProduction: boolean = false,
  ) {}

  private getBaseUrl(): string {
    return this.isProduction
      ? 'https://api.bol.com/retailer'
      : 'https://api.bol.com/retailer-demo';
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(
      'https://login.bol.com/token?grant_type=client_credentials',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
      },
    );
    const data = await response.json();
    return data.access_token;
  }

  async syncProducts(): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.getBaseUrl()}/content/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.retailer.v10+json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          platform: 'BOL',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'BOL',
        count: data.products?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'BOL',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.getBaseUrl()}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.retailer.v10+json',
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return { success: true, platform: 'BOL', orders: data.orders || [] };
    } catch (error) {
      return {
        success: false,
        platform: 'BOL',
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
          'Content-Type': 'application/vnd.retailer.v10+json',
          Accept: 'application/vnd.retailer.v10+json',
        },
        body: JSON.stringify({
          stocks: [
            {
              offerId: sku,
              amount: stock,
              managedByRetailer: true,
            },
          ],
        }),
      });
      return { success: response.ok, sku, stock, platform: 'BOL' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.getBaseUrl()}/offers/${sku}/price`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/vnd.retailer.v10+json',
        },
        body: JSON.stringify({
          pricing: {
            bundlePrices: [
              {
                quantity: 1,
                unitPrice: price,
              },
            ],
          },
        }),
      });
      return { success: response.ok, sku, price, platform: 'BOL' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const url = `https://www.bol.com/nl/v/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'BOL');
      return {
        storeId,
        storeName: scraped?.storeName || storeId,
        platform: 'BOL',
        country: 'Netherlands/Belgium',
        bolPlus: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<BolProduct[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.getBaseUrl()}/content/products?seller=${storeId}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.retailer.v10+json',
          },
        },
      );
      const data = await response.json();
      return (data.products || []).map((item: any) => ({
        productId: item.ean || item.id,
        title: item.title,
        price: item.offerData?.offers?.[0]?.price,
        salePrice: item.offerData?.offers?.[0]?.price,
        stockCount: item.stock?.amount || 0,
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0,
        url: item.url,
        images: [item.images?.[0]?.url],
        sellerName: item.offerData?.offers?.[0]?.seller?.displayName,
        sellerId: item.offerData?.offers?.[0]?.seller?.id,
        deliveryTime: item.offerData?.offers?.[0]?.deliveryTime,
        bolPlusDelivery: item.offerData?.offers?.[0]?.bolPlus || false,
        freeReturns: item.offerData?.offers?.[0]?.freeReturns || false,
        category: item.category,
      }));
    } catch (error) {
      throw error;
    }
  }
}

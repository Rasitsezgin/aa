import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface AllegroProduct {
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
  shippingFrom: string;
  deliveryTime: string;
  freeShipping: boolean;
  category: string;
}

@Injectable()
export class AllegroBridge implements MarketplaceBridge {
  private readonly logger = new Logger(AllegroBridge.name);
  private readonly apiUrl = 'https://api.allegro.pl';

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly accessToken: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/vnd.allegro.public.v1+json',
      'Content-Type': 'application/vnd.allegro.public.v1+json',
    };
  }

  async syncProducts(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/sale/offers?limit=100`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          platform: 'ALLEGRO',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'ALLEGRO',
        count: data.items?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'ALLEGRO',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/order/checkout-forms?status=READY_FOR_PROCESSING`,
        {
          headers: this.getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        success: true,
        platform: 'ALLEGRO',
        orders: data.checkoutForms || [],
      };
    } catch (error) {
      return {
        success: false,
        platform: 'ALLEGRO',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      // Get current offer
      const getResponse = await fetch(`${this.apiUrl}/sale/offers/${sku}`, {
        headers: this.getAuthHeaders(),
      });
      if (!getResponse.ok) throw new Error('Failed to get offer');
      const offer = await getResponse.json();

      // Update stock
      const response = await fetch(`${this.apiUrl}/sale/offers/${sku}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...offer,
          stock: {
            ...offer.stock,
            available: stock,
          },
        }),
      });
      return { success: response.ok, sku, stock, platform: 'ALLEGRO' };
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/sale/offers/${sku}/change-price-commands/${Date.now()}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            input: {
              buyNowPrice: {
                amount: price.toString(),
                currency: 'PLN',
              },
            },
          }),
        },
      );
      return { success: response.ok, sku, price, platform: 'ALLEGRO' };
    } catch (error) {
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/users/${storeId}/ratings-summary`,
        {
          headers: this.getAuthHeaders(),
        },
      );
      if (response.ok) {
        const data = await response.json();
        return {
          storeId,
          storeName: storeId,
          platform: 'ALLEGRO',
          country: 'Poland',
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
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
  ): Promise<AllegroProduct[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/users/${storeId}/offers?limit=${limit}`,
        { headers: this.getAuthHeaders() },
      );
      const data = await response.json();
      return (data.items || []).map((item: any) => ({
        productId: item.id,
        title: item.name,
        price: item.sellingMode?.price?.amount,
        salePrice: item.sellingMode?.price?.amount,
        stockCount: item.stock?.available || 0,
        rating: 0,
        reviewCount: 0,
        url: item.url,
        images: [item.images?.[0]?.url],
        sellerName: item.seller?.login,
        sellerId: item.seller?.id,
        shippingFrom: item.location?.city,
        deliveryTime: item.delivery?.shippingRates?.name,
        freeShipping: item.delivery?.shippingRates?.id === 'free',
        category: item.category?.name,
      }));
    } catch (error) {
      throw error;
    }
  }
}

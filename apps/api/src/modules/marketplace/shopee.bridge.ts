import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface ShopeeProduct {
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
  likedCount: number;
  shippingFrom: string;
  isPreOrder: boolean;
}

@Injectable()
export class ShopeeBridge implements MarketplaceBridge {
  private readonly logger = new Logger(ShopeeBridge.name);
  private readonly apiUrl = 'https://partner.shopeemobile.com/api/v2';

  constructor(
    private readonly partnerId: string,
    private readonly partnerKey: string,
    private readonly shopId: string,
    private readonly accessToken: string,
    private readonly scrapingService: ScrapingService,
    private readonly isSandbox: boolean = false,
  ) {}

  private getBaseUrl(): string {
    return this.isSandbox
      ? 'https://partner.test-stable.shopeemobile.com/api/v2'
      : this.apiUrl;
  }

  private generateAuthHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000);
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async syncProducts(): Promise<any> {
    this.logger.log('Syncing products from Shopee');
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/product/get_item_list?partner_id=${this.partnerId}&shop_id=${this.shopId}&timestamp=${Math.floor(Date.now() / 1000)}`,
        {
          method: 'GET',
          headers: this.generateAuthHeaders(),
        },
      );

      if (!response.ok) {
        this.logger.warn(`Shopee syncProducts failed: ${response.status}`);
        return {
          success: false,
          platform: 'SHOPEE',
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const products = data.response?.item_list || [];

      return {
        success: true,
        platform: 'SHOPEE',
        count: products.length,
        products: products.map(this.mapShopeeProduct),
      };
    } catch (error) {
      this.logger.warn(
        `Shopee syncProducts error: ${(error as Error).message}`,
      );
      return {
        success: false,
        platform: 'SHOPEE',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<any> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `${this.getBaseUrl()}/order/get_order_list?partner_id=${this.partnerId}&shop_id=${this.shopId}&timestamp=${timestamp}`,
        {
          method: 'GET',
          headers: this.generateAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        platform: 'SHOPEE',
        orders: data.response?.order_list || [],
      };
    } catch (error) {
      this.logger.warn(`Shopee syncOrders error: ${(error as Error).message}`);
      return {
        success: false,
        platform: 'SHOPEE',
        error: (error as Error).message,
      };
    }
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/product/update_stock?partner_id=${this.partnerId}&shop_id=${this.shopId}&timestamp=${Math.floor(Date.now() / 1000)}`,
        {
          method: 'POST',
          headers: this.generateAuthHeaders(),
          body: JSON.stringify({
            item_id: parseInt(sku),
            stock: stock,
          }),
        },
      );

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Shopee stock update failed: HTTP ${response.status}`);
      }

      return { success: response.ok, sku, stock, platform: 'SHOPEE' };
    } catch (error) {
      this.logger.warn(`Shopee updateStock error: ${(error as Error).message}`);
      throw error;
    }
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/product/update_price?partner_id=${this.partnerId}&shop_id=${this.shopId}&timestamp=${Math.floor(Date.now() / 1000)}`,
        {
          method: 'POST',
          headers: this.generateAuthHeaders(),
          body: JSON.stringify({
            item_id: parseInt(sku),
            price: price,
          }),
        },
      );

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Shopee price update failed: HTTP ${response.status}`);
      }

      return { success: response.ok, sku, price, platform: 'SHOPEE' };
    } catch (error) {
      this.logger.warn(`Shopee updatePrice error: ${(error as Error).message}`);
      throw error;
    }
  }

  async getStoreInfo(storeId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/shop/get_shop_info?partner_id=${this.partnerId}&shop_id=${storeId}&timestamp=${Math.floor(Date.now() / 1000)}`,
        {
          method: 'GET',
          headers: this.generateAuthHeaders(),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const shop = data.response;
        return {
          storeId: shop.shop_id?.toString() || storeId,
          storeName: shop.shop_name || storeId,
          totalProducts: 0, // Get from product list
          averageRating: shop.rating_star || 0,
          platform: 'SHOPEE',
          shopUrl: `https://shopee.com/${shop.country}/${shop.shop_name}`,
          country: shop.country || '',
          followerCount: shop.follower_count || 0,
          responseRate: shop.response_rate || 0,
        };
      }

      // Fallback to scraping
      const url = `https://shopee.com/shop/${storeId}`;
      const scraped = await this.scrapingService.scrapeStore(url, 'SHOPEE');
      if (scraped) {
        return {
          storeId,
          storeName: scraped.storeName || storeId,
          totalProducts: scraped.productCount ?? 0,
          averageRating: scraped.rating ?? 0,
          totalReviews: scraped.totalReviews ?? 0,
          platform: 'SHOPEE',
        };
      }

      throw new Error('Shopee shop info could not be retrieved');
    } catch (error) {
      this.logger.error(
        `Shopee getStoreInfo error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getStoreProducts(
    storeId?: string,
    limit: number = 10,
  ): Promise<ShopeeProduct[]> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/product/get_item_list?partner_id=${this.partnerId}&shop_id=${storeId || this.shopId}&timestamp=${Math.floor(Date.now() / 1000)}&page_size=${limit}`,
        {
          method: 'GET',
          headers: this.generateAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = data.response?.item_list || [];

      return items
        .slice(0, limit)
        .map((item: any, index: number) => this.mapShopeeProduct(item, index));
    } catch (error) {
      this.logger.error(
        `Shopee getStoreProducts error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private mapShopeeProduct(item: any, index: number = 0): ShopeeProduct {
    return {
      productId: item.item_id?.toString() || `SHOPEE-${index}`,
      title: item.item_name || 'Unknown',
      price: (item.price || 0) / 100000, // Shopee uses 100000 as base unit
      salePrice: (item.price || 0) / 100000,
      stockCount: item.stock || 0,
      rating: item.item_rating?.rating_star || 0,
      reviewCount: item.item_rating?.rating_count?.[0] || 0,
      url: `https://shopee.com/product/${item.shopid}/${item.item_id}`,
      images: item.image?.image_url_list || [],
      shopName: item.shop_name || '',
      shopId: item.shopid?.toString() || '',
      soldCount: item.sold || 0,
      likedCount: item.liked_count || 0,
      shippingFrom: item.shopee_verified ? 'Shopee Verified' : '',
      isPreOrder: item.is_pre_order || false,
    };
  }
}

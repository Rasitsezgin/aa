import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class MorhipoBridge implements MarketplaceBridge {
  private readonly logger = new Logger(MorhipoBridge.name);

  constructor(
    private readonly vendorId: string,
    private readonly apiKey: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.log(`Syncing Morhipo products for vendor ${this.vendorId}`);
    try {
      const apiUrls = [
        `https://seller-api.morhipo.com/v1/products?vendorId=${encodeURIComponent(this.vendorId)}`,
        `https://api.morhipo.com/seller/products?vendor=${encodeURIComponent(this.vendorId)}`,
      ];

      for (const url of apiUrls) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'X-Api-Key': this.apiKey,
            Accept: 'application/json',
          },
        });
        if (!response.ok) continue;
        const data = (await response.json()) as Record<string, unknown>;
        const items = Array.isArray(data.products)
          ? (data.products as Record<string, unknown>[])
          : Array.isArray(data.items)
            ? (data.items as Record<string, unknown>[])
            : [];
        if (items.length) {
          return {
            success: true,
            platform: 'MORHIPO',
            count: items.length,
            products: items.map((item, index) => this.mapProduct(item, index)),
          };
        }
      }

      const scraped = await this.scrapingService.scrapeStoreProducts(
        `https://www.morhipo.com/magaza/${this.vendorId}`,
        'MORHIPO',
        100,
      );

      return {
        success: true,
        platform: 'MORHIPO',
        count: scraped.length,
        source: 'scraping',
        products: scraped.map((p, index) => ({
          productId: `MH-${this.vendorId}-${index + 1}`,
          title: p.title,
          salePrice: p.price,
          currencyCode: 'TRY',
          listingStatus: p.stockStatus ? 'ACTIVE' : 'OUT_OF_STOCK',
          stockCount: p.stockStatus ? 10 : 0,
          images: p.images,
          merchantSku: `MH-SKU-${index + 1}`,
        })),
      };
    } catch (error) {
      return {
        success: false,
        platform: 'MORHIPO',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    return {
      success: true,
      platform: 'MORHIPO',
      skipped: true,
      message: 'Morhipo sipariş sync API entegrasyonu hazırlanıyor',
      orders: [],
    };
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`Morhipo stock update requested for ${sku}: ${stock}`);
    return { success: false, platform: 'MORHIPO', message: 'Stok güncelleme henüz uygulanmadı' };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`Morhipo price update requested for ${sku}: ${price}`);
    return { success: false, platform: 'MORHIPO', message: 'Fiyat güncelleme henüz uygulanmadı' };
  }

  private mapProduct(item: Record<string, unknown>, index: number) {
    return {
      productId: String(item.id ?? item.productId ?? `MH-${index + 1}`),
      title: String(item.title ?? item.name ?? 'Ürün'),
      salePrice: Number(item.price ?? item.salePrice ?? 0),
      currencyCode: 'TRY',
      listingStatus: 'ACTIVE',
      stockCount: Number(item.stock ?? item.quantity ?? 0),
      images: Array.isArray(item.images)
        ? (item.images as unknown[]).map(String)
        : [],
      merchantSku: String(item.sku ?? item.id ?? index),
    };
  }
}

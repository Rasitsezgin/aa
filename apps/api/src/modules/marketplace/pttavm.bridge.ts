import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class PttAvmBridge implements MarketplaceBridge {
  private readonly logger = new Logger(PttAvmBridge.name);
  private readonly apiBase = 'https://api.pttavm.com';

  constructor(
    private readonly apiKey: string,
    private readonly shopId: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.log(`Syncing PTT AVM products for shop ${this.shopId}`);
    try {
      const endpoints = [
        `${this.apiBase}/v1/products?shopId=${encodeURIComponent(this.shopId)}&page=1&size=100`,
        `${this.apiBase}/api/v1/products?merchantId=${encodeURIComponent(this.shopId)}&page=1&limit=100`,
      ];

      for (const url of endpoints) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'X-Api-Key': this.apiKey,
            Accept: 'application/json',
            'User-Agent': 'PazarYonetimi/1.0',
          },
        });

        if (!response.ok) continue;

        const data = (await response.json()) as Record<string, unknown>;
        const items = this.extractProducts(data);
        if (items.length) {
          return {
            success: true,
            platform: 'PTTAVM',
            count: items.length,
            products: items.map((item, index) => this.mapProduct(item, index)),
          };
        }
      }

      const scraped = await this.scrapingService.scrapeStoreProducts(
        `https://www.pttavm.com/magaza/${this.shopId}`,
        'PTTAVM',
        100,
      );

      return {
        success: true,
        platform: 'PTTAVM',
        count: scraped.length,
        source: 'scraping',
        products: scraped.map((p, index) => ({
          productId: `PTT-${this.shopId}-${index + 1}`,
          title: p.title,
          salePrice: p.price,
          currencyCode: 'TRY',
          listingStatus: p.stockStatus ? 'ACTIVE' : 'OUT_OF_STOCK',
          stockCount: p.stockStatus ? 10 : 0,
          images: p.images,
          merchantSku: `PTT-SKU-${index + 1}`,
        })),
      };
    } catch (error) {
      return {
        success: false,
        platform: 'PTTAVM',
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    return {
      success: true,
      platform: 'PTTAVM',
      skipped: true,
      message: 'PTT AVM sipariş sync API entegrasyonu hazırlanıyor',
      orders: [],
    };
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`PTT AVM stock update requested for ${sku}: ${stock}`);
    return { success: false, platform: 'PTTAVM', message: 'Stok güncelleme henüz uygulanmadı' };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`PTT AVM price update requested for ${sku}: ${price}`);
    return { success: false, platform: 'PTTAVM', message: 'Fiyat güncelleme henüz uygulanmadı' };
  }

  private extractProducts(data: Record<string, unknown>): Record<string, unknown>[] {
    const candidates = [
      data.products,
      data.items,
      data.data,
      (data.result as Record<string, unknown> | undefined)?.products,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Record<string, unknown>[];
      }
    }
    return [];
  }

  private mapProduct(item: Record<string, unknown>, index: number) {
    return {
      productId: String(item.id ?? item.productId ?? `PTT-${index + 1}`),
      title: String(item.title ?? item.name ?? 'Ürün'),
      salePrice: Number(item.price ?? item.salePrice ?? 0),
      currencyCode: 'TRY',
      listingStatus: 'ACTIVE',
      stockCount: Number(item.stock ?? item.quantity ?? 0),
      images: Array.isArray(item.images)
        ? (item.images as unknown[]).map(String)
        : [],
      merchantSku: String(item.sku ?? item.barcode ?? item.id ?? index),
    };
  }
}

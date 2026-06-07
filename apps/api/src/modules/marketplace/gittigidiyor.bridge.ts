import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class GittigidiyorBridge implements MarketplaceBridge {
  private readonly logger = new Logger(GittigidiyorBridge.name);

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<Record<string, unknown>> {
    this.logger.warn(
      'GittiGidiyor platformu kapatıldı; scraping/legacy API ile sınırlı sync',
    );
    try {
      const legacyUrl = `https://dev.gittigidiyor.com/listingapi/ws/IndividualProductService?wsdl`;
      const response = await fetch(legacyUrl, { method: 'GET' });
      if (response.ok) {
        this.logger.log('GittiGidiyor legacy endpoint erişilebilir');
      }

      const storeId = this.apiKey.slice(0, 12);
      const scraped = await this.scrapingService.scrapeStoreProducts(
        `https://www.gittigidiyor.com/magaza/${storeId}`,
        'GITTIGIDIYOR',
        50,
      );

      return {
        success: true,
        platform: 'GITTIGIDIYOR',
        deprecated: true,
        message: 'GittiGidiyor kapatıldı; mevcut veriler sınırlı çekilebilir',
        count: scraped.length,
        products: scraped.map((p, index) => ({
          productId: `GG-${index + 1}`,
          title: p.title,
          salePrice: p.price,
          currencyCode: 'TRY',
          listingStatus: p.stockStatus ? 'ACTIVE' : 'OUT_OF_STOCK',
          stockCount: p.stockStatus ? 5 : 0,
          images: p.images,
          merchantSku: `GG-SKU-${index + 1}`,
        })),
      };
    } catch (error) {
      return {
        success: false,
        platform: 'GITTIGIDIYOR',
        deprecated: true,
        error: (error as Error).message,
      };
    }
  }

  async syncOrders(): Promise<Record<string, unknown>> {
    return {
      success: true,
      platform: 'GITTIGIDIYOR',
      deprecated: true,
      skipped: true,
      orders: [],
      message: 'GittiGidiyor sipariş sync kullanılamıyor (platform kapatıldı)',
    };
  }

  async updateStock(sku: string, stock: number): Promise<Record<string, unknown>> {
    this.logger.log(`GittiGidiyor stock update requested for ${sku}: ${stock}`);
    return { success: false, platform: 'GITTIGIDIYOR', deprecated: true, message: 'Platform kapatıldı' };
  }

  async updatePrice(sku: string, price: number): Promise<Record<string, unknown>> {
    this.logger.log(`GittiGidiyor price update requested for ${sku}: ${price}`);
    return { success: false, platform: 'GITTIGIDIYOR', deprecated: true, message: 'Platform kapatıldı' };
  }
}

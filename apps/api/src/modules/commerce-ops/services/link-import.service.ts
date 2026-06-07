import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ScrapingService } from '../../scraping/scraping.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Link ile ürün kaydı — Trendyol/HB/Amazon URL → katalog ürünü.
 */
@Injectable()
export class LinkImportService {
  private readonly logger = new Logger(LinkImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scraping: ScrapingService,
  ) {}

  async importFromUrl(tenantId: string, url: string, options?: { sku?: string }) {
    if (!url?.trim()) {
      throw new BadRequestException('URL zorunludur');
    }

    const scraped = await this.scraping.scrapeProductFromUrl(url.trim());
    if (!scraped) {
      throw new BadRequestException('Ürün sayfası okunamadı');
    }

    const sku =
      options?.sku?.trim() ||
      `IMP-${scraped.platform}-${Date.now().toString(36).toUpperCase()}`;

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        title: scraped.title,
        sku,
        price: new Decimal(scraped.price || 0),
        stock: scraped.stockStatus ? 10 : 0,
        status: 'active',
        tags: { sourceUrl: url, platform: scraped.platform, importedAt: new Date().toISOString() },
        images: scraped.images.length
          ? {
              create: scraped.images.slice(0, 3).map((img, i) => ({
                url: img,
                isMain: i === 0,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    this.logger.log(`[${tenantId}] Link import: ${product.id} ← ${url}`);

    return {
      success: true,
      product,
      scraped: {
        platform: scraped.platform,
        title: scraped.title,
        price: scraped.price,
        rating: scraped.rating,
      },
    };
  }
}

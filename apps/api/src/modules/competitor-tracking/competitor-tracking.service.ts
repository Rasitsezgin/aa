import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ScrapingService } from '../scraping/scraping.service';
import { PricingOptimizationService } from '../pricing-optimization/pricing-optimization.service';

/**
 * Rakip Takip ve Otomatik Fiyatlandırma Orkestratörü
 */
@Injectable()
export class CompetitorTrackingService {
  private readonly logger = new Logger(CompetitorTrackingService.name);

  constructor(
    private prisma: PrismaService,
    private scrapingService: ScrapingService,
    private pricingService: PricingOptimizationService,
  ) {}

  /**
   * Tüm kiracılar için rakip fiyatlarını güncelle
   */
  async updateAllCompetitorPrices() {
    this.logger.log('Tüm rakip fiyat güncelleme işlemi başlatıldı...');
    
    const productsWithCompetitors = await this.prisma.product.findMany({
      where: {
        competitorProducts: { some: {} },
        status: 'active'
      },
      include: {
        competitorProducts: {
          include: { competitor: true }
        }
      }
    });

    for (const product of productsWithCompetitors) {
      for (const cp of product.competitorProducts) {
        if (!cp.url) continue;

        try {
          const scrapedData = await this.scrapingService.scrapeStore(cp.url, cp.competitor.platform);
          // Not: scrapeStore şu an mağaza verisi çekiyor, ürün bazlı scraping eklenecek
          // Şimdilik simüle edilmiş bir ürün scraping çağrısı:
          
          this.logger.debug(`${product.sku} için ${cp.competitor.name} fiyatı güncelleniyor...`);
          
          // Gerçekte burada scrapeProduct(url) olmalı
          const newPrice = Number(product.price) * (0.9 + Math.random() * 0.2); // Simüle

          await this.prisma.competitorProduct.update({
            where: { id: cp.id },
            data: { 
              price: newPrice,
              lastChecked: new Date()
            }
          });
        } catch (error) {
          this.logger.error(`Fiyat güncellenemedi (${product.sku}): ${error.message}`);
        }
      }
    }

    this.logger.log('Rakip fiyat güncelleme işlemi tamamlandı.');
  }

  /**
   * Belirli bir ürün için rakip analizi yap ve AI önerisi getir
   */
  async getAIPricingInsight(productId: string, tenantId: string) {
    const recommendations = await this.pricingService.getPriceRecommendations(tenantId);
    const productRec = recommendations.recommendations.find(r => r.productId === productId);

    if (!productRec) return null;

    return {
      type: 'PRICING_OPTIMIZATION',
      priority: productRec.changePercent < 0 ? 'HIGH' : 'NORMAL',
      message: `${productRec.title} için ${productRec.reason}. Önerilen Fiyat: ₺${productRec.recommendedPrice}`,
      data: productRec
    };
  }
}

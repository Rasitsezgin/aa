import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';
import {
  MarketplaceAnalysisResponse,
  computeConfidenceFromSources,
} from './analysis.types';

@Injectable()
export class AmazonBridge implements MarketplaceBridge {
  private readonly logger = new Logger(AmazonBridge.name);

  constructor(
    private readonly sellerId: string,
    private readonly mwsAuthToken: string,
    private readonly scrapingService: ScrapingService,
  ) {}

  async syncProducts(): Promise<any> {
    const sellerId = this.sellerId?.trim();
    if (!sellerId || sellerId === 'public') {
      throw new Error('Amazon syncProducts için sellerId zorunludur');
    }

    this.logger.log(`Syncing products for Amazon Seller: ${sellerId}`);
    const storeUrl = sellerId.startsWith('http')
      ? sellerId
      : `https://www.amazon.com.tr/s?me=${encodeURIComponent(sellerId)}`;

    const products = await this.scrapingService.scrapeStoreProducts(
      storeUrl,
      'AMAZON',
      100,
    );
    if (!Array.isArray(products)) {
      throw new Error('Amazon ürün verisi alınamadı');
    }

    return {
      success: true,
      platform: 'AMAZON',
      count: products.length,
      products,
    };
  }

  async getStoreInfo(storeId?: string): Promise<any> {
    const resolvedStoreId = (storeId || this.sellerId || '').trim();
    if (!resolvedStoreId || resolvedStoreId === 'public') {
      throw new Error('Amazon getStoreInfo için sellerId zorunludur');
    }

    const storeUrl = resolvedStoreId.startsWith('http')
      ? resolvedStoreId
      : `https://www.amazon.com.tr/s?me=${encodeURIComponent(resolvedStoreId)}`;

    const scraped = await this.scrapingService.scrapeStore(storeUrl, 'AMAZON');
    return {
      storeId: resolvedStoreId,
      storeName: scraped?.storeName || resolvedStoreId,
      totalProducts: scraped?.productCount ?? 0,
      averageRating: scraped?.rating ?? 0,
      totalReviews: scraped?.totalReviews ?? 0,
      followersCount: scraped?.followerCount ?? 0,
      platform: 'AMAZON',
    };
  }

  async getStoreProducts(storeId?: string, limit: number = 10): Promise<any[]> {
    const resolvedStoreId = (storeId || this.sellerId || '').trim();
    if (!resolvedStoreId || resolvedStoreId === 'public') {
      throw new Error('Amazon getStoreProducts için sellerId zorunludur');
    }

    const storeUrl = resolvedStoreId.startsWith('http')
      ? resolvedStoreId
      : `https://www.amazon.com.tr/s?me=${encodeURIComponent(resolvedStoreId)}`;

    const scrapedProducts = await this.scrapingService.scrapeStoreProducts(
      storeUrl,
      'AMAZON',
      limit,
    );
    return (Array.isArray(scrapedProducts) ? scrapedProducts : []).map(
      (product, index) => {
        const entry = product as unknown as Record<string, unknown>;
        return {
          productId: String(entry.productId || entry.id || `AMZ-${index + 1}`),
          title: String(entry.title || entry.name || ''),
          salePrice: Number(entry.salePrice || entry.price || 0),
          price: Number(entry.price || entry.salePrice || 0),
          stockCount: Number(entry.stock ?? entry.stockCount ?? 0),
          rating: Number(entry.rating || 0),
          reviewCount: Number(entry.reviewCount || 0),
          images: Array.isArray(entry.images) ? entry.images : [],
          url: String(entry.url || ''),
        };
      },
    );
  }

  async syncOrders(): Promise<any> {
    throw new Error(
      'Amazon sipariş senkronizasyonu için SP-API entegrasyonu zorunludur',
    );
  }

  async updateStock(sku: string, stock: number): Promise<any> {
    void sku;
    void stock;
    throw new Error(
      'Amazon stok güncelleme için SP-API entegrasyonu zorunludur',
    );
  }

  async updatePrice(sku: string, price: number): Promise<any> {
    void sku;
    void price;
    throw new Error(
      'Amazon fiyat güncelleme için SP-API entegrasyonu zorunludur',
    );
  }

  // Amazon SP-API review entegrasyonu — henüz aktif değil
  async getReviews(
    _page: number = 0,
    _size: number = 100,
  ): Promise<MarketplaceReview[]> {
    this.logger.warn(
      'Amazon getReviews: SP-API entegrasyonu henüz aktif değil',
    );
    return [];
  }

  /**
   * SEO ve Performans analizi yap - Scraping tabanlı
   */
  async analyzeStoreSEO(
    storeId?: string,
  ): Promise<MarketplaceAnalysisResponse> {
    try {
      const resolvedStoreId = (storeId || this.sellerId || '').trim();
      if (!resolvedStoreId || resolvedStoreId === 'public') {
        throw new Error('Amazon analiz için sellerId zorunludur');
      }

      const storeInfo = await this.getStoreInfo(resolvedStoreId);
      const products = await this.getStoreProducts(resolvedStoreId, 20);

      // SEO Score hesabı
      const seoScore = this.calculateSEOScore(storeInfo, products);

      const metricSources = {
        storeName: 'scraped',
        rating: 'scraped',
        followers: 'not_available',
        totalProducts: 'scraped',
        responseTime: 'not_available',
        monthlyTraffic: 'not_available',
        monthlyTurnover: 'not_available',
        titleOptimization: 'calculated',
        imageOptimization: 'calculated',
        priceCompetitiveness: 'calculated',
        stockHealth: 'calculated',
        ratingTrend: 'scraped',
        reviewCount: 'scraped',
      } as const;

      return {
        platform: 'AMAZON',
        storeId: resolvedStoreId,
        storeName: storeInfo.storeName,
        seoScore,
        dataSources: {
          overall: 'scraped+calculated',
          seoScore: 'calculated',
          products: 'scraped',
          metrics: metricSources,
          reasons: {
            responseTime:
              'Amazon public source yanit suresi bilgisini acik olarak saglamiyor.',
            monthlyTraffic:
              'Aylik trafik verisi platform public endpointlerinde bulunmuyor.',
            monthlyTurnover:
              'Aylik ciro verisi platform public endpointlerinde bulunmuyor.',
            followers:
              'Amazon magaza takipcisi bilgisi public olarak saglanmiyor.',
          },
          evidence: {
            adapter: 'amazon.bridge',
            productSampleSize: products.length,
            hasCredentials: Boolean(
              this.sellerId && this.sellerId !== 'public',
            ),
          },
        },
        confidence: computeConfidenceFromSources(metricSources),
        metrics: {
          storeName: storeInfo.storeName,
          rating: storeInfo.averageRating,
          followers: 0,
          totalProducts: storeInfo.totalProducts,
          titleOptimization: this.analyzeTitles(products),
          imageOptimization: this.analyzeImages(products),
          priceCompetitiveness: this.analyzePrices(products),
          stockHealth: this.analyzeStock(products),
          ratingTrend: storeInfo.averageRating,
          reviewCount: storeInfo.totalReviews,
        },
        products: products.map((p) => ({
          name: p.title,
          price: p.salePrice,
          rating: p.rating,
          reviews: p.reviewCount,
          stock: p.stockCount,
        })),
        recommendations: this.generateRecommendations(storeInfo, products),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Amazon SEO analysis error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private calculateSEOScore(storeInfo: any, products: any[]): number {
    let score = 45; // Base score (lower than local platforms due to global competition)

    // Rating (max +20) - Amazon uses 5-star system
    score += (storeInfo.averageRating / 5) * 20;

    // Review count (max +15)
    const reviewBonus = Math.min(storeInfo.totalReviews / 500, 15);
    score += reviewBonus;

    // Stock health (max +15)
    const avgStock =
      products.length > 0
        ? products.reduce((sum, p) => sum + (p.stockCount > 0 ? 1 : 0), 0) /
          products.length
        : 0;
    score += avgStock * 15;

    // Product diversity (max +5)
    if (products.length >= 10) score += 5;

    return Math.min(Math.round(score), 100);
  }

  private analyzeTitles(products: any[]): number {
    if (!products.length) return 50;
    let validCount = 0;

    products.forEach((p) => {
      const title = p.title || '';
      // Amazon title optimization: 60-200 chars is ideal
      if (title.length >= 60 && title.length <= 200) validCount++;
    });

    return Math.round((validCount / products.length) * 100);
  }

  private analyzeImages(products: any[]): number {
    if (!products.length) return 50;
    let validCount = 0;
    products.forEach((p) => {
      // Amazon requires main image + 4+ additional images ideally
      if (p.images && p.images.length >= 1) validCount++;
    });
    return Math.round((validCount / products.length) * 100);
  }

  private analyzePrices(products: any[]): number {
    if (!products.length) return 50;
    const avgPrice =
      products.reduce((sum, p) => sum + (p.salePrice || 0), 0) /
      products.length;
    // Amazon competitive pricing analysis - variance indicates competition
    const variance =
      products.reduce(
        (sum, p) => sum + Math.abs((p.salePrice || 0) - avgPrice),
        0,
      ) / products.length;
    const normalizedVariance = Math.min(
      30,
      (variance / Math.max(avgPrice, 1)) * 100,
    );
    return Math.round(
      Math.min(100, Math.max(40, 70 + (30 - normalizedVariance))),
    );
  }

  private analyzeStock(products: any[]): number {
    if (!products.length) return 50;
    const stockedProducts = products.filter(
      (p) => (p.stockCount || 0) > 5,
    ).length;
    return Math.round((stockedProducts / products.length) * 100);
  }

  private generateRecommendations(storeInfo: any, products: any[]): string[] {
    const recommendations: string[] = [];

    if (storeInfo.averageRating < 4.0) {
      recommendations.push(
        'Amazon satıcı puanını artırmak için müşteri hizmetlerini iyileştir',
      );
    }

    if (storeInfo.totalReviews < 100) {
      recommendations.push(
        'Yorum sayısını artırmak için Amazon Early Reviewer programını kullan',
      );
    }

    const lowStockProducts = products.filter(
      (p) => (p.stockCount || 0) < 10,
    ).length;
    if (lowStockProducts > 0) {
      recommendations.push(
        `${lowStockProducts} ürün kritik stok seviyesinde - FBA kullanmayı düşün`,
      );
    }

    if (products.length < 10) {
      recommendations.push(
        'Amazon katalogunu genişlet - minimum 10+ ürün önerilir',
      );
    }

    // Check for Prime eligibility simulation
    const hasPrimeEligible = products.some((p) => (p.salePrice || 0) > 35);
    if (!hasPrimeEligible) {
      recommendations.push('Prime ücretsiz kargo için 35$+ ürünler ekle');
    }

    return recommendations;
  }
}

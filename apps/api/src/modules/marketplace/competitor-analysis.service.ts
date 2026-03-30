import { Injectable, Logger } from '@nestjs/common';
import { ScrapingService, ScrapedProductData } from '../scraping/scraping.service';
import { MarketplaceService, Platform } from './marketplace.service';

export interface CompetitorProduct {
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  platform: string;
  storeName: string;
  url: string;
  image?: string;
  stockStatus: boolean;
}

export interface PriceComparison {
  productName: string;
  ourPrice: number;
  competitorPrices: Array<{
    platform: string;
    storeName: string;
    price: number;
    difference: number;
    differencePercent: number;
    url: string;
  }>;
  cheapest: {
    platform: string;
    price: number;
  } | null;
  mostExpensive: {
    platform: string;
    price: number;
  } | null;
  averageMarketPrice: number;
  recommendation: string;
}

export interface CompetitorAnalysis {
  competitorStoreUrl: string;
  platform: Platform;
  storeInfo: {
    name: string;
    rating: number;
    followerCount: number;
    productCount: number;
  };
  products: CompetitorProduct[];
  commonProducts: Array<{
    ourProduct: { title: string; price: number };
    competitorProduct: CompetitorProduct;
    priceDifference: number;
    priceDifferencePercent: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  analyzedAt: Date;
}

@Injectable()
export class CompetitorAnalysisService {
  private readonly logger = new Logger(CompetitorAnalysisService.name);

  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  /**
   * Rakip mağazayı analiz et
   */
  async analyzeCompetitor(
    competitorUrl: string,
    platform: Platform,
    ourTenantId: string,
  ): Promise<CompetitorAnalysis> {
    this.logger.log(`Analyzing competitor: ${competitorUrl} on ${platform}`);

    // Rakip mağaza bilgilerini çek
    const storeData = await this.scrapingService.scrapeStore(competitorUrl, platform);
    if (!storeData) {
      throw new Error('Rakip mağaza verisi alınamadı');
    }

    // Rakip ürünlerini çek
    const products = await this.scrapingService.scrapeStoreProducts(
      competitorUrl,
      platform,
      50,
    );

    // Kendi ürünlerimizi çek
    const ourProducts = await this.getOurProducts(ourTenantId);

    // Ortak ürünleri bul ve karşılaştır
    const commonProducts = this.findCommonProducts(ourProducts, products, platform);

    // SWOT analizi yap
    const { strengths, weaknesses, opportunities, threats } = this.performSwotAnalysis(
      storeData,
      products,
      ourProducts,
      commonProducts,
    );

    return {
      competitorStoreUrl: competitorUrl,
      platform,
      storeInfo: {
        name: storeData.storeName,
        rating: storeData.rating,
        followerCount: storeData.followerCount,
        productCount: storeData.productCount,
      },
      products: products.map((p) => ({
        productId: p.title, // Use title as ID for scraped products
        title: p.title,
        price: p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        platform,
        storeName: storeData.storeName,
        url: competitorUrl,
        image: p.images?.[0],
        stockStatus: p.stockStatus,
      })),
      commonProducts,
      strengths,
      weaknesses,
      opportunities,
      threats,
      analyzedAt: new Date(),
    };
  }

  /**
   * Fiyat karşılaştırması yap
   */
  async comparePrices(
    productQuery: string,
    platforms: Platform[],
    ourProductPrice?: number,
  ): Promise<PriceComparison> {
    this.logger.log(`Comparing prices for: ${productQuery}`);

    const competitorPrices: PriceComparison['competitorPrices'] = [];

    for (const platform of platforms) {
      try {
        // Platformda ürün ara (bridge searchProducts varsa kullan)
        const results = await this.marketplaceService.searchProducts(
          platform,
          productQuery,
          5,
        );

        for (const result of results) {
          const price = Number(result.price || result.salePrice || 0);
          if (price > 0) {
            competitorPrices.push({
              platform,
              storeName: String(result.storeName || result.sellerName || platform),
              price,
              difference: ourProductPrice ? price - ourProductPrice : 0,
              differencePercent: ourProductPrice
                ? ((price - ourProductPrice) / ourProductPrice) * 100
                : 0,
              url: String(result.url || ''),
            });
          }
        }
      } catch (error) {
        this.logger.warn(`Price search failed for ${platform}: ${(error as Error).message}`);
      }
    }

    // Fiyat istatistikleri
    const prices = competitorPrices.map((p) => p.price);
    const cheapest = prices.length > 0
      ? { platform: competitorPrices[prices.indexOf(Math.min(...prices))].platform, price: Math.min(...prices) }
      : null;
    const mostExpensive = prices.length > 0
      ? { platform: competitorPrices[prices.indexOf(Math.max(...prices))].platform, price: Math.max(...prices) }
      : null;
    const averageMarketPrice = prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;

    // Öneri oluştur
    let recommendation = 'Pazar fiyatları analiz ediliyor';
    if (ourProductPrice && cheapest) {
      if (ourProductPrice <= cheapest.price * 1.05) {
        recommendation = 'Fiyatınız pazarda rekabetçi düzeyde';
      } else if (ourProductPrice > cheapest.price * 1.2) {
        recommendation = 'Fiyatınız pazar ortalamasının üzerinde - indirim düşünün';
      } else {
        recommendation = 'Fiyatınız pazar ortalamasında';
      }
    }

    return {
      productName: productQuery,
      ourPrice: ourProductPrice || 0,
      competitorPrices,
      cheapest,
      mostExpensive,
      averageMarketPrice: Math.round(averageMarketPrice * 100) / 100,
      recommendation,
    };
  }

  /**
   * Çoklu rakip analizi
   */
  async analyzeMultipleCompetitors(
    competitorUrls: Array<{ url: string; platform: Platform }>,
    ourTenantId: string,
  ): Promise<{
    analyses: CompetitorAnalysis[];
    summary: {
      totalCompetitors: number;
      totalCompetitorProducts: number;
      averageCompetitorRating: number;
      priceGapAnalysis: string;
    };
  }> {
    const analyses: CompetitorAnalysis[] = [];

    for (const { url, platform } of competitorUrls) {
      try {
        const analysis = await this.analyzeCompetitor(url, platform, ourTenantId);
        analyses.push(analysis);
      } catch (error) {
        this.logger.error(`Failed to analyze ${url}: ${(error as Error).message}`);
      }
    }

    const totalCompetitorProducts = analyses.reduce(
      (sum, a) => sum + a.storeInfo.productCount,
      0,
    );
    const averageCompetitorRating = analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.storeInfo.rating, 0) / analyses.length
      : 0;

    return {
      analyses,
      summary: {
        totalCompetitors: analyses.length,
        totalCompetitorProducts,
        averageCompetitorRating: Math.round(averageCompetitorRating * 100) / 100,
        priceGapAnalysis: this.generatePriceGapSummary(analyses),
      },
    };
  }

  private async getOurProducts(tenantId: string): Promise<Array<{ title: string; price: number; sku: string }>> {
    // Prisma'dan ürünleri çek
    // Şimdilik basit bir implementasyon - gerçek implementasyonda PrismaService kullanılmalı
    return [];
  }

  private findCommonProducts(
    ourProducts: Array<{ title: string; price: number; sku: string }>,
    competitorProducts: ScrapedProductData[],
    platform: Platform,
  ): CompetitorAnalysis['commonProducts'] {
    const common: CompetitorAnalysis['commonProducts'] = [];

    for (const ourProduct of ourProducts) {
      // Başlık benzerliği kontrolü (basit string matching)
      const matchingProduct = competitorProducts.find((cp) => {
        const ourTitleLower = ourProduct.title.toLowerCase();
        const compTitleLower = cp.title.toLowerCase();
        return (
          ourTitleLower.includes(compTitleLower.substring(0, 20)) ||
          compTitleLower.includes(ourTitleLower.substring(0, 20))
        );
      });

      if (matchingProduct) {
        const priceDifference = matchingProduct.price - ourProduct.price;
        const priceDifferencePercent = ourProduct.price
          ? (priceDifference / ourProduct.price) * 100
          : 0;

        common.push({
          ourProduct,
          competitorProduct: {
            productId: matchingProduct.title,
            title: matchingProduct.title,
            price: matchingProduct.price,
            rating: matchingProduct.rating,
            reviewCount: matchingProduct.reviewCount,
            platform,
            storeName: 'Rakip Mağaza',
            url: '',
            stockStatus: matchingProduct.stockStatus,
          },
          priceDifference,
          priceDifferencePercent,
        });
      }
    }

    return common;
  }

  private performSwotAnalysis(
    storeData: any,
    products: ScrapedProductData[],
    ourProducts: Array<{ title: string; price: number }>,
    commonProducts: CompetitorAnalysis['commonProducts'],
  ): { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // Güçlü yönler
    if (storeData.rating > 9.0) {
      strengths.push('Rakip yüksek müşteri memnuniyetine sahip');
    }
    if (storeData.followerCount > 5000) {
      strengths.push('Rakibin geniş müşteri kitlesi var');
    }
    if (products.length > 100) {
      strengths.push('Rakip geniş ürün yelpazesi sunuyor');
    }

    // Zayıf yönler
    if (storeData.rating < 8.0) {
      weaknesses.push('Rakip düşük müşteri memnuniyeti');
    }
    const lowStockProducts = products.filter((p) => !p.stockStatus).length;
    if (lowStockProducts > products.length * 0.3) {
      weaknesses.push('Rakip stok sorunları yaşıyor');
    }

    // Fırsatlar
    const ourCheaperProducts = commonProducts.filter((cp) => cp.priceDifference < 0);
    if (ourCheaperProducts.length > 0) {
      opportunities.push(
        `${ourCheaperProducts.length} üründe fiyat avantajına sahibiz`,
      );
    }
    if (products.length < ourProducts.length) {
      opportunities.push('Ürün çeşitliliğinde avantajlıyız');
    }

    // Tehditler
    const theirCheaperProducts = commonProducts.filter((cp) => cp.priceDifference > 0);
    if (theirCheaperProducts.length > 0) {
      threats.push(
        `${theirCheaperProducts.length} üründe rakip daha ucuz`,
      );
    }
    if (storeData.followerCount > 10000) {
      threats.push('Rakip güçlü marka bilinirliğine sahip');
    }

    return { strengths, weaknesses, opportunities, threats };
  }

  private generatePriceGapSummary(analyses: CompetitorAnalysis[]): string {
    const allPriceGaps = analyses.flatMap((a) =>
      a.commonProducts.map((cp) => cp.priceDifferencePercent),
    );

    if (allPriceGaps.length === 0) {
      return 'Ortak ürün bulunamadı';
    }

    const avgGap = allPriceGaps.reduce((a, b) => a + b, 0) / allPriceGaps.length;

    if (avgGap < -10) {
      return 'Genel olarak rakiplerden daha ucuzsunuz (%10+ avantaj)';
    } else if (avgGap > 10) {
      return 'Rakipler genel olarak daha ucuz - fiyat stratejisi gözden geçirilmeli';
    } else {
      return 'Fiyatlar pazar ortalamasında';
    }
  }
}

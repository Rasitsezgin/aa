import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PriceRecommendation {
  productId: string;
  sku: string;
  title: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  changePercent: number;
  reason: string;
  confidence: number;
  competitorPrices: { platform: string; price: number; seller: string }[];
  demandScore: number;
  profitImpact: number;
}

@Injectable()
export class PricingOptimizationService {
  private readonly logger = new Logger(PricingOptimizationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * AI destekli fiyat önerileri
   */
  async getPriceRecommendations(tenantId: string): Promise<{
    recommendations: PriceRecommendation[];
    summary: any;
  }> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: {
        competitorProducts: {
          include: { competitor: true },
        },
        orderItems: {
          include: { order: true },
          where: {
            order: { orderDate: { gte: new Date(Date.now() - 30 * 86400000) } },
          },
        },
      },
      take: 50,
    });

    const recommendations: PriceRecommendation[] = [];

    for (const product of products) {
      const currentPrice = Number(product.price);
      const competitorPrices = product.competitorProducts.map((cp) => ({
        platform: cp.competitor.platform,
        price: Number(cp.price),
        seller: cp.competitor.name,
      }));

      // Rakip fiyat analizi
      const avgCompetitorPrice =
        competitorPrices.length > 0
          ? competitorPrices.reduce((sum, cp) => sum + cp.price, 0) /
            competitorPrices.length
          : currentPrice;
      const minCompetitorPrice =
        competitorPrices.length > 0
          ? Math.min(...competitorPrices.map((cp) => cp.price))
          : currentPrice;

      // Talep skoru (son 30 gün satış bazlı)
      const salesCount = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const demandScore = Math.min(100, salesCount * 5);

      // Stok durumu
      const stockLevel = product.stock;
      const isLowStock = stockLevel < 10;
      const isOverStock = stockLevel > 100;

      // AI fiyat optimizasyonu
      let recommendedPrice = currentPrice;
      let reason = '';
      let confidence = 0.75;

      if (currentPrice > avgCompetitorPrice * 1.15) {
        // Fiyat rakiplerden çok yüksek
        recommendedPrice = avgCompetitorPrice * 1.05;
        reason = 'Rakip fiyatlarına göre yüksek, rekabetçi fiyat önerisi';
        confidence = 0.85;
      } else if (currentPrice < minCompetitorPrice * 0.9 && demandScore > 50) {
        // Talep yüksek ve en düşük fiyattayız
        recommendedPrice = currentPrice * 1.08;
        reason = 'Yüksek talep, fiyat artışı için uygun';
        confidence = 0.82;
      } else if (isOverStock && demandScore < 30) {
        // Fazla stok, düşük talep
        recommendedPrice = currentPrice * 0.92;
        reason = 'Stok eritme indirimi önerisi';
        confidence = 0.78;
      } else if (isLowStock && demandScore > 60) {
        // Az stok, yüksek talep
        recommendedPrice = currentPrice * 1.12;
        reason = 'Kıtlık fiyatlaması, stok azaldı';
        confidence = 0.8;
      } else {
        recommendedPrice = currentPrice;
        reason = 'Fiyat optimum seviyede';
        confidence = 0.9;
      }

      const priceChange = recommendedPrice - currentPrice;
      const changePercent = (priceChange / currentPrice) * 100;

      // Kar etkisi hesaplama (basit model)
      const profitImpact = priceChange * (salesCount || 10);

      if (Math.abs(changePercent) > 1) {
        recommendations.push({
          productId: product.id,
          sku: product.sku,
          title: product.title,
          currentPrice,
          recommendedPrice: Math.round(recommendedPrice * 100) / 100,
          priceChange: Math.round(priceChange * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          reason,
          confidence,
          competitorPrices,
          demandScore,
          profitImpact: Math.round(profitImpact),
        });
      }
    }

    // Özet istatistikler
    const priceIncreases = recommendations.filter((r) => r.priceChange > 0);
    const priceDecreases = recommendations.filter((r) => r.priceChange < 0);
    const totalProfitImpact = recommendations.reduce(
      (sum, r) => sum + r.profitImpact,
      0,
    );

    return {
      recommendations: recommendations.sort(
        (a, b) => Math.abs(b.profitImpact) - Math.abs(a.profitImpact),
      ),
      summary: {
        totalRecommendations: recommendations.length,
        priceIncreases: priceIncreases.length,
        priceDecreases: priceDecreases.length,
        avgConfidence:
          recommendations.length > 0
            ? Math.round(
                (recommendations.reduce((sum, r) => sum + r.confidence, 0) /
                  recommendations.length) *
                  100,
              )
            : 0,
        potentialProfitImpact: totalProfitImpact,
        avgPriceChange:
          recommendations.length > 0
            ? Math.round(
                (recommendations.reduce((sum, r) => sum + r.changePercent, 0) /
                  recommendations.length) *
                  100,
              ) / 100
            : 0,
      },
    };
  }

  /**
   * Fiyat değişikliği uygula
   */
  async applyPriceChange(
    productId: string,
    newPrice: number,
    tenantId: string,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    const oldPrice = Number(product.price);

    await this.prisma.product.update({
      where: { id: productId },
      data: { price: newPrice },
    });

    // Fiyat değişikliği logla
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'price.change',
        resource: 'product',
        resourceId: productId,
        details: {
          sku: product.sku,
          oldPrice,
          newPrice,
          changePercent: (((newPrice - oldPrice) / oldPrice) * 100).toFixed(2),
          source: 'ai_optimization',
        },
      },
    });

    return {
      productId,
      sku: product.sku,
      oldPrice,
      newPrice,
      appliedAt: new Date().toISOString(),
    };
  }

  /**
   * Toplu fiyat değişikliği
   */
  async applyBulkPriceChanges(
    changes: { productId: string; newPrice: number }[],
    tenantId: string,
  ) {
    const results: Array<{
      productId: string;
      status: string;
      sku?: string;
      oldPrice?: number;
      newPrice?: number;
      appliedAt?: string;
      error?: string;
    }> = [];
    let success = 0;
    let failed = 0;

    for (const change of changes) {
      try {
        const result = await this.applyPriceChange(
          change.productId,
          change.newPrice,
          tenantId,
        );
        results.push({ ...result, status: 'success' });
        success++;
      } catch (error: any) {
        results.push({
          productId: change.productId,
          status: 'failed',
          error: error.message,
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * Fiyat geçmişi
   */
  async getPriceHistory(productId: string, tenantId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: {
        tenantId,
        resource: 'product',
        resourceId: productId,
        action: 'price.change',
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return logs.map((log) => ({
      date: log.createdAt,
      oldPrice: (log.details as any)?.oldPrice,
      newPrice: (log.details as any)?.newPrice,
      changePercent: (log.details as any)?.changePercent,
      source: (log.details as any)?.source || 'manual',
    }));
  }

  /**
   * Rekabet analizi
   */
  async getCompetitorAnalysis(tenantId: string) {
    const competitors = await this.prisma.competitor.findMany({
      where: { tenantId },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    return competitors.map((comp) => {
      const products = comp.products;
      const avgPriceDiff =
        products.length > 0
          ? products.reduce((sum, cp) => {
              const ourPrice = Number(cp.product?.price || 0);
              const theirPrice = Number(cp.price);
              return sum + ((theirPrice - ourPrice) / ourPrice) * 100;
            }, 0) / products.length
          : 0;

      return {
        competitorId: comp.id,
        name: comp.name,
        platform: comp.platform,
        productCount: products.length,
        avgPriceDifference: Math.round(avgPriceDiff * 100) / 100,
        position:
          avgPriceDiff > 5
            ? 'cheaper'
            : avgPriceDiff < -5
              ? 'expensive'
              : 'similar',
        lastUpdated: comp.updatedAt,
      };
    });
  }
}

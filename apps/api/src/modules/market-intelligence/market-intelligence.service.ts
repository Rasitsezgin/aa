import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { Platform, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

type PricePosition = 'below' | 'at' | 'above';

@Injectable()
export class MarketIntelligenceService {
  private readonly logger = new Logger(MarketIntelligenceService.name);

  constructor(
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
  ) {}

  // Competitor Management
  async createCompetitor(tenantId: string, data: Record<string, unknown>) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const platformRaw = String(data.platform || '').toUpperCase();
    if (
      !platformRaw ||
      !Object.values(Platform).includes(platformRaw as Platform)
    ) {
      throw new BadRequestException('Gecerli bir platform zorunludur');
    }

    const created = await this.prisma.competitor.create({
      data: {
        tenantId,
        name: String(data.name || 'Isimsiz Rakip'),
        platform: platformRaw as Platform,
        storeUrl: data.storeUrl ? String(data.storeUrl) : null,
        logoUrl: data.logoUrl ? String(data.logoUrl) : null,
        rating: this.safeDecimal(data.rating),
        reviewCount: this.safeInt(data.reviewCount, 0),
        isActive: data.isActive !== false,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'competitor.created',
        resource: 'competitor',
        resourceId: created.id,
        details: {
          platform: created.platform,
          name: created.name,
        } as Prisma.InputJsonValue,
      },
    });

    return created;
  }

  async getCompetitors(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const competitors = await this.prisma.competitor.findMany({
      where: { tenantId },
      include: {
        products: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        _count: { select: { products: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return competitors.map((item) => ({
      ...item,
      productCount: item._count.products,
    }));
  }

  // Competitor Product Management
  async addCompetitorProduct(
    competitorId: string,
    data: Record<string, unknown>,
  ) {
    if (!competitorId) {
      throw new BadRequestException('competitorId zorunludur');
    }

    const marketplaceId = String(data.marketplaceId || '').trim();
    if (!marketplaceId) {
      throw new BadRequestException('marketplaceId zorunludur');
    }

    const existing = await this.prisma.competitorProduct.findFirst({
      where: { competitorId, marketplaceId },
      select: { id: true },
    });

    if (existing) {
      return this.prisma.competitorProduct.update({
        where: { id: existing.id },
        data: {
          title: String(data.title || 'Isimsiz Urun'),
          url: data.url ? String(data.url) : null,
          price: this.safeDecimal(data.price, 0),
          stock: this.safeNullableInt(data.stock),
          rating: this.safeDecimal(data.rating),
          reviewCount: this.safeInt(data.reviewCount, 0),
          lastCheckedAt: new Date(),
        },
      });
    }

    return this.prisma.competitorProduct.create({
      data: {
        competitorId,
        productId: data.productId ? String(data.productId) : null,
        marketplaceId,
        url: data.url ? String(data.url) : null,
        title: String(data.title || 'Isimsiz Urun'),
        price: this.safeDecimal(data.price, 0),
        stock: this.safeNullableInt(data.stock),
        rating: this.safeDecimal(data.rating),
        reviewCount: this.safeInt(data.reviewCount, 0),
      },
    });
  }

  async mapCompetitorProduct(competitorProductId: string, productId: string) {
    if (!competitorProductId || !productId) {
      throw new BadRequestException(
        'competitorProductId ve productId zorunludur',
      );
    }

    return this.prisma.competitorProduct.update({
      where: { id: competitorProductId },
      data: { productId },
    });
  }

  // Price History & Tracking
  async recordPrice(
    tenantId: string,
    data: {
      productId?: string;
      competitorProductId?: string;
      price: number;
      platform: Platform;
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    return this.prisma.priceHistory.create({
      data: {
        tenantId,
        productId: data.productId || null,
        competitorProductId: data.competitorProductId || null,
        price: this.safeDecimal(data.price, 0),
        platform: data.platform,
      },
    });
  }

  async getPriceHistory(
    tenantId: string,
    productId?: string,
    competitorProductId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    return this.prisma.priceHistory.findMany({
      where: {
        tenantId,
        productId,
        competitorProductId,
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
  }

  // Forecast Management
  async createForecast(
    tenantId: string,
    productId: string,
    data: Record<string, unknown>,
  ) {
    return this.prisma.salesForecast.create({
      data: {
        tenantId,
        productId,
        forecastDate: data.forecastDate
          ? new Date(String(data.forecastDate))
          : new Date(),
        predictedSales: this.safeInt(data.predictedSales, 0),
        confidenceScore: this.safeDecimal(data.confidenceScore, 0.5),
        metadata: (data.metadata || null) as Prisma.InputJsonValue,
      },
    });
  }

  async getForecasts(tenantId: string, productId: string) {
    return this.prisma.salesForecast.findMany({
      where: { tenantId, productId },
      orderBy: { forecastDate: 'asc' },
    });
  }

  // ==================== PRICING ANALYSIS ====================
  async getPricingAnalysis(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const products = await this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    const productIds = products.map((p) => p.id);
    const competitorProducts = await this.prisma.competitorProduct.findMany({
      where: {
        productId: { in: productIds },
        competitor: { tenantId, isActive: true },
      },
      include: {
        competitor: { select: { id: true, name: true, platform: true } },
      },
      orderBy: { lastCheckedAt: 'desc' },
    });

    const byProduct = new Map<string, typeof competitorProducts>();
    for (const cp of competitorProducts) {
      if (!cp.productId) continue;
      const list = byProduct.get(cp.productId) || [];
      list.push(cp);
      byProduct.set(cp.productId, list);
    }

    const rows = products.map((product) => {
      const comps = byProduct.get(product.id) || [];
      const competitorPrices = comps
        .map((c) => Number(c.price))
        .filter((v) => Number.isFinite(v) && v > 0);
      const avgCompetitorPrice = competitorPrices.length
        ? competitorPrices.reduce((s, p) => s + p, 0) / competitorPrices.length
        : 0;
      const minCompetitorPrice = competitorPrices.length
        ? Math.min(...competitorPrices)
        : 0;
      const myPrice = Number(product.price);
      const pricePosition = this.getPricePosition(myPrice, avgCompetitorPrice);
      const recommended = this.calculateRecommendedPrice(
        myPrice,
        avgCompetitorPrice,
        minCompetitorPrice,
        Number(product.costPrice ?? 0),
      );

      return {
        id: product.id,
        name: product.title,
        currentPrice: myPrice,
        recommendedPrice: recommended,
        competitorAvgPrice: avgCompetitorPrice,
        minCompetitorPrice,
        competitorCount: comps.length,
        pricePosition,
        margin: this.calculateMargin(myPrice, Number(product.costPrice ?? 0)),
        demandElasticity: this.estimateElasticity(pricePosition, comps.length),
        lastUpdated: product.updatedAt.toISOString(),
      };
    });

    const covered = rows.filter((r) => r.competitorCount > 0);
    const optimized = covered.filter((r) => r.pricePosition === 'at').length;
    const needsAttention = covered.filter(
      (r) => r.pricePosition !== 'at',
    ).length;
    const competitive = covered.filter(
      (r) => r.pricePosition === 'below',
    ).length;

    const coverageRate =
      products.length > 0 ? covered.length / products.length : 0;
    const optimalRate = covered.length > 0 ? optimized / covered.length : 0;
    const overallScore = Math.round(
      (coverageRate * 40 + optimalRate * 60) * 100,
    );

    return {
      overallScore,
      totalProducts: products.length,
      coveredProducts: covered.length,
      optimized,
      needsAttention,
      competitive,
      products: rows.slice(0, 100),
      rules: [
        {
          id: 'rule-competitive-band',
          name: 'Rakip ortalamasina yakin fiyat',
          type: 'competitive',
          isActive: true,
          affectedProducts: covered.length,
        },
        {
          id: 'rule-floor-margin',
          name: 'Maliyet uzeri guvenli marj',
          type: 'margin',
          isActive: true,
          affectedProducts: rows.length,
        },
      ],
    };
  }

  async getCompetitorPrices(tenantId: string, productId: string) {
    if (!tenantId || !productId) {
      throw new BadRequestException('tenantId ve productId zorunludur');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, title: true, price: true, costPrice: true },
    });

    if (!product) {
      throw new NotFoundException('Urun bulunamadi');
    }

    const competitorProducts = await this.prisma.competitorProduct.findMany({
      where: {
        productId,
        competitor: { tenantId, isActive: true },
      },
      include: {
        competitor: {
          select: { id: true, name: true, platform: true },
        },
      },
      orderBy: { lastCheckedAt: 'desc' },
    });

    const cpIds = competitorProducts.map((cp) => cp.id);
    const history = await this.prisma.priceHistory.findMany({
      where: {
        tenantId,
        OR: [
          { productId },
          cpIds.length > 0 ? { competitorProductId: { in: cpIds } } : undefined,
        ].filter(Boolean) as Prisma.PriceHistoryWhereInput[],
      },
      orderBy: { createdAt: 'asc' },
      take: 90,
    });

    const competitorPrices = competitorProducts.map((cp) => Number(cp.price));
    const avg = competitorPrices.length
      ? competitorPrices.reduce((s, p) => s + p, 0) / competitorPrices.length
      : 0;
    const min = competitorPrices.length ? Math.min(...competitorPrices) : 0;
    const suggestedPrice = this.calculateRecommendedPrice(
      Number(product.price),
      avg,
      min,
      Number(product.costPrice ?? 0),
    );

    const groupedByDay = new Map<
      string,
      { myPrice: number[]; competitor: number[] }
    >();
    for (const item of history) {
      const day = item.createdAt.toISOString().slice(0, 10);
      const entry = groupedByDay.get(day) || { myPrice: [], competitor: [] };
      if (item.productId === productId) {
        entry.myPrice.push(Number(item.price));
      } else {
        entry.competitor.push(Number(item.price));
      }
      groupedByDay.set(day, entry);
    }

    const priceHistory = Array.from(groupedByDay.entries()).map(
      ([date, values]) => ({
        date,
        myPrice: values.myPrice.length
          ? this.avg(values.myPrice)
          : Number(product.price),
        avgCompetitorPrice: values.competitor.length
          ? this.avg(values.competitor)
          : avg,
        minCompetitorPrice: values.competitor.length
          ? Math.min(...values.competitor)
          : min,
      }),
    );

    return {
      productId,
      currentPrice: Number(product.price),
      competitors: competitorProducts.map((cp) => ({
        id: cp.id,
        name: cp.competitor.name,
        platform: cp.competitor.platform,
        price: Number(cp.price),
        lastChecked: cp.lastCheckedAt.toISOString(),
        inStock: (cp.stock ?? 0) > 0,
        rating: Number(cp.rating ?? 0),
        reviewCount: cp.reviewCount,
      })),
      priceHistory,
      recommendation: {
        suggestedPrice,
        reason:
          avg > 0
            ? `Rakip ortalama fiyati ${avg.toFixed(2)} TRY seviyesinde.`
            : 'Rakip ortalama fiyati henuz olusmadi.',
        expectedImpact: this.expectedImpact(
          Number(product.price),
          suggestedPrice,
        ),
        confidence: this.recommendationConfidence(
          competitorProducts.length,
          history.length,
        ),
      },
    };
  }

  async getCompetitorGap(tenantId: string, productId: string) {
    const detail = await this.getCompetitorPrices(tenantId, productId);
    const myPrice = detail.currentPrice;
    const competitorAvg = this.avg(detail.competitors.map((c) => c.price));
    const gapPercent =
      competitorAvg > 0 ? ((myPrice - competitorAvg) / competitorAvg) * 100 : 0;

    const stockAdvantageCount = detail.competitors.filter(
      (c) => !c.inStock,
    ).length;
    const trustAvg = detail.competitors.length
      ? this.avg(detail.competitors.map((c) => c.rating))
      : 0;

    return {
      productId,
      gap: {
        myPrice,
        competitorAvg,
        gapPercent: +gapPercent.toFixed(2),
        position: this.getPricePosition(myPrice, competitorAvg),
      },
      marketSignals: {
        competitorCount: detail.competitors.length,
        outOfStockCompetitors: stockAdvantageCount,
        competitorRatingAvg: +trustAvg.toFixed(2),
      },
      actionPlan: this.generateActionPlan(
        gapPercent,
        stockAdvantageCount,
        trustAvg,
      ),
    };
  }

  async getCompetitorRecommendations(tenantId: string, productId: string) {
    const gap = await this.getCompetitorGap(tenantId, productId);
    const actions = gap.actionPlan.map((text, index) => ({
      id: `rec-${index + 1}`,
      text,
      priority: index === 0 ? 'high' : 'medium',
    }));

    return {
      productId,
      score: this.recommendationScoreFromGap(gap.gap.gapPercent),
      actions,
      summary: {
        priceGapPercent: gap.gap.gapPercent,
        competitorCount: gap.marketSignals.competitorCount,
        outOfStockCompetitors: gap.marketSignals.outOfStockCompetitors,
      },
    };
  }

  async getCompetitorAlerts(tenantId: string, priceGapPercent = 5) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const products = await this.prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        costPrice: true,
      },
      take: 300,
    });

    const productIds = products.map((p) => p.id);
    const competitorProducts = await this.prisma.competitorProduct.findMany({
      where: {
        productId: { in: productIds },
        competitor: { tenantId, isActive: true },
      },
      include: { competitor: { select: { name: true, platform: true } } },
      orderBy: { lastCheckedAt: 'desc' },
    });

    const byProduct = new Map<string, typeof competitorProducts>();
    for (const row of competitorProducts) {
      if (!row.productId) continue;
      const list = byProduct.get(row.productId) || [];
      list.push(row);
      byProduct.set(row.productId, list);
    }

    const alerts: Array<Record<string, unknown>> = [];

    for (const product of products) {
      const comps = byProduct.get(product.id) || [];
      if (!comps.length) continue;

      const compPrices = comps
        .map((c) => Number(c.price))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (!compPrices.length) continue;

      const myPrice = Number(product.price);
      const avgPrice = this.avg(compPrices);
      const gapPct = avgPrice > 0 ? ((myPrice - avgPrice) / avgPrice) * 100 : 0;

      if (gapPct > priceGapPercent) {
        alerts.push({
          type: 'price_gap_high',
          severity: 'high',
          productId: product.id,
          productTitle: product.title,
          details: `Urun fiyati rakip ortalamasindan %${gapPct.toFixed(2)} yuksek`,
          myPrice,
          competitorAvgPrice: +avgPrice.toFixed(2),
        });
      }

      if (product.stock <= 0 && comps.some((c) => (c.stock ?? 0) > 0)) {
        alerts.push({
          type: 'stockout_vs_competitor',
          severity: 'high',
          productId: product.id,
          productTitle: product.title,
          details: 'Bizde stok yok, rakipte stok var',
        });
      }

      const costPrice = Number(product.costPrice ?? 0);
      if (costPrice > 0 && myPrice < costPrice * 1.05) {
        alerts.push({
          type: 'low_margin_risk',
          severity: 'medium',
          productId: product.id,
          productTitle: product.title,
          details: 'Fiyat maliyete cok yakin, marj riski var',
          myPrice,
          estimatedCost: costPrice,
        });
      }
    }

    if (alerts.length > 0) {
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'competitor.alerts.generated',
          resource: 'competitor',
          details: {
            alertCount: alerts.length,
            highSeverityCount: alerts.filter((a) => a.severity === 'high')
              .length,
          } as Prisma.InputJsonValue,
        },
      });

      await this.dispatchAlertsWebhook(tenantId, alerts, priceGapPercent);
    }

    return {
      tenantId,
      generatedAt: new Date().toISOString(),
      threshold: priceGapPercent,
      alertCount: alerts.length,
      alerts,
    };
  }

  async generateCompetitorSummaryReport(tenantId: string, days = 7) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const safeDays = Math.max(1, Math.min(30, days));
    const startDate = new Date(Date.now() - safeDays * 86400000);

    const competitors = await this.prisma.competitor.findMany({
      where: { tenantId, isActive: true },
      include: {
        _count: { select: { products: true } },
      },
    });

    const history = await this.prisma.priceHistory.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
        competitorProductId: { not: null },
      },
      orderBy: { createdAt: 'asc' },
    });

    const avgCompetitorPrice = history.length
      ? this.avg(history.map((h) => Number(h.price)))
      : 0;

    const summary = {
      tenantId,
      periodDays: safeDays,
      totalCompetitors: competitors.length,
      totalTrackedProducts: competitors.reduce(
        (sum, c) => sum + c._count.products,
        0,
      ),
      totalPriceSamples: history.length,
      averageCompetitorPrice: +avgCompetitorPrice.toFixed(2),
      byPlatform: this.groupCompetitorByPlatform(
        competitors.map((c) => c.platform),
      ),
      generatedAt: new Date().toISOString(),
    };

    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: `Rakip Ozet Raporu (${safeDays} gun)`,
        type: 'competitor-summary',
        description: 'Rakip takip ozet metrikleri',
        parameters: { days: safeDays } as Prisma.InputJsonValue,
        data: summary as unknown as Prisma.InputJsonValue,
        status: 'completed',
        generatedAt: new Date(),
        format: 'json',
      },
    });

    return {
      success: true,
      reportId: report.id,
      summary,
    };
  }

  async applyPriceRecommendation(
    tenantId: string,
    productId: string,
    newPrice: number,
  ) {
    if (!tenantId || !productId) {
      throw new BadRequestException('tenantId ve productId zorunludur');
    }
    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      throw new BadRequestException(
        'newPrice gecerli bir pozitif sayi olmalidir',
      );
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, price: true },
    });

    if (!product) {
      throw new NotFoundException('Urun bulunamadi');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { price: newPrice },
    });

    await this.prisma.priceHistory.create({
      data: {
        tenantId,
        productId,
        price: newPrice,
        platform: Platform.OTHER,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'pricing.recommendation.applied',
        resource: 'product',
        resourceId: productId,
        details: {
          oldPrice: Number(product.price),
          newPrice,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      productId,
      newPrice: Number(updated.price),
      message: `Fiyat ${newPrice} olarak guncellendi`,
      updatedAt: new Date().toISOString(),
    };
  }

  async runCompetitorSnapshot(
    tenantId: string,
    options?: { platform?: Platform; limitPerStore?: number },
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const limitPerStore = Math.max(
      1,
      Math.min(30, options?.limitPerStore ?? 10),
    );
    const supportedPlatforms: Platform[] = [
      Platform.TRENDYOL,
      Platform.HEPSIBURADA,
      Platform.N11,
      Platform.CICEKSEPETI,
    ];

    const competitors = await this.prisma.competitor.findMany({
      where: {
        tenantId,
        isActive: true,
        platform: options?.platform || undefined,
        storeUrl: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let scannedCompetitors = 0;
    let scannedProducts = 0;
    let createdProducts = 0;
    let updatedProducts = 0;
    let historyWrites = 0;
    const warnings: string[] = [];

    const tenantProducts = await this.prisma.product.findMany({
      where: { tenantId },
      select: { id: true, title: true, sku: true },
    });

    for (const competitor of competitors) {
      if (!supportedPlatforms.includes(competitor.platform)) {
        warnings.push(`${competitor.name}: platform su an desteklenmiyor`);
        continue;
      }
      if (!competitor.storeUrl) {
        warnings.push(`${competitor.name}: storeUrl eksik`);
        continue;
      }

      const storeId = this.extractStoreIdFromUrl(
        competitor.storeUrl,
        competitor.platform,
      );
      if (!storeId) {
        warnings.push(`${competitor.name}: storeId parse edilemedi`);
        continue;
      }

      scannedCompetitors += 1;

      let products: Array<Record<string, unknown>> = [];
      try {
        const raw = (await this.marketplaceService.getStoreProducts(
          competitor.platform as unknown as any,
          storeId,
          limitPerStore,
        )) as unknown;
        products = Array.isArray(raw)
          ? (raw as Array<Record<string, unknown>>)
          : [];
      } catch (error) {
        warnings.push(
          `${competitor.name}: urun cekilemedi (${(error as Error).message})`,
        );
        continue;
      }

      for (const item of products) {
        scannedProducts += 1;
        const marketplaceId = String(
          item.productId ?? item.id ?? item.merchantSku ?? '',
        ).trim();
        if (!marketplaceId) continue;

        const title = String(item.title ?? 'Isimsiz Urun');
        const productId = this.matchOurProduct(
          tenantProducts,
          title,
          String(item.sku ?? item.merchantSku ?? ''),
        );
        const price = this.safeNumber(item.salePrice ?? item.price);

        const existing = await this.prisma.competitorProduct.findFirst({
          where: {
            competitorId: competitor.id,
            marketplaceId,
          },
          select: { id: true },
        });

        if (existing) {
          await this.prisma.competitorProduct.update({
            where: { id: existing.id },
            data: {
              productId,
              title,
              price,
              stock: this.safeNullableInt(item.stockCount ?? item.stock),
              rating: this.safeDecimal(item.rating),
              reviewCount: this.safeInt(item.reviewCount, 0),
              url: item.url ? String(item.url) : null,
              lastCheckedAt: new Date(),
            },
          });
          updatedProducts += 1;

          await this.prisma.priceHistory.create({
            data: {
              tenantId,
              competitorProductId: existing.id,
              price,
              platform: competitor.platform,
            },
          });
          historyWrites += 1;
        } else {
          const created = await this.prisma.competitorProduct.create({
            data: {
              competitorId: competitor.id,
              productId,
              marketplaceId,
              title,
              price,
              stock: this.safeNullableInt(item.stockCount ?? item.stock),
              rating: this.safeDecimal(item.rating),
              reviewCount: this.safeInt(item.reviewCount, 0),
              url: item.url ? String(item.url) : null,
            },
          });
          createdProducts += 1;

          await this.prisma.priceHistory.create({
            data: {
              tenantId,
              competitorProductId: created.id,
              price,
              platform: competitor.platform,
            },
          });
          historyWrites += 1;
        }
      }
    }

    const summary = {
      tenantId,
      scannedCompetitors,
      scannedProducts,
      createdProducts,
      updatedProducts,
      historyWrites,
      warnings,
      completedAt: new Date().toISOString(),
    };

    await this.prisma.report.create({
      data: {
        tenantId,
        name: 'Rakip Snapshot Raporu',
        type: 'competitor',
        description: 'Gunluk rakip urun ve fiyat snapshot ozeti',
        parameters: {
          platform: options?.platform || null,
          limitPerStore,
        } as Prisma.InputJsonValue,
        data: summary as unknown as Prisma.InputJsonValue,
        status: 'completed',
        generatedAt: new Date(),
        format: 'json',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'competitor.snapshot.run',
        resource: 'competitor',
        details: summary as unknown as Prisma.InputJsonValue,
      },
    });

    return summary;
  }

  private safeInt(value: unknown, fallback = 0): number {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(0, Math.round(num));
  }

  private safeNullableInt(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return this.safeInt(value, 0);
  }

  private safeNumber(value: unknown, fallback = 0): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  private safeDecimal(value: unknown, fallback?: number): Prisma.Decimal {
    const raw = this.safeNumber(
      value,
      Number.isFinite(fallback as number) ? (fallback as number) : 0,
    );
    return new Prisma.Decimal(raw);
  }

  private avg(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, n) => sum + n, 0) / values.length;
  }

  private getPricePosition(
    myPrice: number,
    competitorAvg: number,
  ): PricePosition {
    if (competitorAvg <= 0) return 'at';
    const ratio = ((myPrice - competitorAvg) / competitorAvg) * 100;
    if (ratio <= -3) return 'below';
    if (ratio >= 3) return 'above';
    return 'at';
  }

  private calculateMargin(price: number, costPrice: number): number {
    if (costPrice <= 0 || price <= 0) return 0;
    return +(((price - costPrice) / price) * 100).toFixed(2);
  }

  private calculateRecommendedPrice(
    myPrice: number,
    competitorAvg: number,
    minCompetitorPrice: number,
    costPrice: number,
  ): number {
    if (competitorAvg <= 0) return +myPrice.toFixed(2);

    let candidate = competitorAvg * 0.98;
    if (minCompetitorPrice > 0) {
      candidate = Math.max(candidate, minCompetitorPrice * 0.995);
    }
    if (costPrice > 0) {
      candidate = Math.max(candidate, costPrice * 1.15);
    }

    return +candidate.toFixed(2);
  }

  private estimateElasticity(
    position: PricePosition,
    competitorCount: number,
  ): number {
    const base = position === 'above' ? 1.6 : position === 'at' ? 1.1 : 0.8;
    const marketPressure = Math.min(0.9, competitorCount * 0.08);
    return +(base + marketPressure).toFixed(2);
  }

  private expectedImpact(currentPrice: number, suggestedPrice: number): string {
    if (currentPrice <= 0) return 'N/A';
    const diffPct = ((suggestedPrice - currentPrice) / currentPrice) * 100;
    if (diffPct < -2) return 'Donusum artisi beklenir';
    if (diffPct > 2) return 'Marj artisi, donusum takibi onerilir';
    return 'Dengeli etki beklenir';
  }

  private recommendationConfidence(
    competitorCount: number,
    historyCount: number,
  ): number {
    const compScore = Math.min(60, competitorCount * 12);
    const histScore = Math.min(40, Math.floor(historyCount / 3));
    return Math.max(35, compScore + histScore);
  }

  private recommendationScoreFromGap(gapPercent: number): number {
    const normalized = Math.max(0, 100 - Math.abs(gapPercent) * 6);
    return Math.round(normalized);
  }

  private async dispatchAlertsWebhook(
    tenantId: string,
    alerts: Array<Record<string, unknown>>,
    threshold: number,
  ): Promise<void> {
    const webhookUrl = process.env.COMPETITOR_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      return;
    }

    try {
      const generatedAt = new Date().toISOString();
      const payload = {
        tenantId,
        generatedAt,
        threshold,
        alertCount: alerts.length,
        alerts,
      };
      const body = JSON.stringify(payload);
      const timestamp = String(Date.now());
      const secret = process.env.COMPETITOR_ALERT_WEBHOOK_SECRET;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'PazarYonetimi/1.0',
        'X-PazarYonetimi-Timestamp': timestamp,
      };

      if (secret) {
        headers['X-PazarYonetimi-Signature'] = this.buildWebhookSignature(
          body,
          timestamp,
          secret,
        );
        headers['X-PazarYonetimi-Signature-Alg'] = 'sha256';
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        this.logger.warn(
          `Competitor alert webhook failed (${response.status}) tenant=${tenantId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Competitor alert webhook error tenant=${tenantId}: ${(error as Error).message}`,
      );
    }
  }

  private buildWebhookSignature(
    body: string,
    timestamp: string,
    secret: string,
  ): string {
    const payload = `${timestamp}.${body}`;
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private groupCompetitorByPlatform(platforms: Platform[]) {
    const map = new Map<string, number>();
    for (const p of platforms) {
      map.set(p, (map.get(p) || 0) + 1);
    }
    return Array.from(map.entries()).map(([platform, count]) => ({
      platform,
      count,
    }));
  }

  private generateActionPlan(
    gapPercent: number,
    outOfStockCompetitors: number,
    trustAvg: number,
  ): string[] {
    const actions: string[] = [];

    if (gapPercent > 5) {
      actions.push(
        'Fiyati rakip ortalamasina yaklastir ve 7 gun A/B test uygula.',
      );
    } else if (gapPercent < -8) {
      actions.push('Marj kontrolu yap; fiyatta kademeli artis firsati var.');
    } else {
      actions.push(
        'Mevcut fiyat bandi korunabilir, listeleme kalitesine odaklan.',
      );
    }

    if (outOfStockCompetitors > 0) {
      actions.push(
        'Rakip stok disi iken kampanya butcesini gecici olarak artir.',
      );
    }

    if (trustAvg > 0 && trustAvg < 4.2) {
      actions.push(
        'Yorum toplama ve satis sonrasi iletisim akisini guclendir.',
      );
    }

    if (actions.length === 0) {
      actions.push(
        'Haftalik rakip snapshot ve fiyat alarmi takibine devam et.',
      );
    }

    return actions;
  }

  private extractStoreIdFromUrl(
    url: string,
    platform: Platform,
  ): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathname = urlObj.pathname;

      if (platform === Platform.TRENDYOL) {
        const match = pathname.match(/\/magaza\/([^/]+)/);
        if (!match) return null;
        const parts = match[1].split('-m-');
        if (parts.length > 1) return parts[1];
        return match[1].split('-').pop() || null;
      }

      if (platform === Platform.HEPSIBURADA) {
        const match = pathname.match(/\/magaza\/([^/?]+)/);
        return match ? match[1] : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private matchOurProduct(
    products: Array<{ id: string; title: string; sku: string }>,
    competitorTitle: string,
    competitorSku: string,
  ): string | null {
    const normalizedSku = competitorSku.trim().toLowerCase();
    if (normalizedSku) {
      const skuMatch = products.find(
        (p) => p.sku.trim().toLowerCase() === normalizedSku,
      );
      if (skuMatch) return skuMatch.id;
    }

    const normalizedTitle = competitorTitle.trim().toLowerCase();
    if (!normalizedTitle) return null;

    const titleMatch = products.find((p) => {
      const own = p.title.trim().toLowerCase();
      return (
        own.includes(normalizedTitle.slice(0, 24)) ||
        normalizedTitle.includes(own.slice(0, 24))
      );
    });

    return titleMatch?.id || null;
  }

  // ==================== DELETE OPERATIONS ====================
  async deleteCompetitor(tenantId: string, competitorId: string) {
    if (!tenantId || !competitorId) {
      throw new BadRequestException('tenantId ve competitorId zorunludur');
    }

    const competitor = await this.prisma.competitor.findFirst({
      where: { id: competitorId, tenantId },
      select: { id: true, name: true },
    });
    if (!competitor) throw new NotFoundException('Rakip bulunamadi');

    // Delete related competitor products' price history first
    const cpIds = await this.prisma.competitorProduct.findMany({
      where: { competitorId },
      select: { id: true },
    });

    if (cpIds.length > 0) {
      await this.prisma.priceHistory.deleteMany({
        where: { competitorProductId: { in: cpIds.map((c) => c.id) } },
      });
      await this.prisma.competitorProduct.deleteMany({
        where: { competitorId },
      });
    }

    await this.prisma.competitor.delete({ where: { id: competitorId } });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'competitor.deleted',
        resource: 'competitor',
        resourceId: competitorId,
        details: {
          name: competitor.name,
          deletedProducts: cpIds.length,
        } as Prisma.InputJsonValue,
      },
    });

    return { success: true, deletedProducts: cpIds.length };
  }

  async deleteCompetitorProduct(tenantId: string, competitorProductId: string) {
    if (!tenantId || !competitorProductId) {
      throw new BadRequestException(
        'tenantId ve competitorProductId zorunludur',
      );
    }

    const cp = await this.prisma.competitorProduct.findFirst({
      where: { id: competitorProductId, competitor: { tenantId } },
      select: { id: true, title: true },
    });
    if (!cp) throw new NotFoundException('Rakip urun bulunamadi');

    await this.prisma.priceHistory.deleteMany({
      where: { competitorProductId },
    });
    await this.prisma.competitorProduct.delete({
      where: { id: competitorProductId },
    });

    return { success: true, deleted: cp.title };
  }

  // ==================== A/B EXPERIMENTS ====================
  async createExperiment(tenantId: string, data: Record<string, unknown>) {
    if (!tenantId) throw new BadRequestException('tenantId zorunludur');

    const productId = String(data.productId || '');
    if (!productId) throw new BadRequestException('productId zorunludur');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, price: true },
    });
    if (!product) throw new NotFoundException('Urun bulunamadi');

    const controlPrice = Number(data.controlPrice ?? product.price);
    const testPrice = Number(data.testPrice);
    if (!Number.isFinite(testPrice) || testPrice <= 0) {
      throw new BadRequestException(
        'testPrice gecerli bir pozitif sayi olmalidir',
      );
    }

    const durationDays = Math.max(
      1,
      Math.min(30, Number(data.durationDays) || 7),
    );
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const experiment = await this.prisma.priceExperiment.create({
      data: {
        tenantId,
        productId,
        name: String(data.name || `A/B Test - ${product.id.slice(0, 8)}`),
        controlPrice,
        testPrice,
        durationDays,
        endDate,
        metadata: {
          hypothesis: data.hypothesis || null,
        } as Prisma.InputJsonValue,
      },
    });

    // Set product to test price for the experiment
    await this.prisma.product.update({
      where: { id: productId },
      data: { price: testPrice },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'experiment.created',
        resource: 'product',
        resourceId: productId,
        details: {
          experimentId: experiment.id,
          controlPrice,
          testPrice,
          durationDays,
        } as Prisma.InputJsonValue,
      },
    });

    return experiment;
  }

  async getExperiments(tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId zorunludur');

    return this.prisma.priceExperiment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async evaluateExperiment(tenantId: string, experimentId: string) {
    if (!tenantId || !experimentId)
      throw new BadRequestException('tenantId ve experimentId zorunludur');

    const experiment = await this.prisma.priceExperiment.findFirst({
      where: { id: experimentId, tenantId },
    });
    if (!experiment) throw new NotFoundException('Deney bulunamadi');

    const controlSales = experiment.controlSales;
    const testSales = experiment.testSales;
    const controlRevenue = Number(experiment.controlRevenue);
    const testRevenue = Number(experiment.testRevenue);
    const controlViews = experiment.controlViews || 1;
    const testViews = experiment.testViews || 1;

    const controlConversion = controlSales / controlViews;
    const testConversion = testSales / testViews;

    // Calculate lift
    const salesLift =
      controlSales > 0 ? ((testSales - controlSales) / controlSales) * 100 : 0;
    const revenueLift =
      controlRevenue > 0
        ? ((testRevenue - controlRevenue) / controlRevenue) * 100
        : 0;

    // Simple statistical significance: using normal approximation
    const totalSamples = controlViews + testViews;
    const significance = this.calculateSignificance(
      controlConversion,
      testConversion,
      controlViews,
      testViews,
    );

    const winner =
      revenueLift > 0 && significance >= 0.9
        ? 'test'
        : revenueLift < 0 && significance >= 0.9
          ? 'control'
          : 'inconclusive';

    const result = {
      winner,
      salesLift: +salesLift.toFixed(2),
      revenueLift: +revenueLift.toFixed(2),
      controlConversion: +(controlConversion * 100).toFixed(2),
      testConversion: +(testConversion * 100).toFixed(2),
      significance: +significance.toFixed(4),
      isSignificant: significance >= 0.9,
      recommendation:
        winner === 'test'
          ? `Test fiyati (${Number(experiment.testPrice).toFixed(2)} TRY) kazandi. Kalici olarak uygulayin.`
          : winner === 'control'
            ? `Kontrol fiyati (${Number(experiment.controlPrice).toFixed(2)} TRY) daha iyi. Eski fiyata donun.`
            : `Yeterli veri yok, deneyi devam ettirin veya fiyat farkini artirin.`,
    };

    await this.prisma.priceExperiment.update({
      where: { id: experimentId },
      data: { result: result as unknown as Prisma.InputJsonValue },
    });

    return { experimentId, ...result };
  }

  async stopExperiment(tenantId: string, experimentId: string) {
    if (!tenantId || !experimentId)
      throw new BadRequestException('tenantId ve experimentId zorunludur');

    const experiment = await this.prisma.priceExperiment.findFirst({
      where: { id: experimentId, tenantId, status: 'active' },
    });
    if (!experiment) throw new NotFoundException('Aktif deney bulunamadi');

    // Evaluate before stopping
    const evaluation = await this.evaluateExperiment(tenantId, experimentId);

    // Revert to control price if test lost or inconclusive
    if (evaluation.winner !== 'test') {
      await this.prisma.product.update({
        where: { id: experiment.productId },
        data: { price: experiment.controlPrice },
      });
    }

    await this.prisma.priceExperiment.update({
      where: { id: experimentId },
      data: { status: 'completed', endDate: new Date() },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'experiment.stopped',
        resource: 'product',
        resourceId: experiment.productId,
        details: {
          experimentId,
          winner: evaluation.winner,
          revenueLift: evaluation.revenueLift,
        } as Prisma.InputJsonValue,
      },
    });

    return { success: true, winner: evaluation.winner, evaluation };
  }

  // ==================== AUTO-DISCOVERY ====================
  async autoDiscoverCompetitors(tenantId: string, platform?: Platform) {
    if (!tenantId) throw new BadRequestException('tenantId zorunludur');

    const products = await this.prisma.product.findMany({
      where: { tenantId },
      select: { id: true, title: true, sku: true, category: true },
      take: 50,
    });

    if (products.length === 0) {
      return { discovered: 0, message: 'Urun bulunamadi' };
    }

    const platforms: Platform[] = platform
      ? [platform]
      : [Platform.TRENDYOL, Platform.HEPSIBURADA];
    const discoveredStores = new Map<
      string,
      {
        name: string;
        platform: Platform;
        storeUrl: string;
        productCount: number;
      }
    >();

    for (const p of platforms) {
      for (const product of products.slice(0, 20)) {
        try {
          const searchResults = (await this.marketplaceService.searchProducts(
            p as unknown as any,
            product.title.slice(0, 60),
            5,
          )) as unknown as Array<Record<string, unknown>>;

          if (!Array.isArray(searchResults)) continue;

          for (const item of searchResults) {
            const storeName = String(
              item.storeName || item.merchantName || item.seller || '',
            ).trim();
            const storeUrl = String(
              item.storeUrl || item.merchantUrl || item.sellerUrl || '',
            ).trim();
            if (!storeName || !storeUrl) continue;

            const storeKey = `${p}:${storeName}`;
            const existing = discoveredStores.get(storeKey);
            if (existing) {
              existing.productCount += 1;
            } else {
              discoveredStores.set(storeKey, {
                name: storeName,
                platform: p,
                storeUrl,
                productCount: 1,
              });
            }
          }
        } catch {
          // Search may not be available for all platforms
        }
      }
    }

    // Filter stores with multiple product overlaps and not already tracked
    const existingCompetitors = await this.prisma.competitor.findMany({
      where: { tenantId },
      select: { storeUrl: true, name: true },
    });
    const existingUrls = new Set(
      existingCompetitors.map((c) => c.storeUrl?.toLowerCase()),
    );
    const existingNames = new Set(
      existingCompetitors.map((c) => c.name.toLowerCase()),
    );

    const candidates = Array.from(discoveredStores.values())
      .filter((s) => s.productCount >= 2)
      .filter(
        (s) =>
          !existingUrls.has(s.storeUrl.toLowerCase()) &&
          !existingNames.has(s.name.toLowerCase()),
      )
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 10);

    const created: Array<{ id: string; name: string; platform: string }> = [];
    for (const cand of candidates) {
      const competitor = await this.prisma.competitor.create({
        data: {
          tenantId,
          name: cand.name,
          platform: cand.platform,
          storeUrl: cand.storeUrl,
          isActive: true,
        },
      });
      created.push({
        id: competitor.id,
        name: competitor.name,
        platform: competitor.platform,
      });
    }

    if (created.length > 0) {
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'competitor.auto_discovered',
          resource: 'competitor',
          details: {
            count: created.length,
            names: created.map((c) => c.name),
          } as Prisma.InputJsonValue,
        },
      });
    }

    return {
      discovered: created.length,
      competitors: created,
      scannedProducts: products.length,
      scannedPlatforms: platforms,
    };
  }

  // ==================== PRIVATE HELPERS ====================
  private calculateSignificance(
    controlRate: number,
    testRate: number,
    controlN: number,
    testN: number,
  ): number {
    if (controlN < 10 || testN < 10) return 0;

    const pooledRate =
      (controlRate * controlN + testRate * testN) / (controlN + testN);
    if (pooledRate <= 0 || pooledRate >= 1) return 0;

    const se = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlN + 1 / testN),
    );
    if (se <= 0) return 0;

    const z = Math.abs(controlRate - testRate) / se;

    // Approximate normal CDF for z-score
    // P(Z > z) ≈ erfc(z/sqrt(2))/2
    // significance = 1 - 2*P(Z > z)
    const t = 1 / (1 + 0.2316419 * z);
    const d = 0.3989422804014327;
    const p =
      d *
      Math.exp((-z * z) / 2) *
      (0.3193815 * t +
        -0.3565638 * t * t +
        1.781478 * t ** 3 +
        -1.821256 * t ** 4 +
        1.330274 * t ** 5);
    return Math.max(0, Math.min(1, 1 - 2 * p));
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/** Trendyol/HB tipik kargo barem eşikleri (TL) */
const BAREM_TIERS = [
  { min: 0, max: 149.99, shipping: 14.99 },
  { min: 150, max: 299.99, shipping: 9.99 },
  { min: 300, max: 99999, shipping: 4.99 },
];

@Injectable()
export class BaremOptimizerService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(tenantId: string, limit = 30) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const suggestions = products
      .map((p) => {
        const price = Number(p.price);
        const tier = this.getTier(price);
        const nextTier = this.findOptimization(price, tier);
        if (!nextTier) return null;
        return {
          productId: p.id,
          title: p.title,
          sku: p.sku,
          currentPrice: price,
          suggestedPrice: nextTier.targetPrice,
          action: nextTier.action,
          currentShipping: tier.shipping,
          suggestedShipping: nextTier.shipping,
          netSavingPerOrder: nextTier.saving,
          extraProfit: nextTier.extraProfit || 0,
        };
      })
      .filter(Boolean);

    const missedSavings = suggestions.reduce(
      (sum, s) => sum + (s?.netSavingPerOrder || 0) * 10,
      0,
    );

    return {
      suggestions,
      summary: {
        count: suggestions.length,
        estimatedMonthlyMissed: Math.round(missedSavings),
      },
    };
  }

  private getTier(price: number) {
    return (
      BAREM_TIERS.find((t) => price >= t.min && price <= t.max) || BAREM_TIERS[0]
    );
  }

  private findOptimization(price: number, tier: (typeof BAREM_TIERS)[0]) {
    if (price > 240 && price < 250) {
      return {
        action: 'Fiyat Düşür' as const,
        targetPrice: 239,
        shipping: 4.99,
        saving: tier.shipping - 4.99,
      };
    }
    if (price > 145 && price < 155) {
      return {
        action: 'Fiyat Düşür' as const,
        targetPrice: 149,
        shipping: 9.99,
        saving: tier.shipping - 9.99,
      };
    }
    if (price > 38 && price < 48) {
      return {
        action: 'Fiyat Yükselt' as const,
        targetPrice: 49,
        shipping: tier.shipping,
        saving: 0,
        extraProfit: 7,
      };
    }
    return null;
  }
}

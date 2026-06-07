import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CurrencyService } from '../../currency/currency.service';

@Injectable()
export class FxPricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currency: CurrencyService,
  ) {}

  async getFxSuggestions(tenantId: string) {
    let usdRate = 34.5;
    let eurRate = 37.2;
    try {
      usdRate = await this.currency.getRate('USD', 'TRY');
      eurRate = await this.currency.getRate('EUR', 'TRY');
    } catch {
      // fallback rates
    }

    const products = await this.prisma.product.findMany({
      where: { tenantId, costPrice: { not: null } },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    const suggestions = products.map((p) => {
      const costUsd = Number(p.costPrice) / usdRate;
      const margin = 1.35;
      const suggestedTry = Math.round(costUsd * usdRate * margin * 100) / 100;
      const current = Number(p.price);
      const drift = Math.round(((current - suggestedTry) / current) * 100);

      return {
        productId: p.id,
        title: p.title,
        sku: p.sku,
        currentPrice: current,
        suggestedPrice: suggestedTry,
        currency: 'USD',
        fxRate: usdRate,
        driftPct: drift,
        action: Math.abs(drift) > 5 ? 'update' : 'ok',
      };
    });

    return {
      rates: { USD: usdRate, EUR: eurRate },
      suggestions,
      autoPricingEnabled: false,
    };
  }
}

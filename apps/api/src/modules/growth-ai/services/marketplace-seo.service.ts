import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
type PlatformSeoRule = {
  id: string;
  label: string;
  maxTitle: number;
  style: string;
};

const PLATFORM_RULES: PlatformSeoRule[] = [
  { id: 'TRENDYOL', label: 'Trendyol', maxTitle: 100, style: 'long-tail' },
  { id: 'AMAZON', label: 'Amazon · A10', maxTitle: 200, style: 'brand-type' },
  { id: 'N11', label: 'N11', maxTitle: 80, style: 'compact' },
  { id: 'HEPSIBURADA', label: 'Hepsiburada', maxTitle: 120, style: 'feature-rich' },
  { id: 'EBAY', label: 'eBay · Cassini', maxTitle: 80, style: 'cassini' },
  { id: 'CICEKSEPETI', label: 'Çiçeksepeti', maxTitle: 90, style: 'gift' },
  { id: 'PAZARAMA', label: 'Pazarama', maxTitle: 100, style: 'standard' },
];

const BANNED = ['ŞOK İNDİRİM', 'EN UCUZ', 'TAKLİT', 'SAHTE'];

@Injectable()
export class MarketplaceSeoService {
  constructor(private readonly prisma: PrismaService) {}

  async scoreProduct(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) return { error: 'Ürün bulunamadı' };

    const baseTitle = product.title;
    const brand = product.brand || baseTitle.split(' ')[0];

    const platforms = PLATFORM_RULES.map((rule) => {
      const optimized = this.generateTitle(baseTitle, brand, rule);
      const score = this.fuzzyScore(baseTitle, optimized, rule);
      const risks = this.scanRisks(optimized);
      return {
        platform: rule.label,
        platformId: rule.id,
        title: optimized,
        score: score.pct,
        grade: score.grade,
        length: optimized.length,
        maxLength: rule.maxTitle,
        risks,
      };
    });

    return {
      productId,
      productTitle: baseTitle,
      platforms,
    };
  }

  async bulkScore(tenantId: string, limit = 20) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const results = await Promise.all(
      products.map(async (p) => {
        const scored = await this.scoreProduct(tenantId, p.id);
        return {
          productId: p.id,
          sku: p.sku,
          title: p.title,
          avgScore:
            'platforms' in scored && scored.platforms
              ? Math.round(
                  scored.platforms.reduce((s, x) => s + x.score, 0) /
                    scored.platforms.length,
                )
              : 0,
          platforms: 'platforms' in scored ? scored.platforms : [],
        };
      }),
    );

    return { total: results.length, items: results };
  }

  private generateTitle(base: string, brand: string, rule: PlatformSeoRule): string {
    const words = base.split(/\s+/).filter(Boolean);
    if (rule.style === 'long-tail') {
      return this.trim(`${brand} ${base} Orijinal Garantili Hızlı Kargo`, rule.maxTitle);
    }
    if (rule.style === 'brand-type') {
      return this.trim(`${brand} ${words.slice(0, 6).join(' ')} | Premium Kalite`, rule.maxTitle);
    }
    if (rule.style === 'cassini') {
      return this.trim(`${brand} ${words.slice(0, 4).join(' ')}`, rule.maxTitle);
    }
    if (rule.style === 'compact') {
      return this.trim(`${brand} ${words.slice(0, 5).join(' ')}`, rule.maxTitle);
    }
    return this.trim(base, rule.maxTitle);
  }

  private fuzzyScore(original: string, optimized: string, rule: PlatformSeoRule) {
    const overlap = this.tokenOverlap(original, optimized);
    const lengthPenalty =
      optimized.length > rule.maxTitle
        ? 15
        : optimized.length < rule.maxTitle * 0.4
          ? 10
          : 0;
    const pct = Math.max(0, Math.min(100, Math.round(overlap * 100 - lengthPenalty)));
    const grade =
      pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    return { pct, grade };
  }

  private tokenOverlap(a: string, b: string): number {
    const ta = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
    const tb = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
    if (ta.size === 0) return 0.5;
    let hit = 0;
    ta.forEach((t) => {
      if (tb.has(t)) hit++;
    });
    return hit / ta.size;
  }

  private scanRisks(text: string): string[] {
    const upper = text.toUpperCase();
    const risks: string[] = [];
    if (text === text.toUpperCase() && text.length > 10) risks.push('CAPS LOCK');
    for (const b of BANNED) {
      if (upper.includes(b)) risks.push(`Yasak: ${b}`);
    }
    return risks;
  }

  private trim(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max - 3).trim() + '...';
  }
}

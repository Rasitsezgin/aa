import {
  computePriceDistribution,
  computePriceStats,
  computeStockDistribution,
  deriveMarketingInsights,
} from '@/lib/analysis-portfolio-insights';

const products = [
  { name: 'Ucuz Ürün', price: 50, rating: 4.8, reviews: 120, stockStatus: true },
  { name: 'Orta Ürün', price: 250, rating: 4.2, reviews: 15, stockStatus: true },
  { name: 'Pahalı Ürün', price: 1500, rating: 0, reviews: 0, stockStatus: false },
  { name: 'Fiyatsız', price: 0, rating: 3.5, reviews: 2, stockStatus: true },
];

describe('analysis-portfolio-insights', () => {
  it('computePriceDistribution buckets priced products', () => {
    const dist = computePriceDistribution(products);
    const total = dist.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(3);
    expect(dist.find((b) => b.label === '1.000₺+')?.count).toBe(1);
  });

  it('computePriceStats returns min max median', () => {
    const stats = computePriceStats(products);
    expect(stats.min).toBe(50);
    expect(stats.max).toBe(1500);
    expect(stats.pricedCount).toBe(3);
  });

  it('computeStockDistribution splits stock', () => {
    const dist = computeStockDistribution(products);
    expect(dist.find((b) => b.label === 'Stokta')?.count).toBe(3);
    expect(dist.find((b) => b.label === 'Tükendi')?.count).toBe(1);
  });

  it('deriveMarketingInsights flags no-review products', () => {
    const insights = deriveMarketingInsights(products, ['Ürün', 'Orta'], {
      stockHealth: 75,
      imageOptimization: 70,
      avgProductPrice: 600,
      rating: 4.5,
    });
    expect(insights.some((i) => i.title.includes('Değerlendirme'))).toBe(true);
    expect(insights.length).toBeGreaterThan(0);
  });
});

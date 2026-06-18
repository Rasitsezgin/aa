import {
  calculatePriceScore,
  calculateTitleScore,
  mapProductsToAnalysis,
} from '@/lib/marketplace-analysis-metrics';

describe('marketplace-analysis-metrics', () => {
  const sampleProducts = [
    {
      name: 'Test Ürün Uzun Başlık Anahtar Kelime Örneği',
      price: 100,
      images: ['https://example.com/a.jpg'],
      rating: 4.5,
      reviewCount: 12,
      stockStatus: true,
    },
    {
      name: 'İkinci Ürün Başlığı Uzun Format',
      price: 0,
      images: [],
      rating: 0,
      reviewCount: 0,
      stockStatus: false,
    },
  ];

  it('calculatePriceScore from priced ratio', () => {
    expect(calculatePriceScore(sampleProducts)).toBe(50);
  });

  it('mapProductsToAnalysis includes derived fields', () => {
    const result = mapProductsToAnalysis(
      sampleProducts,
      {
        storeName: 'Test Mağaza',
        storeId: '1',
        platform: 'TRENDYOL',
        rating: 4.5,
        followers: 100,
        totalProducts: 50,
      },
      'scraped',
    );
    expect(result.seoScore).toBeGreaterThan(0);
    expect(result.metrics.totalReviews).toBe(12);
    expect(result.metrics.avgProductPrice).toBe(50);
    expect(result.metrics.customerSatisfaction).toBe(90);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it('calculateTitleScore returns 0 for empty', () => {
    expect(calculateTitleScore([])).toBe(0);
  });
});

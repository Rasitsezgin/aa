export type PortfolioProduct = {
  name: string;
  price: number;
  rating: number;
  reviews: number;
  stockStatus: boolean;
};

export type DistributionBucket = {
  label: string;
  count: number;
  percent: number;
};

export type PriceStats = {
  min: number;
  max: number;
  median: number;
  avg: number;
  pricedCount: number;
};

export type MarketingInsight = {
  title: string;
  description: string;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  metric?: string;
};

function roundPct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

export function computePriceDistribution(
  products: PortfolioProduct[],
): DistributionBucket[] {
  const priced = products.filter((p) => p.price > 0);
  const total = priced.length || 1;
  const buckets: Array<{ label: string; match: (price: number) => boolean }> = [
    { label: '0–100₺', match: (price) => price > 0 && price <= 100 },
    { label: '100–500₺', match: (price) => price > 100 && price <= 500 },
    { label: '500–1.000₺', match: (price) => price > 500 && price <= 1000 },
    { label: '1.000₺+', match: (price) => price > 1000 },
  ];

  return buckets.map(({ label, match }) => {
    const count = priced.filter((p) => match(p.price)).length;
    return { label, count, percent: roundPct(count, total) };
  });
}

export function computeRatingDistribution(
  products: PortfolioProduct[],
): DistributionBucket[] {
  const total = products.length || 1;
  const buckets: Array<{ label: string; count: number }> = [
    { label: '4.5+', count: products.filter((p) => p.rating >= 4.5).length },
    { label: '4.0–4.4', count: products.filter((p) => p.rating >= 4 && p.rating < 4.5).length },
    { label: '3.0–3.9', count: products.filter((p) => p.rating >= 3 && p.rating < 4).length },
    { label: '3.0 altı', count: products.filter((p) => p.rating > 0 && p.rating < 3).length },
    { label: 'Puan yok', count: products.filter((p) => p.rating === 0).length },
  ];

  return buckets.map(({ label, count }) => ({
    label,
    count,
    percent: roundPct(count, total),
  }));
}

export function computeStockDistribution(
  products: PortfolioProduct[],
): DistributionBucket[] {
  const total = products.length || 1;
  const inStock = products.filter((p) => p.stockStatus).length;
  const outOfStock = products.length - inStock;
  return [
    { label: 'Stokta', count: inStock, percent: roundPct(inStock, total) },
    { label: 'Tükendi', count: outOfStock, percent: roundPct(outOfStock, total) },
  ];
}

export function computeReviewDistribution(
  products: PortfolioProduct[],
): DistributionBucket[] {
  const total = products.length || 1;
  const buckets = [
    { label: '100+', test: (n: number) => n >= 100 },
    { label: '20–99', test: (n: number) => n >= 20 && n < 100 },
    { label: '1–19', test: (n: number) => n >= 1 && n < 20 },
    { label: '0', test: (n: number) => n === 0 },
  ];
  return buckets.map(({ label, test }) => {
    const count = products.filter((p) => test(p.reviews)).length;
    return { label, count, percent: roundPct(count, total) };
  });
}

export function computePriceStats(products: PortfolioProduct[]): PriceStats {
  const prices = products.map((p) => p.price).filter((p) => p > 0).sort((a, b) => a - b);
  if (prices.length === 0) {
    return { min: 0, max: 0, median: 0, avg: 0, pricedCount: 0 };
  }
  const sum = prices.reduce((a, b) => a + b, 0);
  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];
  return {
    min: prices[0],
    max: prices[prices.length - 1],
    median: Math.round(median),
    avg: Math.round(sum / prices.length),
    pricedCount: prices.length,
  };
}

export function getTopProductsByReviews(
  products: PortfolioProduct[],
  limit = 5,
): PortfolioProduct[] {
  return [...products]
    .filter((p) => p.reviews > 0)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, limit);
}

export function getProductsWithoutReviews(
  products: PortfolioProduct[],
  limit = 5,
): PortfolioProduct[] {
  return products.filter((p) => p.reviews === 0).slice(0, limit);
}

export function deriveMarketingInsights(
  products: PortfolioProduct[],
  keywords: string[] = [],
  metrics?: {
    stockHealth?: number;
    imageOptimization?: number;
    avgProductPrice?: number;
    rating?: number;
  } | null,
): MarketingInsight[] {
  if (products.length === 0) return [];

  const insights: MarketingInsight[] = [];
  const noReviewCount = products.filter((p) => p.reviews === 0).length;
  const outOfStock = products.filter((p) => !p.stockStatus).length;
  const topRated = [...products]
    .filter((p) => p.rating >= 4.5 && p.reviews >= 5)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 3);

  if (noReviewCount > 0) {
    insights.push({
      title: 'Değerlendirme eksik ürünler',
      description: `${noReviewCount} üründe henüz değerlendirme yok. Sipariş sonrası hatırlatma veya kupon teşviki düşünün.`,
      priority: noReviewCount > products.length / 2 ? 'Yüksek' : 'Orta',
      metric: `${noReviewCount}/${products.length}`,
    });
  }

  if (outOfStock > 0) {
    insights.push({
      title: 'Tükenen ürünler',
      description: `${outOfStock} ürün stokta değil. Reklam bütçesini stoktaki ürünlere kaydırın.`,
      priority: outOfStock > products.length / 3 ? 'Yüksek' : 'Orta',
      metric: `${outOfStock} ürün`,
    });
  }

  if (topRated.length > 0) {
    insights.push({
      title: 'Öne çıkarılacak ürünler',
      description: `Yüksek puanlı: ${topRated.map((p) => p.name.slice(0, 40)).join(' · ')}`,
      priority: 'Orta',
      metric: `${topRated.length} ürün`,
    });
  }

  if ((metrics?.imageOptimization ?? 100) < 80) {
    insights.push({
      title: 'Görsel eksikliği kampanya riski',
      description: `Görsel skoru %${metrics?.imageOptimization ?? 0}. Reklam öncesi görselsiz ürünleri tamamlayın.`,
      priority: 'Yüksek',
    });
  }

  if (keywords.length > 0) {
    insights.push({
      title: 'Anahtar kelime odaklı kampanya',
      description: `Ürün başlıklarından çıkarılan terimler: ${keywords.slice(0, 4).join(', ')}. Bu kelimelerle mağaza içi arama ve sponsorlu vitrin planlayın.`,
      priority: 'Düşük',
    });
  }

  const stats = computePriceStats(products);
  if (stats.pricedCount > 0 && hasNumericValue(metrics?.avgProductPrice)) {
    insights.push({
      title: 'Fiyat konumlandırması',
      description: `Ortalama ${stats.avg.toLocaleString('tr-TR')}₺, medyan ${stats.median.toLocaleString('tr-TR')}₺ (${stats.min.toLocaleString('tr-TR')}₺ – ${stats.max.toLocaleString('tr-TR')}₺ aralığı).`,
      priority: 'Düşük',
      metric: `${stats.pricedCount} fiyatlı ürün`,
    });
  }

  if ((metrics?.rating ?? 0) >= 4.5) {
    insights.push({
      title: 'Mağaza güven sinyali',
      description: `Mağaza puanı ${metrics?.rating}/5 — güven rozetlerini ve müşteri yorumlarını vitrinde öne çıkarın.`,
      priority: 'Düşük',
    });
  }

  return insights.slice(0, 6);
}

function hasNumericValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

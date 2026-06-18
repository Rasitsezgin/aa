export type ComparisonMetric = {
  label: string;
  current: string | number;
  compare: string | number;
  better: 'current' | 'compare' | 'tie';
};

export type ComparisonStoreSnapshot = {
  storeName: string;
  seoScore: number;
  rating: number;
  followers: number;
  totalProducts: number;
  avgPrice: number;
  totalReviews: number;
  titleOptimization: number;
  imageOptimization: number;
};

export function snapshotFromAnalysis(data: {
  metrics?: Record<string, unknown>;
  seoScore?: number;
}): ComparisonStoreSnapshot | null {
  const m = data.metrics;
  if (!m) return null;
  return {
    storeName: String(m.storeName || 'Mağaza'),
    seoScore: Number(data.seoScore) || 0,
    rating: Number(m.rating) || 0,
    followers: Number(m.followers) || 0,
    totalProducts: Number(m.totalProducts) || Number(m.productCount) || 0,
    avgPrice: Number(m.avgProductPrice) || 0,
    totalReviews: Number(m.totalReviews) || 0,
    titleOptimization: Number(m.titleOptimization) || 0,
    imageOptimization: Number(m.imageOptimization) || 0,
  };
}

export function compareStoreSnapshots(
  current: ComparisonStoreSnapshot,
  other: ComparisonStoreSnapshot,
): ComparisonMetric[] {
  const rows: Array<{
    label: string;
    current: number;
    compare: number;
    format?: (n: number) => string;
  }> = [
    { label: 'SEO Skoru', current: current.seoScore, compare: other.seoScore },
    { label: 'Mağaza Puanı', current: current.rating, compare: other.rating },
    { label: 'Takipçi', current: current.followers, compare: other.followers },
    { label: 'Ürün Sayısı', current: current.totalProducts, compare: other.totalProducts },
    { label: 'Ortalama Fiyat (₺)', current: current.avgPrice, compare: other.avgPrice },
    { label: 'Toplam Değerlendirme', current: current.totalReviews, compare: other.totalReviews },
    { label: 'Başlık Optimizasyonu', current: current.titleOptimization, compare: other.titleOptimization },
    { label: 'Görsel Skoru', current: current.imageOptimization, compare: other.imageOptimization },
  ];

  return rows.map(({ label, current: a, compare: b }) => {
    const better: ComparisonMetric['better'] =
      a > b ? 'current' : b > a ? 'compare' : 'tie';
    return {
      label,
      current: label.includes('Fiyat') ? a.toLocaleString('tr-TR') : a,
      compare: label.includes('Fiyat') ? b.toLocaleString('tr-TR') : b,
      better,
    };
  });
}

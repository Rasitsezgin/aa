export type AnalysisProduct = {
  name: string;
  title?: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stockStatus: boolean;
};

export function calculateTitleScore(products: Array<{ name: string }>): number {
  if (products.length === 0) return 0;
  let total = 0;
  for (const p of products) {
    let score = 0;
    const len = p.name.length;
    if (len >= 50 && len <= 100) score += 40;
    else if (len >= 30 && len <= 150) score += 25;
    else score += 10;
    if (p.name.split(' ').length >= 4) score += 30;
    if (/[A-ZÇĞİÖŞÜ]/.test(p.name)) score += 30;
    total += score;
  }
  return Math.round(total / products.length);
}

export function calculateImageScore(
  products: Array<{ images: string[] }>,
): number {
  if (products.length === 0) return 0;
  const withImage = products.filter((p) => p.images.length > 0).length;
  return Math.round((withImage / products.length) * 100);
}

export function calculateStockHealth(
  products: Array<{ stockStatus: boolean }>,
): number {
  if (products.length === 0) return 0;
  const inStock = products.filter((p) => p.stockStatus).length;
  return Math.round((inStock / products.length) * 100);
}

export function calculatePriceScore(products: Array<{ price: number }>): number {
  if (products.length === 0) return 0;
  const priced = products.filter((p) => p.price > 0);
  if (priced.length === 0) return 0;
  return Math.round((priced.length / products.length) * 100);
}

export function calculateSeoScore(
  rating: number,
  reviews: number,
  totalProducts: number,
  titleScore: number,
): number {
  if (totalProducts === 0 && reviews === 0 && rating === 0) return 0;
  let score = 50;
  score += (rating / 5) * 20;
  score += Math.min(reviews / 5000, 1) * 15;
  score += Math.min(totalProducts / 100, 1) * 10;
  score += (titleScore / 100) * 5;
  return Math.min(Math.round(score), 99);
}

export function extractKeywords(products: Array<{ name: string }>): string[] {
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set([
    've', 'veya', 'için', 'ile', 'en', 'çok', 'bir', 'bu', 'da', 'de',
    'ml', 'gr', 'adet', 'paket', 'set',
  ]);

  for (const product of products) {
    const words = product.name
      .toLocaleLowerCase('tr-TR')
      .replace(/[^\w\sğüşöçı]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function buildMetricSources(hasProducts: boolean, hasRating: boolean) {
  return {
    storeName: hasProducts ? 'scraped' : 'scraped',
    rating: hasRating ? 'scraped' : 'not_available',
    followers: 'scraped',
    totalProducts: hasProducts ? 'scraped' : 'not_available',
    productCount: hasProducts ? 'scraped' : 'not_available',
    totalReviews: hasProducts ? 'calculated' : 'not_available',
    avgProductPrice: hasProducts ? 'calculated' : 'not_available',
    monthlyTraffic: 'not_available',
    monthlyTurnover: 'not_available',
    responseTime: 'not_available',
    titleOptimization: 'calculated',
    imageOptimization: 'calculated',
    priceCompetitiveness: 'calculated',
    stockHealth: 'calculated',
    customerSatisfaction: hasRating ? 'calculated' : 'not_available',
    responseScore: 'not_available',
  } as const;
}

export function mapProductsToAnalysis(
  products: AnalysisProduct[],
  storeInfo: {
    storeName: string;
    storeId: string;
    platform: string;
    rating?: number;
    followers?: number;
    totalProducts?: number;
  },
  source: 'api' | 'scraped',
) {
  const rated = products.filter((p) => p.rating > 0);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length
      : storeInfo.rating || 0;
  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);
  const totalCount = storeInfo.totalProducts || products.length;
  const titleOptimization = calculateTitleScore(products);
  const imageOptimization = calculateImageScore(products);
  const stockHealth = calculateStockHealth(products);
  const priceCompetitiveness = calculatePriceScore(products);
  const seoScore = calculateSeoScore(
    avgRating,
    totalReviews,
    totalCount,
    titleOptimization,
  );
  const hasProducts = products.length > 0;
  const hasRating = avgRating > 0;
  const avgProductPrice =
    products.length > 0
      ? Math.round(
          (products.reduce((sum, p) => sum + p.price, 0) / products.length) * 100,
        ) / 100
      : 0;
  const customerSatisfaction = hasRating
    ? Math.round((avgRating / 5) * 100)
    : 0;

  const metricSources = buildMetricSources(hasProducts, hasRating);
  const sourceWeights: Record<string, number> = {
    scraped: 100,
    api: 100,
    calculated: 70,
    estimated: 35,
    not_available: 0,
  };
  const metricValues = Object.values(metricSources);
  const confidenceScore =
    metricValues.length > 0
      ? Math.round(
          metricValues.reduce((sum, key) => sum + (sourceWeights[key] ?? 0), 0) /
            metricValues.length,
        )
      : 0;
  const breakdown = metricValues.reduce(
    (acc, key) => {
      if (key === 'scraped' || key === 'api') acc.real += 1;
      else if (key === 'calculated') acc.calculated += 1;
      else if (key === 'estimated') acc.estimated += 1;
      else acc.unavailable += 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, real: 0, calculated: 0, estimated: 0, unavailable: 0 },
  );

  return {
    metrics: {
      storeName: storeInfo.storeName,
      storeId: storeInfo.storeId,
      platform: storeInfo.platform,
      rating: Math.round(avgRating * 10) / 10,
      followers: storeInfo.followers || 0,
      productCount: totalCount,
      totalProducts: totalCount,
      titleOptimization,
      imageOptimization,
      priceCompetitiveness,
      stockHealth,
      responseTime: 'Veri yok',
      totalReviews,
      avgProductPrice,
      customerSatisfaction,
    },
    products,
    seoScore,
    keywords: extractKeywords(products),
    dataSources: {
      overall: source,
      seoScore: 'calculated',
      products: source,
      metrics: {
        ...metricSources,
        followers:
          (storeInfo.followers ?? 0) > 0
            ? source === 'api'
              ? 'api'
              : 'scraped'
            : 'not_available',
      },
      reasons: {
        monthlyTraffic: 'Aylık trafik verisi platform public kaynaklarında bulunmuyor.',
        monthlyTurnover: 'Aylık ciro verisi platform public kaynaklarında bulunmuyor.',
        responseTime: 'Yanıt süresi verisi public kaynaklardan alınamıyor.',
      },
      evidence: {
        productSampleSize: products.length,
        dataCollection: 'Canlı platform kaynağından çekilen gerçek mağaza verisi',
        aiProcessing: 'SEO skoru ve optimizasyon metrikleri yapay zeka modelleriyle hesaplanır',
      },
    },
    confidence: {
      score: confidenceScore,
      breakdown,
    },
    timestamp: new Date().toISOString(),
  };
}

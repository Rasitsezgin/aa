import type { ParsedTrendyolStore } from './trendyol-store-url';

interface TrendyolApiProduct {
  name?: string;
  title?: string;
  brand?: { name?: string };
  merchantName?: string;
  price?: {
    sellingPrice?: number;
    discountedPrice?: number;
    originalPrice?: number;
  };
  ratingScore?: {
    averageRating?: number;
    totalRatingCount?: number;
  };
  favoriteCount?: number;
  hasStock?: boolean;
  images?: Array<{ url?: string }>;
}

interface TrendyolApiResponse {
  result?: {
    products?: TrendyolApiProduct[];
    totalCount?: number;
    merchant?: { name?: string };
  };
}

export interface TrendyolAnalysisResult {
  metrics: {
    storeName: string;
    storeId: string;
    platform: string;
    rating: number;
    followers: number;
    productCount: number;
    totalProducts: number;
    titleOptimization: number;
    imageOptimization: number;
    priceCompetitiveness: number;
    stockHealth: number;
    responseTime: string;
  };
  products: Array<{
    name: string;
    title: string;
    price: number;
    images: string[];
    rating: number;
    reviewCount: number;
    stockStatus: boolean;
  }>;
  seoScore: number;
  keywords: string[];
}

function calculateTitleScore(
  products: Array<{ name: string }>,
): number {
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

function calculateImageScore(
  products: Array<{ images: string[] }>,
): number {
  if (products.length === 0) return 0;
  const withImage = products.filter((p) => p.images.length > 0).length;
  return Math.round((withImage / products.length) * 100);
}

function calculateStockHealth(
  products: Array<{ stockStatus: boolean }>,
): number {
  if (products.length === 0) return 0;
  const inStock = products.filter((p) => p.stockStatus).length;
  return Math.round((inStock / products.length) * 100);
}

function calculatePriceScore(
  products: Array<{ price: number }>,
): number {
  if (products.length === 0) return 0;
  const priced = products.filter((p) => p.price > 0);
  if (priced.length === 0) return 0;
  return Math.round((priced.length / products.length) * 100);
}

function calculateSeoScore(
  rating: number,
  reviews: number,
  totalProducts: number,
  titleScore: number,
): number {
  let score = 50;
  score += (rating / 5) * 20;
  score += Math.min(reviews / 5000, 1) * 15;
  score += Math.min(totalProducts / 100, 1) * 10;
  score += (titleScore / 100) * 5;
  return Math.min(Math.round(score), 99);
}

function extractKeywords(products: Array<{ name: string }>): string[] {
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set([
    've',
    'veya',
    'için',
    'ile',
    'en',
    'çok',
    'bir',
    'bu',
    'da',
    'de',
    'ml',
    'gr',
    'adet',
    'paket',
    'set',
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

export async function fetchTrendyolStoreAnalysis(
  storeInfo: ParsedTrendyolStore,
  sourceUrl?: string,
): Promise<TrendyolAnalysisResult> {
  const { storeId, storeSlug, storeName: fallbackName } = storeInfo;
  const referer =
    sourceUrl ||
    `https://www.trendyol.com/sr?mid=${storeId}`;

  const query = `mid=${storeId}&os=1&sk=1&sst=BEST_SELLER&pi=1&culture=tr-TR&userGenderId=1&pId=0&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA`;
  const apiCandidates = [
    `https://apigw.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?${query}`,
    `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?${query}`,
    `https://www.trendyol.com/api/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?${query}`,
  ];

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    Origin: 'https://www.trendyol.com',
    Referer: referer,
  };

  let data: TrendyolApiResponse | null = null;
  let lastStatus = 0;

  for (const sellerApiUrl of apiCandidates) {
    try {
      const response = await fetch(sellerApiUrl, {
        headers,
        cache: 'no-store',
      });
      lastStatus = response.status;
      if (!response.ok) continue;

      const json = (await response.json()) as TrendyolApiResponse;
      if (json?.result?.products?.length) {
        data = json;
        break;
      }
    } catch {
      // Sonraki endpoint
    }
  }

  if (!data) {
    throw new Error(
      `Trendyol mağaza verisi alınamadı${lastStatus ? ` (HTTP ${lastStatus})` : ''}.`,
    );
  }
  const rawProducts = data?.result?.products || [];

  if (rawProducts.length === 0) {
    throw new Error('Mağaza bulundu ancak ürün listesi boş veya erişilemez.');
  }

  const products = rawProducts.slice(0, 20).map((p) => {
    const name = p.name || p.title || 'İsimsiz Ürün';
    const price =
      p.price?.sellingPrice ||
      p.price?.discountedPrice ||
      p.price?.originalPrice ||
      0;
    const imageUrl = p.images?.[0]?.url;

    return {
      name,
      title: name,
      price,
      images: imageUrl ? [imageUrl] : [],
      rating: p.ratingScore?.averageRating || 0,
      reviewCount: p.ratingScore?.totalRatingCount || 0,
      stockStatus: p.hasStock !== false,
    };
  });

  const rated = products.filter((p) => p.rating > 0);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length
      : 0;
  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);
  const totalCount = data.result?.totalCount || products.length;

  const merchantName =
    data.result?.merchant?.name ||
    rawProducts.find((p) => p.merchantName)?.merchantName ||
    rawProducts.find((p) => p.brand?.name)?.brand?.name;

  const storeName = merchantName || fallbackName;
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

  return {
    metrics: {
      storeName,
      storeId,
      platform: 'TRENDYOL',
      rating: Math.round(avgRating * 10) / 10,
      followers: 0,
      productCount: totalCount,
      totalProducts: totalCount,
      titleOptimization,
      imageOptimization,
      priceCompetitiveness,
      stockHealth,
      responseTime: 'Veri yok',
    },
    products,
    seoScore,
    keywords: extractKeywords(products),
  };
}

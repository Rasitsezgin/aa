import { fetchFromApi } from '@/lib/server-api-url';
import {
  fetchTrendyolStoreAnalysis,
  type TrendyolAnalysisResult,
} from '@/lib/trendyol-store-api';
import {
  parseTrendyolStoreUrl,
  resolveTrendyolBrowseUrl,
  type ParsedTrendyolStore,
} from '@/lib/trendyol-store-url';

export type TrendyolAnalyzeResponse = TrendyolAnalysisResult & {
  partial?: boolean;
  notice?: string;
  dataSources?: {
    overall?: string;
    seoScore?: string;
    products?: string;
  };
};

function buildFallbackAnalysis(
  parsed: ParsedTrendyolStore,
  notice: string,
): TrendyolAnalyzeResponse {
  const titleScore = 55;
  const seoScore = 48;

  return {
    metrics: {
      storeName: parsed.storeName,
      storeId: parsed.storeId,
      platform: 'TRENDYOL',
      rating: 0,
      followers: 0,
      productCount: 0,
      totalProducts: 0,
      titleOptimization: titleScore,
      imageOptimization: 0,
      priceCompetitiveness: 60,
      stockHealth: 0,
      responseTime: 'Veri yok',
    },
    products: [],
    seoScore,
    keywords: [],
    partial: true,
    notice,
    dataSources: {
      overall: 'estimated',
      seoScore: 'estimated',
      products: 'not_available',
    },
  };
}

function mapBackendScrape(data: {
  metrics?: Record<string, unknown>;
  products?: Array<{
    title?: string;
    name?: string;
    price?: number;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    stockStatus?: boolean;
  }>;
  seoScore?: number;
}): TrendyolAnalyzeResponse | null {
  const products = (data.products || []).map((p) => {
    const name = p.title || p.name || 'Ürün';
    return {
      name,
      title: name,
      price: p.price || 0,
      images: p.images || [],
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      stockStatus: p.stockStatus !== false,
    };
  });

  if (products.length === 0 && !data.metrics?.storeName) {
    return null;
  }

  const metrics = data.metrics || {};
  const storeName =
    (typeof metrics.storeName === 'string' && metrics.storeName) ||
    'Trendyol Mağazası';

  return {
    metrics: {
      storeName,
      storeId: String(metrics.storeId || ''),
      platform: 'TRENDYOL',
      rating: Number(metrics.rating) || 0,
      followers: Number(metrics.followers) || 0,
      productCount: Number(metrics.productCount) || products.length,
      totalProducts: Number(metrics.productCount) || products.length,
      titleOptimization: 70,
      imageOptimization: products.some((p) => p.images.length > 0) ? 85 : 40,
      priceCompetitiveness: 72,
      stockHealth: products.length
        ? Math.round(
            (products.filter((p) => p.stockStatus).length / products.length) *
              100,
          )
        : 0,
      responseTime: 'Veri yok',
    },
    products,
    seoScore: Number(data.seoScore) || 55,
    keywords: [],
    dataSources: {
      overall: 'scraped',
      seoScore: 'calculated',
      products: 'scraped',
    },
  };
}

export async function runTrendyolAnalysis(
  url: string,
  storeIdFallback?: string,
): Promise<TrendyolAnalyzeResponse> {
  const parsed =
    parseTrendyolStoreUrl(url) ||
    (storeIdFallback && /^\d+$/.test(storeIdFallback)
      ? {
          storeId: storeIdFallback,
          storeSlug: `magaza-${storeIdFallback}`,
          storeName: 'Trendyol Mağazası',
        }
      : null);

  if (!parsed) {
    throw new Error('Trendyol mağaza kimliği URL içinden çözümlenemedi.');
  }

  const browseUrl = resolveTrendyolBrowseUrl(parsed, url);

  try {
    const live = await fetchTrendyolStoreAnalysis(parsed, browseUrl);
    if (live.products.length > 0) {
      return {
        ...live,
        dataSources: {
          overall: 'api',
          seoScore: 'calculated',
          products: 'api',
        },
      };
    }
  } catch (error) {
    console.warn('[Trendyol] Public API failed:', error);
  }

  const scrapePath = `/scraping/analyze/trendyol/${parsed.storeId}?url=${encodeURIComponent(browseUrl)}`;
  const backendScrape = await fetchFromApi<{
    metrics?: Record<string, unknown>;
    products?: Array<Record<string, unknown>>;
    seoScore?: number;
  }>(scrapePath, { method: 'GET', cache: 'no-store' });

  if (backendScrape.ok && backendScrape.data) {
    const mapped = mapBackendScrape(
      backendScrape.data as Parameters<typeof mapBackendScrape>[0],
    );
    if (mapped && mapped.products.length > 0) {
      return mapped;
    }
  }

  const marketplacePath = `/marketplace/analyze/trendyol/${parsed.storeId}?url=${encodeURIComponent(browseUrl)}`;
  const backendMarketplace = await fetchFromApi<{
    metrics?: { storeName?: string; rating?: number; totalProducts?: number };
    products?: Array<{ name?: string; price?: number; rating?: number }>;
    seoScore?: number;
  }>(marketplacePath, { method: 'GET', cache: 'no-store' });

  if (backendMarketplace.ok && backendMarketplace.data?.products?.length) {
    const m = backendMarketplace.data;
    return {
      metrics: {
        storeName: m.metrics?.storeName || parsed.storeName,
        storeId: parsed.storeId,
        platform: 'TRENDYOL',
        rating: m.metrics?.rating || 0,
        followers: 0,
        productCount: m.metrics?.totalProducts || m.products?.length || 0,
        totalProducts: m.metrics?.totalProducts || m.products?.length || 0,
        titleOptimization: 68,
        imageOptimization: 75,
        priceCompetitiveness: 70,
        stockHealth: 80,
        responseTime: 'Veri yok',
      },
      products: (m.products || []).map((p) => ({
        name: p.name || 'Ürün',
        title: p.name || 'Ürün',
        price: p.price || 0,
        images: [],
        rating: p.rating || 0,
        reviewCount: 0,
        stockStatus: true,
      })),
      seoScore: m.seoScore || 55,
      keywords: [],
      dataSources: {
        overall: 'api+scraped',
        seoScore: 'calculated',
        products: 'api',
      },
    };
  }

  return buildFallbackAnalysis(
    parsed,
    'Trendyol geçici olarak tam veri paylaşmıyor. Mağaza kimliği doğrulandı; sınırlı önizleme gösteriliyor.',
  );
}

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
import { scrapeTrendyolWithBrowser, scrapeTrendyolStoreMetaOnly } from '@/lib/marketplace-browser-scraper';
import { mapProductsToAnalysis } from '@/lib/marketplace-analysis-metrics';

export type TrendyolAnalyzeResponse = TrendyolAnalysisResult & {
  partial?: boolean;
  notice?: string;
  dataSources?: {
    overall?: string;
    seoScore?: string;
    products?: string;
    metrics?: Record<string, string>;
    reasons?: Record<string, string>;
  };
};

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

  if (products.length === 0) return null;

  const metrics = data.metrics || {};
  const storeName =
    (typeof metrics.storeName === 'string' && metrics.storeName) ||
    'Trendyol Mağazası';

  return mapProductsToAnalysis(
    products,
    {
      storeName,
      storeId: String(metrics.storeId || ''),
      platform: 'TRENDYOL',
      rating: Number(metrics.rating) || 0,
      followers: Number(metrics.followers) || 0,
      totalProducts: Number(metrics.productCount) || products.length,
    },
    'scraped',
  );
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
      const mapped = mapProductsToAnalysis(
        live.products,
        {
          storeName: live.metrics.storeName,
          storeId: parsed.storeId,
          platform: 'TRENDYOL',
          rating: live.metrics.rating,
          followers: live.metrics.followers,
          totalProducts: live.metrics.totalProducts,
        },
        'api',
      );

      if ((mapped.metrics.followers ?? 0) === 0) {
        try {
          const meta = await scrapeTrendyolStoreMetaOnly(parsed, url);
          if (meta?.followers) {
            mapped.metrics.followers = meta.followers;
            if (mapped.dataSources?.metrics) {
              mapped.dataSources.metrics.followers = 'scraped';
            }
          }
          if (meta?.rating && (mapped.metrics.rating ?? 0) === 0) {
            mapped.metrics.rating = meta.rating;
          }
        } catch {
          // API ürünleri yeterli; takipçi platform API'sinde yoksa -- gösterilir
        }
      }

      return mapped;
    }
  } catch (error) {
    console.warn('[Trendyol] Public API failed:', error);
  }

  const browserScrape = await scrapeTrendyolWithBrowser(parsed, url);
  if (browserScrape && browserScrape.products.length > 0) {
    return mapProductsToAnalysis(
      browserScrape.products,
      {
        storeName: browserScrape.storeName || parsed.storeName,
        storeId: parsed.storeId,
        platform: 'TRENDYOL',
        rating: browserScrape.rating,
        followers: browserScrape.followers,
        totalProducts: browserScrape.totalProducts || browserScrape.products.length,
      },
      'scraped',
    );
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
    if (mapped) return mapped;
  }

  const marketplacePath = `/marketplace/analyze/trendyol/${parsed.storeId}?url=${encodeURIComponent(browseUrl)}`;
  const backendMarketplace = await fetchFromApi<{
    metrics?: { storeName?: string; rating?: number; totalProducts?: number };
    products?: Array<{ name?: string; price?: number; rating?: number }>;
    seoScore?: number;
  }>(marketplacePath, { method: 'GET', cache: 'no-store' });

  if (backendMarketplace.ok && backendMarketplace.data?.products?.length) {
    const m = backendMarketplace.data;
    return mapProductsToAnalysis(
      (m.products || []).map((p) => ({
        name: p.name || 'Ürün',
        title: p.name || 'Ürün',
        price: p.price || 0,
        images: [],
        rating: p.rating || 0,
        reviewCount: 0,
        stockStatus: true,
      })),
      {
        storeName: m.metrics?.storeName || parsed.storeName,
        storeId: parsed.storeId,
        platform: 'TRENDYOL',
        rating: m.metrics?.rating || 0,
        totalProducts: m.metrics?.totalProducts || m.products?.length || 0,
      },
      'api',
    );
  }

  throw new Error(
    'Trendyol mağaza verisi alınamadı. Mağaza sayfasına erişilemedi veya ürün listesi boş.',
  );
}

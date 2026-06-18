import { fetchFromApi } from '@/lib/server-api-url';
import {
  parseHepsiburadaStoreUrl,
  resolveHepsiburadaBrowseUrl,
} from '@/lib/hepsiburada-store-url';
import { scrapeHepsiburadaWithBrowser } from '@/lib/marketplace-browser-scraper';
import { mapProductsToAnalysis } from '@/lib/marketplace-analysis-metrics';
import type { TrendyolAnalyzeResponse } from '@/lib/trendyol-analyze';

export async function runHepsiburadaAnalysis(
  url: string,
  storeSlugFallback?: string,
): Promise<TrendyolAnalyzeResponse> {
  const parsed =
    parseHepsiburadaStoreUrl(url) ||
    (storeSlugFallback
      ? {
          storeSlug: storeSlugFallback,
          storeName: storeSlugFallback
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
        }
      : null);

  if (!parsed) {
    throw new Error('Hepsiburada mağaza kimliği URL içinden çözümlenemedi.');
  }

  const browseUrl = resolveHepsiburadaBrowseUrl(parsed, url);

  const browserScrape = await scrapeHepsiburadaWithBrowser(browseUrl);
  if (browserScrape && browserScrape.products.length > 0) {
    return mapProductsToAnalysis(
      browserScrape.products,
      {
        storeName: browserScrape.storeName || parsed.storeName,
        storeId: parsed.storeSlug,
        platform: 'HEPSIBURADA',
        rating: browserScrape.rating,
        followers: browserScrape.followers,
        totalProducts: browserScrape.totalProducts || browserScrape.products.length,
      },
      'scraped',
    );
  }

  const scrapePath = `/scraping/analyze/hepsiburada/${encodeURIComponent(parsed.storeSlug)}?url=${encodeURIComponent(browseUrl)}`;
  const backendScrape = await fetchFromApi<{
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
  }>(scrapePath, { method: 'GET', cache: 'no-store' });

  if (backendScrape.ok && backendScrape.data?.products?.length) {
    const products = backendScrape.data.products.map((p) => {
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

    const metrics = backendScrape.data.metrics || {};
    return mapProductsToAnalysis(
      products,
      {
        storeName: String(metrics.storeName || parsed.storeName),
        storeId: parsed.storeSlug,
        platform: 'HEPSIBURADA',
        rating: Number(metrics.rating) || 0,
        followers: Number(metrics.followers) || 0,
        totalProducts: Number(metrics.productCount) || products.length,
      },
      'scraped',
    );
  }

  throw new Error(
    'Hepsiburada mağaza verisi alınamadı. Mağaza sayfasına erişilemedi veya ürün listesi boş.',
  );
}

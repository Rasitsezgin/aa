import 'server-only';

import * as cheerio from 'cheerio';
import {
  resolveTrendyolBrowseUrl,
  type ParsedTrendyolStore,
} from '@/lib/trendyol-store-url';
import {
  parseHepsiburadaStoreUrl,
  resolveHepsiburadaBrowseUrl,
} from '@/lib/hepsiburada-store-url';
import type { AnalysisProduct } from '@/lib/marketplace-analysis-metrics';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** Cloudflare headless engelini aşmak için yerel geliştirmede görünür Chrome kullanır. */
function shouldUseHeadlessBrowser(): boolean {
  if (process.env.SCRAPE_HEADLESS === 'true') return true;
  if (process.env.SCRAPE_HEADLESS === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

async function launchPlaywrightBrowser(): Promise<import('playwright').Browser> {
  const { chromium } = await import('playwright');
  const headless = shouldUseHeadlessBrowser();
  const channels = [
    process.env.PLAYWRIGHT_CHANNEL,
    'chrome',
    'msedge',
    undefined,
  ].filter((v, i, arr) => v !== undefined || i === arr.length - 1) as Array<
    string | undefined
  >;

  let lastError: unknown;
  for (const channel of channels) {
    try {
      return await chromium.launch({
        ...(channel ? { channel } : {}),
        headless,
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Playwright tarayıcısı başlatılamadı.');
}

export type ScrapedStoreSnapshot = {
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
  products: AnalysisProduct[];
};

function parseMetric(text: string): number {
  if (!text) return 0;
  const clean = text.toUpperCase().replace(/\s/g, '').replace(',', '.');
  let multiplier = 1;
  if (clean.includes('M') || clean.includes('MN')) multiplier = 1_000_000;
  else if (clean.includes('B') || clean.includes('BN') || clean.includes('MR')) {
    multiplier = 1_000_000_000;
  } else if (clean.includes('K') || clean.includes('BIN')) multiplier = 1_000;

  const num = parseFloat(clean.replace(/[^\d.]/g, ''));
  return Number.isFinite(num) ? Math.floor(num * multiplier) : 0;
}

function parseRating(text: string): number {
  if (!text) return 0;
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

function parsePrice(text: string): number {
  if (!text) return 0;
  const normalized = text.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

async function withPlaywrightPage<T>(
  browseUrl: string,
  handler: (page: import('playwright').Page, html: string) => Promise<T>,
): Promise<T | null> {
  let browser: import('playwright').Browser | null = null;
  try {
    browser = await launchPlaywrightBrowser();
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'tr-TR',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(browseUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(2_500);
    const html = await page.content();
    return await handler(page, html);
  } catch (error) {
    console.warn('[BrowserScraper] Playwright failed:', error);
    return null;
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

type TrendyolDomProduct = {
  name: string;
  priceText: string;
  image: string;
  ratingText: string;
  reviewText: string;
};

async function extractTrendyolProductsFromPage(
  page: import('playwright').Page,
): Promise<AnalysisProduct[]> {
  await page
    .waitForSelector('[data-testid="product-card"]', { timeout: 30_000 })
    .catch(() => null);
  await page.mouse.wheel(0, 1_200);
  await page.waitForTimeout(1_000);

  const raw = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="product-card"]');
    return Array.from(cards)
      .slice(0, 20)
      .map((card) => {
        const text = card.textContent?.replace(/\s+/g, ' ').trim() || '';
        const name =
          card.querySelector('img[data-testid="image-img"]')?.getAttribute('alt')?.trim() ||
          card.querySelector('[data-testid="product-card-name"]')?.textContent?.trim() ||
          card.querySelector('[data-testid="product-name"]')?.textContent?.trim() ||
          card.querySelector('.prdct-desc-cntnr-name')?.textContent?.trim() ||
          '';
        const priceText =
          card.querySelector('[data-testid="price-current-price"]')?.textContent?.trim() ||
          card.querySelector('.prc-box-dscntd')?.textContent?.trim() ||
          (text.match(/(\d[\d.,]*)\s*TL/)?.[1] ? `${text.match(/(\d[\d.,]*)\s*TL/)?.[1]} TL` : '');
        const img = card.querySelector('img');
        const image =
          img?.getAttribute('src') ||
          img?.getAttribute('data-src') ||
          '';
        const ratingMatch = text.match(/(\d+[.,]\d+)\s*\((\d+)\)/);
        const ratingText = ratingMatch?.[1] || '';
        const reviewText = ratingMatch?.[2] || '';
        return { name, priceText, image, ratingText, reviewText };
      })
      .filter((p) => p.name);
  });

  return (raw as TrendyolDomProduct[]).map((p) => ({
    name: p.name,
    title: p.name,
    price: parsePrice(p.priceText),
    images: p.image ? [p.image] : [],
    rating: parseRating(p.ratingText),
    reviewCount: parseMetric(p.reviewText),
    stockStatus: true,
  }));
}

function mapTrendyolApiProducts(rawProducts: Array<Record<string, unknown>>): AnalysisProduct[] {
  return rawProducts.slice(0, 20).map((p) => {
    const name = String(p.name || p.title || 'İsimsiz Ürün');
    const priceObj = p.price as Record<string, number> | undefined;
    const price =
      priceObj?.sellingPrice ||
      priceObj?.discountedPrice ||
      priceObj?.originalPrice ||
      0;
    const images = p.images as Array<{ url?: string }> | undefined;
    const imageUrl = images?.[0]?.url;
    const ratingObj = p.ratingScore as Record<string, number> | undefined;

    return {
      name,
      title: name,
      price: Number(price) || 0,
      images: imageUrl ? [imageUrl] : [],
      rating: Number(ratingObj?.averageRating) || 0,
      reviewCount: Number(ratingObj?.totalRatingCount) || 0,
      stockStatus: p.hasStock !== false,
    };
  });
}

function parseTrendyolFromDom(html: string): {
  products: AnalysisProduct[];
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
} {
  const $ = cheerio.load(html);
  const products: AnalysisProduct[] = [];

  $('[data-testid="product-card"]').each((_, el) => {
    if (products.length >= 20) return false;
    const node = $(el);
    const name =
      node.find('img[data-testid="image-img"]').attr('alt')?.trim() ||
      node
      .find('[data-testid="product-card-name"], [data-testid="product-name"], .prdct-desc-cntnr-name, .prdct-desc-cntnr-ttl')
      .first()
      .text()
      .trim();
    const priceText = node
      .find('.prc-box-dscntd, .prc-box-orgnl, [data-testid="price-current-price"]')
      .first()
      .text()
      .trim();
    const image =
      node.find('img').first().attr('src') ||
      node.find('img').first().attr('data-src') ||
      '';
    const ratingText = node.find('.ratings .rating-score, .ratingScore').first().text().trim();
    const reviewText = node.find('.ratings .ratingCount, .rating-count').first().text().trim();

    if (!name) return;

    products.push({
      name,
      title: name,
      price: parsePrice(priceText),
      images: image ? [image] : [],
      rating: parseRating(ratingText.replace(',', '.')),
      reviewCount: parseMetric(reviewText),
      stockStatus: true,
    });
  });

  const storeName =
    $('h1.seller-name').text().trim() ||
    $('.seller-info-container .name').text().trim() ||
    '';
  const rating = parseRating(
    $('.seller-store-rating-score').text().trim().replace(',', '.'),
  );
  const followers = parseMetric($('.seller-follower-count').text().trim());
  const totalProducts = parseMetric(
    $('.search-result-count-text').text() || $('.dscrptn').text() || '',
  );

  return { products, storeName, rating, followers, totalProducts };
}

export async function scrapeTrendyolStoreMetaOnly(
  parsed: ParsedTrendyolStore,
  sourceUrl?: string,
): Promise<Pick<ScrapedStoreSnapshot, 'followers' | 'rating' | 'storeName'> | null> {
  const browseUrl = resolveTrendyolBrowseUrl(parsed, sourceUrl);
  return withPlaywrightPage(browseUrl, async (_page, html) => {
    const dom = parseTrendyolFromDom(html);
    if (!dom.followers && !dom.rating && !dom.storeName) return null;
    return {
      storeName: dom.storeName || parsed.storeName,
      rating: dom.rating,
      followers: dom.followers,
    };
  });
}

export async function scrapeTrendyolWithBrowser(
  parsed: ParsedTrendyolStore,
  sourceUrl?: string,
): Promise<ScrapedStoreSnapshot | null> {
  const browseUrl = resolveTrendyolBrowseUrl(parsed, sourceUrl);
  const productUrl = `https://www.trendyol.com/sr?mid=${parsed.storeId}`;

  let browser: import('playwright').Browser | null = null;
  try {
    browser = await launchPlaywrightBrowser();
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'tr-TR',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    let apiProducts: AnalysisProduct[] = [];
    page.on('response', async (response) => {
      if (!response.url().includes('infinite-scroll/sr') || response.status() !== 200) {
        return;
      }
      try {
        const json = (await response.json()) as {
          result?: { products?: Array<Record<string, unknown>> };
        };
        if (json?.result?.products?.length) {
          apiProducts = mapTrendyolApiProducts(json.result.products);
        }
      } catch {
        // ignore
      }
    });

    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 }).catch(() => null);
    await page.waitForTimeout(2_000);

    const liveProducts = await extractTrendyolProductsFromPage(page);
    let dom = parseTrendyolFromDom(await page.content());
    const products =
      apiProducts.length > 0
        ? apiProducts
        : liveProducts.length > 0
          ? liveProducts
          : dom.products;

    if (!dom.storeName || dom.rating === 0) {
      await page.goto(browseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
      await page.waitForTimeout(1_500);
      dom = parseTrendyolFromDom(await page.content());
    }

    const finalProducts = products;
    if (finalProducts.length === 0) return null;

    const merchantName =
      dom.storeName ||
      parsed.storeName ||
      'Trendyol Mağazası';

    return {
      storeName: merchantName,
      rating: dom.rating,
      followers: dom.followers,
      totalProducts: dom.totalProducts || finalProducts.length,
      products: finalProducts,
    };
  } catch (error) {
    console.warn('[BrowserScraper] Trendyol failed:', error);
    return null;
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

function extractHepsiburadaProductsFromState(mData: Record<string, unknown>): AnalysisProduct[] {
  const products: AnalysisProduct[] = [];
  const seen = new Set<string>();

  const rowSources = [
    mData.desktopRows,
    (mData.data as { desktopRows?: Record<string, unknown> } | undefined)?.desktopRows,
    mData.mobileRows,
  ];

  for (const rows of rowSources) {
    if (!rows || typeof rows !== 'object') continue;
    for (const row of Object.values(rows as Record<string, { type?: string; data?: unknown }>)) {
      if (row?.type !== 'product' || !row.data) continue;
      const items = Array.isArray(row.data)
        ? row.data
        : ((row.data as { items?: unknown[] }).items || []);
      for (const item of items as Array<Record<string, unknown>>) {
        const variant = (item.variantList as Array<Record<string, unknown>> | undefined)?.[0];
        const productId = String(
          variant?.sku || item.productId || variant?.name || item.name || '',
        );
        if (!productId || seen.has(productId)) continue;
        seen.add(productId);

        const variantList = item.variantList as Array<{ images?: Array<{ link?: string }> }> | undefined;
        const imageLink = variantList?.[0]?.images?.[0]?.link?.replace('{size}', '500') || '';
        const listing = variant?.listing as { priceInfo?: { price?: number } } | undefined;
        const priceInfo = item.priceInfo as { price?: number } | undefined;
        const name = String(variant?.name || item.name || item.brand || 'Ürün');

        products.push({
          name,
          title: name,
          price: Number(listing?.priceInfo?.price || priceInfo?.price) || 0,
          images: imageLink ? [imageLink] : [],
          rating: Number(item.customerReviewRating) || 0,
          reviewCount: Number(item.customerReviewCount) || 0,
          stockStatus: true,
        });
      }
    }
  }

  return products;
}

function extractHepsiburadaFromMcontent(content: Record<string, unknown>): {
  products: AnalysisProduct[];
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
} {
  const products: AnalysisProduct[] = [];
  const seen = new Set<string>();

  for (const section of Object.values(content)) {
    if (!section || typeof section !== 'object') continue;
    for (const block of Object.values(section as Record<string, unknown>)) {
      const state =
        (block as { STATE?: Record<string, unknown> })?.STATE ||
        (block as Record<string, unknown>);
      products.push(...extractHepsiburadaProductsFromState(state as Record<string, unknown>));
    }
  }

  const uniqueProducts = products.filter((p) => {
    const key = p.name;
    if (!key || key === 'Ürün' || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let storeName = '';
  let rating = 0;
  let followers = 0;
  let totalProducts = uniqueProducts.length;

  const merchantInfo = content.MERCHANTINFO as Record<string, { STATE?: { data?: Record<string, unknown> } & Record<string, unknown> }> | undefined;
  if (merchantInfo) {
    for (const block of Object.values(merchantInfo)) {
      const state = (block?.STATE?.data || block?.STATE) as Record<string, unknown> | undefined;
      if (!state) continue;

      const detail = state.merchantDetail as { name?: string; rating?: { rating?: number } | number } | undefined;
      if (detail?.name) storeName = detail.name;

      if (detail?.rating && typeof detail.rating === 'object' && detail.rating.rating) {
        rating = Number(detail.rating.rating);
      } else if (typeof detail?.rating === 'number') {
        rating = detail.rating;
      } else if (typeof state.storeRating === 'number') {
        rating = state.storeRating;
      }

      if (state.followerCount) followers = Number(state.followerCount);

      const filter = state.merchantFilter as { totalProductCount?: number } | undefined;
      if (filter?.totalProductCount) {
        totalProducts = Number(filter.totalProductCount);
      }
    }
  }

  return {
    products: uniqueProducts,
    storeName,
    rating,
    followers,
    totalProducts,
  };
}

async function extractHepsiburadaProductsFromPage(
  page: import('playwright').Page,
): Promise<{
  products: AnalysisProduct[];
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
} | null> {
  return page.evaluate(() => {
    const content = window.MCONTENT as Record<string, unknown> | undefined;
    if (!content) return null;

    const products: Array<{
      name: string;
      price: number;
      image: string;
      rating: number;
      reviewCount: number;
    }> = [];
    const seen = new Set<string>();

    for (const section of Object.values(content)) {
      if (!section || typeof section !== 'object') continue;
      for (const block of Object.values(section as Record<string, unknown>)) {
        const state =
          (block as { STATE?: Record<string, unknown> })?.STATE ||
          (block as Record<string, unknown>);
        const rowSources = [
          (state as { desktopRows?: Record<string, unknown> }).desktopRows,
          (state as { data?: { desktopRows?: Record<string, unknown> } }).data?.desktopRows,
        ];
        for (const rows of rowSources) {
          if (!rows) continue;
          for (const row of Object.values(rows as Record<string, { type?: string; data?: unknown }>)) {
            if (row?.type !== 'product' || !row.data) continue;
            const items = Array.isArray(row.data)
              ? row.data
              : ((row.data as { items?: unknown[] }).items || []);
            for (const item of items as Array<Record<string, unknown>>) {
              const variant = (item.variantList as Array<Record<string, unknown>> | undefined)?.[0];
              const id = String(variant?.sku || item.productId || variant?.name || '');
              if (!id || seen.has(id)) continue;
              seen.add(id);
              const variantList = item.variantList as Array<{ images?: Array<{ link?: string }> }> | undefined;
              const image = variantList?.[0]?.images?.[0]?.link?.replace('{size}', '500') || '';
              const listing = variant?.listing as { priceInfo?: { price?: number } } | undefined;
              const priceInfo = item.priceInfo as { price?: number } | undefined;
              products.push({
                name: String(variant?.name || item.name || item.brand || ''),
                price: Number(listing?.priceInfo?.price || priceInfo?.price) || 0,
                image,
                rating: Number(item.customerReviewRating) || 0,
                reviewCount: Number(item.customerReviewCount) || 0,
              });
            }
          }
        }
      }
    }

    let storeName = '';
    let rating = 0;
    let followers = 0;
    let totalProducts = products.length;

    const merchantInfo = content.MERCHANTINFO as Record<string, { STATE?: { data?: Record<string, unknown> } & Record<string, unknown> }> | undefined;
    if (merchantInfo) {
      for (const block of Object.values(merchantInfo)) {
        const state = (block?.STATE?.data || block?.STATE) as Record<string, unknown> | undefined;
        if (!state) continue;
        const detail = state.merchantDetail as { name?: string; rating?: { rating?: number } } | undefined;
        if (detail?.name) storeName = detail.name;
        if (detail?.rating?.rating) rating = Number(detail.rating.rating);
        if (state.followerCount) followers = Number(state.followerCount);
        const filter = state.merchantFilter as { totalProductCount?: number } | undefined;
        if (filter?.totalProductCount) totalProducts = Number(filter.totalProductCount);
      }
    }

    return { products, storeName, rating, followers, totalProducts };
  }).then((result) => {
    if (!result) return null;
    return {
      storeName: result.storeName,
      rating: result.rating,
      followers: result.followers,
      totalProducts: result.totalProducts,
      products: result.products
        .filter((p) => p.name)
        .slice(0, 20)
        .map((p) => ({
          name: p.name,
          title: p.name,
          price: p.price,
          images: p.image ? [p.image] : [],
          rating: p.rating,
          reviewCount: p.reviewCount,
          stockStatus: true,
        })),
    };
  });
}

function parseHepsiburadaFromDom(html: string): {
  products: AnalysisProduct[];
  storeName: string;
  rating: number;
  followers: number;
  totalProducts: number;
} {
  const $ = cheerio.load(html);
  const products: AnalysisProduct[] = [];

  $('[data-test-id="product-card"], [data-testid="product-card"], .product-card, .product-item, .product-list-item').each((_, el) => {
    if (products.length >= 20) return false;
    const node = $(el);
    const name = node.find('h3, .title, .product-title, [data-testid="product-card-name"]').first().text().trim();
    const priceText = node.find('.price, .current-price, .product-price, [data-testid="price-current-price"]').first().text().trim();
    const image = node.find('img').first().attr('src') || node.find('img').first().attr('data-src') || '';
    if (!name) return;
    products.push({
      name,
      title: name,
      price: parsePrice(priceText),
      images: image ? [image] : [],
      rating: 0,
      reviewCount: 0,
      stockStatus: true,
    });
  });

  const storeName =
    $('h1.merchant-name').text().trim() ||
    $('.merchant-page-header .title').text().trim() ||
    '';
  const rating = parseRating(
    ($('.merchant-rating .rating-score').text() || $('.merchant-header-rating').text()).trim().replace(',', '.'),
  );
  const followersText = $('.merchant-followers').text().trim();
  const followers = parseMetric(followersText);

  return { products, storeName, rating, followers, totalProducts: products.length };
}

export async function scrapeHepsiburadaWithBrowser(
  url: string,
): Promise<ScrapedStoreSnapshot | null> {
  const parsed = parseHepsiburadaStoreUrl(url);
  const browseUrl = parsed
    ? resolveHepsiburadaBrowseUrl(parsed, url)
    : url;

  let browser: import('playwright').Browser | null = null;
  try {
    browser = await launchPlaywrightBrowser();
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'tr-TR',
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(browseUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(4_000);
    await page.mouse.wheel(0, 1_500);
    await page.waitForTimeout(2_000);

    let extracted = await extractHepsiburadaProductsFromPage(page);

    if (!extracted || extracted.products.length === 0) {
      const mcontentRaw = await page.evaluate(() => window.MCONTENT || null);
      if (mcontentRaw && typeof mcontentRaw === 'object') {
        const fromState = extractHepsiburadaFromMcontent(
          mcontentRaw as Record<string, unknown>,
        );
        if (fromState.products.length > 0) {
          extracted = {
            ...fromState,
            products: fromState.products.slice(0, 20),
          };
        }
      }
    }

    if (!extracted || extracted.products.length === 0) {
      const dom = parseHepsiburadaFromDom(await page.content());
      if (dom.products.length > 0) {
        extracted = {
          storeName: dom.storeName,
          rating: dom.rating,
          followers: dom.followers,
          totalProducts: dom.totalProducts,
          products: dom.products,
        };
      }
    }

    if (!extracted || extracted.products.length === 0) return null;

    let { storeName, rating, followers, totalProducts, products } = extracted;

    if (!storeName) {
      storeName =
        (await page.title()).split(' Mağazası')[0]?.trim() ||
        parsed?.storeName ||
        '';
    }

    if (rating === 0) {
      const rated = products.filter((p) => p.rating > 0);
      if (rated.length > 0) {
        rating = rated.reduce((sum, p) => sum + p.rating, 0) / rated.length;
      }
    }

    return {
      storeName: storeName || parsed?.storeName || 'Hepsiburada Mağazası',
      rating,
      followers,
      totalProducts: totalProducts || products.length,
      products: products.slice(0, 20),
    };
  } catch (error) {
    console.warn('[BrowserScraper] Hepsiburada failed:', error);
    return null;
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

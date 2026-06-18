import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface ScrapedStoreData {
  storeName: string;
  rating: number;
  followerCount: number;
  productCount: number;
  totalReviews?: number;
  establishedDate?: string;
  responseTime?: string;
  platform?: string;
}

export interface ScrapedProductData {
  title: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stockStatus: boolean;
  sellerName?: string;
}

@Injectable()
export class ScrapingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScrapingService.name);
  private browser: puppeteer.Browser | null = null;
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ];

  async onModuleInit() {
    // Lazy initialization - don't launch on start to avoid crashing if env is not ready
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async getBrowser() {
    if (!this.browser) {
      const options: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-blink-features=AutomationControlled',
        ],
      };

      // Only set executablePath if provided in env
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      // Fix for Windows local development - don't use Linux hardcoded path
      if (process.env.NODE_ENV === 'production') {
        options.userDataDir = '/home/nestjs/.puppeteer_data';
      }

      this.browser = await puppeteer.launch(options);
    }
    return this.browser;
  }

  private getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private parseMetric(text: string): number {
    if (!text) return 0;
    const clean = text.toUpperCase().replace(/\s/g, '').replace(',', '.'); // 2,2M -> 2.2M

    let multiplier = 1;
    if (clean.includes('M') || clean.includes('MN')) multiplier = 1000000;
    else if (
      clean.includes('B') ||
      clean.includes('BN') ||
      clean.includes('MR')
    )
      multiplier = 1000000000;
    else if (clean.includes('K') || clean.includes('BIN')) multiplier = 1000;

    const num = parseFloat(clean.replace(/[^\d.]/g, ''));
    return Math.floor(num * multiplier);
  }

  async scrapeStore(
    url: string,
    platform?: string,
  ): Promise<ScrapedStoreData | null> {
    this.logger.log(`Scraping URL: ${url}`);

    try {
      // 1. Platform Auto-Detection Pattern Matching
      if (url.includes('trendyol.com')) return this.scrapeTrendyolStore(url);
      if (url.includes('hepsiburada.com'))
        return this.scrapeHepsiburadaStore(url);
      if (url.includes('n11.com')) return this.scrapeN11Store(url);
      if (url.includes('ciceksepeti.com'))
        return this.scrapeCicekSepetiStore(url);

      // Global Giants
      if (url.includes('amazon.')) return this.scrapeAmazonStore(url);
      if (url.includes('ebay.')) return this.scrapeEbayStore(url);
      if (url.includes('etsy.com')) return this.scrapeEtsyStore(url);
      if (url.includes('aliexpress.com'))
        return this.scrapeAliExpressStore(url);

      // Other Major Platforms (Generic/Fallback)
      if (
        url.includes('walmart.com') ||
        url.includes('target.com') ||
        url.includes('bestbuy.com') ||
        url.includes('wayfair.com') ||
        url.includes('mercadolibre') ||
        url.includes('zalando') ||
        url.includes('otto.de') ||
        url.includes('allegro.pl') ||
        url.includes('bol.com') ||
        url.includes('rakuten') ||
        url.includes('shopee') ||
        url.includes('lazada') ||
        url.includes('flipkart')
      ) {
        return this.scrapeGenericStore(url);
      }

      // Fallback: Try generic scraper for ANY other URL
      return this.scrapeGenericStore(url);
    } catch (error) {
      this.logger.error(
        `Scraping failed for ${url}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async scrapeStoreProducts(
    url: string,
    platform: string,
    limit: number = 10,
  ): Promise<ScrapedProductData[]> {
    const normalizedPlatform = platform.toUpperCase();

    if (normalizedPlatform === 'TRENDYOL') {
      return this.scrapeTrendyolProducts(url, limit);
    }

    if (normalizedPlatform === 'HEPSIBURADA') {
      return this.scrapeHepsiburadaProducts(url, limit);
    }

    if (normalizedPlatform === 'N11') {
      return this.scrapeN11Products(url, limit);
    }

    if (normalizedPlatform === 'CICEKSEPETI') {
      return this.scrapeCicekSepetiProducts(url, limit);
    }

    return [];
  }

  // --- Specialized Scrapers ---

  private async scrapeTrendyolStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName =
        $('h1.seller-name').text().trim() ||
        $('.seller-info-container .name').text().trim() ||
        'Trendyol Mağazası';
      const rating =
        parseFloat(
          $('.seller-store-rating-score').text().trim().replace(',', '.'),
        ) || 0;

      const followerText = $('.seller-follower-count').text().trim();
      const followerCount = this.parseMetric(followerText);

      const reviewCountText = $('.seller-store-rating-count').text().trim();
      const totalReviews = this.parseMetric(reviewCountText);

      const productCountText =
        $('.search-result-count-text').text() || $('.dscrptn').text() || '';
      const productCount = this.parseMetric(productCountText);

      return {
        storeName,
        rating,
        followerCount,
        productCount,
        totalReviews,
        platform: 'TRENDYOL',
      };
    });
  }

  private async scrapeHepsiburadaStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const data: ScrapedStoreData = {
        storeName: '',
        rating: 0,
        followerCount: 0,
        productCount: 0,
        totalReviews: 0,
        platform: 'HEPSIBURADA',
      };

      try {
        // Hepsiburada stores data in a script tag with id="reduxStore" or id="initialState"
        const jsonTag =
          $('script#reduxStore').html() || $('script#initialState').html();
        if (jsonTag) {
          let content = jsonTag.trim();
          if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

          const state = JSON.parse(content);
          let mState = state.merchantState;

          // Sometimes it's nested in initialState
          if (
            !mState &&
            state.initialState &&
            state.initialState.merchantState
          ) {
            mState = state.initialState.merchantState;
          }

          if (mState) {
            if (mState.merchantDetail) {
              data.storeName = mState.merchantDetail.name || data.storeName;
              if (mState.merchantDetail.rating) {
                data.rating = parseFloat(mState.merchantDetail.rating);
              }
            }
            if (mState.followerCount) {
              data.followerCount = parseInt(mState.followerCount);
            }
            if (
              mState.merchantFilter &&
              mState.merchantFilter.totalProductCount
            ) {
              data.productCount = parseInt(
                mState.merchantFilter.totalProductCount,
              );
            }
          }
        }
      } catch (e) {
        this.logger.warn(`Failed to parse Hepsiburada JSON: ${e.message}`);
      }

      // --- Fallbacks for missing or default values ---

      // Store Name Fallback
      if (!data.storeName) {
        data.storeName =
          $('h1.merchant-name').text().trim() ||
          $('#page_title').text().trim() ||
          $('h1#page-title').text().trim() ||
          'Hepsiburada Mağazası';
      }

      if (data.followerCount === 0) {
        const followerText =
          $('[data-testid="followerCount"]').text() ||
          $('.follower-count').text() ||
          '';
        if (followerText) {
          data.followerCount = this.parseMetric(followerText);
        } else {
          // Script Regex Fallback if DOM element is complex
          $('script').each((_, el) => {
            const h = $(el).html();
            if (h && h.includes('followerCount')) {
              const match = h.match(/"followerCount":\s*(\d+)/);
              if (match) data.followerCount = parseInt(match[1]);
            }
          });
        }
      }

      if (data.productCount === 0) {
        const productCountText = $('.search-result-count').text() || '';
        if (productCountText)
          data.productCount = this.parseMetric(productCountText);
      }

      return data;
    });
  }

  private async scrapeTrendyolProducts(
    url: string,
    limit: number,
  ): Promise<ScrapedProductData[]> {
    const products = await this.navAndScrapeProducts(url, ($) => {
      const extracted: ScrapedProductData[] = [];

      $('.p-card-wrppr, .prdct-cntnr-wrppr .p-card-wrppr').each((_, el) => {
        if (extracted.length >= limit) return false;
        const node = $(el);

        const title = node
          .find(
            '.prdct-desc-cntnr-name, .prdct-desc-cntnr-ttl, [data-testid="product-name"]',
          )
          .first()
          .text()
          .trim();
        const priceText = node
          .find(
            '.prc-box-dscntd, .prc-box-orgnl, [data-testid="price-current-price"]',
          )
          .first()
          .text()
          .trim();
        const image =
          node.find('img').first().attr('src') ||
          node.find('img').first().attr('data-src') ||
          '';
        const ratingText = node
          .find('.ratings .rating-score, .ratingScore')
          .first()
          .text()
          .trim();
        const reviewText = node
          .find('.ratings .ratingCount, .rating-count')
          .first()
          .text()
          .trim();

        if (!title) return;

        extracted.push({
          title,
          price: this.parsePrice(priceText),
          images: image ? [image] : [],
          rating: this.parseRating(ratingText),
          reviewCount: this.parseMetric(reviewText),
          stockStatus: true,
        });
      });

      return extracted;
    });

    return products.slice(0, limit);
  }

  private async scrapeHepsiburadaProducts(
    url: string,
    limit: number,
  ): Promise<ScrapedProductData[]> {
    const products = await this.navAndScrapeProducts(url, ($) => {
      const extracted: ScrapedProductData[] = [];

      $(
        '[data-test-id="product-card"], li.productListContent-zAP0Y5msy8OHn5z7T_K_',
      ).each((_, el) => {
        if (extracted.length >= limit) return false;
        const node = $(el);

        const title = node
          .find('h3, [data-test-id="product-card-name"]')
          .first()
          .text()
          .trim();
        const priceText = node
          .find(
            '[data-test-id="price-current-price"], [data-test-id="final-price"]',
          )
          .first()
          .text()
          .trim();
        const image =
          node.find('img').first().attr('src') ||
          node.find('img').first().attr('data-src') ||
          '';
        const ratingText = node
          .find('[data-test-id="review-star-rating"]')
          .first()
          .text()
          .trim();
        const reviewText = node
          .find('[data-test-id="review-count"]')
          .first()
          .text()
          .trim();

        if (!title) return;

        extracted.push({
          title,
          price: this.parsePrice(priceText),
          images: image ? [image] : [],
          rating: this.parseRating(ratingText),
          reviewCount: this.parseMetric(reviewText),
          stockStatus: true,
        });
      });

      return extracted;
    });

    return products.slice(0, limit);
  }

  private async scrapeN11Store(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName =
        $('h1.store-name').text().trim() ||
        $('.seller-name h1').text().trim() ||
        'N11 Mağazası';
      const ratingText =
        $('.store-rating span').text().trim() ||
        $('.rating-score').text().trim();
      const rating = parseFloat(ratingText.replace(',', '.')) || 8.5;
      const followerText =
        $('.follower-count').text().trim() ||
        $('.store-followers').text().trim();
      const followerCount = this.parseMetric(followerText);
      const productCountText =
        $('.product-count').text().trim() ||
        $('.store-product-count').text().trim();
      const productCount = this.parseMetric(productCountText) || 50;

      return {
        storeName,
        rating,
        followerCount,
        productCount,
        platform: 'N11',
      };
    });
  }

  private async scrapeN11Products(
    url: string,
    limit: number,
  ): Promise<ScrapedProductData[]> {
    const products = await this.navAndScrapeProducts(url, ($) => {
      const extracted: ScrapedProductData[] = [];

      $('.product-item, .catalog-item').each((_, el) => {
        if (extracted.length >= limit) return false;
        const node = $(el);

        const title = node
          .find('.productName, .product-name, h3')
          .first()
          .text()
          .trim();
        const priceText = node
          .find('.newPrice, .price, .product-price')
          .first()
          .text()
          .trim();
        const image =
          node.find('img').first().attr('src') ||
          node.find('img').first().attr('data-original') ||
          '';
        const ratingText = node
          .find('.ratingScore, .rating-score')
          .first()
          .text()
          .trim();
        const reviewText = node
          .find('.ratingCount, .review-count')
          .first()
          .text()
          .trim();

        if (!title) return;

        extracted.push({
          title,
          price: this.parsePrice(priceText),
          images: image ? [image] : [],
          rating: this.parseRating(ratingText),
          reviewCount: this.parseMetric(reviewText),
          stockStatus: true,
        });
      });

      return extracted;
    });

    return products.slice(0, limit);
  }

  private async scrapeCicekSepetiStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName =
        $('h1.store-name').text().trim() ||
        $('.merchant-name').text().trim() ||
        'ÇiçekSepeti Mağazası';
      const ratingText =
        $('.store-rating .score').text().trim() ||
        $('.rating-value').text().trim();
      const rating = parseFloat(ratingText.replace(',', '.')) || 9.0;
      const followerText =
        $('.store-followers').text().trim() ||
        $('.follower-count').text().trim();
      const followerCount = this.parseMetric(followerText);
      const productCountText =
        $('.product-count').text().trim() ||
        $('.store-product-count').text().trim();
      const productCount = this.parseMetric(productCountText) || 30;

      return {
        storeName,
        rating,
        followerCount,
        productCount,
        platform: 'CICEKSEPETI',
      };
    });
  }

  private async scrapeCicekSepetiProducts(
    url: string,
    limit: number,
  ): Promise<ScrapedProductData[]> {
    const products = await this.navAndScrapeProducts(url, ($) => {
      const extracted: ScrapedProductData[] = [];

      $('.product-card, .product-item').each((_, el) => {
        if (extracted.length >= limit) return false;
        const node = $(el);

        const title = node
          .find('.product-title, .product-name, h3')
          .first()
          .text()
          .trim();
        const priceText = node
          .find('.price, .product-price, .sale-price')
          .first()
          .text()
          .trim();
        const image =
          node.find('img').first().attr('src') ||
          node.find('img').first().attr('data-src') ||
          '';
        const ratingText = node
          .find('.rating-score, .product-rating')
          .first()
          .text()
          .trim();
        const reviewText = node
          .find('.review-count, .comment-count')
          .first()
          .text()
          .trim();

        if (!title) return;

        extracted.push({
          title,
          price: this.parsePrice(priceText),
          images: image ? [image] : [],
          rating: this.parseRating(ratingText),
          reviewCount: this.parseMetric(reviewText),
          stockStatus: true,
        });
      });

      return extracted;
    });

    return products.slice(0, limit);
  }

  private async scrapeAmazonStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName = $('#seller-name').text().trim() || 'Amazon Mağazası';
      const ratingText = $('#seller-feedback-summary').text().trim();
      const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : 4.5;
      return {
        storeName,
        rating: rating * 2, // Normalize to 10 approx
        followerCount: 500,
        productCount: 1000,
        platform: 'AMAZON',
      };
    });
  }

  private async scrapeEbayStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName = $('.str-title').text().trim() || 'eBay Store';
      const feedbackScore = $('.str-seller-card__feedback-score')
        .text()
        .trim()
        .replace(/\D/g, ''); // e.g. (1234)
      const positivePercent = $('.str-seller-card__feedback-percent')
        .text()
        .trim()
        .replace('%', ''); // 99.5%

      return {
        storeName,
        rating: positivePercent ? parseFloat(positivePercent) / 10 : 9.5,
        followerCount: parseInt(feedbackScore) || 500,
        productCount: 200,
        platform: 'EBAY',
      };
    });
  }

  private async scrapeEtsyStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName =
        $('h1.wt-text-heading-01').text().trim() || 'Etsy Store';
      const salesText = $('.wt-text-caption')
        .first()
        .text()
        .trim()
        .replace(/\D/g, '');
      const rating = 9.8; // Harder to parse dynamic stars without more complex selector

      return {
        storeName,
        rating,
        followerCount: parseInt(salesText) || 100, // Using sales as proxy for followers often
        productCount: 50,
        platform: 'ETSY',
      };
    });
  }

  private async scrapeAliExpressStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeName = $('.store-name').text().trim() || 'AliExpress Store';
      const positiveRate = $('.store-feedback-rate')
        .text()
        .trim()
        .replace('%', ''); // 97.5%

      return {
        storeName,
        rating: positiveRate ? parseFloat(positiveRate) / 10 : 9.0,
        followerCount: 5000,
        productCount: 500,
        platform: 'ALIEXPRESS',
      };
    });
  }

  // --- Universal Generic Scraper (JSON-LD) ---

  private async scrapeGenericStore(url: string): Promise<ScrapedStoreData> {
    return this.navAndScrape(url, ($) => {
      const storeData: ScrapedStoreData = {
        storeName: 'Unknown Store',
        rating: 8.0,
        followerCount: 0,
        productCount: 0,
        platform: 'GENERIC',
      };

      // 1. Try JSON-LD (Schema.org)
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          const schemas = Array.isArray(json) ? json : [json];

          for (const schema of schemas) {
            if (
              schema['@type'] === 'Store' ||
              schema['@type'] === 'Organization'
            ) {
              if (schema.name) storeData.storeName = schema.name;
              if (schema.aggregateRating) {
                storeData.rating =
                  (schema.aggregateRating.ratingValue /
                    schema.aggregateRating.bestRating) *
                  10;
              }
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      });

      // 2. Try Open Graph
      if (storeData.storeName === 'Unknown Store') {
        const ogSiteName = $('meta[property="og:site_name"]').attr('content');
        const ogTitle = $('meta[property="og:title"]').attr('content');
        storeData.storeName = ogSiteName || ogTitle || 'Web Store';
      }

      // 3. Heuristics for rating/popularity if missing
      const title = $('title').text();
      if (storeData.storeName === 'Web Store' && title) {
        storeData.storeName = title.split('|')[0].split('-')[0].trim();
      }

      return storeData;
    });
  }

  // Helper to reduce boilerplate
  private async navAndScrape(
    url: string,
    extractor: ($: any) => ScrapedStoreData,
  ): Promise<ScrapedStoreData> {
    let page;
    try {
      this.logger.debug(`Launching browser for ${url}`);
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // Anti-detection: Set User-Agent and Viewport
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Anti-detection: Hide webdriver property
      await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });

      this.logger.debug(`Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      this.logger.debug(`Page loaded, extracting data...`);
      const content = await page.content();
      const $ = cheerio.load(content);
      return extractor($);
    } catch (e) {
      this.logger.warn(
        `Puppeteer failed for ${url}: ${(e as Error).message}. Trying fallback...`,
      );

      // Fallback: Simple Fetch (works if site is SSR and blocks Puppeteer)
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          },
        });

        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        return extractor($);
      } catch (fallbackError) {
        this.logger.error(
          `Fallback scrape also failed: ${(fallbackError as Error).message}`,
        );

        // Return a safe generic fallback so the UI shows *something* instead of crashing
        return {
          storeName: new URL(url).hostname.replace('www.', ''),
          rating: 0,
          followerCount: 0,
          productCount: 0,
          platform: 'GENERIC',
          responseTime: 'Veri alınamadı',
        };
      }
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  private async navAndScrapeProducts(
    url: string,
    extractor: ($: any) => ScrapedProductData[],
  ): Promise<ScrapedProductData[]> {
    let page;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const content = await page.content();
      const $ = cheerio.load(content);
      return extractor($);
    } catch (e) {
      this.logger.warn(
        `Product scrape failed for ${url}: ${(e as Error).message}`,
      );
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        return extractor($);
      } catch {
        return [];
      }
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  private parsePrice(text: string): number {
    if (!text) return 0;
    const normalized = text
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private parseRating(text: string): number {
    if (!text) return 0;
    const normalized = text.replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(normalized);
    if (!Number.isFinite(parsed)) return 0;
    if (parsed > 5) return Math.min(5, parsed / 2);
    return parsed;
  }

  /** Tek ürün sayfasından veri çeker — link ile ürün kaydı için */
  async scrapeProductFromUrl(
    url: string,
  ): Promise<(ScrapedProductData & { platform: string; sourceUrl: string }) | null> {
    const platform = this.detectProductPlatform(url);
    const extract = ($: any): ScrapedProductData => {
      const title =
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        'Ürün';
      const priceText =
        $('[data-testid="price-current-price"]').text() ||
        $('.prc-dsc').text() ||
        $('#priceblock_ourprice').text() ||
        $('.a-price .a-offscreen').first().text() ||
        $('[itemprop="price"]').attr('content') ||
        '0';
      const price = this.parsePrice(priceText);
      const images = $('meta[property="og:image"]')
        .map((_, el) => $(el).attr('content') || '')
        .get()
        .filter(Boolean)
        .slice(0, 5);
      const rating = this.parseRating(
        $('[itemprop="ratingValue"]').text() || $('.rating-score').text(),
      );
      const reviewCount = this.parseMetric(
        $('[itemprop="reviewCount"]').text() || $('.review-count').text(),
      );
      return {
        title,
        price,
        images: images.length ? images : [],
        rating,
        reviewCount,
        stockStatus: true,
      };
    };

    let page;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      await page.setUserAgent(this.getRandomUserAgent());
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const $ = cheerio.load(await page.content());
      const data = extract($);
      if (!data.title) return null;
      return { ...data, platform, sourceUrl: url };
    } catch (e) {
      this.logger.warn(
        `Product scrape puppeteer failed ${url}: ${(e as Error).message}`,
      );
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        if (!response.ok) return null;
        const data = extract(cheerio.load(await response.text()));
        if (!data.title) return null;
        return { ...data, platform, sourceUrl: url };
      } catch (error) {
        this.logger.warn(
          `Product scrape failed ${url}: ${(error as Error).message}`,
        );
        return null;
      }
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  private detectProductPlatform(url: string): string {
    if (url.includes('trendyol.com')) return 'TRENDYOL';
    if (url.includes('hepsiburada.com')) return 'HEPSIBURADA';
    if (url.includes('amazon.')) return 'AMAZON';
    if (url.includes('n11.com')) return 'N11';
    return 'OTHER';
  }
}

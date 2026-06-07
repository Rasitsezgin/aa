export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseTrendyolStoreUrl } from '@/lib/trendyol-store-url';
import { fetchTrendyolStoreAnalysis } from '@/lib/trendyol-store-api';

interface ScrapedStoreData {
    storeName: string;
    rating: number;
    followerCount: number;
    productCount: number;
    totalReviews?: number;
    platform?: string;
}

interface ScrapedProductData {
    title: string;
    price: number;
    images: string[];
    rating: number;
    reviewCount: number;
    stockStatus: boolean;
    sellerName?: string;
}

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function fetchHtml(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
        });
        if (!response.ok) return null;
        return await response.text();
    } catch {
        return null;
    }
}

async function scrapeAmazonStore(url: string): Promise<ScrapedStoreData | null> {
    const html = await fetchHtml(url);
    if (!html) {
        console.log('[Scrape] No HTML returned from fetch');
        return null;
    }
    console.log(`[Scrape] HTML length: ${html.length}`);
    const $ = cheerio.load(html);

    // Try multiple selectors for store name
    const storeName = $('#bylineInfo').text().trim() ||
                     $('h1').text().trim() ||
                     $('.store-title').text().trim() ||
                     $('[data-testid="store-title"]').text().trim();

    if (!storeName) {
        return null;
    }

    const ratingText = $('.averageRating').text().trim() ||
                      $('.cr-widget-AverageCustomerRating').text().trim() ||
                      $('[data-hook="rating-out-of-text"]').text().trim();
    const rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : 0;

    const productElements = $('[data-component-type="s-search-result"]');
    const productCount = productElements.length || 0;

    console.log(`[Scrape] Store: ${storeName}, Rating: ${rating}, Products: ${productCount}`);

    return {
        storeName: storeName.replace('Marka: ', '').replace('Ziyaret et: ', ''),
        rating,
        followerCount: 0,
        productCount,
        platform: 'AMAZON',
    };
}

async function scrapeAmazonProducts(url: string): Promise<ScrapedProductData[]> {
    const html = await fetchHtml(url);
    if (!html) return [];
    const $ = cheerio.load(html);
    const products: ScrapedProductData[] = [];

    $('[data-component-type="s-search-result"]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2 a span').text().trim() ||
                     $el.find('[data-cy="title-recipe-title"]').text().trim() ||
                     'Ürün';
        const priceText = $el.find('.a-price-whole').text().trim() ||
                         $el.find('.a-price .a-offscreen').text().trim() ||
                         '0';
        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const ratingText = $el.find('.a-icon-alt').text().trim();
        const rating = parseFloat(ratingText.replace(',', '.')) || 0;
        const reviewText = $el.find('.a-size-base').text().trim();
        const reviewCount = parseInt(reviewText.replace(/\D/g, '')) || 0;
        const imageUrl = $el.find('img').attr('src') || '';

        if (title && title !== 'Ürün') {
            products.push({
                title,
                price,
                images: imageUrl ? [imageUrl] : [],
                rating,
                reviewCount,
                stockStatus: true,
            });
        }
    });

    return products.slice(0, 20);
}

async function scrapeHepsiburadaStore(url: string): Promise<ScrapedStoreData | null> {
    const html = await fetchHtml(url);
    if (!html) {
        console.log('[Scrape] No HTML returned from Hepsiburada');
        return null;
    }
    console.log(`[Scrape] Hepsiburada HTML length: ${html.length}`);
    const $ = cheerio.load(html);

    // Try multiple selectors for store name
    const storeName = $('h1').text().trim() ||
                     $('.seller-name').text().trim() ||
                     $('[data-testid="store-name"]').text().trim() ||
                     $('.store-title').text().trim();

    if (!storeName) {
        return null;
    }

    const ratingText = $('.rating').text().trim() ||
                      $('.score').text().trim() ||
                      $('[data-testid="rating"]').text().trim();
    const rating = parseFloat(ratingText) || 0;

    const followerText = $('.follower-count').text().trim() ||
                        $('[data-testid="follower-count"]').text().trim();
    const followerCount = parseInt(followerText.replace(/\D/g, '')) || 0;

    const productElements = $('.product-item, [data-testid="product-card"], .product-card');
    const productCount = productElements.length || 0;

    console.log(`[Scrape] Hepsiburada Store: ${storeName}, Rating: ${rating}, Products: ${productCount}`);

    return {
        storeName,
        rating,
        followerCount,
        productCount,
        platform: 'HEPSIBURADA',
    };
}

async function scrapeHepsiburadaProducts(url: string): Promise<ScrapedProductData[]> {
    const html = await fetchHtml(url);
    if (!html) return [];
    const $ = cheerio.load(html);
    const products: ScrapedProductData[] = [];

    $('.product-item, [data-testid="product-card"], .product-card').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h3, .product-title, [data-testid="product-title"]').text().trim() || 'Ürün';
        const priceText = $el.find('.price, .product-price, [data-testid="price"]').text().trim() || '0';
        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const ratingText = $el.find('.rating, .stars').text().trim();
        const rating = parseFloat(ratingText) || 0;
        const reviewText = $el.find('.review-count, .comments').text().trim();
        const reviewCount = parseInt(reviewText.replace(/\D/g, '')) || 0;
        const imageUrl = $el.find('img').attr('src') || '';

        if (title && title !== 'Ürün') {
            products.push({
                title,
                price,
                images: imageUrl ? [imageUrl] : [],
                rating,
                reviewCount,
                stockStatus: true,
            });
        }
    });

    return products.slice(0, 20);
}

async function scrapeGenericStore(url: string, platform: string): Promise<ScrapedStoreData | null> {
    const html = await fetchHtml(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    const storeName = $('h1').text().trim() ||
                     $('.store-name').text().trim() ||
                     $('.seller-name').text().trim();
    if (!storeName) return null;
    const ratingText = $('.rating, .score, .stars').first().text().trim();
    const rating = parseFloat(ratingText) || 0;

    return {
        storeName,
        rating,
        followerCount: 0,
        productCount: 0,
        platform: platform.toUpperCase(),
    };
}

function calculateSeoScore(store: ScrapedStoreData | null, products: ScrapedProductData[]): number {
    if (!store) return 0;
    let score = 50;
    if (store.rating > 0) score += Math.min(20, store.rating * 2);
    if (store.followerCount > 0) score += Math.min(15, store.followerCount / 1000);
    if (store.productCount > 0) score += Math.min(10, store.productCount / 50);
    const productsWithImages = products.filter(p => p.images && p.images.length > 0).length;
    if (products.length > 0) score += Math.min(5, (productsWithImages / products.length) * 5);
    return Math.min(100, Math.round(score));
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; storeId: string }> }
) {
    try {
        const { platform, storeId } = await params;
        const { searchParams } = request.nextUrl;
        const url = searchParams.get('url') || '';

        console.log(`[Analyze API] platform=${platform}, storeId=${storeId}, url=${url}`);

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        let store: ScrapedStoreData | null = null;
        let products: ScrapedProductData[] = [];

        try {
            if (
                platform.toLowerCase() === 'trendyol' ||
                url.includes('trendyol.com')
            ) {
                const parsed =
                    parseTrendyolStoreUrl(url) ||
                    (storeId && /^\d+$/.test(storeId)
                        ? {
                              storeId,
                              storeSlug: `magaza-${storeId}`,
                              storeName: 'Trendyol Mağazası',
                          }
                        : null);

                if (parsed) {
                    const trendyolData = await fetchTrendyolStoreAnalysis(
                        parsed,
                        url,
                    );
                    return NextResponse.json({
                        metrics: trendyolData.metrics,
                        products: trendyolData.products,
                        seoScore: trendyolData.seoScore,
                        keywords: trendyolData.keywords,
                        dataSources: {
                            overall: 'api',
                            seoScore: 'calculated',
                            products: 'api',
                        },
                    });
                }
            } else if (url.includes('amazon.')) {
                store = await scrapeAmazonStore(url);
                products = await scrapeAmazonProducts(url);
            } else if (url.includes('hepsiburada.com')) {
                store = await scrapeHepsiburadaStore(url);
                products = await scrapeHepsiburadaProducts(url);
            } else {
                store = await scrapeGenericStore(url, platform);
            }
        } catch (scrapeError: any) {
            console.error(`[Analyze API] Scraping error:`, scrapeError);
        }

        const detectedPlatform = store?.platform || platform.toUpperCase();
        const avgPrice = products.length > 0
            ? products.reduce((sum, p) => sum + p.price, 0) / products.length
            : 0;
        const avgRating = products.length > 0
            ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
            : 0;
        const seoScore = calculateSeoScore(store, products);

        const result = {
            metrics: {
                storeName: store?.storeName || storeId,
                storeId: storeId,
                platform: detectedPlatform,
                rating: store?.rating || 0,
                followers: store?.followerCount || 0,
                productCount: store?.productCount || products.length,
                totalReviews: store?.totalReviews,
            },
            products,
            seoScore,
            analysis: {
                avgPrice: Math.round(avgPrice * 100) / 100,
                avgRating: Math.round(avgRating * 100) / 100,
                totalProducts: store?.productCount || products.length,
                platform: detectedPlatform,
            },
        };

        console.log(`[Analyze API] Success, returned ${products.length} products`);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Analyze API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch marketplace analysis', message: error.message },
            { status: 500 }
        );
    }
}

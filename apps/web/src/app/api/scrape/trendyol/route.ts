export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

interface TrendyolStoreData {
    storeName: string;
    storeId: string;
    rating: number;
    followers: string;
    followersCount: number;
    products: TrendyolProduct[];
    seoScore: number;
    keywords: string[];
    metrics: {
        storeName: string;
        rating: number;
        followers: number;
        monthlyTurnover: number;
        monthlyTraffic: number;
        responseTime: string;
        totalProducts: number;
        titleOptimization: number;
        imageOptimization: number;
        priceCompetitiveness: number;
        stockHealth: number;
        customerSatisfaction: number;
        responseScore: number;
    };
}

interface TrendyolProduct {
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    favorites: string;
    stock: number;
    imageUrl?: string;
    hasDiscount: boolean;
    discountRate?: number;
}

// Trendyol API response types
interface TrendyolApiProduct {
    name?: string;
    title?: string;
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
    };
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('trendyol.com')) {
            return NextResponse.json({ error: 'Geçersiz Trendyol URL\'si' }, { status: 400 });
        }

        // URL'den mağaza bilgilerini çıkar
        const storeInfo = extractStoreInfo(url);

        // Trendyol public API'den veri çek
        const storeData = await fetchTrendyolStoreData(storeInfo);

        return NextResponse.json(storeData);
    } catch (error: any) {
        console.error('Trendyol scrape error:', error);
        return NextResponse.json(
            { error: error.message || 'Mağaza verileri çekilemedi. Lütfen URL\'yi kontrol edin.' },
            { status: 500 }
        );
    }
}

function extractStoreInfo(url: string): { storeName: string; storeSlug: string; storeId: string } {
    try {
        // Example URL: https://www.trendyol.com/magaza/daily-organics-m-1024688
        const match = url.match(/\/magaza\/([^/?]+)/);
        if (match) {
            const fullSlug = match[1];
            const parts = fullSlug.split('-');
            const storeId = parts.pop() || '';
            const mPart = parts.pop(); // Remove 'm' if exists
            const storeSlug = parts.join('-');
            const storeName = storeSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            return { storeName, storeSlug, storeId };
        }
    } catch (e) {
        console.error('Store info extraction error:', e);
    }
    return { storeName: 'Mağaza', storeSlug: 'magaza', storeId: '' };
}

async function fetchTrendyolStoreData(storeInfo: { storeName: string; storeSlug: string; storeId: string }): Promise<TrendyolStoreData> {
    const { storeSlug, storeId } = storeInfo;

    // Trendyol public search API endpoint
    const sellerApiUrl = `https://public.trendyol.com/discovery-web-searchgw-service/v2/api/infinite-scroll/sr?mid=${storeId}&os=1&sk=1&sst=BEST_SELLER&pi=1&culture=tr-TR&userGenderId=1&pId=0&scoringAlgorithmId=2&categoryRelevancyEnabled=false&isLegalRequirementConfirmed=false&searchStrategyType=DEFAULT&productStampType=TypeA`;

    const response = await fetch(sellerApiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'tr-TR,tr;q=0.9',
            'Origin': 'https://www.trendyol.com',
            'Referer': `https://www.trendyol.com/magaza/${storeSlug}-m-${storeId}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Trendyol API hatası: ${response.status}. Mağaza bilgilerine ulaşılamıyor.`);
    }

    const data = await response.json();

    if (!data?.result || !data.result.products || data.result.products.length === 0) {
        throw new Error('Mağaza bulundu ancak ürün listesi boş veya erişilemez durumda.');
    }

    return parseApiResponse(data, storeInfo);
}

function parseApiResponse(data: TrendyolApiResponse, storeInfo: { storeName: string; storeSlug: string; storeId: string }): TrendyolStoreData {
    const products = data?.result?.products || [];
    const totalCount = data?.result?.totalCount || 0;

    // Parse real products
    const parsedProducts: TrendyolProduct[] = products.slice(0, 10).map((p: TrendyolApiProduct) => ({
        name: p.name || p.title || 'İsimsiz Ürün',
        price: p.price?.sellingPrice || p.price?.discountedPrice || p.price?.originalPrice || 0,
        originalPrice: p.price?.originalPrice,
        rating: p.ratingScore?.averageRating || 0,
        reviews: p.ratingScore?.totalRatingCount || 0,
        favorites: formatNumber(p.favoriteCount || 0),
        stock: p.hasStock ? 1 : 0,
        imageUrl: p.images?.[0]?.url,
        hasDiscount: (p.price?.discountedPrice || 0) < (p.price?.originalPrice || 0),
        discountRate: p.price?.discountedPrice && p.price?.originalPrice
            ? Math.round((1 - p.price.discountedPrice / p.price.originalPrice) * 100)
            : 0,
    }));

    // Calculate aggregated metrics from real data
    const activeProducts = parsedProducts.filter(p => p.rating > 0);
    const avgRating = activeProducts.length > 0
        ? activeProducts.reduce((sum, p) => sum + p.rating, 0) / activeProducts.length
        : 0;

    const totalSampleReviews = parsedProducts.reduce((sum, p) => sum + p.reviews, 0);

    const monthlyTurnover = 0;
    const monthlyTraffic = 0;

    // Extract real keywords from product names
    const keywords = extractKeywords(parsedProducts);

    // Calculate SEO score based on real product titles, images, and ratings
    const seoScore = calculateSEOScore(avgRating, totalSampleReviews, totalCount, parsedProducts);

    return {
        storeName: storeInfo.storeName,
        storeId: storeInfo.storeId,
        rating: Math.round(avgRating * 10) / 10,
        followers: formatNumber(0),
        followersCount: 0,
        products: parsedProducts,
        seoScore,
        keywords,
        metrics: {
            storeName: storeInfo.storeName,
            rating: Math.round(avgRating * 10) / 10,
            followers: 0,
            monthlyTurnover,
            monthlyTraffic,
            responseTime: 'Veri yok',
            totalProducts: totalCount,
            titleOptimization: calculateTitleScore(parsedProducts),
            imageOptimization: calculateImageScore(parsedProducts),
            priceCompetitiveness: calculatePriceScore(parsedProducts),
            stockHealth: calculateStockHealth(parsedProducts),
            customerSatisfaction: Math.round(avgRating * 20),
            responseScore: 0,
        },
    };
}

function extractKeywords(products: TrendyolProduct[]): string[] {
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(['ve', 'veya', 'için', '-', 'ile', 'en', 'çok', 'bir', 'bu', 'da', 'de', 'ml', 'gr', 'adet', 'paket', 'set']);

    products.forEach(p => {
        const words = p.name.toLocaleLowerCase('tr-TR')
            .replace(/[^\w\sğüşöçı]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));

        words.forEach(w => {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
        });
    });

    return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

function calculateSEOScore(rating: number, reviews: number, totalProducts: number, products: TrendyolProduct[]): number {
    let score = 50; // Base score

    // Rating contribution (max +20)
    score += (rating / 5) * 20;

    // Review density (max +15)
    const reviewFactor = Math.min(reviews / 5000, 1);
    score += reviewFactor * 15;

    // Product variety (max +10)
    const varietyFactor = Math.min(totalProducts / 100, 1);
    score += varietyFactor * 10;

    // Title optimization contribution (max +5)
    const titleScore = calculateTitleScore(products);
    score += (titleScore / 100) * 5;

    return Math.min(Math.round(score), 99);
}

function calculateTitleScore(products: TrendyolProduct[]): number {
    if (products.length === 0) return 0;

    let totalScore = 0;
    products.forEach(p => {
        let s = 0;
        const len = p.name.length;
        // Ideal title length for Trendyol SEO is 50-100 characters
        if (len >= 50 && len <= 100) s += 40;
        else if (len >= 30 && len <= 150) s += 25;
        else s += 10;

        // Keywords check (sample)
        if (p.name.includes(' ') && p.name.split(' ').length >= 4) s += 30;

        // Brand/Model check (sample)
        if (/[A-Z]/.test(p.name)) s += 30;

        totalScore += s;
    });

    return Math.round(totalScore / products.length);
}

function calculatePriceScore(products: TrendyolProduct[]): number {
    if (products.length === 0) return 0;

    const discountedCount = products.filter(p => p.hasDiscount).length;
    const avgDiscount = products.reduce((s, p) => s + (p.discountRate || 0), 0) / products.length;

    // Having discounts improves price competitiveness score
    return Math.min(Math.round(65 + (discountedCount / products.length) * 20 + avgDiscount / 3), 98);
}

function calculateStockHealth(products: TrendyolProduct[]): number {
    if (products.length === 0) return 0;
    const inStock = products.filter(p => p.stock > 0).length;
    return Math.round((inStock / products.length) * 100);
}

function calculateImageScore(products: TrendyolProduct[]): number {
    if (products.length === 0) return 0;
    const withImage = products.filter(p => Boolean(p.imageUrl)).length;
    return Math.round((withImage / products.length) * 100);
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}B`;
    return num.toString();
}

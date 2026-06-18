import { runStoreAnalysis } from '@/lib/store-analysis';
import { parseTrendyolStoreUrl } from '@/lib/trendyol-store-url';
import { checkAnalyzeRateLimit } from '@/lib/analysis-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function handleScrape(request: NextRequest, platform: 'trendyol' | 'hepsiburada') {
    const rate = await checkAnalyzeRateLimit(request);
    if (!rate.allowed) {
        return NextResponse.json(
            { error: 'RATE_LIMIT', message: 'Çok fazla analiz isteği.' },
            { status: 429 },
        );
    }

    const { url, refresh } = await request.json();
    const domainCheck = platform === 'trendyol' ? 'trendyol.com' : 'hepsiburada.com';
    if (!url || !url.includes(domainCheck)) {
        return NextResponse.json({ error: `Geçersiz ${platform} URL'si` }, { status: 400 });
    }

    let storeId: string | undefined;
    if (platform === 'trendyol') {
        storeId = parseTrendyolStoreUrl(url)?.storeId;
        if (!storeId) {
            return NextResponse.json({ error: 'Mağaza kimliği çözümlenemedi.' }, { status: 400 });
        }
    }

    const analysis = await runStoreAnalysis(url, storeId, { skipCache: Boolean(refresh) });
    return NextResponse.json({
        storeName: analysis.metrics.storeName,
        storeId: analysis.metrics.storeId,
        rating: analysis.metrics.rating,
        followers: String(analysis.metrics.followers),
        followersCount: analysis.metrics.followers,
        products: analysis.products.map((p) => ({
            name: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.reviewCount,
            reviewCount: p.reviewCount,
            stockStatus: p.stockStatus,
            images: p.images,
            imageUrl: p.images[0],
        })),
        seoScore: analysis.seoScore,
        keywords: analysis.keywords,
        metrics: analysis.metrics,
        dataSources: analysis.dataSources,
        confidence: analysis.confidence,
        timestamp: analysis.timestamp,
        analyzedAt: analysis.analyzedAt,
        cached: analysis.cached,
    });
}

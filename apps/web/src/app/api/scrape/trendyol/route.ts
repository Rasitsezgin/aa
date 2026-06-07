export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { parseTrendyolStoreUrl } from '@/lib/trendyol-store-url';
import { fetchTrendyolStoreAnalysis } from '@/lib/trendyol-store-api';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('trendyol.com')) {
            return NextResponse.json({ error: 'Geçersiz Trendyol URL\'si' }, { status: 400 });
        }

        const storeInfo = parseTrendyolStoreUrl(url);
        if (!storeInfo?.storeId) {
            return NextResponse.json(
                { error: 'Trendyol mağaza kimliği URL içinden çözümlenemedi.' },
                { status: 400 },
            );
        }

        const analysis = await fetchTrendyolStoreAnalysis(storeInfo, url);
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
                favorites: '0',
                stock: p.stockStatus ? 1 : 0,
                imageUrl: p.images[0],
                hasDiscount: false,
            })),
            seoScore: analysis.seoScore,
            keywords: analysis.keywords,
            metrics: analysis.metrics,
        });
    } catch (error: unknown) {
        console.error('Trendyol scrape error:', error);
        const message =
            error instanceof Error
                ? error.message
                : 'Mağaza verileri çekilemedi. Lütfen URL\'yi kontrol edin.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

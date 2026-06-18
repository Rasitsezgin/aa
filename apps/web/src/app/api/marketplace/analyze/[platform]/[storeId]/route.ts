export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { runStoreAnalysis } from '@/lib/store-analysis';
import { checkAnalyzeRateLimit } from '@/lib/analysis-rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string; storeId: string }> },
) {
  try {
    const rate = await checkAnalyzeRateLimit(request);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: `Çok fazla analiz isteği. ${rate.retryAfter ?? 60} saniye sonra tekrar deneyin.`,
        },
        { status: 429 },
      );
    }

    const { platform, storeId } = await params;
    const url = request.nextUrl.searchParams.get('url') || '';

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const skipCache = request.nextUrl.searchParams.get('refresh') === '1';

    try {
      if (
        platform.toLowerCase() === 'trendyol' ||
        url.includes('trendyol.com')
      ) {
        const data = await runStoreAnalysis(url, storeId, { skipCache });
        return NextResponse.json(data, {
          headers: {
            'X-RateLimit-Remaining': String(rate.remaining),
            ...(data.cached ? { 'X-Analysis-Cache': 'HIT' } : { 'X-Analysis-Cache': 'MISS' }),
          },
        });
      }

      if (
        platform.toLowerCase() === 'hepsiburada' ||
        url.includes('hepsiburada.com')
      ) {
        const data = await runStoreAnalysis(url, storeId, { skipCache });
        return NextResponse.json(data, {
          headers: {
            'X-RateLimit-Remaining': String(rate.remaining),
            ...(data.cached ? { 'X-Analysis-Cache': 'HIT' } : { 'X-Analysis-Cache': 'MISS' }),
          },
        });
      }

      return NextResponse.json(
        {
          error: 'PREMIUM_REQUIRED',
          message:
            'Bu platform için mağaza analizi premium özelliktir. Trendyol ve Hepsiburada ücretsiz; diğer platformlar için kayıt olun.',
          platform: platform.toUpperCase(),
        },
        { status: 403 },
      );
    } catch (scrapeError: unknown) {
      const message =
        scrapeError instanceof Error ? scrapeError.message : 'Analiz başarısız oldu.';

      if (message === 'PREMIUM_REQUIRED') {
        return NextResponse.json(
          {
            error: 'PREMIUM_REQUIRED',
            message:
              'Bu platform için mağaza analizi premium özelliktir. Lütfen kayıt olun.',
          },
          { status: 403 },
        );
      }

      const isSupported =
        platform.toLowerCase() === 'trendyol' ||
        url.includes('trendyol.com') ||
        platform.toLowerCase() === 'hepsiburada' ||
        url.includes('hepsiburada.com');

      if (isSupported) {
        return NextResponse.json(
          { error: 'Failed to fetch marketplace analysis', message },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { error: 'PREMIUM_REQUIRED', message: 'Lütfen kayıt olun.' },
        { status: 403 },
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analiz başarısız oldu.';
    return NextResponse.json(
      { error: 'Failed to fetch marketplace analysis', message },
      { status: 500 },
    );
  }
}

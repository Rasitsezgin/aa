import { NextResponse } from 'next/server';
import { getPricingCatalog } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
    const catalog = await getPricingCatalog();

    return NextResponse.json(catalog, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
    });
}

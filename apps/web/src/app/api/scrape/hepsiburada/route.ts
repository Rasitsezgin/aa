export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { handleScrape } from '../_shared-scrape';

export async function POST(request: NextRequest) {
    try {
        return await handleScrape(request, 'hepsiburada');
    } catch (error: unknown) {
        console.error('Hepsiburada scrape error:', error);
        const message =
            error instanceof Error
                ? error.message
                : 'Mağaza verileri çekilemedi. Lütfen URL\'yi kontrol edin.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

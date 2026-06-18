export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchRateHistory } from '@/lib/currency/tcmb';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currency = request.nextUrl.searchParams.get('currency') || 'USD';
  const days = parseInt(request.nextUrl.searchParams.get('days') || '7', 10);

  try {
    const history = await fetchRateHistory(currency, Math.min(Math.max(days, 1), 90));
    return NextResponse.json({ currency, days, history });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Geçmiş alınamadı' },
      { status: 500 },
    );
  }
}

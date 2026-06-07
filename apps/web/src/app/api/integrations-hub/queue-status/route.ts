export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function getApiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const normalized = raw.trim();
  if (!normalized) return 'http://localhost:3001';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized.replace(/\/$/, '');
  }
  return `https://${normalized}`.replace(/\/$/, '');
}

/** GET — tenant queue durumu */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerId = req.nextUrl.searchParams.get('providerId');
    if (!providerId) {
      return NextResponse.json({ error: 'providerId zorunlu' }, { status: 400 });
    }

    const base = getApiBaseUrl();
    const qs = `?providerId=${encodeURIComponent(providerId)}`;
    const candidates = [
      `${base}/api/integrations-hub/queue-status${qs}`,
      `${base}/integrations-hub/queue-status${qs}`,
    ];

    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          headers: {
            'x-tenant-id': tenantId,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (response.ok) {
          return NextResponse.json(await response.json());
        }
        if (response.status !== 404) {
          const err = await response.json().catch(() => ({}));
          return NextResponse.json(err, { status: response.status });
        }
      } catch {
        // try next
      }
    }

    return NextResponse.json({ error: 'API erişilemedi' }, { status: 502 });
  } catch (error) {
    console.error('integrations-hub queue-status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

/** POST — sağlayıcı bağlantısı */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const base = getApiBaseUrl();
    const candidates = [
      `${base}/api/integrations-hub/connect`,
      `${base}/integrations-hub/connect`,
    ];

    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': tenantId,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ ...body, tenantId }),
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

    return NextResponse.json({ error: 'Bağlantı kurulamadı' }, { status: 502 });
  } catch (error) {
    console.error('integrations-hub connect error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

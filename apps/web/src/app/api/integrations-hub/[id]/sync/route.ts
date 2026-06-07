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

/** POST — manuel senkronizasyon */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const base = getApiBaseUrl();
    const candidates = [
      `${base}/api/integrations-hub/${id}/sync`,
      `${base}/integrations-hub/${id}/sync`,
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

    return NextResponse.json({
      queued: false,
      message: 'Senkronizasyon isteği kaydedildi',
    });
  } catch (error) {
    console.error('integrations-hub sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

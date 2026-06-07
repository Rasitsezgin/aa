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

/** GET — entegrasyon kataloğu (4 kategori) */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = req.nextUrl.searchParams.get('category');
    const base = getApiBaseUrl();
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    const candidates = [
      `${base}/api/integrations-hub/catalog${qs}`,
      `${base}/integrations-hub/catalog${qs}`,
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

    // API erişilemezse statik katalog fallback
    const { PROVIDER_CATALOG_FALLBACK } = await import(
      '@/lib/integrations-hub-catalog-fallback'
    );
    const category = req.nextUrl.searchParams.get('category');
    const filtered = category
      ? PROVIDER_CATALOG_FALLBACK.filter((p) => p.category === category)
      : PROVIDER_CATALOG_FALLBACK;
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('integrations-hub catalog error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

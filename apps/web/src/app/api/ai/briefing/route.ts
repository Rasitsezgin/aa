export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildApiUrlCandidates } from '@/lib/server-api-url';

export async function GET() {
  const session = await auth();
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId || 'demo-tenant';
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const candidates = buildApiUrlCandidates('/ai/briefing');

  for (const url of candidates) {
    try {
      const response = await fetch(`${url}?tenantId=${encodeURIComponent(tenantId)}`, {
        headers: {
          'x-tenant-id': tenantId,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      if (response.status !== 404) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({
            message: 'Günlük brifing şu an kullanılamıyor.',
            stats: { revenue: 0, orders: 0, stockAlerts: 0 },
            fallback: true,
          });
        }
        return NextResponse.json(
          { error: `Backend error: ${response.status}` },
          { status: response.status },
        );
      }
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json({
    message: 'Günlük brifing şu an kullanılamıyor.',
    stats: { revenue: 0, orders: 0, stockAlerts: 0 },
    fallback: true,
  });
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const normalized = raw.trim();
  if (!normalized) return 'http://localhost:3001';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized.replace(/\/$/, '');
  }
  if (normalized.startsWith('/')) return normalized.replace(/\/$/, '');
  return `https://${normalized}`.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.text();
  const base = getApiBaseUrl();
  const candidates = [
    `${base}/api/ai/copilot/suggestions`,
    `${base}/ai/copilot/suggestions`,
    `${base}/api/v1/ai/copilot/suggestions`,
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
        body: payload,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      if (response.status !== 404) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({ suggestions: [], fallback: true });
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

  return NextResponse.json({ suggestions: [], fallback: true });
}

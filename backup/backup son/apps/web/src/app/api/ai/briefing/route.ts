import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const normalized = raw.trim();
  if (!normalized) return 'http://localhost:3001';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized.replace(/\/$/, '');
  if (normalized.startsWith('/')) return normalized.replace(/\/$/, '');
  return `https://${normalized}`.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const base = getApiBaseUrl();
  const candidates = [
    `${base}/ai/briefing`,
    `${base}/api/ai/briefing`,
    `${base}/api/v1/ai/briefing`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: {
          'x-tenant-id': request.headers.get('x-tenant-id') || 'default',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      if (response.status !== 404) {
        return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status });
      }
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json(
    { error: 'Briefing verisi backend tarafindan saglanamadi' },
    { status: 502 }
  );
}

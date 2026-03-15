import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const normalized = raw.trim();
  if (!normalized) return 'http://localhost:3001';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized.replace(/\/$/, '');
  if (normalized.startsWith('/')) return normalized.replace(/\/$/, '');
  return `https://${normalized}`.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const base = getApiBaseUrl();
  const candidates = [
    `${base}/ai/copilot/chat`,
    `${base}/api/ai/copilot/chat`,
    `${base}/api/v1/ai/copilot/chat`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': request.headers.get('x-tenant-id') || 'default',
        },
        body: payload,
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
    { error: 'Copilot chat backend tarafinda kullanilamiyor' },
    { status: 502 }
  );
}

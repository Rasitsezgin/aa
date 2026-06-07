export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchFromApi } from '@/lib/server-api-url';

export async function POST(request: NextRequest) {
  const session = await auth();
  const sessionTenantId = (session?.user as { tenantId?: string } | undefined)
    ?.tenantId;
  const tenantId =
    sessionTenantId || request.headers.get('x-tenant-id') || undefined;
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.text();

  const backend = await fetchFromApi<{ message: string; type?: string }>(
    '/ai/copilot/quick-action',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: payload,
    },
  );

  if (backend.ok && backend.data) {
    return NextResponse.json(backend.data);
  }

  return NextResponse.json({
    message:
      'Bu aksiyon şu an çalıştırılamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
    role: 'assistant',
    fallback: true,
  });
}

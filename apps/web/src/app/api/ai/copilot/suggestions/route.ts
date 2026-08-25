export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchFromApi } from '@/lib/server-api-url';
import { getDefaultCopilotSuggestions } from '@/lib/copilot-local';

export async function POST(request: NextRequest) {
  const session = await auth();
  const sessionTenantId = (session?.user as { tenantId?: string } | undefined)
    ?.tenantId;
  const tenantId =
    sessionTenantId || request.headers.get('x-tenant-id') || undefined;
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const body = (await request.json().catch(() => ({}))) as {
    currentPage?: string;
    context?: string;
  };

  if (!tenantId) {
    return NextResponse.json({
      suggestions: getDefaultCopilotSuggestions(body.currentPage),
      fallback: true,
    });
  }

  const backend = await fetchFromApi<{ suggestions?: string[] }>(
    '/ai/copilot/suggestions',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    },
  );

  if (backend.ok && backend.data?.suggestions?.length) {
    return NextResponse.json(backend.data);
  }

  return NextResponse.json({
    suggestions: getDefaultCopilotSuggestions(body.currentPage),
    fallback: true,
  });
}

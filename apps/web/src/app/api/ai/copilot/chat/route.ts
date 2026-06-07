export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchFromApi } from '@/lib/server-api-url';
import { generateGeminiChatResponse } from '@/lib/gemini-chat';
import {
  buildFollowUpSuggestions,
  COPILOT_SYSTEM_PROMPT,
} from '@/lib/copilot-local';

interface ChatBody {
  message?: string;
  history?: Array<{ role: string; content: string }>;
  context?: string;
}

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

  const body = (await request.json()) as ChatBody;
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const history = (body.history || []).map((item) => ({
    role: item.role as 'user' | 'assistant',
    content: item.content,
  }));

  const backend = await fetchFromApi<{
    message: string;
    suggestions?: string[];
    type?: string;
    credits?: unknown;
  }>('/ai/copilot/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-tenant-id': tenantId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      message,
      history,
      context: body.context,
    }),
  });

  if (backend.ok && backend.data?.message) {
    return NextResponse.json(backend.data);
  }

  const contextSuffix = body.context ? `\n\nKullanıcı şu sayfada: ${body.context}` : '';
  const geminiText = await generateGeminiChatResponse(
    `${COPILOT_SYSTEM_PROMPT}${contextSuffix}`,
    message,
    history,
  );

  if (geminiText) {
    return NextResponse.json({
      message: geminiText,
      role: 'assistant',
      suggestions: buildFollowUpSuggestions(geminiText),
      timestamp: new Date().toISOString(),
      source: 'gemini-direct',
    });
  }

  return NextResponse.json({
    message:
      'Yapay zeka şu an yanıt veremiyor. Lütfen biraz sonra tekrar deneyin veya yöneticinize GEMINI_API_KEY ayarını kontrol ettirin.',
    role: 'assistant',
    suggestions: [],
    timestamp: new Date().toISOString(),
  });
}

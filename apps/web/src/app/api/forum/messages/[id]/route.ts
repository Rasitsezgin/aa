export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import {
  getConversationForUser,
  getConversationMessages,
  sendPrivateMessage,
} from '@/lib/forum-messages';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [conversation, messages] = await Promise.all([
      getConversationForUser(id, authContext.profile.id),
      getConversationMessages(id, authContext.profile.id, page),
    ]);

    if (!conversation || !messages) {
      return NextResponse.json({ error: 'Sohbet bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ conversation, ...messages });
  } catch (error) {
    console.error('Forum conversation fetch error:', error);
    return NextResponse.json({ error: 'Sohbet yüklenemedi' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const content = body.content as string;

    const message = await sendPrivateMessage(id, authContext.profile.id, content);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mesaj gönderilemedi';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

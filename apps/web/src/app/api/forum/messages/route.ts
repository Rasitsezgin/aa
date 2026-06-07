export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import {
  getOrCreateDirectConversation,
  getUnreadMessageCount,
  listUserConversations,
} from '@/lib/forum-messages';

export async function GET() {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const [conversations, unreadCount] = await Promise.all([
      listUserConversations(authContext.profile.id),
      getUnreadMessageCount(authContext.profile.id),
    ]);

    return NextResponse.json({ conversations, unreadCount });
  } catch (error) {
    console.error('Forum messages list error:', error);
    return NextResponse.json({ error: 'Mesajlar yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const recipientId = body.recipientId as string;
    if (!recipientId) {
      return NextResponse.json({ error: 'Alıcı belirtilmeli' }, { status: 400 });
    }

    const conversationId = await getOrCreateDirectConversation(
      authContext.profile.id,
      recipientId,
    );

    return NextResponse.json({ conversationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sohbet oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

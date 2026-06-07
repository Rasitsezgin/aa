export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { blockForumUser, unblockForumUser } from '@/lib/forum-social';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Engellemek için giriş yapmalısınız' }, { status: 401 });
    }

    const { id: targetId } = await params;
    const body = await request.json().catch(() => ({}));
    await blockForumUser(authContext.profile.id, targetId, body.reason);
    return NextResponse.json({ success: true, isBlocked: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Engelleme başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id: targetId } = await params;
    await unblockForumUser(authContext.profile.id, targetId);
    return NextResponse.json({ success: true, isBlocked: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Engel kaldırma başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

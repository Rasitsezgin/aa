export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { followForumUser, unfollowForumUser } from '@/lib/forum-social';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Takip için giriş yapmalısınız' }, { status: 401 });
    }

    const { id: targetId } = await params;
    await followForumUser(authContext.profile.id, targetId);
    return NextResponse.json({ success: true, isFollowing: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Takip işlemi başarısız';
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
    await unfollowForumUser(authContext.profile.id, targetId);
    return NextResponse.json({ success: true, isFollowing: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Takibi bırakma başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

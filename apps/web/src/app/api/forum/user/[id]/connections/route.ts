export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getForumUserPublicProfile } from '@/lib/forum-server';
import { listForumFollowers, listForumFollowing } from '@/lib/forum-social';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'following' ? 'following' : 'followers';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const profile = await getForumUserPublicProfile(id);
    if (!profile) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const data = type === 'following'
      ? await listForumFollowing(id, page, limit)
      : await listForumFollowers(id, page, limit);

    return NextResponse.json({
      type,
      profile: { id: profile.id, name: profile.name },
      ...data,
    });
  } catch (error) {
    console.error('Forum connections error:', error);
    return NextResponse.json({ error: 'Liste yüklenemedi' }, { status: 500 });
  }
}

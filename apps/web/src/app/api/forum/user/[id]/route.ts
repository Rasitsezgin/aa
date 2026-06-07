export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile, getForumUserPublicProfile } from '@/lib/forum-server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authContext = await getAuthenticatedForumProfile();
    const profile = await getForumUserPublicProfile(id, authContext?.profile.id);

    if (!profile) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Forum user profile fetch error:', error);
    return NextResponse.json({ error: 'Profil yüklenirken hata oluştu' }, { status: 500 });
  }
}

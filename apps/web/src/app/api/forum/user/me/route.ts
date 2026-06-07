export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile, getForumUserPublicProfile } from '@/lib/forum-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const profile = await getForumUserPublicProfile(authContext.profile.id, authContext.profile.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Forum me profile error:', error);
    return NextResponse.json({ error: 'Profil yüklenemedi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const about = typeof body.about === 'string' ? body.about.trim().slice(0, 1000) : undefined;
    const location = typeof body.location === 'string' ? body.location.trim().slice(0, 100) : undefined;
    const website = typeof body.website === 'string' ? body.website.trim().slice(0, 200) : undefined;
    const signature = typeof body.signature === 'string' ? body.signature.trim().slice(0, 500) : undefined;

    await prisma.forumUserProfile.update({
      where: { id: authContext.profile.id },
      data: {
        ...(about !== undefined && { about: about || null }),
        ...(location !== undefined && { location: location || null }),
        ...(website !== undefined && { website: website || null }),
        ...(signature !== undefined && { signature: signature || null }),
        lastActivityAt: new Date(),
      },
    });

    const profile = await getForumUserPublicProfile(authContext.profile.id, authContext.profile.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Forum profile update error:', error);
    return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 });
  }
}

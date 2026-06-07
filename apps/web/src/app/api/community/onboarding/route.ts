export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureForumProfile } from '@/lib/forum-server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({
        isAuthenticated: false,
        profileId: null,
        steps: [
          { id: 'signup', label: 'Hesap oluştur', completed: false, href: '/signup' },
          { id: 'topic', label: 'İlk konunu aç', completed: false, href: '/signup?callbackUrl=/forum/new-topic' },
          { id: 'profile', label: 'Profilini tamamla', completed: false, href: '/signup?callbackUrl=/dashboard/settings/profile' },
          { id: 'reply', label: 'Bir tartışmaya yanıt ver', completed: false, href: '/forum' },
        ],
        completedCount: 0,
        totalCount: 4,
        isComplete: false,
      });
    }

    const profile = await ensureForumProfile(userId);

    const profileComplete = Boolean(
      profile.avatarUrl?.trim() ||
        profile.about?.trim() ||
        profile.location?.trim() ||
        profile.occupation?.trim(),
    );

    const hasTopic = profile.topicCount >= 1;
    const hasReply = profile.postCount > profile.topicCount;

    const steps = [
      { id: 'signup', label: 'Hesap oluştur', completed: true, href: '/dashboard' },
      {
        id: 'topic',
        label: 'İlk konunu aç',
        completed: hasTopic,
        href: '/forum/new-topic',
      },
      {
        id: 'profile',
        label: 'Profilini tamamla',
        completed: profileComplete,
        href: '/dashboard/settings/profile',
      },
      {
        id: 'reply',
        label: 'Bir tartışmaya yanıt ver',
        completed: hasReply,
        href: '/forum',
      },
    ];

    const completedCount = steps.filter((s) => s.completed).length;

    return NextResponse.json({
      isAuthenticated: true,
      profileId: profile.id,
      steps,
      completedCount,
      totalCount: steps.length,
      isComplete: completedCount === steps.length,
    });
  } catch (error) {
    console.error('Community onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 },
    );
  }
}

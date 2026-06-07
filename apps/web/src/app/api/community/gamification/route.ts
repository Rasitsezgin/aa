export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { getGamificationSummary } from '@/lib/forum-gamification';

export async function GET() {
  try {
    const authContext = await getAuthenticatedForumProfile();

    if (!authContext) {
      return NextResponse.json({
        isAuthenticated: false,
        level: null,
        quests: [],
        badges: [],
        marketplaceBadges: [],
      });
    }

    const summary = await getGamificationSummary(authContext.profile.id, true);

    return NextResponse.json({
      isAuthenticated: true,
      profileId: authContext.profile.id,
      ...summary,
    });
  } catch (error) {
    console.error('Community gamification error:', error);
    return NextResponse.json(
      { error: 'Gamification verisi alınamadı' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/forum-notification-prefs';

export async function GET() {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const preferences = await getNotificationPreferences(authContext.profile.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Notification prefs GET error:', error);
    return NextResponse.json({ error: 'Tercihler yüklenemedi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    await updateNotificationPreferences(authContext.profile.id, body);
    const preferences = await getNotificationPreferences(authContext.profile.id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Notification prefs PATCH error:', error);
    return NextResponse.json({ error: 'Tercihler kaydedilemedi' }, { status: 500 });
  }
}

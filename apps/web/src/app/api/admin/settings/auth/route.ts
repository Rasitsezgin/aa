import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getStringSettings } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

const AUTH_KEYS = ['google_id', 'google_secret', 'facebook_id', 'facebook_secret'];

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const settings = await getStringSettings(AUTH_KEYS);
  return NextResponse.json({ settings });
}

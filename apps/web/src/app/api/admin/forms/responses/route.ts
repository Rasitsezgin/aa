import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const responses = await getJsonSetting('form_responses', []);
  return NextResponse.json({ responses });
}

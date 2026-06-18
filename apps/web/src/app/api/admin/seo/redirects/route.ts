export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';

const REDIRECTS: Array<{
  id: string;
  source: string;
  destination: string;
  type: string;
  hits: number;
  lastHit: string;
  active: boolean;
}> = [
  {
    id: '1',
    source: '/register',
    destination: '/signup',
    type: '301',
    hits: 0,
    lastHit: new Date().toISOString(),
    active: true,
  },
];

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;
  return NextResponse.json({ redirects: REDIRECTS });
}

export async function POST() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;
  return NextResponse.json({ success: true, message: 'Yönlendirme kaydı eklendi (statik liste)' });
}

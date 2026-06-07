export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

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
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ redirects: REDIRECTS });
}

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ success: true, message: 'Yönlendirme kaydı eklendi (statik liste)' });
}

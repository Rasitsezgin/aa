export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: 'Sitemap Next.js tarafından dinamik üretiliyor (/sitemap.xml).',
    regeneratedAt: new Date().toISOString(),
  });
}

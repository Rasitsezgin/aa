export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllSeoPages } from '@/lib/seo/seo-admin-service';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pages = await getAllSeoPages();
  return NextResponse.json({ pages });
}

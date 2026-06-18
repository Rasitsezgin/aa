export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getAllSeoPages } from '@/lib/seo/seo-admin-service';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const pages = await getAllSeoPages();
  return NextResponse.json({ pages });
}

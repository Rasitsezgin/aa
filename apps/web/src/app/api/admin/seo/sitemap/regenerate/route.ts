export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';

export async function POST() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  return NextResponse.json({
    success: true,
    message: 'Sitemap Next.js tarafından dinamik üretiliyor (/sitemap.xml).',
    regeneratedAt: new Date().toISOString(),
  });
}

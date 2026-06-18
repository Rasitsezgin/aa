import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    take: 500,
  });

  return NextResponse.json({ permissions });
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const actorId = session?.user?.id;
    if (!tenantId || !actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { type: true, role: { select: { name: true } } },
    });
    const isAdmin =
      actor?.type === 'ADMIN' ||
      actor?.type === 'SUPERADMIN' ||
      actor?.role?.name === 'Yönetici';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const body = (await request.json()) as { roleId?: string };
    if (!body.roleId) {
      return NextResponse.json({ error: 'roleId gerekli' }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!target) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roleId: body.roleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team role PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

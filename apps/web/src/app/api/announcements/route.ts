export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) {
      return NextResponse.json([]);
    }

    const now = new Date();
    const planTarget =
      tenant.plan === 'ENTERPRISE'
        ? 'ENTERPRISE_USERS'
        : tenant.plan === 'PRO'
          ? 'PRO_USERS'
          : 'FREE_USERS';

    const rows = await prisma.announcement.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        target: { in: ['ALL', planTarget] },
      },
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    const reads = await prisma.announcementRead.findMany({
      where: { tenantId },
      select: { announcementId: true, isRead: true, isDismissed: true },
    });
    const readMap = new Map(reads.map((r) => [r.announcementId, r]));

    return NextResponse.json(
      rows.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        summary: a.summary,
        type: a.type,
        icon: a.icon,
        color: a.color,
        actionUrl: a.actionUrl,
        actionText: a.actionText,
        isPinned: a.isPinned,
        isActive: a.isActive,
        isRead: readMap.get(a.id)?.isRead ?? false,
        isDismissed: readMap.get(a.id)?.isDismissed ?? false,
        startsAt: a.startsAt.toISOString(),
        endsAt: a.endsAt?.toISOString(),
      })),
    );
  } catch (error) {
    console.error('Announcements error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

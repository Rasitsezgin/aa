export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    const userId = session?.user?.id;
    if (!tenantId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user, logs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true },
      }),
      prisma.activityLog.findMany({
        where: {
          tenantId,
          OR: [
            { action: { contains: 'login' } },
            { action: { contains: 'security' } },
            { action: { contains: 'auth' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, action: true, createdAt: true, details: true, ipAddress: true },
      }),
    ]);

    const alerts = logs.map((log) => {
      const action = log.action.toLowerCase();
      const type = action.includes('fail') || action.includes('denied') ? 'warning' : 'info';
      return {
        id: log.id,
        type,
        message: log.action.replace(/\./g, ' '),
        date: log.createdAt.toLocaleString('tr-TR'),
        ip: log.ipAddress,
      };
    });

    return NextResponse.json({
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
      alerts,
    });
  } catch (error) {
    console.error('Security alerts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_PREFS = {
  orders: { email: true, push: true },
  stock: { email: true, push: true },
  sync: { email: true, push: false },
  marketing: { email: false, push: false },
};

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { config: true },
    });

    const config = (settings?.config as Record<string, unknown>) || {};
    const stored = config.notificationPrefs as typeof DEFAULT_PREFS | undefined;

    return NextResponse.json(stored || DEFAULT_PREFS);
  } catch (error) {
    console.error('Notification prefs GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = await request.json();

    const existing = await prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { config: true },
    });

    const config = (existing?.config as Record<string, unknown>) || {};
    const nextConfig = { ...config, notificationPrefs: prefs };

    if (existing) {
      await prisma.tenantSettings.update({
        where: { tenantId },
        data: { config: nextConfig },
      });
    } else {
      await prisma.tenantSettings.create({
        data: { tenantId, config: nextConfig },
      });
    }

    return NextResponse.json({ success: true, prefs });
  } catch (error) {
    console.error('Notification prefs PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

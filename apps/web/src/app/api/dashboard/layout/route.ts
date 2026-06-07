export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_DASHBOARD_WIDGETS } from '@/lib/dashboard-layout';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layout = await prisma.dashboardLayout.findUnique({
      where: { tenantId_userId_name: { tenantId, userId, name: 'default' } },
    });

    const widgets = (layout?.layout as { widgets?: unknown })?.widgets
      || layout?.widgets
      || layout?.layout;

    if (Array.isArray(widgets) && widgets.length > 0) {
      return NextResponse.json({ widgets });
    }

    return NextResponse.json({ widgets: DEFAULT_DASHBOARD_WIDGETS });
  } catch (error) {
    console.error('Dashboard layout GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { widgets?: unknown[] };
    const widgets = body.widgets || [];

    await prisma.dashboardLayout.upsert({
      where: { tenantId_userId_name: { tenantId, userId, name: 'default' } },
      create: {
        tenantId,
        userId,
        name: 'default',
        layout: { widgets },
        widgets,
        isDefault: true,
      },
      update: {
        layout: { widgets },
        widgets,
      },
    });

    return NextResponse.json({ success: true, widgets });
  } catch (error) {
    console.error('Dashboard layout POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

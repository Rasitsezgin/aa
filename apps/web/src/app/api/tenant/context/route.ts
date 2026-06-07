export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [tenant, user, tenantModules, integrations, orderGroups, settings, criticalStock] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, plan: true, status: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { type: true, role: { select: { name: true } } },
      }),
      prisma.tenantModule.findMany({
        where: { tenantId, isEnabled: true },
        include: { module: { select: { key: true } } },
      }),
      prisma.integration.findMany({
        where: { tenantId },
        select: { id: true, platform: true, isActive: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),
      prisma.tenantSettings.findUnique({ where: { tenantId }, select: { config: true } }),
      prisma.product.count({ where: { tenantId, stock: { lt: 5 } } }),
    ]);

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    let enabledModules = tenantModules.map((tm) => tm.module.key);

    if (enabledModules.length === 0) {
      const planOrder = ['FREE', 'PRO', 'ENTERPRISE'] as const;
      const planIndex = planOrder.indexOf(tenant.plan as (typeof planOrder)[number]);
      const accessiblePlans = planOrder.slice(0, Math.max(planIndex + 1, 1));
      const fallbackModules = await prisma.systemModule.findMany({
        where: {
          isActive: true,
          OR: [{ isCore: true }, { requiredPlan: { in: accessiblePlans as unknown as string[] } }],
        },
        select: { key: true },
      });
      enabledModules = fallbackModules.map((m) => m.key);
    }

    const config = (settings?.config as Record<string, unknown>) || {};
    const storedCredits = config.aiCredits as { used?: number; limit?: number } | undefined;
    const creditLimits: Record<string, number> = { FREE: 50, PRO: 200, ENTERPRISE: 1000 };
    const aiCredits = {
      used: storedCredits?.used ?? 0,
      limit: storedCredits?.limit ?? creditLimits[tenant.plan] ?? 200,
    };

    const orderPipeline = orderGroups.reduce(
      (acc, row) => {
        acc[row.status] = row._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      tenantId,
      plan: tenant.plan,
      tenantName: tenant.name,
      tenantStatus: tenant.status,
      userType: user?.type ?? 'USER',
      roleName: user?.role?.name ?? user?.type ?? 'USER',
      enabledModules,
      aiCredits,
      integrations: integrations.map((i) => ({
        id: i.id,
        platform: i.platform,
        isActive: i.isActive,
        lastSync: i.updatedAt.toISOString(),
        status: i.isActive ? 'connected' : 'disconnected',
      })),
      orderPipeline,
      criticalStockCount: criticalStock,
    });
  } catch (error) {
    console.error('Tenant context error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

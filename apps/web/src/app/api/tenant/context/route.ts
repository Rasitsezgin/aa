export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Plan } from '@pazaryonetimi/database';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Tenant context partial query failed:', error);
    return fallback;
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    let tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;

    if (!userId) {
      return NextResponse.json({
        tenantId: 'guest-tenant',
        plan: 'PRO',
        tenantName: 'Pazar Yönetimi',
        tenantStatus: 'ACTIVE',
        userType: 'USER',
        roleName: 'USER',
        enabledModules: [
          'DASHBOARD', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'CUSTOMERS', 'SHIPPING',
          'FINANCE', 'PAYMENTS', 'PRICING_ENGINE', 'COMPETITOR_ANALYSIS', 'CAMPAIGNS',
          'AI_ADVISOR', 'AI_SEO', 'BULK_ACTIONS', 'INTEGRATIONS', 'STORE_MANAGEMENT',
          'SECURITY', 'FINANCIAL_REPORTS', 'SETTINGS'
        ],
        aiCredits: { used: 0, limit: 200 },
        integrations: [],
        orderPipeline: {},
        criticalStockCount: 0,
        fallback: true,
      });
    }

    if (!tenantId) {
      const dbUser = await safeQuery(
        () => prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true, email: true, name: true } }),
        null,
      );
      if (dbUser?.tenantId) {
        tenantId = dbUser.tenantId;
      } else {
        const fallbackTenant = await safeQuery(
          () => prisma.tenant.findFirst({ select: { id: true } }),
          null,
        );
        tenantId = fallbackTenant?.id || 'demo-tenant';
      }
    }

    const tenant = await safeQuery(
      () =>
        prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, name: true, plan: true, status: true },
        }),
      null,
    );

    if (!tenant) {
      return NextResponse.json({
        tenantId,
        plan: 'FREE',
        tenantName: 'Mağazam',
        tenantStatus: 'ACTIVE',
        userType: 'USER',
        roleName: 'USER',
        enabledModules: ['DASHBOARD', 'ORDERS', 'PRODUCTS', 'INTEGRATIONS', 'ANALYTICS'],
        aiCredits: { used: 0, limit: 50 },
        integrations: [],
        orderPipeline: {},
        criticalStockCount: 0,
        fallback: true,
      });
    }

    const [user, tenantModules, integrations, orderGroups, settings, criticalStock] =
      await Promise.all([
        safeQuery(
          () =>
            prisma.user.findUnique({
              where: { id: userId },
              select: { type: true, role: { select: { name: true } } },
            }),
          null,
        ),
        safeQuery(
          () =>
            prisma.tenantModule.findMany({
              where: { tenantId, isEnabled: true },
              include: { module: { select: { key: true } } },
            }),
          [],
        ),
        safeQuery(
          () =>
            prisma.integration.findMany({
              where: { tenantId },
              select: { id: true, platform: true, isActive: true, updatedAt: true },
              orderBy: { updatedAt: 'desc' },
            }),
          [],
        ),
        safeQuery(
          () =>
            prisma.order.groupBy({
              by: ['status'],
              where: { tenantId },
              _count: { status: true },
            }),
          [],
        ),
        safeQuery(
          () =>
            prisma.tenantSettings.findUnique({
              where: { tenantId },
              select: { config: true },
            }),
          null,
        ),
        safeQuery(
          () => prisma.product.count({ where: { tenantId, stock: { lt: 5 } } }),
          0,
        ),
      ]);

    let enabledModules = tenantModules.map((tm) => tm.module.key);

    if (enabledModules.length === 0) {
      const planOrder: Plan[] = [Plan.FREE, Plan.PRO, Plan.ENTERPRISE];
      const planIndex = planOrder.indexOf(tenant.plan);
      const accessiblePlans = planOrder.slice(0, Math.max(planIndex + 1, 1));

      const fallbackModules = await safeQuery(
        () =>
          prisma.systemModule.findMany({
            where: {
              isActive: true,
              OR: [
                { isCore: true },
                { requiredPlan: { in: accessiblePlans } },
              ],
            },
            select: { key: true },
          }),
        [],
      );
      enabledModules = fallbackModules.map((m) => m.key);
    }

    if (enabledModules.length === 0) {
      enabledModules = [
        'DASHBOARD',
        'ORDERS',
        'PRODUCTS',
        'INVENTORY',
        'INTEGRATIONS',
        'ANALYTICS',
      ];
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
    return NextResponse.json({
      tenantId: '',
      plan: 'FREE',
      tenantName: 'Mağazam',
      enabledModules: ['DASHBOARD', 'ORDERS', 'PRODUCTS', 'INTEGRATIONS'],
      aiCredits: { used: 0, limit: 50 },
      integrations: [],
      orderPipeline: {},
      criticalStockCount: 0,
      fallback: true,
    });
  }
}

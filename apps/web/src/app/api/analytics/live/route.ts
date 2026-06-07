export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function hourLabel(date: Date) {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [
      todayOrders,
      yesterdayOrders,
      pendingOrders,
      lowStock,
      activeProducts,
      customerCount,
      returnsToday,
      platformGroups,
      recentActivity,
      hourlyRaw,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId, orderDate: { gte: todayStart }, status: { not: 'CANCELLED' } },
        select: { totalAmount: true, orderDate: true },
      }),
      prisma.order.aggregate({
        where: { tenantId, orderDate: { gte: yesterdayStart, lt: todayStart }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.order.count({ where: { tenantId, status: { in: ['PENDING', 'PROCESSING', 'AWAITING_PAYMENT'] } } }),
      prisma.product.count({ where: { tenantId, stock: { lt: 5 } } }),
      prisma.product.count({ where: { tenantId, status: 'active' } }),
      prisma.customer.count({ where: { tenantId } }),
      prisma.return.count({ where: { tenantId, createdAt: { gte: todayStart } } }),
      prisma.order.groupBy({
        by: ['platform'],
        where: { tenantId, orderDate: { gte: todayStart }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.activityLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, action: true, resource: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { tenantId, orderDate: { gte: todayStart }, status: { not: 'CANCELLED' } },
        select: { orderDate: true },
      }),
    ]);

    const revenue = todayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const orders = todayOrders.length;
    const yesterdayRevenue = Number(yesterdayOrders._sum.totalAmount || 0);
    const yesterdayCount = yesterdayOrders._count.id;
    const revenueTrend = yesterdayRevenue > 0 ? Math.round(((revenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;
    const ordersTrend = yesterdayCount > 0 ? Math.round(((orders - yesterdayCount) / yesterdayCount) * 100) : 0;
    const avgOrderValue = orders > 0 ? Math.round(revenue / orders) : 0;
    const returnRate = orders > 0 ? Math.round((returnsToday / orders) * 100) : 0;

    const buckets = Array.from({ length: 12 }, (_, i) => {
      const h = new Date(todayStart);
      h.setHours(8 + i, 0, 0, 0);
      return { label: hourLabel(h), value: 0 };
    });
    for (const o of hourlyRaw) {
      const h = o.orderDate.getHours();
      const idx = Math.min(11, Math.max(0, h - 8));
      buckets[idx].value += 1;
    }

    const revenueHistory = buckets.map((b) => b.value * (avgOrderValue || 1));

    // Oturum tahmini: sipariş başına ~3.5 oturum (gerçek ziyaretçi verisi yok)
    const sessionMultiplier = 3.5;
    const estimatedSessions =
      orders > 0
        ? Math.round(orders * sessionMultiplier)
        : Math.max(customerCount, 0);
    const conversionRate =
      estimatedSessions > 0
        ? Math.round((orders / estimatedSessions) * 1000) / 10
        : 0;

    return NextResponse.json({
      data: {
        revenue,
        revenueTrend,
        revenueHistory,
        orders,
        ordersTrend,
        ordersHistory: buckets.map((b) => b.value),
        visitors: estimatedSessions,
        visitorsLabel: 'Tahmini oturum',
        visitorsTrend: ordersTrend,
        visitorsHistory: buckets.map((b) =>
          Math.round(b.value * sessionMultiplier),
        ),
        metricsSource: 'order_derived',
        conversionRate,
        conversionTrend: 0,
        avgOrderValue,
        aovTrend: revenueTrend,
        pendingOrders,
        lowStock,
        activeProducts,
        customerCount,
        customerTrend: 0,
        returnRate,
        returnTrend: 0,
        platforms: platformGroups.map((p) => ({
          name: p.platform,
          logo: p.platform.slice(0, 2),
          orders: p._count.id,
          revenue: Number(p._sum.totalAmount || 0),
          trend: ordersTrend,
        })),
        hourlyOrders: buckets,
        activities: recentActivity.map((a) => ({
          id: a.id,
          type: a.resource,
          text: a.action,
          time: a.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        })),
      },
    });
  } catch (error) {
    console.error('Live analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

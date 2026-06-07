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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [tenant, orders, products, integrations] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, plan: true } }),
      prisma.order.findMany({
        where: { tenantId, orderDate: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
        select: { orderNumber: true, totalAmount: true, status: true, platform: true, orderDate: true },
        orderBy: { orderDate: 'desc' },
        take: 500,
      }),
      prisma.product.count({ where: { tenantId } }),
      prisma.integration.count({ where: { tenantId, isActive: true } }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const lines = [
      'Pazar Yönetimi — Dashboard Özeti',
      `Mağaza,${tenant?.name || '-'}`,
      `Plan,${tenant?.plan || '-'}`,
      `Dönem,Son 30 gün`,
      `Toplam Ciro,${totalRevenue.toFixed(2)}`,
      `Sipariş Sayısı,${orders.length}`,
      `Aktif Ürün,${products}`,
      `Aktif Entegrasyon,${integrations}`,
      '',
      'Sipariş No,Tutar,Durum,Platform,Tarih',
      ...orders.map((o) =>
        [
          o.orderNumber || '-',
          Number(o.totalAmount).toFixed(2),
          o.status,
          o.platform,
          o.orderDate.toISOString().slice(0, 10),
        ].join(','),
      ),
    ];

    const csv = '\uFEFF' + lines.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dashboard-ozet-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Dashboard export error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

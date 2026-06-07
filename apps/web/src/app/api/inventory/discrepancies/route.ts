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

    const products = await prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        sku: true,
        title: true,
        stock: true,
        marketplaceLinks: {
          select: {
            id: true,
            platform: true,
            stock: true,
            lastSyncAt: true,
          },
        },
      },
      take: 500,
    });

    const discrepancies: Array<{
      id: string;
      sku: string;
      name: string;
      localStock: number;
      marketStock: number;
      marketplace: string;
      status: 'critical' | 'warning' | 'synced';
      lastSyncAt: string | null;
    }> = [];

    for (const product of products) {
      for (const link of product.marketplaceLinks) {
        const diff = Math.abs(product.stock - link.stock);
        let status: 'critical' | 'warning' | 'synced' = 'synced';
        if (diff > 5 || (product.stock === 0 && link.stock > 0) || (product.stock > 0 && link.stock === 0)) {
          status = 'critical';
        } else if (diff > 0) {
          status = 'warning';
        }

        if (status !== 'synced') {
          discrepancies.push({
            id: `${product.id}-${link.id}`,
            sku: product.sku,
            name: product.title,
            localStock: product.stock,
            marketStock: link.stock,
            marketplace: link.platform,
            status,
            lastSyncAt: link.lastSyncAt?.toISOString() || null,
          });
        }
      }
    }

    const lastScan = await prisma.activityLog.findFirst({
      where: { tenantId, action: 'inventory.discrepancy.scan' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return NextResponse.json({
      items: discrepancies.sort((a, b) => (a.status === 'critical' ? -1 : 1)),
      lastScan: lastScan?.createdAt.toISOString() || null,
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Discrepancies GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.activityLog.create({
      data: {
        tenantId,
        userId: session?.user?.id,
        action: 'inventory.discrepancy.scan',
        resource: 'inventory',
        details: { triggeredAt: new Date().toISOString() },
      },
    });

    const res = await GET();
    return res;
  } catch (error) {
    console.error('Discrepancies POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

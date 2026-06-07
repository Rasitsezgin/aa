export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type SkuGroupInput = {
  masterSku: string;
  masterStock: number;
  variantIds: string[];
};

function mapRow(row: {
  masterSku: string;
  masterStock: number;
  variantIds: unknown;
  updatedAt: Date;
}) {
  return {
    masterSku: row.masterSku,
    masterStock: row.masterStock,
    variantIds: (row.variantIds as string[]) || [],
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await prisma.skuGroup.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(rows.map(mapRow));
  } catch (error) {
    console.error('SKU groups GET error:', error);
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

    const body = (await request.json()) as { groups?: SkuGroupInput[] };
    const groups = body.groups || [];

    await prisma.$transaction(async (tx) => {
      await tx.skuGroup.deleteMany({ where: { tenantId } });
      if (groups.length > 0) {
        await tx.skuGroup.createMany({
          data: groups.map((g) => ({
            tenantId,
            masterSku: g.masterSku.trim(),
            masterStock: g.masterStock,
            variantIds: g.variantIds,
          })),
        });
      }
    });

    const rows = await prisma.skuGroup.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(rows.map(mapRow));
  } catch (error) {
    console.error('SKU groups PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

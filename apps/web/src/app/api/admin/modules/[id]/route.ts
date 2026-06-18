import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await context.params;
  const body = (await req.json()) as {
    isActive?: boolean;
    isBeta?: boolean;
    isNew?: boolean;
    monthlyPrice?: number;
    name?: string;
    description?: string;
  };

  const module = await prisma.systemModule.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isBeta !== undefined && { isBeta: body.isBeta }),
      ...(body.isNew !== undefined && { isNew: body.isNew }),
      ...(body.monthlyPrice !== undefined && { monthlyPrice: body.monthlyPrice }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  return NextResponse.json({ module });
}

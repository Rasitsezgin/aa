import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const offers = await prisma.specialOffer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  });

  return NextResponse.json({
    offers: offers.map((o) => ({
      ...o,
      leadCount: o._count.leads,
    })),
  });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();

  const offer = await prisma.specialOffer.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      type: body.type ?? 'DISCOUNT_PERCENT',
      value: body.value,
      code: body.code,
      bgColor: body.bgColor,
      textColor: body.textColor,
      ctaText: body.ctaText ?? 'Hemen Başvur',
      ctaUrl: body.ctaUrl ?? '#contact',
      isActive: body.isActive ?? false,
      status: body.status ?? 'DRAFT',
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
    },
  });

  return NextResponse.json({ offer }, { status: 201 });
}

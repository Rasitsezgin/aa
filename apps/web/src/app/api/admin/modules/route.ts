import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const modules = await prisma.systemModule.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { tenantModules: true } },
    },
  });

  const formatted = modules.map((m) => ({
    id: m.id,
    key: m.key,
    name: m.name,
    description: m.description,
    icon: m.icon,
    category: m.category,
    monthlyPrice: Number(m.monthlyPrice),
    yearlyPrice: m.yearlyPrice ? Number(m.yearlyPrice) : null,
    requiredPlan: m.requiredPlan,
    isCore: m.isCore,
    isActive: m.isActive,
    isBeta: m.isBeta,
    isNew: m.isNew,
    features: Array.isArray(m.features) ? m.features : [],
    usageCount: m.usageCount,
    activeUsers: m._count.tenantModules,
    rating: m.rating ? Number(m.rating) : 0,
    revenue: 0,
    sortOrder: m.sortOrder,
  }));

  return NextResponse.json({ modules: formatted });
}

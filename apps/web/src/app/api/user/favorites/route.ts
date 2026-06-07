export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_FAVORITES = [
  { id: '1', title: 'Kontrol Merkezi', url: '/dashboard', category: 'Sayfa', color: 'blue' },
  { id: '2', title: 'Ürünler', url: '/dashboard/products', category: 'Sayfa', color: 'purple' },
  { id: '3', title: 'Siparişler', url: '/dashboard/orders', category: 'Sayfa', color: 'emerald' },
  { id: '4', title: 'Raporlar', url: '/dashboard/reports', category: 'Sayfa', color: 'cyan' },
];

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dashboardConfig: true },
    });

    const config = (user?.dashboardConfig as Record<string, unknown>) || {};
    const favorites = config.favorites as typeof DEFAULT_FAVORITES | undefined;

    return NextResponse.json({ favorites: favorites?.length ? favorites : DEFAULT_FAVORITES });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { favorites?: unknown[] };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dashboardConfig: true },
    });

    const config = (user?.dashboardConfig as Record<string, unknown>) || {};
    const nextConfig = { ...config, favorites: body.favorites || [] };

    await prisma.user.update({
      where: { id: userId },
      data: { dashboardConfig: nextConfig },
    });

    return NextResponse.json({ success: true, favorites: body.favorites });
  } catch (error) {
    console.error('Favorites PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

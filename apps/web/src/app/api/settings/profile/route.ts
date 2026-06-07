export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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

    const [user, tenant, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          image: true,
          type: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          plan: true,
          taxNumber: true,
          taxOffice: true,
          address: true,
          createdAt: true,
        },
      }),
      prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { config: true },
      }).catch(() => null),
    ]);

    const config = (settings?.config as Record<string, unknown>) ?? {};

    return NextResponse.json({
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || session?.user?.name || '',
      email: user?.email || session?.user?.email || '',
      phone: user?.phone || '',
      company: tenant?.name || '',
      taxId: tenant?.taxNumber || '',
      taxOffice: tenant?.taxOffice || '',
      address: tenant?.address || '',
      language: String(config.language ?? 'tr'),
      plan: tenant?.plan ?? 'FREE',
      userType: user?.type ?? 'USER',
      hasPassword: Boolean(user?.password),
      image: user?.image ?? null,
      createdAt: user?.createdAt?.toISOString() ?? null,
      tenantCreatedAt: tenant?.createdAt?.toISOString() ?? null,
      lastUpdated: user?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({
      name: '',
      email: '',
      phone: '',
      company: '',
      taxId: '',
      taxOffice: '',
      language: 'tr',
      plan: 'FREE',
      fallback: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      company?: string;
      taxId?: string;
      taxOffice?: string;
      address?: string;
      language?: string;
    };

    const nameParts = (body.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: body.phone || undefined,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: body.company || undefined,
        taxNumber: body.taxId || undefined,
        taxOffice: body.taxOffice || undefined,
        address: body.address || undefined,
      },
    });

    if (body.language) {
      const existing = await prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { config: true },
      }).catch(() => null);
      const config = (existing?.config as Record<string, unknown>) ?? {};
      await prisma.tenantSettings.upsert({
        where: { tenantId },
        create: { tenantId, config: { ...config, language: body.language } },
        update: { config: { ...config, language: body.language } },
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      name: body.name,
    });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

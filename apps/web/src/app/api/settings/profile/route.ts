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

    const [user, tenant] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, phone: true, email: true },
      }),
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, taxNumber: true, taxOffice: true },
      }),
    ]);

    return NextResponse.json({
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || session?.user?.name || '',
      email: user?.email || session?.user?.email || '',
      phone: user?.phone || '',
      company: tenant?.name || '',
      taxId: tenant?.taxNumber || '',
      taxOffice: tenant?.taxOffice || '',
      language: 'tr',
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
      language?: string;
    };

    const nameParts = (body.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: body.phone || undefined,
        },
      }),
      prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: body.company || undefined,
          taxNumber: body.taxId || undefined,
          taxOffice: body.taxOffice || undefined,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

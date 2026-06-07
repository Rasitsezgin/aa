export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin(session: Awaited<ReturnType<typeof auth>>) {
  const userId = session?.user?.id;
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  if (!userId || !tenantId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { type: true, role: { select: { name: true } } },
  });

  const isAdmin =
    user?.type === 'ADMIN' ||
    user?.type === 'SUPERADMIN' ||
    user?.role?.name === 'Yönetici';

  if (!isAdmin) return null;
  return { userId, tenantId };
}

export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [members, roles] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          type: true,
          updatedAt: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.role.findMany({
        where: { OR: [{ tenantId }, { tenantId: null, isSystem: true }] },
        include: { permissions: true, _count: { select: { users: true } } },
      }),
    ]);

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email,
        email: m.email,
        phone: m.phone,
        role: m.role?.name || m.type,
        roleId: m.role?.id,
        lastLogin: m.updatedAt.toISOString(),
      })),
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        count: r._count.users,
        isSystem: r.isSystem,
        permissions: r.permissions.map((p) => p.action),
      })),
    });
  } catch (error) {
    console.error('Team GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const admin = await requireAdmin(session);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as {
      email?: string;
      name?: string;
      roleId?: string;
    };

    if (!body.email?.trim()) {
      return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 });
    }

    const nameParts = (body.name || '').trim().split(/\s+/);
    const tempPassword = `Py${Math.random().toString(36).slice(2, 10)}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    let roleId = body.roleId;
    if (!roleId) {
      const defaultRole = await prisma.role.findFirst({
        where: { OR: [{ name: 'Personel' }, { name: 'Görüntüleyici' }], isSystem: true },
      });
      roleId = defaultRole?.id;
    }

    const user = await prisma.user.create({
      data: {
        email: body.email.trim(),
        password: hashedPassword,
        firstName: nameParts[0] || body.email.split('@')[0],
        lastName: nameParts.slice(1).join(' ') || '',
        tenantId: admin.tenantId,
        type: 'USER',
        roleId,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        email: user.email,
      },
      message: 'Personel eklendi. Geçici şifre e-posta ile paylaşılmalıdır.',
    });
  } catch (error) {
    console.error('Team POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

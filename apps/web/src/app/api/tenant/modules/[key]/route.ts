import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isPlatformAdmin } from '@/lib/platform-admin';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ key: string }> };

async function requireTenantAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; type?: string; tenantId?: string | null } | undefined;
  if (!user?.id || !user.tenantId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }
  if (!isPlatformAdmin(user) && user.type !== 'ADMIN' && user.type !== 'USER' && user.type !== 'SUPERADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null };
  }
  return { error: null, user: user as { id: string; tenantId: string } };
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authResult = await requireTenantAdmin();
  if (authResult.error) return authResult.error;

  const { key } = await context.params;
  const body = (await req.json()) as { enabled?: boolean; config?: Record<string, unknown> };

  const systemModule = await prisma.systemModule.findUnique({ where: { key } });
  if (!systemModule) {
    return NextResponse.json({ error: 'Modül bulunamadı' }, { status: 404 });
  }

  if (body.enabled !== undefined) {
    const existing = await prisma.tenantModule.findFirst({
      where: { tenantId: authResult.user!.tenantId, moduleId: systemModule.id },
    });

    if (body.enabled) {
      if (existing) {
        await prisma.tenantModule.update({
          where: { id: existing.id },
          data: { isEnabled: true, ...(body.config && { config: body.config }) },
        });
      } else {
        await prisma.tenantModule.create({
          data: {
            tenantId: authResult.user!.tenantId,
            moduleId: systemModule.id,
            isEnabled: true,
            config: body.config ?? {},
          },
        });
      }
    } else if (existing) {
      await prisma.tenantModule.update({
        where: { id: existing.id },
        data: { isEnabled: false },
      });
    }
  } else if (body.config) {
    const existing = await prisma.tenantModule.findFirst({
      where: { tenantId: authResult.user!.tenantId, moduleId: systemModule.id },
    });
    if (existing) {
      await prisma.tenantModule.update({
        where: { id: existing.id },
        data: { config: body.config },
      });
    }
  }

  return NextResponse.json({ success: true, key, enabled: body.enabled });
}

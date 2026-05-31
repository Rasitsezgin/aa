export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const label = typeof body?.label === 'string' ? body.label.slice(0, 120) : 'unknown';
    const href = typeof body?.href === 'string' ? body.href.slice(0, 512) : '/';
    const section = typeof body?.section === 'string' ? body.section.slice(0, 120) : 'unknown';

    await prisma.activityLog.create({
      data: {
        action: 'menu.click',
        resource: 'navigation',
        resourceId: href,
        details: {
          label,
          href,
          section,
          source: 'web-landing-navbar',
          ts: Date.now(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('menu-click analytics error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

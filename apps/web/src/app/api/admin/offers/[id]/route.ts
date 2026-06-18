import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await context.params;
  const offer = await prisma.specialOffer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 });

  const design = await getJsonSetting(`offer_design_${id}`, {
    bgColor: offer.bgColor,
    textColor: offer.textColor,
    accentColor: '#7C3AED',
    buttonColor: '#7C3AED',
    buttonTextColor: '#ffffff',
    cardBgColor: 'rgba(255,255,255,0.1)',
    overlayOpacity: 0.5,
    titleSize: 'text-4xl',
    titleWeight: 'font-black',
    subtitleSize: 'text-lg',
    bodySize: 'text-base',
    fontFamily: 'Inter',
    textAlign: 'center' as const,
    paddingY: 'py-16',
    paddingX: 'px-6',
    maxWidth: 'max-w-4xl',
    borderRadius: 'rounded-2xl',
    contentLayout: 'center' as const,
    showParticles: true,
    showGlow: true,
    animationSpeed: 'normal' as const,
    shadowIntensity: 'shadow-xl',
  });

  return NextResponse.json({
    offer: {
      id: offer.id,
      title: offer.title,
      subtitle: offer.subtitle,
      description: offer.description,
      bgColor: offer.bgColor,
      textColor: offer.textColor,
      design,
    },
  });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await context.params;
  const body = await req.json();

  const offer = await prisma.specialOffer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 });

  if (body.design) {
    await setJsonSetting(`offer_design_${id}`, body.design, 'offers');
  }

  if (body.bgColor || body.textColor || body.title) {
    await prisma.specialOffer.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.bgColor && { bgColor: body.bgColor }),
        ...(body.textColor && { textColor: body.textColor }),
      },
    });
  }

  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_ONBOARDING = {
  currentStep: 'WELCOME',
  completedSteps: [],
  isActive: true,
  isCompleted: false,
};

// GET /api/onboarding - Kullanıcının onboarding durumunu getir
export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: session.user.id,
          currentStep: 'WELCOME',
          completedSteps: [],
          isActive: true,
          isCompleted: false,
        },
      });
    }

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    return NextResponse.json({
      userId: session.user.id,
      ...DEFAULT_ONBOARDING,
      fallback: true,
    });
  }
}

// POST /api/onboarding/complete - Onboarding'i tamamla
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { completedSteps, totalTimeSpent } = await request.json();

    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentStep: 'COMPLETE',
        completedSteps: completedSteps || [],
        isActive: false,
        isCompleted: true,
        completionDate: new Date(),
        totalTimeSpent: totalTimeSpent || 0,
      },
      update: {
        isCompleted: true,
        isActive: false,
        completionDate: new Date(),
        completedSteps: completedSteps || [],
        totalTimeSpent: totalTimeSpent || 0,
        currentStep: 'COMPLETE',
      },
    });

    const badges = [];
    if (completedSteps?.includes('profile')) {
      badges.push({ badgeId: 'profile_setup', name: 'Profil Uzmanı', icon: 'User', color: 'blue' });
    }
    if (completedSteps?.includes('tenant')) {
      badges.push({ badgeId: 'tenant_setup', name: 'Mağaza Kurucusu', icon: 'Building2', color: 'purple' });
    }
    if (completedSteps?.includes('platforms')) {
      badges.push({ badgeId: 'platform_master', name: 'Platform Ustası', icon: 'Store', color: 'orange' });
    }

    for (const badge of badges) {
      await prisma.userBadge
        .create({
          data: {
            userId: session.user.id,
            ...badge,
          },
        })
        .catch(() => undefined);
    }

    return NextResponse.json({ success: true, onboarding });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 },
    );
  }
}

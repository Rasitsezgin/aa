export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/onboarding - Kullanıcının onboarding durumunu getir
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });

    // If no onboarding record exists, create one
    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId: session.user.id,
          currentStep: "WELCOME",
          completedSteps: [],
          isActive: true,
          isCompleted: false,
        },
      });
    }

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Error fetching onboarding:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
}

// POST /api/onboarding/complete - Onboarding'i tamamla
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { completedSteps, totalTimeSpent } = await request.json();

    const onboarding = await prisma.userOnboarding.update({
      where: { userId: session.user.id },
      data: {
        isCompleted: true,
        isActive: false,
        completionDate: new Date(),
        completedSteps: completedSteps || [],
        totalTimeSpent: totalTimeSpent || 0,
        currentStep: "COMPLETE",
      },
    });

    // Create badges for completed steps
    const badges = [];
    if (completedSteps?.includes("profile")) {
      badges.push({ badgeId: "profile_setup", name: "Profil Uzmanı", icon: "User", color: "blue" });
    }
    if (completedSteps?.includes("tenant")) {
      badges.push({ badgeId: "tenant_setup", name: "Mağaza Kurucusu", icon: "Building2", color: "purple" });
    }
    if (completedSteps?.includes("platforms")) {
      badges.push({ badgeId: "platform_master", name: "Platform Ustası", icon: "Store", color: "orange" });
    }

    // Award badges
    for (const badge of badges) {
      await prisma.userBadge.create({
        data: {
          userId: session.user.id,
          ...badge,
        },
      }).catch(() => {}); // Ignore duplicate errors
    }

    return NextResponse.json({ success: true, onboarding });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

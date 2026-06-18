export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from "@/lib/prisma";

// POST /api/admin/pages/[id]/set-home - Sayfayı ana sayfa yap
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    // Önce mevcut ana sayfayı kaldır
    await prisma.page.updateMany({
      where: { isHomePage: true },
      data: { isHomePage: false },
    });

    // Yeni ana sayfa ayarla
    const page = await prisma.page.update({
      where: { id },
      data: { isHomePage: true },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error setting home page:", error);
    return NextResponse.json(
      { error: "Failed to set home page" },
      { status: 500 }
    );
  }
}

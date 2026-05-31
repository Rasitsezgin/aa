export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/pages/[id]/set-home - Sayfayı ana sayfa yap
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

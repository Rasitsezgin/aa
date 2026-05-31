export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/menus/[id]/set-default - Menüyü varsayılan yap
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
    // Önce tüm menülerin varsayılan durumunu kaldır
    const menu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Aynı tip'teki diğer menülerin varsayılan durumunu kaldır
    await prisma.menu.updateMany({
      where: { type: menu.type, isDefault: true },
      data: { isDefault: false },
    });

    // Bu menüyü varsayılan yap
    const updated = await prisma.menu.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error setting default menu:", error);
    return NextResponse.json(
      { error: "Failed to set default menu" },
      { status: 500 }
    );
  }
}

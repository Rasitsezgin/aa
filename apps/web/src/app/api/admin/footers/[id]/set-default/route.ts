export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from "@/lib/prisma";

// POST /api/admin/footers/[id]/set-default - Footer'ı varsayılan yap
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const footer = await prisma.footer.findUnique({
      where: { id },
    });

    if (!footer) {
      return NextResponse.json({ error: "Footer not found" }, { status: 404 });
    }

    // Aynı konumdaki diğer footer'ların varsayılan durumunu kaldır
    await prisma.footer.updateMany({
      where: { location: footer.location, isDefault: true },
      data: { isDefault: false },
    });

    // Bu footer'ı varsayılan yap
    const updated = await prisma.footer.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error setting default footer:", error);
    return NextResponse.json(
      { error: "Failed to set default footer" },
      { status: 500 }
    );
  }
}

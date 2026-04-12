import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@pazaryonetimi/database";

// POST /api/admin/footers/[id]/set-default - Footer'ı varsayılan yap
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

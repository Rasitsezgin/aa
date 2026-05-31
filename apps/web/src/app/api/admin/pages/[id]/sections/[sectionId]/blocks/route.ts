export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/pages/[id]/sections/[sectionId]/blocks - Blokları listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sectionId } = await params;
    const blocks = await prisma.pageBlock.findMany({
      where: { sectionId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages/[id]/sections/[sectionId]/blocks - Yeni blok ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sectionId } = await params;
    const data = await request.json();

    // Mevcut son sıralamayı bul
    const lastBlock = await prisma.pageBlock.findFirst({
      where: { sectionId },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = lastBlock ? lastBlock.sortOrder + 1 : 0;

    const block = await prisma.pageBlock.create({
      data: {
        sectionId,
        type: data.type,
        name: data.name,
        content: data.content || {},
        align: data.align || "left",
        width: data.width || "full",
        customClass: data.customClass,
        sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/pages/[id]/sections/[sectionId]/blocks/[blockId] - Blok detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string; blockId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blockId } = await params;
    const block = await prisma.pageBlock.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 });
    }

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error fetching block:", error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages/[id]/sections/[sectionId]/blocks/[blockId] - Blok güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string; blockId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blockId } = await params;
    const data = await request.json();

    const block = await prisma.pageBlock.update({
      where: { id: blockId },
      data: {
        type: data.type,
        name: data.name,
        content: data.content,
        align: data.align,
        width: data.width,
        customClass: data.customClass,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages/[id]/sections/[sectionId]/blocks/[blockId] - Blok sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string; blockId: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blockId } = await params;
    await prisma.pageBlock.delete({
      where: { id: blockId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500 }
    );
  }
}

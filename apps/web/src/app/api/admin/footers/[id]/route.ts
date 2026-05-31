export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/footers/[id] - Tekil footer detayı
export async function GET(
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
      include: {
        columns: {
          orderBy: { sortOrder: "asc" },
          include: {
            links: { orderBy: { sortOrder: "asc" } },
          },
        },
        bottomBar: {
          include: {
            links: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!footer) {
      return NextResponse.json({ error: "Footer not found" }, { status: 404 });
    }

    return NextResponse.json(footer);
  } catch (error) {
    console.error("Error fetching footer:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/footers/[id] - Footer güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const footer = await prisma.footer.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        isActive: data.isActive,
        isDefault: data.isDefault,
        bgColor: data.bgColor,
        textColor: data.textColor,
        borderColor: data.borderColor,
        logoUrl: data.logoUrl,
        logoText: data.logoText,
        tagline: data.tagline,
      },
    });

    return NextResponse.json(footer);
  } catch (error) {
    console.error("Error updating footer:", error);
    return NextResponse.json(
      { error: "Failed to update footer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/footers/[id] - Footer sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.footer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer:", error);
    return NextResponse.json(
      { error: "Failed to delete footer" },
      { status: 500 }
    );
  }
}

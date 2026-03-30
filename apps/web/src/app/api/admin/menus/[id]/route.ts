import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@pazaryonetimi/database";

// GET /api/admin/menus/[id] - Tekil menü detayı
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
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menus/[id] - Menü güncelle
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

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
        isActive: data.isActive,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menus/[id] - Menü sil
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
    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/menus/[id]/items - Menü öğelerini listele
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
    const items = await prisma.menuItem.findMany({
      where: { menuId: id, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            children: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menus/[id]/items - Yeni menü öğesi ekle
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
    const data = await request.json();

    // Son sıralamayı bul
    const lastItem = await prisma.menuItem.findFirst({
      where: { menuId: id, parentId: data.parentId || null },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    const item = await prisma.menuItem.create({
      data: {
        menuId: id,
        parentId: data.parentId || null,
        type: data.type || "LINK",
        label: data.label,
        url: data.url,
        icon: data.icon,
        description: data.description,
        isActive: data.isActive ?? true,
        isHighlighted: data.isHighlighted ?? false,
        highlightColor: data.highlightColor,
        imageUrl: data.imageUrl,
        columns: data.columns || 1,
        sortOrder,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

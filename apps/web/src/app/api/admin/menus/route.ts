import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/menus - Tüm menüleri listele
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const menus = await prisma.menu.findMany({
      orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }],
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

    return NextResponse.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menus - Yeni menü oluştur
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
      },
    });

    // Menü öğelerini oluştur
    if (data.items && data.items.length > 0) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        await createMenuItem(menu.id, item, null, i);
      }
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

// Yardımcı fonksiyon: Menü öğelerini recursive oluştur
async function createMenuItem(
  menuId: string,
  item: any,
  parentId: string | null,
  sortOrder: number
) {
  const created = await prisma.menuItem.create({
    data: {
      menuId,
      parentId,
      type: item.type || "LINK",
      label: item.label,
      url: item.url,
      icon: item.icon,
      description: item.description,
      isActive: item.isActive ?? true,
      isHighlighted: item.isHighlighted ?? false,
      highlightColor: item.highlightColor,
      imageUrl: item.imageUrl,
      columns: item.columns || 1,
      sortOrder,
    },
  });

  // Alt öğeleri oluştur
  if (item.children && item.children.length > 0) {
    for (let i = 0; i < item.children.length; i++) {
      await createMenuItem(menuId, item.children[i], created.id, i);
    }
  }

  return created;
}

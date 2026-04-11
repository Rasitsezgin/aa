import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/footers/[id]/columns - Footer kolonlarını listele
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
    const columns = await prisma.footerColumn.findMany({
      where: { footerId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        links: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching footer columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer columns" },
      { status: 500 }
    );
  }
}

// POST /api/admin/footers/[id]/columns - Yeni kolon ekle
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
    const lastColumn = await prisma.footerColumn.findFirst({
      where: { footerId: id },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = lastColumn ? lastColumn.sortOrder + 1 : 0;

    const column = await prisma.footerColumn.create({
      data: {
        footerId: id,
        title: data.title,
        isActive: data.isActive ?? true,
        sortOrder,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating footer column:", error);
    return NextResponse.json(
      { error: "Failed to create footer column" },
      { status: 500 }
    );
  }
}

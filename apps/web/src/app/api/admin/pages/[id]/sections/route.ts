import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/pages/[id]/sections - Yeni bölüm ekle
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

    // Mevcut son sıralamayı bul
    const lastSection = await prisma.pageSection.findFirst({
      where: { pageId: id },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = lastSection ? lastSection.sortOrder + 1 : 0;

    const section = await prisma.pageSection.create({
      data: {
        pageId: id,
        name: data.name,
        title: data.title,
        subtitle: data.subtitle,
        bgColor: data.bgColor,
        bgImage: data.bgImage,
        textColor: data.textColor,
        padding: data.padding || "py-16",
        container: data.container || "container",
        columns: data.columns || 1,
        sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}

// GET /api/admin/pages/[id]/sections - Bölümleri listele
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
    const sections = await prisma.pageSection.findMany({
      where: { pageId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

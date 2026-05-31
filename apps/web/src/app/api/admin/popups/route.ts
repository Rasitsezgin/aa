import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/popups - Tüm popup'ları listele
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const popups = await prisma.popup.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(popups);
  } catch (error) {
    console.error("Error fetching popups:", error);
    return NextResponse.json(
      { error: "Failed to fetch popups" },
      { status: 500 }
    );
  }
}

// POST /api/admin/popups - Yeni popup oluştur
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const popup = await prisma.popup.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        type: data.type || "EXIT_INTENT",
        delay: data.delay || 0,
        scroll: data.scroll || 0,
        theme: data.theme || "light",
        bgColor: data.bgColor,
        textColor: data.textColor,
        size: data.size || "md",
        isActive: data.isActive ?? false,
        isGlobal: data.isGlobal ?? true,
        pageSlugs: data.pageSlugs || [],
      },
    });

    return NextResponse.json(popup);
  } catch (error) {
    console.error("Error creating popup:", error);
    return NextResponse.json(
      { error: "Failed to create popup" },
      { status: 500 }
    );
  }
}

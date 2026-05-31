export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/footers?location=main - Aktif footer'ı getir
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "main";

  try {
    const footer = await prisma.footer.findFirst({
      where: {
        location,
        isActive: true,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        columns: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            links: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
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

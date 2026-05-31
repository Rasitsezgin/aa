export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          { isGlobal: true },
          { pageSlugs: { has: slug || "homepage" } }
        ]
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(popups);
  } catch (error) {
    console.error("Error fetching public popups:", error);
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}

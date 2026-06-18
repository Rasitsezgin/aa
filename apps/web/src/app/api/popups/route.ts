export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isDbUnavailable(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  const msg = err?.message ?? '';
  return (
    err?.code === 'P2021' ||
    err?.code === 'P1001' ||
    err?.code === 'P1002' ||
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ETIMEDOUT' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes("Can't reach database server") ||
    msg.includes('require is not a function')
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          { isGlobal: true },
          { pageSlugs: { has: slug || "homepage" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(popups);
  } catch (error) {
    if (isDbUnavailable(error)) {
      return NextResponse.json([]);
    }
    console.error("Error fetching public popups:", error);
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}

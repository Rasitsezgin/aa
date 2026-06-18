export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from "@/lib/prisma";

// GET /api/admin/offers/[id]/leads - Teklif lead'lerini listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const leads = await prisma.offerLead.findMany({
      where: { offerId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

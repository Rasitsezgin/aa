export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const popup = await prisma.popup.findUnique({
      where: { id: params.id },
    });

    if (!popup) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 });
    }

    return NextResponse.json(popup);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const data = await request.json();

    const popup = await prisma.popup.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        type: data.type,
        delay: data.delay,
        scroll: data.scroll,
        theme: data.theme,
        bgColor: data.bgColor,
        textColor: data.textColor,
        size: data.size,
        isActive: data.isActive,
        isGlobal: data.isGlobal,
        pageSlugs: data.pageSlugs,
      },
    });

    return NextResponse.json(popup);
  } catch (error) {
    console.error("Error updating popup:", error);
    return NextResponse.json({ error: "Failed to update popup" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    await prisma.popup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Popup deleted successfully" });
  } catch (error) {
    console.error("Error deleting popup:", error);
    return NextResponse.json({ error: "Failed to delete popup" }, { status: 500 });
  }
}

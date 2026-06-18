export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from "@/lib/prisma";

// GET /api/admin/pages/[id] - Tekil sayfa detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          include: {
            blocks: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages/[id] - Sayfa güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const data = await request.json();

    // Slug benzersizlik kontrolü (başka sayfada var mı)
    if (data.slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existingPage) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      slug: data.slug,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      layout: data.layout,
      theme: data.theme,
      customCss: data.customCss,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      version: { increment: 1 },
    };

    // Yayınlanma tarihi kontrolü
    if (data.status === "PUBLISHED") {
      const currentPage = await prisma.page.findUnique({
        where: { id },
        select: { status: true, publishedAt: true },
      });

      if (currentPage?.status !== "PUBLISHED" && !currentPage?.publishedAt) {
        updateData.publishedAt = new Date();
        updateData.publishedBy = authResult.user.id;
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages/[id] - Sayfa sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (page.isHomePage) {
      return NextResponse.json(
        { error: "Cannot delete home page. Set another page as home first." },
        { status: 400 }
      );
    }

    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}

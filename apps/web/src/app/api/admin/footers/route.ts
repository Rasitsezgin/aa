import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/footers - Tüm footerları listele
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const footers = await prisma.footer.findMany({
      orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }],
      include: {
        columns: {
          orderBy: { sortOrder: "asc" },
          include: {
            links: { orderBy: { sortOrder: "asc" } },
          },
        },
        bottomBar: {
          include: {
            links: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(footers);
  } catch (error) {
    console.error("Error fetching footers:", error);
    return NextResponse.json(
      { error: "Failed to fetch footers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/footers - Yeni footer oluştur
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const footer = await prisma.footer.create({
      data: {
        name: data.name,
        location: data.location || "main",
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        bgColor: data.bgColor,
        textColor: data.textColor,
        borderColor: data.borderColor,
        logoUrl: data.logoUrl,
        logoText: data.logoText,
        tagline: data.tagline,
      },
    });

    // Bottom bar oluştur
    if (data.bottomBar) {
      await prisma.footerBottomBar.create({
        data: {
          footerId: footer.id,
          copyright: data.bottomBar.copyright,
          showCopyright: data.bottomBar.showCopyright ?? true,
          showSocial: data.bottomBar.showSocial ?? true,
          socialLinks: data.bottomBar.socialLinks || [],
          showPaymentIcons: data.bottomBar.showPaymentIcons ?? true,
          paymentIcons: data.bottomBar.paymentIcons || [],
        },
      });
    }

    // Kolonları oluştur
    if (data.columns && data.columns.length > 0) {
      for (let i = 0; i < data.columns.length; i++) {
        const column = data.columns[i];
        const createdColumn = await prisma.footerColumn.create({
          data: {
            footerId: footer.id,
            title: column.title,
            sortOrder: i,
            isActive: column.isActive ?? true,
          },
        });

        // Linkleri oluştur
        if (column.links && column.links.length > 0) {
          for (let j = 0; j < column.links.length; j++) {
            const link = column.links[j];
            await prisma.footerLink.create({
              data: {
                columnId: createdColumn.id,
                label: link.label,
                url: link.url,
                icon: link.icon,
                isExternal: link.isExternal ?? false,
                isActive: link.isActive ?? true,
                sortOrder: j,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(footer);
  } catch (error) {
    console.error("Error creating footer:", error);
    return NextResponse.json(
      { error: "Failed to create footer" },
      { status: 500 }
    );
  }
}

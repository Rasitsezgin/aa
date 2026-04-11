import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EnhancedMenuAdminClient from "./EnhancedMenuAdminClient";

export const metadata: Metadata = {
  title: "Menü Yönetimi - Admin Panel",
  description: "Navigasyon menülerini yönetin",
};

export default async function MenuAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    redirect("/admin/login");
  }

  try {
    const menus = await prisma.menu.findMany({
      orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    // Transform Prisma data to match expected types (convert null to undefined and Date to string)
    const transformMenuItem = (item: any): any => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      url: item.url ?? undefined,
      description: item.description ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      children: item.children?.map(transformMenuItem),
    });

    const transformedMenus = menus.map(menu => ({
      ...menu,
      createdAt: menu.createdAt.toISOString(),
      updatedAt: menu.updatedAt.toISOString(),
      items: menu.items.map(transformMenuItem),
    }));

    return <EnhancedMenuAdminClient menus={transformedMenus} />;
  } catch (error) {
    // CMS tabloları henüz oluşturulmadıysa boş liste göster
    return <EnhancedMenuAdminClient menus={[]} />;
  }
}

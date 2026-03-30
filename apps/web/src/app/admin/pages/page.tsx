import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@pazaryonetimi/database";
import PagesAdminClient from "./PagesAdminClient";

export const metadata: Metadata = {
  title: "Sayfa Yönetimi - Admin Panel",
  description: "CMS sayfalarını yönetin",
};

export default async function PagesAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    redirect("/admin/login");
  }

  try {
    const pages = await prisma.page.findMany({
      orderBy: [
        { isHomePage: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        sections: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return <PagesAdminClient pages={pages} />;
  } catch (error) {
    // CMS tabloları henüz oluşturulmadıysa boş liste göster
    return <PagesAdminClient pages={[]} />;
  }
}

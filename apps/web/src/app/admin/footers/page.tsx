import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EnhancedFooterAdminClient from "./EnhancedFooterAdminClient";

export const metadata: Metadata = {
  title: "Footer Yönetimi - Admin Panel",
  description: "Footer içeriklerini yönetin",
};

export default async function FooterAdminPage() {
  const session = await auth();

  if (!session?.user || session.user.type !== "SUPERADMIN") {
    redirect("/admin/login");
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

    // Transform Prisma data to match expected types (convert null to undefined and Date to string)
    const transformedFooters = footers.map(footer => ({
      ...footer,
      createdAt: footer.createdAt.toISOString(),
      updatedAt: footer.updatedAt.toISOString(),
      bgColor: footer.bgColor ?? undefined,
      textColor: footer.textColor ?? undefined,
      borderColor: footer.borderColor ?? undefined,
      logoUrl: footer.logoUrl ?? undefined,
      logoText: footer.logoText ?? undefined,
      tagline: footer.tagline ?? undefined,
      columns: footer.columns.map(column => ({
        ...column,
        createdAt: column.createdAt.toISOString(),
        updatedAt: column.updatedAt.toISOString(),
        links: column.links.map(link => ({
          ...link,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
          icon: link.icon ?? undefined,
        })),
      })),
      bottomBar: footer.bottomBar ? {
        ...footer.bottomBar,
        createdAt: footer.bottomBar.createdAt.toISOString(),
        updatedAt: footer.bottomBar.updatedAt.toISOString(),
        copyright: footer.bottomBar.copyright ?? undefined,
        showPaymentIcons: footer.bottomBar.showPaymentIcons ?? undefined,
        socialLinks: footer.bottomBar.socialLinks as any[] ?? undefined,
        paymentIcons: footer.bottomBar.paymentIcons as any[] ?? undefined,
        links: footer.bottomBar.links.map(link => ({
          ...link,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        })),
      } : undefined,
    }));

    return <EnhancedFooterAdminClient footers={transformedFooters} />;
  } catch (error) {
    return <EnhancedFooterAdminClient footers={[]} />;
  }
}

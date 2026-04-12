import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@pazaryonetimi/database";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Tüm sayfa slurlarını statik oluşturma için getir
export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: {
      isActive: true,
      status: "PUBLISHED",
    },
    select: { slug: true },
  });

  return pages.map((page: { slug: string }) => ({ slug: page.slug }));
}

// Sayfa metadata'larını oluştur
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: {
      slug,
      isActive: true,
      status: "PUBLISHED",
    },
  });

  if (!page) {
    return {
      title: "Sayfa Bulunamadı",
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.description,
    keywords: page.metaKeywords,
    openGraph: page.ogImage
      ? {
          images: [{ url: page.ogImage }],
        }
      : undefined,
    robots: page.noIndex ? { index: false, follow: false } : undefined,
    alternates: page.canonicalUrl
      ? { canonical: page.canonicalUrl }
      : undefined,
  };
}

// Dinamik CMS sayfası
export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: {
      slug,
      isActive: true,
      status: "PUBLISHED",
    },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          blocks: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Transform Prisma data to match expected types (convert null to undefined)
  const transformedPage = {
    ...page,
    sections: page.sections.map(section => ({
      ...section,
      blocks: section.blocks.map(block => ({
        ...block,
        customClass: block.customClass ?? undefined,
        name: block.name ?? undefined,
      })),
    })),
  };

  return (
    <main>
      {page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      )}
      <CmsPageRenderer page={transformedPage} />
    </main>
  );
}

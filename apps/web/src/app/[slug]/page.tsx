import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Tüm sayfa slurlarını statik oluşturma için getir
export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isActive: true,
        status: "PUBLISHED",
      },
      select: { slug: true },
    });

    return pages.map((page: { slug: string }) => ({ slug: page.slug }));
  } catch (error) {
    console.error('[CMS] generateStaticParams database error:', error);
    return [];
  }
}

// Sayfa metadata'larını oluştur
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
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
      metadataBase: new URL('https://pazaryonetimi.com'),
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description,
      keywords: page.metaKeywords,
      openGraph: page.ogImage
        ? {
            images: [{ url: page.ogImage }],
          }
        : undefined,
      robots: page.noIndex ? { index: false, follow: false } : undefined,
      alternates: {
        canonical: page.canonicalUrl || `https://pazaryonetimi.com/${page.slug}`,
      },
    };
  } catch (error) {
    console.error('[CMS] generateMetadata database error:', error);
    return {
      title: "Pazaryonetimi - CMS Sayfası",
    };
  }
}

// Dinamik CMS sayfası
export default async function CmsPage({ params }: PageProps) {
  try {
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
    sections: page.sections.map((section: any) => ({
      ...section,
      blocks: section.blocks.map((block: any) => ({
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
  } catch (error) {
    console.error('[CMS] CmsPage database error:', error);
    notFound();
  }
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await prisma.page.findFirst({
      where: {
        isHomePage: true,
        isActive: true,
        status: "PUBLISHED",
      },
    });

    if (!page) {
      return getDefaultMetadata();
    }

    return {
      metadataBase: new URL("https://pazaryonetimi.com"),
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description,
      keywords: page.metaKeywords,
      alternates: {
        canonical: page.canonicalUrl || "https://pazaryonetimi.com",
      },
      openGraph: page.ogImage
        ? {
            title: page.metaTitle || page.title,
            description: page.metaDescription || page.description || undefined,
            url: "https://pazaryonetimi.com",
            siteName: "Pazaryonetimi",
            images: [
              {
                url: page.ogImage,
                width: 1200,
                height: 630,
                alt: page.metaTitle || page.title,
              },
            ],
            locale: "tr_TR",
            type: "website",
          }
        : undefined,
      twitter: {
        card: "summary_large_image",
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.description || undefined,
        images: page.ogImage ? [page.ogImage] : undefined,
      },
      robots: page.noIndex ? { index: false, follow: false } : undefined,
    };
  } catch (error) {
    return getDefaultMetadata();
  }
}

function getDefaultMetadata(): Metadata {
  const title = "Pazaryonetimi | AI Destekli E-ticaret Yönetim Platformu";
  const description = "Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti — tüm pazaryerlerinizi tek platformdan yönetin. Yapay zeka destekli stok, fiyat ve sipariş yönetimi.";
  const ogImage = "https://pazaryonetimi.com/og-image.png";

  return {
    title,
    description,
    keywords: ["e-ticaret", "pazaryeri", "trendyol", "hepsiburada", "amazon", "n11", "stok yönetimi", "fiyat yönetimi", "sipariş yönetimi"],
    alternates: {
      canonical: "https://pazaryonetimi.com",
    },
    openGraph: {
      title,
      description,
      url: "https://pazaryonetimi.com",
      siteName: "Pazaryonetimi",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    metadataBase: new URL("https://pazaryonetimi.com"),
  };
}

export default async function Home() {
  try {
    const page = await prisma.page.findFirst({
      where: {
        isHomePage: true,
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

    // Eğer CMS'de ana sayfa yoksa, fallback olarak mevcut LandingHomeClient göster
    if (!page) {
      const { default: LandingHomeClient } = await import(
        "@/components/landing/LandingHomeClient"
      );
      return <LandingHomeClient />;
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
    // CMS tabloları henüz oluşturulmadıysa veya hata varsa fallback göster
    const { default: LandingHomeClient } = await import(
      "@/components/landing/LandingHomeClient"
    );
    return <LandingHomeClient />;
  }
}

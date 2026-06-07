import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { buildPageMetadata, truncateForMeta, SITE_URL } from '@/lib/seo/site-seo';
import { getResolvedMetadata } from '@/lib/seo/seo-admin-service';
import JsonLd from '@/components/SEO/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const board = await prisma.forumBoard.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      category: { select: { name: true } },
      _count: { select: { topics: true } },
    },
  }).catch(() => null);

  if (!board) {
    return { title: 'Forum bölümü bulunamadı', robots: { index: false, follow: false } };
  }

  const resolved = await getResolvedMetadata(`/forum/board/${slug}`);
  const description = resolved?.description || (board.description
    ? truncateForMeta(board.description, 160)
    : `${board.name} forum bölümünde ${board._count.topics} konu. ${board.category?.name || 'E-ticaret'} kategorisinde tartışmalara katılın.`);

  return buildPageMetadata({
    title: resolved?.title || `${board.name} Forumu | ${board.category?.name || 'Pazaryonetimi'}`,
    description,
    path: `/forum/board/${slug}`,
    keywords: (resolved?.keywords as string[] | undefined) || ['e-ticaret forum', board.name, board.category?.name || 'pazaryeri'].filter(Boolean) as string[],
    noIndex: resolved?.noIndex,
    ogImage: resolved?.ogImage,
  });
}

export default async function ForumBoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await prisma.forumBoard.findUnique({
    where: { slug },
    select: { name: true, description: true },
  }).catch(() => null);

  const jsonLd = board
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: board.name,
        description: board.description || `${board.name} forum bölümü`,
        url: `${SITE_URL}/forum/board/${slug}`,
        isPartOf: { '@type': 'WebSite', name: 'Pazaryonetimi', url: SITE_URL },
      }
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      {children}
    </>
  );
}

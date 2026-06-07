import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { buildPageMetadata, truncateForMeta, SITE_URL } from '@/lib/seo/site-seo';
import { getResolvedMetadata } from '@/lib/seo/seo-admin-service';
import JsonLd from '@/components/SEO/JsonLd';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const topic = await prisma.forumTopic.findUnique({
    where: { slug },
    select: {
      title: true,
      replyCount: true,
      viewCount: true,
      status: true,
      lastPostAt: true,
      board: { select: { name: true } },
      posts: {
        where: { isDeleted: false, postNumber: 1 },
        take: 1,
        select: { content: true },
      },
    },
  }).catch(() => null);

  if (!topic || topic.status === 'DELETED') {
    return { title: 'Konu bulunamadı', robots: { index: false, follow: false } };
  }

  const excerpt = truncateForMeta(topic.posts[0]?.content || topic.title, 155);
  const resolved = await getResolvedMetadata(`/forum/topic/${slug}`);

  return buildPageMetadata({
    title: resolved?.title || `${topic.title} | ${topic.board?.name || 'Forum'} — Pazaryonetimi`,
    description: resolved?.description || `${excerpt} ${topic.replyCount} yanıt, ${topic.viewCount} görüntülenme.`,
    path: `/forum/topic/${slug}`,
    keywords: (resolved?.keywords as string[] | undefined) || ['e-ticaret forum', topic.board?.name || 'forum', 'soru cevap'],
    ogType: 'article',
    noIndex: resolved?.noIndex,
    ogImage: resolved?.ogImage,
  });
}

export default async function ForumTopicLayout({ children, params }: Props) {
  const { slug } = await params;

  const topic = await prisma.forumTopic.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      createdAt: true,
      lastPostAt: true,
      author: {
        select: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  }).catch(() => null);

  const authorName = topic
    ? [topic.author.user.firstName, topic.author.user.lastName].filter(Boolean).join(' ') || 'Pazaryonetimi Üyesi'
    : 'Pazaryonetimi Üyesi';

  const jsonLd = topic
    ? {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: topic.title,
        url: `${SITE_URL}/forum/topic/${topic.slug}`,
        datePublished: topic.createdAt.toISOString(),
        dateModified: topic.lastPostAt.toISOString(),
        author: { '@type': 'Person', name: authorName },
        publisher: {
          '@type': 'Organization',
          name: 'Pazaryonetimi',
          url: SITE_URL,
        },
      }
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      {children}
    </>
  );
}

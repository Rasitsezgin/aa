import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';
import { getResolvedMetadata } from '@/lib/seo/seo-admin-service';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await getResolvedMetadata('/forum');
  const base = pageMetadata['/forum'];

  return buildPageMetadata({
    title: String(resolved?.title || base?.title || 'Forum'),
    description: String(resolved?.description || base?.description || ''),
    path: '/forum',
    keywords: resolved?.keywords as string[] | undefined || (Array.isArray(base?.keywords) ? base.keywords.map(String) : undefined),
    noIndex: resolved?.noIndex,
    ogImage: resolved?.ogImage,
  });
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children;
}

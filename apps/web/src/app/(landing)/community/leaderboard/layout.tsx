import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';
import { buildPageMetadata } from '@/lib/seo/site-seo';

const base = pageMetadata['/community/leaderboard'];

export const metadata: Metadata = buildPageMetadata({
  title: String(base?.title || 'Liderlik Tablosu'),
  description: String(base?.description || ''),
  path: '/community/leaderboard',
  keywords: Array.isArray(base?.keywords) ? base.keywords.map(String) : undefined,
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

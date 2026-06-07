import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Takipçiler | Pazaryonetimi Forum',
  description: 'Forum takipçi ve takip listesi.',
  path: '/forum/user/connections',
  noIndex: true,
});

export default function ForumConnectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

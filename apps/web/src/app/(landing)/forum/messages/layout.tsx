import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Özel Mesajlar | Pazaryonetimi Forum',
  description: 'Forum üyeleriyle özel mesajlaşın.',
  path: '/forum/messages',
  noIndex: true,
});

export default function ForumMessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

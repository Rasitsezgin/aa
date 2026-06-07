import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Yeni Konu Aç | Pazaryonetimi Forum',
  description: 'Pazaryonetimi forumunda yeni bir tartışma başlatın.',
  path: '/forum/new-topic',
  noIndex: true,
});

export default function NewTopicLayout({ children }: { children: React.ReactNode }) {
  return children;
}

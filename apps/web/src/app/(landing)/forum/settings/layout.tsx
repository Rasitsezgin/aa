import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Forum Ayarları | Pazaryonetimi',
  description: 'Bildirim ve forum tercihlerinizi yönetin.',
  path: '/forum/settings',
  noIndex: true,
});

export default function ForumSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

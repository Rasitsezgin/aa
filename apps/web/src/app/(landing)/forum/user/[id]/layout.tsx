import type { Metadata } from 'next';
import { getForumUserPublicProfile } from '@/lib/forum-server';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await getForumUserPublicProfile(id).catch(() => null);

  return buildPageMetadata({
    title: profile ? `${profile.name} — Forum Profili` : 'Forum Profili | Pazaryonetimi',
    description: profile?.about || `${profile?.name || 'Üye'} profil sayfası.`,
    path: `/forum/user/${id}`,
    noIndex: true,
  });
}

export default function ForumUserLayout({ children }: { children: React.ReactNode }) {
  return children;
}

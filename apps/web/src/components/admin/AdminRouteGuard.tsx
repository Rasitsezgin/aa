'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { isPlatformAdmin } from '@/lib/platform-admin';
import { Loader2 } from 'lucide-react';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage || status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(`/admin/login?callbackUrl=${encodeURIComponent(pathname ?? '/admin')}`);
      return;
    }

    const user = session?.user as { type?: string; tenantId?: string | null } | undefined;
    if (!isPlatformAdmin(user)) {
      void signOut({ redirect: false }).then(() => {
        router.replace('/unauthorized?from=admin');
      });
    }
  }, [status, session, router, pathname, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isPlatformAdmin(session?.user as { type?: string; tenantId?: string | null })) {
    return null;
  }

  return <>{children}</>;
}

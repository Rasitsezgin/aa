'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useModules } from '@/lib/modules';
import { resolveNavRedirect } from '@/lib/navigation.config';

export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessRoute, isLoading } = useModules();

  useEffect(() => {
    if (!pathname || isLoading) return;

    // Never block core dashboard or upgrade routes
    if (
      pathname === '/dashboard' ||
      pathname === '/dashboard/' ||
      pathname.startsWith('/dashboard/upgrade') ||
      pathname.startsWith('/upgrade')
    ) {
      return;
    }

    const redirect = resolveNavRedirect(pathname);
    if (redirect) {
      router.replace(redirect);
      return;
    }
  }, [pathname, isLoading, router]);

  return <>{children}</>;
}

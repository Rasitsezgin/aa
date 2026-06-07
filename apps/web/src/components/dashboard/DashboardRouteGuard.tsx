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

    const redirect = resolveNavRedirect(pathname);
    if (redirect) {
      router.replace(redirect);
      return;
    }

    if (!canAccessRoute(pathname)) {
      router.replace('/dashboard/upgrade?blocked=' + encodeURIComponent(pathname));
    }
  }, [pathname, isLoading, canAccessRoute, router]);

  return <>{children}</>;
}

'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

export function getTenantIdFromSession(session: Session | null | undefined): string {
  const tid = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  return tid || '';
}

export function useTenantId(): string {
  const { data: session } = useSession();
  return getTenantIdFromSession(session);
}

export function tenantHeaders(session: Session | null | undefined, extra?: Record<string, string>): HeadersInit {
  const tid = getTenantIdFromSession(session);
  return {
    'Content-Type': 'application/json',
    ...(tid ? { 'x-tenant-id': tid } : {}),
    ...extra,
  };
}

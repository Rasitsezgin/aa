'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface TenantContextType {
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: string;
  isReady: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: '',
  userId: '',
  userName: '',
  userEmail: '',
  userType: 'USER',
  isReady: false,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo<TenantContextType>(() => {
    const user = session?.user as any;
    return {
      tenantId: user?.tenantId || '',
      userId: user?.id || '',
      userName: user?.name || '',
      userEmail: user?.email || '',
      userType: user?.type || 'USER',
      isReady: status === 'authenticated' && !!user?.tenantId,
    };
  }, [session, status]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

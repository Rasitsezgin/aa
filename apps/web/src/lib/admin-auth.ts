import 'server-only';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isPlatformAdmin } from '@/lib/platform-admin';

export type PlatformAdminSession = {
  id: string;
  type?: string;
  tenantId?: string | null;
  email?: string | null;
};

export async function requirePlatformAdmin(): Promise<
  | { error: NextResponse; user: null }
  | { error: null; user: PlatformAdminSession }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
    };
  }

  const user = session.user as PlatformAdminSession;

  if (!isPlatformAdmin(user)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}

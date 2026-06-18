/**
 * Platform admin = SUPERADMIN veya tenant'sız ADMIN.
 * Tenant sahibi (tenantId'li ADMIN) platform paneline erişemez.
 */
export type PlatformAdminUser = {
  type?: string | null;
  tenantId?: string | null;
};

export function isPlatformAdmin(user: PlatformAdminUser | null | undefined): boolean {
  if (!user?.type) return false;
  if (user.type === 'SUPERADMIN') return true;
  if (user.type === 'ADMIN' && !user.tenantId) return true;
  return false;
}

export function isTenantOwner(user: PlatformAdminUser | null | undefined): boolean {
  return user?.type === 'ADMIN' && !!user.tenantId;
}

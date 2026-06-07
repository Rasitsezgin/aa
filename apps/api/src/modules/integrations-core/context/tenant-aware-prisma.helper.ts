/**
 * Tenant-scoped Prisma sorguları için yardımcı.
 * ORM middleware yerine explicit kullanım — geliştirici tenant_id unutamaz.
 */
const TENANT_SCOPED_MODELS = new Set([
  'Integration',
  'Product',
  'Order',
  'Customer',
  'MarketplaceProduct',
  'ActivityLog',
  'ServiceCredential',
  'TenantSettings',
  'TenantModule',
]);

export function assertTenantScopedModel(model: string): boolean {
  return TENANT_SCOPED_MODELS.has(model);
}

/** where koşuluna tenantId enjekte eder */
export function injectTenantId<T extends Record<string, unknown>>(
  tenantId: string,
  where?: T,
): T & { tenantId: string } {
  if (!tenantId) {
    throw new Error('tenantId zorunludur');
  }
  return { ...(where ?? ({} as T)), tenantId };
}

/** create/update data nesnesine tenantId ekler */
export function injectTenantIdToData<T extends Record<string, unknown>>(
  tenantId: string,
  data: T,
): T & { tenantId: string } {
  return { ...data, tenantId };
}

import type { NavItemConfig, NavSection } from '@/lib/navigation.config';

export type PanelRole = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER' | 'USER';

export function resolvePanelRole(userType?: string, roleName?: string): PanelRole {
  const type = (userType || '').toUpperCase();
  const role = (roleName || '').toUpperCase();

  if (type === 'SUPERADMIN') return 'SUPERADMIN';
  if (type === 'ADMIN' || role === 'ADMIN' || role.includes('ADMIN')) return 'ADMIN';
  if (role.includes('MANAGER') || role.includes('YÖNET')) return 'MANAGER';
  if (role.includes('OPERATOR') || role.includes('OPERATÖR') || role.includes('DEPO')) return 'OPERATOR';
  if (role.includes('VIEWER') || role.includes('İZLE')) return 'VIEWER';
  return 'USER';
}

const SECTION_ACCESS: Record<PanelRole, string[] | '*'> = {
  SUPERADMIN: '*',
  ADMIN: '*',
  MANAGER: ['Günlük', 'Büyüme', 'Operasyon', 'Finans', 'Sistem', 'Kişisel'],
  OPERATOR: ['Günlük', 'Operasyon'],
  USER: ['Günlük', 'Büyüme', 'Operasyon', 'Finans', 'Sistem', 'Kişisel'],
  VIEWER: ['Günlük'],
};

const RESTRICTED_HREFS: Partial<Record<PanelRole, string[]>> = {
  VIEWER: ['/dashboard/settings', '/dashboard/webhooks', '/dashboard/bulk-actions'],
  OPERATOR: ['/dashboard/settings', '/dashboard/webhooks', '/dashboard/payments', '/dashboard/finance'],
};

export function canAccessNavSection(role: PanelRole, section: string): boolean {
  const allowed = SECTION_ACCESS[role];
  if (allowed === '*') return true;
  return allowed.includes(section);
}

export function canAccessNavItem(role: PanelRole, item: NavItemConfig): boolean {
  if (!canAccessNavSection(role, item.section)) return false;
  const blocked = RESTRICTED_HREFS[role];
  if (blocked?.includes(item.href)) return false;
  return true;
}

export function filterNavSections(sections: NavSection[], role: PanelRole): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessNavItem(role, item)),
    }))
    .filter((section) => section.items.length > 0 && canAccessNavSection(role, section.title));
}

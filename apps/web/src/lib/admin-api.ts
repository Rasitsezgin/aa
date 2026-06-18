async function fetchLocalAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API Hatası' }));
    throw new Error(error.message || error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** NestJS admin API — oturum üzerinden BFF proxy */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const path = endpoint.replace(/^\//, '');
  return fetchLocalAPI<T>(`/api/admin/proxy/${path}`, options);
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════

export const adminApi = {
  getDashboardStats: () => fetchAPI<any>('admin/dashboard/stats'),

  // ═══════════════════════════════════════════════════════════════════
  // TENANTS
  // ═══════════════════════════════════════════════════════════════════
  getTenants: (params?: { plan?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.plan) qs.set('plan', params.plan);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/tenants?${qs}`);
  },
  getTenantDetail: (id: string) => fetchAPI<any>(`admin/tenants/${id}`),
  updateTenant: (id: string, data: any) =>
    fetchAPI<any>(`admin/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTenant: (id: string) =>
    fetchAPI<any>(`admin/tenants/${id}`, { method: 'DELETE' }),

  // ═══════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════
  getUsers: (params?: { tenantId?: string; type?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set('tenantId', params.tenantId);
    if (params?.type) qs.set('type', params.type);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/users?${qs}`);
  },
  getUserDetail: (id: string) => fetchAPI<any>(`admin/users/${id}`),
  updateUser: (id: string, data: any) =>
    fetchAPI<any>(`admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  lockUser: (id: string) =>
    fetchAPI<any>(`admin/users/${id}/lock`, { method: 'POST' }),
  unlockUser: (id: string) =>
    fetchAPI<any>(`admin/users/${id}/unlock`, { method: 'POST' }),
  force2FA: (id: string) =>
    fetchAPI<any>(`admin/users/${id}/force-2fa`, { method: 'POST' }),

  // ═══════════════════════════════════════════════════════════════════
  // CRM & CUSTOMERS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════
  getCustomers: (params?: { search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/customers?${qs}`);
  },
  getCustomerDetail: (email: string) => fetchAPI<any>(`admin/customers/${encodeURIComponent(email)}`),

  // ═══════════════════════════════════════════════════════════════════
  // HELPDESK & TICKETS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════
  getSupportTickets: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/support-tickets?${qs}`);
  },
  getSupportTicketDetail: (id: string) => fetchAPI<any>(`admin/support-tickets/${id}`),
  replyToSupportTicket: (id: string, content: string) =>
    fetchAPI<any>(`admin/support-tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),

  // ═══════════════════════════════════════════════════════════════════
  // TASKS (Phase 3 Kanban)
  // ═══════════════════════════════════════════════════════════════════
  getTasks: (params?: { status?: string; assigneeId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.assigneeId) qs.set('assigneeId', params.assigneeId);
    return fetchAPI<any>(`admin/tasks?${qs}`);
  },
  createTask: (data: any) =>
    fetchAPI<any>('admin/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    fetchAPI<any>(`admin/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    fetchAPI<any>(`admin/tasks/${id}`, { method: 'DELETE' }),

  // ═══════════════════════════════════════════════════════════════════
  // VARIANTS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════
  getProductVariants: (productId: string) =>
    fetchAPI<any>(`admin/products/${productId}/variants`),
  bulkUpdateVariants: (productId: string, variants: any[]) =>
    fetchAPI<any>(`admin/products/${productId}/variants/bulk`, {
      method: 'POST',
      body: JSON.stringify({ variants })
    }),

  // ═══════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════════════════
  getProducts: (params?: { search?: string; limit?: number; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/products?${qs}`);
  },

  getOrders: (params?: { search?: string; status?: string; tenantId?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.tenantId) qs.set('tenantId', params.tenantId);
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.limit) qs.set('limit', (params.limit ?? 50).toString());
    return fetchAPI<any>(`admin/orders?${qs}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    fetchAPI<any>(`admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getModules: () => fetchLocalAPI<any>('/api/admin/modules'),
  updateModule: (id: string, data: Record<string, unknown>) =>
    fetchLocalAPI<any>(`/api/admin/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getForumOverview: () => fetchLocalAPI<any>('/api/admin/forum'),
  getOffers: () => fetchLocalAPI<any>('/api/admin/offers'),
  createOffer: (data: Record<string, unknown>) =>
    fetchLocalAPI<any>('/api/admin/offers', { method: 'POST', body: JSON.stringify(data) }),
  updateOffer: (id: string, data: Record<string, unknown>) =>
    fetchLocalAPI<any>(`/api/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOffer: (id: string) =>
    fetchLocalAPI<any>(`/api/admin/offers/${id}`, { method: 'DELETE' }),

  // ═══════════════════════════════════════════════════════════════════
  sendMessageToAiAssistant: (message: string, history: any[] = []) =>
    fetchAPI<any>('admin/ai-assistant/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),

  getPredictions: (tenantId?: string) =>
    fetchAPI<any>(`analytics/predictions${tenantId ? `?tenantId=${tenantId}` : ''}`),

  getAiSummary: (tenantId?: string) =>
    fetchAPI<any>(`analytics/ai-summary${tenantId ? `?tenantId=${tenantId}` : ''}`),

  // ═══════════════════════════════════════════════════════════════════
  // ROLES
  // ═══════════════════════════════════════════════════════════════════
  getRoles: (tenantId?: string) => {
    const qs = tenantId ? `?tenantId=${tenantId}` : '';
    return fetchAPI<any>(`admin/roles${qs}`);
  },
  createRole: (data: { name: string; description?: string; permissions: string[] }) =>
    fetchAPI<any>('admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: any) =>
    fetchAPI<any>(`admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: string) =>
    fetchAPI<any>(`admin/roles/${id}`, { method: 'DELETE' }),

  // ═══════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════
  getAuditLogs: (params?: {
    tenantId?: string; action?: string; resource?: string;
    startDate?: string; endDate?: string; page?: number; limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set('tenantId', params.tenantId);
    if (params?.action) qs.set('action', params.action);
    if (params?.resource) qs.set('resource', params.resource);
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.limit) qs.set('limit', params.limit.toString());
    return fetchAPI<any>(`admin/audit-logs?${qs}`);
  },

  // ═══════════════════════════════════════════════════════════════════
  // BACKUPS
  // ═══════════════════════════════════════════════════════════════════
  getBackups: (params?: { tenantId?: string; status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.tenantId) qs.set('tenantId', params.tenantId);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/backups?${qs}`);
  },
  getBackupSchedules: () => fetchAPI<any>('admin/backup-schedules'),
  createBackupSchedule: (data: any) =>
    fetchAPI<any>('admin/backup-schedules', { method: 'POST', body: JSON.stringify(data) }),
  restoreBackup: (id: string, dryRun?: boolean) =>
    fetchAPI<any>(`admin/backups/${id}/restore`, { method: 'POST', body: JSON.stringify({ dryRun }) }),
  getDrSettings: () => fetchAPI<any>('admin/dr-settings'),
  updateDrSettings: (tenantId: string, data: any) =>
    fetchAPI<any>(`admin/dr-settings/${tenantId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ═══════════════════════════════════════════════════════════════════
  // SECURITY
  // ═══════════════════════════════════════════════════════════════════
  getLoginAttempts: (params?: { email?: string; success?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.email) qs.set('email', params.email);
    if (params?.success) qs.set('success', params.success);
    if (params?.page) qs.set('page', params.page.toString());
    return fetchAPI<any>(`admin/security/login-attempts?${qs}`);
  },
  getSecurityStats: () => fetchAPI<any>('admin/security/stats'),
  getSuspiciousIps: () => fetchAPI<any>('admin/security/suspicious-ips'),
  blockIp: (ip: string, reason: string) =>
    fetchAPI<any>('admin/security/block-ip', { method: 'POST', body: JSON.stringify({ ip, reason }) }),
  get2FAStats: () => fetchAPI<any>('admin/security/2fa-stats'),

  // ═══════════════════════════════════════════════════════════════════
  // SEO YÖNETİMİ
  // ═══════════════════════════════════════════════════════════════════
  getSeoPages: () => fetchLocalAPI<any>('/api/admin/seo/pages'),
  getSeoStats: () => fetchLocalAPI<any>('/api/admin/seo/stats'),
  getSeoRedirects: () => fetchLocalAPI<any>('/api/admin/seo/redirects'),
  getStructuredData: () => fetchLocalAPI<any>('/api/admin/seo/structured-data'),
  updateSeoPage: (pageId: string, data: any) =>
    fetchLocalAPI<any>(`/api/admin/seo/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  createRedirect: (data: { source: string; destination: string; type: string }) =>
    fetchLocalAPI<any>('/api/admin/seo/redirects', { method: 'POST', body: JSON.stringify(data) }),
  runSeoAudit: () => fetchLocalAPI<any>('/api/admin/seo/audit', { method: 'POST' }),
  regenerateSitemap: () => fetchLocalAPI<any>('/api/admin/seo/sitemap/regenerate', { method: 'POST' }),

  // ═══════════════════════════════════════════════════════════════════
  // EXISTING
  // ═══════════════════════════════════════════════════════════════════
  getBilling: () => fetchAPI<any>('admin/billing'),
  getApiUsage: () => fetchAPI<any>('admin/api-usage'),
  getFeatureFlags: () => fetchAPI<any>('admin/feature-flags'),
  updateFeatureFlag: (key: string, data: any) =>
    fetchAPI<any>(`admin/feature-flags/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMaintenanceMode: () => fetchAPI<any>('admin/maintenance'),
  setMaintenanceMode: (data: any) =>
    fetchAPI<any>('admin/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  bulkOperation: (data: any) =>
    fetchAPI<any>('admin/bulk-operation', { method: 'POST', body: JSON.stringify(data) }),
  sendAnnouncement: (data: any) =>
    fetchAPI<any>('admin/announcement', { method: 'POST', body: JSON.stringify(data) }),
  // ═══════════════════════════════════════════════════════════════════
  // SYSTEM MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════
  getSystemServices: () => fetchAPI<any>('system/services'),
  controlService: (serviceId: string, action: 'start' | 'stop' | 'restart') =>
    fetchAPI<any>(`system/services/${serviceId}/${action}`, { method: 'POST' }),
  getDatabaseInfo: () => fetchAPI<any>('system/database'),
  databaseAction: (action: 'backup' | 'migrate' | 'optimize') =>
    fetchAPI<any>(`system/database/${action}`, { method: 'POST' }),
  getDeploymentInfo: () => fetchAPI<any>('system/deployment'),
  runScript: (scriptName: string) =>
    fetchAPI<any>(`system/scripts/${scriptName}/run`, { method: 'POST' }),

  getSystemRealtime: () => fetchAPI<any>('system/realtime'),
};

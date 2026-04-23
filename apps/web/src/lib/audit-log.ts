import { prisma } from '@/lib/prisma';
import { cache } from './cache';

// Audit log types
type AuditAction =
  // Authentication
  | 'user.login'
  | 'user.logout'
  | 'user.password_reset'
  | 'user.password_change'
  | 'user.2fa_enabled'
  | 'user.2fa_disabled'
  // Authorization
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'permission.granted'
  | 'permission.revoked'
  // Tenant operations
  | 'tenant.created'
  | 'tenant.updated'
  | 'tenant.settings_changed'
  // Products
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.bulk_updated'
  | 'product.bulk_deleted'
  | 'product.imported'
  | 'product.exported'
  // Orders
  | 'order.created'
  | 'order.updated'
  | 'order.cancelled'
  | 'order.refunded'
  // Inventory
  | 'stock.adjusted'
  | 'stock.counted'
  // Pricing
  | 'price.updated'
  | 'price.rule_created'
  // Integrations
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.synced'
  | 'api_key.created'
  | 'api_key.rotated'
  | 'api_key.revoked'
  // AI
  | 'ai.prompt_sent'
  | 'ai.analysis_run'
  | 'ai.content_generated'
  // Security
  | 'security.alert'
  | 'security.rate_limit_hit'
  | 'security.suspicious_activity'
  // System
  | 'system.backup'
  | 'system.restore'
  | 'system.maintenance';

type AuditSeverity = 'info' | 'warning' | 'critical';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: string[];
}

// Audit logger class
export class AuditLogger {
  private static instance: AuditLogger;
  private batchQueue: AuditLogEntry[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log single event
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Add to batch queue
    this.batchQueue.push(fullEntry);

    // Schedule batch write
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), 5000); // 5 second batch
    }

    // Also cache recent critical events
    if (entry.severity === 'critical') {
      await this.cacheCriticalEvent(fullEntry);
    }

    // Real-time alert for security events
    if (this.isSecurityEvent(entry.action)) {
      await this.triggerSecurityAlert(fullEntry);
    }
  }

  // Batch write to database
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      this.batchTimeout = null;
      return;
    }

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    try {
      // Write to database
      await prisma.$transaction(
        batch.map((entry) =>
          prisma.auditLog.create({
            data: {
              id: entry.id,
              tenantId: entry.tenantId,
              userId: entry.userId,
              userEmail: entry.userEmail,
              action: entry.action,
              resource: entry.resource,
              resourceId: entry.resourceId,
              severity: entry.severity,
              ipAddress: entry.ipAddress,
              userAgent: entry.userAgent,
              metadata: entry.metadata || {},
              before: entry.before || null,
              after: entry.after || null,
              changes: entry.changes || null,
            },
          })
        )
      );
    } catch (error) {
      console.error('Audit log batch write failed:', error);
      // Re-queue failed entries
      this.batchQueue.unshift(...batch);
    }
  }

  // Cache critical events for quick access
  private async cacheCriticalEvent(entry: AuditLogEntry): Promise<void> {
    const key = `audit:critical:${entry.tenantId || 'global'}:${Date.now()}`;
    await cache.set(key, entry, 86400); // 24 hours
  }

  // Trigger security alert
  private async triggerSecurityAlert(entry: AuditLogEntry): Promise<void> {
    // Could send to Slack, email, or Sentry
    console.warn('Security Alert:', entry);

    // Cache for security dashboard
    const key = `audit:security:${entry.tenantId || 'global'}:${entry.action}`;
    await cache.set(key, entry, 3600); // 1 hour
  }

  // Check if action is security-related
  private isSecurityEvent(action: AuditAction): boolean {
    const securityActions: AuditAction[] = [
      'security.alert',
      'security.suspicious_activity',
      'user.password_reset',
      'user.password_change',
      'user.2fa_enabled',
      'user.2fa_disabled',
      'api_key.revoked',
      'security.rate_limit_hit',
    ];
    return securityActions.includes(action);
  }

  // Query audit logs
  async query(filters: {
    tenantId?: string;
    userId?: string;
    action?: AuditAction;
    resource?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditLogEntry[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.severity) where.severity = filters.severity;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {} as Record<string, Date>;
      if (filters.startDate) (where.timestamp as Record<string, Date>).gte = filters.startDate;
      if (filters.endDate) (where.timestamp as Record<string, Date>).lte = filters.endDate;
    }

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      entries: entries.map((e: {
        metadata: unknown;
        before: unknown;
        after: unknown;
        changes: unknown;
        [key: string]: unknown;
      }) => ({
        ...e,
        metadata: e.metadata as Record<string, unknown>,
        before: e.before as Record<string, unknown> | undefined,
        after: e.after as Record<string, unknown> | undefined,
        changes: e.changes as string[] | undefined,
      })) as AuditLogEntry[],
      total,
    };
  }

  // Get recent critical events from cache
  async getRecentCritical(tenantId?: string, limit = 10): Promise<AuditLogEntry[]> {
    const pattern = `audit:critical:${tenantId || '*'}:*`;
    // Note: This is a simplified version. In production, use proper cache querying
    return [];
  }

  // Export audit log
  async export(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { entries } = await this.query({
      tenantId,
      startDate,
      endDate,
      limit: 10000,
    });

    if (format === 'csv') {
      const headers = ['timestamp', 'userEmail', 'action', 'resource', 'resourceId', 'severity', 'metadata'];
      const rows = entries.map((e) => [
        e.timestamp.toISOString(),
        e.userEmail || '',
        e.action,
        e.resource,
        e.resourceId || '',
        e.severity,
        JSON.stringify(e.metadata),
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return JSON.stringify(entries, null, 2);
  }
}

// Export singleton
export const auditLogger = AuditLogger.getInstance();

// Helper to extract request info
export function getRequestInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  return {
    ipAddress:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

// Middleware helper for API routes
export async function withAudit(
  request: Request,
  action: AuditAction,
  callback: () => Promise<Response>,
  options: {
    tenantId?: string;
    userId?: string;
    userEmail?: string;
    resource?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<Response> {
  const startTime = Date.now();
  const requestInfo = getRequestInfo(request);

  try {
    const response = await callback();
    const duration = Date.now() - startTime;

    // Log successful request
    await auditLogger.log({
      tenantId: options.tenantId,
      userId: options.userId,
      userEmail: options.userEmail,
      action,
      resource: options.resource || 'api',
      resourceId: options.resourceId,
      severity: options.severity || 'info',
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      metadata: {
        ...options.metadata,
        statusCode: response.status,
        duration,
      },
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed request
    await auditLogger.log({
      tenantId: options.tenantId,
      userId: options.userId,
      userEmail: options.userEmail,
      action,
      resource: options.resource || 'api',
      resourceId: options.resourceId,
      severity: 'critical',
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      metadata: {
        ...options.metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
    });

    throw error;
  }
}

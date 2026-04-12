import { Injectable } from '@nestjs/common';

export enum AuditAction {
  // Auth actions
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  PASSWORD_CHANGE = 'auth.password_change',
  PASSWORD_RESET = 'auth.password_reset',

  // User actions
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_INVITE = 'user.invite',

  // Product actions
  PRODUCT_CREATE = 'product.create',
  PRODUCT_UPDATE = 'product.update',
  PRODUCT_DELETE = 'product.delete',
  PRODUCT_IMPORT = 'product.import',
  PRODUCT_EXPORT = 'product.export',

  // Order actions
  ORDER_CREATE = 'order.create',
  ORDER_UPDATE = 'order.update',
  ORDER_CANCEL = 'order.cancel',
  ORDER_SHIP = 'order.ship',
  ORDER_DELIVER = 'order.deliver',
  ORDER_REFUND = 'order.refund',

  // Inventory actions
  INVENTORY_UPDATE = 'inventory.update',
  INVENTORY_SYNC = 'inventory.sync',
  INVENTORY_ALERT = 'inventory.alert',

  // Integration actions
  MARKETPLACE_CONNECT = 'marketplace.connect',
  MARKETPLACE_DISCONNECT = 'marketplace.disconnect',
  MARKETPLACE_SYNC = 'marketplace.sync',
  SERVICE_CREDENTIAL_CREATE = 'service_credential.create',
  SERVICE_CREDENTIAL_UPDATE = 'service_credential.update',
  SERVICE_CREDENTIAL_DELETE = 'service_credential.delete',
  SERVICE_CREDENTIAL_TEST = 'service_credential.test',
  SERVICE_CREDENTIAL_ROTATE = 'service_credential.rotate',
  WEBHOOK_SECRET_ROTATE = 'webhook_secret.rotate',

  // Settings actions
  SETTINGS_UPDATE = 'settings.update',
  WEBHOOK_CREATE = 'webhook.create',
  WEBHOOK_UPDATE = 'webhook.update',
  WEBHOOK_DELETE = 'webhook.delete',
  API_KEY_CREATE = 'api_key.create',
  API_KEY_REVOKE = 'api_key.revoke',

  // AI actions
  AI_ANALYZE = 'ai.analyze',
  AI_GENERATE = 'ai.generate',
  AI_SUGGEST = 'ai.suggest',

  // Automation actions
  AUTOMATION_CREATE = 'automation.create',
  AUTOMATION_UPDATE = 'automation.update',
  AUTOMATION_DELETE = 'automation.delete',
  AUTOMATION_TRIGGER = 'automation.trigger',

  // Data actions
  DATA_EXPORT = 'data.export',
  DATA_IMPORT = 'data.import',
  DATA_BACKUP = 'data.backup',
  DATA_RESTORE = 'data.restore',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  action?: AuditAction | AuditAction[];
  severity?: AuditSeverity | AuditSeverity[];
  userId?: string;
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: { userId: string; email: string; count: number }[];
  successRate: number;
  recentActivity: AuditLogEntry[];
}

// In-memory store (use database in production)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000;

@Injectable()
export class AuditService {
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async log(params: {
    action: AuditAction;
    userId?: string;
    userEmail?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
    resourceType?: string;
    resourceId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    metadata?: Record<string, any>;
    duration?: number;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditLogEntry> {
    const severity = this.determineSeverity(params.action, params.success);

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      action: params.action,
      severity,
      userId: params.userId,
      userEmail: params.userEmail,
      tenantId: params.tenantId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      metadata: params.metadata,
      duration: params.duration,
      success: params.success ?? true,
      errorMessage: params.errorMessage,
    };

    // Add to store
    auditLogs.unshift(entry);

    // Limit store size
    if (auditLogs.length > MAX_LOGS) {
      auditLogs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[AUDIT] ${entry.action} - ${entry.userEmail || 'System'} - ${entry.success ? 'SUCCESS' : 'FAILED'}`,
      );
    }

    return entry;
  }

  private determineSeverity(
    action: AuditAction,
    success?: boolean,
  ): AuditSeverity {
    if (!success) {
      if (action.includes('login') || action.includes('password')) {
        return AuditSeverity.WARNING;
      }
      return AuditSeverity.ERROR;
    }

    const criticalActions = [
      AuditAction.PASSWORD_CHANGE,
      AuditAction.API_KEY_CREATE,
      AuditAction.API_KEY_REVOKE,
      AuditAction.USER_DELETE,
      AuditAction.DATA_RESTORE,
    ];

    const warningActions = [
      AuditAction.LOGIN_FAILED,
      AuditAction.SETTINGS_UPDATE,
      AuditAction.WEBHOOK_DELETE,
      AuditAction.AUTOMATION_DELETE,
    ];

    if (criticalActions.includes(action)) return AuditSeverity.CRITICAL;
    if (warningActions.includes(action)) return AuditSeverity.WARNING;
    return AuditSeverity.INFO;
  }

  async query(
    params: AuditQuery,
  ): Promise<{ logs: AuditLogEntry[]; total: number; pages: number }> {
    let filtered = [...auditLogs];

    // Apply filters
    if (params.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= params.endDate!);
    }
    if (params.action) {
      const actions = Array.isArray(params.action)
        ? params.action
        : [params.action];
      filtered = filtered.filter((log) => actions.includes(log.action));
    }
    if (params.severity) {
      const severities = Array.isArray(params.severity)
        ? params.severity
        : [params.severity];
      filtered = filtered.filter((log) => severities.includes(log.severity));
    }
    if (params.userId) {
      filtered = filtered.filter((log) => log.userId === params.userId);
    }
    if (params.tenantId) {
      filtered = filtered.filter((log) => log.tenantId === params.tenantId);
    }
    if (params.resourceType) {
      filtered = filtered.filter(
        (log) => log.resourceType === params.resourceType,
      );
    }
    if (params.resourceId) {
      filtered = filtered.filter((log) => log.resourceId === params.resourceId);
    }
    if (params.success !== undefined) {
      filtered = filtered.filter((log) => log.success === params.success);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(search) ||
          log.userEmail?.toLowerCase().includes(search) ||
          log.resourceType?.toLowerCase().includes(search) ||
          log.errorMessage?.toLowerCase().includes(search),
      );
    }

    // Sort
    const sortBy = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // Paginate
    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      logs: paginated,
      total: filtered.length,
      pages: Math.ceil(filtered.length / limit),
    };
  }

  async getById(id: string): Promise<AuditLogEntry | null> {
    return auditLogs.find((log) => log.id === id) || null;
  }

  async getStats(tenantId?: string): Promise<AuditStats> {
    const logs = tenantId
      ? auditLogs.filter((log) => log.tenantId === tenantId)
      : auditLogs;

    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const userCounts: Record<string, { email: string; count: number }> = {};
    let successCount = 0;

    logs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

      if (log.userId) {
        if (!userCounts[log.userId]) {
          userCounts[log.userId] = {
            email: log.userEmail || 'Unknown',
            count: 0,
          };
        }
        userCounts[log.userId].count++;
      }

      if (log.success) successCount++;
    });

    const byUser = Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        email: data.email,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: logs.length,
      byAction,
      bySeverity,
      byUser,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 100,
      recentActivity: logs.slice(0, 10),
    };
  }

  async getActivityTimeline(
    tenantId: string,
    hours: number = 24,
  ): Promise<{ hour: string; count: number }[]> {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const logs = auditLogs.filter(
      (log) => log.tenantId === tenantId && log.timestamp >= startTime,
    );

    const hourlyData: Record<string, number> = {};

    for (let i = 0; i < hours; i++) {
      const hour = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const key = hour.toISOString().slice(0, 13);
      hourlyData[key] = 0;
    }

    logs.forEach((log) => {
      const key = log.timestamp.toISOString().slice(0, 13);
      if (hourlyData[key] !== undefined) {
        hourlyData[key]++;
      }
    });

    return Object.entries(hourlyData).map(([hour, count]) => ({ hour, count }));
  }

  // Helper method to create audit context from request
  createContext(req: any): {
    ipAddress: string;
    userAgent: string;
    userId?: string;
    userEmail?: string;
    tenantId?: string;
  } {
    return {
      ipAddress:
        req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      userId: req.user?.id,
      userEmail: req.user?.email,
      tenantId: req.user?.tenantId,
    };
  }

  // Method to track changes between old and new values
  trackChanges(
    oldValue: Record<string, any>,
    newValue: Record<string, any>,
  ): {
    changed: string[];
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
  } {
    const changed: string[] = [];
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    Object.keys(newValue).forEach((key) => {
      if (oldValue[key] !== newValue[key]) {
        changed.push(key);

        if (sensitiveFields.some((f) => key.toLowerCase().includes(f))) {
          oldValues[key] = '***';
          newValues[key] = '***';
        } else {
          oldValues[key] = oldValue[key];
          newValues[key] = newValue[key];
        }
      }
    });

    return { changed, oldValues, newValues };
  }
}

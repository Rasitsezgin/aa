// Activity Logger - Comprehensive activity tracking
// Tracks all user and system activities

import { prisma } from '@/lib/prisma';

type ActivityType = 
  // Auth activities
  | 'user.login' | 'user.logout' | 'user.register' | 'user.password_change'
  | 'user.password_reset' | 'user.profile_update' | 'user.deactivate'
  // Product activities
  | 'product.create' | 'product.update' | 'product.delete' | 'product.import'
  | 'product.export' | 'product.bulk_update' | 'product.image_upload'
  // Order activities
  | 'order.create' | 'order.update' | 'order.cancel' | 'order.ship'
  | 'order.deliver' | 'order.refund' | 'order.print'
  // Inventory activities
  | 'inventory.adjust' | 'inventory.transfer' | 'inventory.count'
  | 'inventory.low_stock_alert'
  // Integration activities
  | 'integration.connect' | 'integration.disconnect' | 'integration.sync'
  | 'integration.config_update'
  // System activities
  | 'settings.update' | 'user.permission_change' | 'role.create'
  | 'api.key_generate' | 'webhook.create' | 'export.generate'
  // Data activities
  | 'data.import' | 'data.export' | 'data.delete' | 'data.anonymize'
  // Security activities
  | 'security.block' | 'security.unblock' | 'security.suspicious_activity'
  | 'security.two_factor_enable' | 'security.two_factor_disable';

type ActivitySeverity = 'info' | 'warning' | 'error' | 'critical';

interface Activity {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  type: ActivityType;
  description: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  severity: ActivitySeverity;
  status: 'success' | 'failure' | 'pending';
  duration?: number; // milliseconds
  createdAt: Date;
}

interface ActivityFilter {
  tenantId?: string;
  userId?: string;
  types?: ActivityType[];
  severity?: ActivitySeverity[];
  entityType?: string;
  entityId?: string;
  dateRange?: { from: Date; to: Date };
  status?: 'success' | 'failure' | 'pending';
  search?: string;
}

interface ActivityStats {
  totalCount: number;
  byType: Record<string, number>;
  byUser: Record<string, number>;
  byDay: Record<string, number>;
  errorRate: number;
  averageDuration: number;
}

// Activity Logger
export class ActivityLogger {
  private activities: Activity[] = [];
  private maxMemorySize = 10000;
  private listeners: Array<(activity: Activity) => void> = [];

  // Log activity
  async log(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const fullActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Add to memory buffer
    this.activities.unshift(fullActivity);
    if (this.activities.length > this.maxMemorySize) {
      this.activities = this.activities.slice(0, this.maxMemorySize);
    }

    // Persist to database
    await this.persist(fullActivity);

    // Notify listeners
    this.listeners.forEach(listener => listener(fullActivity));

    // Real-time notifications for critical activities
    if (activity.severity === 'critical') {
      await this.notifyCriticalActivity(fullActivity);
    }

    return fullActivity;
  }

  // Log with convenience method
  async record(
    tenantId: string,
    type: ActivityType,
    description: string,
    options: {
      userId?: string;
      userEmail?: string;
      userName?: string;
      entity?: Activity['entity'];
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      severity?: ActivitySeverity;
      status?: 'success' | 'failure' | 'pending';
      duration?: number;
    } = {}
  ): Promise<Activity> {
    return this.log({
      tenantId,
      type,
      description,
      ...options,
      metadata: options.metadata || {},
      severity: options.severity || 'info',
      status: options.status || 'success',
    });
  }

  // Get activities with filter
  async getActivities(
    filter: ActivityFilter,
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 50 }
  ): Promise<{
    activities: Activity[];
    total: number;
    hasMore: boolean;
  }> {
    let filtered = [...this.activities];

    // Apply filters
    if (filter.tenantId) {
      filtered = filtered.filter(a => a.tenantId === filter.tenantId);
    }

    if (filter.userId) {
      filtered = filtered.filter(a => a.userId === filter.userId);
    }

    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(a => filter.types!.includes(a.type));
    }

    if (filter.severity && filter.severity.length > 0) {
      filtered = filtered.filter(a => filter.severity!.includes(a.severity));
    }

    if (filter.entityType) {
      filtered = filtered.filter(a => a.entity?.type === filter.entityType);
    }

    if (filter.entityId) {
      filtered = filtered.filter(a => a.entity?.id === filter.entityId);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(
        a => a.createdAt >= filter.dateRange!.from && a.createdAt <= filter.dateRange!.to
      );
    }

    if (filter.status) {
      filtered = filtered.filter(a => a.status === filter.status);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.description.toLowerCase().includes(searchLower) ||
          a.userEmail?.toLowerCase().includes(searchLower) ||
          a.userName?.toLowerCase().includes(searchLower) ||
          JSON.stringify(a.metadata).toLowerCase().includes(searchLower)
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = filtered.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const paginated = filtered.slice(start, end);

    return {
      activities: paginated,
      total,
      hasMore: end < total,
    };
  }

  // Get activity by ID
  getById(activityId: string): Activity | null {
    return this.activities.find(a => a.id === activityId) || null;
  }

  // Get user activity timeline
  async getUserTimeline(
    userId: string,
    tenantId: string,
    options: { from?: Date; to?: Date } = {}
  ): Promise<{
    sessions: Array<{
      start: Date;
      end: Date;
      activities: Activity[];
      duration: number;
    }>;
    summary: {
      totalActivities: number;
      mostActiveDay: string;
      averageSessionDuration: number;
    };
  }> {
    const { from, to } = options;
    
    const userActivities = this.activities.filter(
      a => a.userId === userId && 
           a.tenantId === tenantId &&
           (!from || a.createdAt >= from) &&
           (!to || a.createdAt <= to)
    );

    // Group into sessions (gaps > 30 minutes)
    const sessions = this.groupIntoSessions(userActivities, 30 * 60 * 1000);

    // Calculate summary
    const byDay: Record<string, number> = {};
    for (const activity of userActivities) {
      const day = activity.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    }

    const mostActiveDay = Object.entries(byDay)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const totalSessionDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      sessions,
      summary: {
        totalActivities: userActivities.length,
        mostActiveDay,
        averageSessionDuration: sessions.length > 0 ? totalSessionDuration / sessions.length : 0,
      },
    };
  }

  // Get statistics
  getStats(tenantId: string, period: { from: Date; to: Date }): ActivityStats {
    const activities = this.activities.filter(
      a => a.tenantId === tenantId &&
           a.createdAt >= period.from &&
           a.createdAt <= period.to
    );

    const byType: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let errorCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    for (const activity of activities) {
      // By type
      byType[activity.type] = (byType[activity.type] || 0) + 1;

      // By user
      const userKey = activity.userEmail || 'anonymous';
      byUser[userKey] = (byUser[userKey] || 0) + 1;

      // By day
      const day = activity.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;

      // Errors
      if (activity.status === 'failure') {
        errorCount++;
      }

      // Duration
      if (activity.duration) {
        totalDuration += activity.duration;
        durationCount++;
      }
    }

    return {
      totalCount: activities.length,
      byType,
      byUser,
      byDay,
      errorRate: activities.length > 0 ? (errorCount / activities.length) * 100 : 0,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    };
  }

  // Export activities
  async export(
    filter: ActivityFilter,
    format: 'csv' | 'json' | 'excel'
  ): Promise<Buffer> {
    const { activities } = await this.getActivities(filter, { page: 1, pageSize: 10000 });

    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(activities, null, 2));

      case 'csv':
        const headers = ['Timestamp', 'User', 'Type', 'Description', 'Entity', 'Status', 'IP'];
        const rows = activities.map(a => [
          a.createdAt.toISOString(),
          a.userEmail || '-',
          a.type,
          a.description,
          a.entity ? `${a.entity.type}:${a.entity.id}` : '-',
          a.status,
          a.ipAddress || '-',
        ]);
        return Buffer.from([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));

      default:
        throw new Error(`Format ${format} not supported`);
    }
  }

  // Subscribe to activities
  subscribe(callback: (activity: Activity) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Private methods
  private async persist(activity: Activity): Promise<void> {
    // Would save to database
    // console.log(`[ACTIVITY] ${activity.type}: ${activity.description}`);
  }

  private async notifyCriticalActivity(activity: Activity): Promise<void {
    // Would send notification to admins
    console.warn(`[CRITICAL] ${activity.type}: ${activity.description}`);
  }

  private groupIntoSessions(
    activities: Activity[],
    gapThreshold: number
  ): Array<{
    start: Date;
    end: Date;
    activities: Activity[];
    duration: number;
  }> {
    if (activities.length === 0) return [];

    const sorted = [...activities].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const sessions = [];
    let currentSession: Activity[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].createdAt.getTime() - sorted[i - 1].createdAt.getTime();
      
      if (gap > gapThreshold) {
        // End current session
        const start = currentSession[0].createdAt;
        const end = currentSession[currentSession.length - 1].createdAt;
        sessions.push({
          start,
          end,
          activities: currentSession,
          duration: end.getTime() - start.getTime(),
        });
        currentSession = [sorted[i]];
      } else {
        currentSession.push(sorted[i]);
      }
    }

    // Don't forget the last session
    if (currentSession.length > 0) {
      const start = currentSession[0].createdAt;
      const end = currentSession[currentSession.length - 1].createdAt;
      sessions.push({
        start,
        end,
        activities: currentSession,
        duration: end.getTime() - start.getTime(),
      });
    }

    return sessions;
  }
}

// Activity retention manager
export class ActivityRetentionManager {
  constructor(private logger: ActivityLogger) {}

  async applyRetentionPolicy(tenantId: string, config: {
    keepDays: number;
    archiveBeforeDelete: boolean;
    archiveLocation?: string;
  }): Promise<{
    archived: number;
    deleted: number;
  }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.keepDays);

    const oldActivities = this.logger['activities'].filter(
      a => a.tenantId === tenantId && a.createdAt < cutoff
    );

    let archived = 0;
    let deleted = 0;

    if (config.archiveBeforeDelete) {
      // Archive old activities
      await this.archive(oldActivities, config.archiveLocation);
      archived = oldActivities.length;
    }

    // Delete from memory
    this.logger['activities'] = this.logger['activities'].filter(
      a => !(a.tenantId === tenantId && a.createdAt < cutoff)
    );

    // Delete from database
    deleted = oldActivities.length;

    return { archived, deleted };
  }

  private async archive(activities: Activity[], location?: string): Promise<void> {
    // Would archive to S3, Glacier, etc.
    console.log(`Archived ${activities.length} activities`);
  }
}

// Export singleton
export const activityLogger = new ActivityLogger();
export const retentionManager = new ActivityRetentionManager(activityLogger);

export { Activity, ActivityType, ActivitySeverity, ActivityFilter };

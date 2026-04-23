// GDPR Compliance & Data Retention Management
// Handles data anonymization, deletion, and retention policies

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

interface RetentionPolicy {
  dataType: string;
  retentionPeriod: number; // days
  action: 'delete' | 'anonymize' | 'archive';
  legalBasis: string;
  description: string;
}

// Default retention policies
export const defaultRetentionPolicies: RetentionPolicy[] = [
  {
    dataType: 'user_sessions',
    retentionPeriod: 30,
    action: 'delete',
    legalBasis: 'legitimate_interest',
    description: 'User session data older than 30 days',
  },
  {
    dataType: 'audit_logs',
    retentionPeriod: 365,
    action: 'archive',
    legalBasis: 'legal_obligation',
    description: 'Audit logs for compliance (1 year)',
  },
  {
    dataType: 'deleted_orders',
    retentionPeriod: 90,
    action: 'anonymize',
    legalBasis: 'legal_obligation',
    description: 'Soft-deleted orders anonymized after 90 days',
  },
  {
    dataType: 'marketing_emails',
    retentionPeriod: 365,
    action: 'delete',
    legalBasis: 'consent_withdrawn',
    description: 'Marketing emails for unsubscribed users',
  },
  {
    dataType: 'failed_login_attempts',
    retentionPeriod: 90,
    action: 'delete',
    legalBasis: 'legitimate_interest',
    description: 'Failed login attempts older than 90 days',
  },
  {
    dataType: 'temp_files',
    retentionPeriod: 7,
    action: 'delete',
    legalBasis: 'legitimate_interest',
    description: 'Temporary uploaded files',
  },
  {
    dataType: 'analytics_data',
    retentionPeriod: 730, // 2 years
    action: 'anonymize',
    legalBasis: 'legitimate_interest',
    description: 'Analytics data anonymized after 2 years',
  },
  {
    dataType: 'support_tickets',
    retentionPeriod: 1095, // 3 years
    action: 'archive',
    legalBasis: 'contract_performance',
    description: 'Resolved support tickets archived after 3 years',
  },
];

// Data retention manager
export class DataRetentionManager {
  private policies: RetentionPolicy[];

  constructor(policies: RetentionPolicy[] = defaultRetentionPolicies) {
    this.policies = policies;
  }

  // Add custom policy
  addPolicy(policy: RetentionPolicy): void {
    this.policies.push(policy);
  }

  // Execute retention policy for all data types
  async executeRetention(): Promise<Record<string, { processed: number; errors: number }>> {
    const results: Record<string, { processed: number; errors: number }> = {};

    for (const policy of this.policies) {
      try {
        const count = await this.processDataType(policy);
        results[policy.dataType] = { processed: count, errors: 0 };
      } catch (error) {
        console.error(`[Retention] Error processing ${policy.dataType}:`, error);
        results[policy.dataType] = { processed: 0, errors: 1 };
      }
    }

    return results;
  }

  // Process specific data type
  private async processDataType(policy: RetentionPolicy): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);

    let processed = 0;

    switch (policy.dataType) {
      case 'user_sessions':
        processed = await this.cleanupSessions(cutoffDate);
        break;
      case 'audit_logs':
        processed = await this.archiveAuditLogs(cutoffDate);
        break;
      case 'deleted_orders':
        processed = await this.anonymizeDeletedOrders(cutoffDate);
        break;
      case 'marketing_emails':
        processed = await this.cleanupMarketingData(cutoffDate);
        break;
      case 'temp_files':
        processed = await this.cleanupTempFiles(cutoffDate);
        break;
      case 'analytics_data':
        processed = await this.anonymizeAnalytics(cutoffDate);
        break;
      case 'support_tickets':
        processed = await this.archiveSupportTickets(cutoffDate);
        break;
      default:
        console.warn(`[Retention] Unknown data type: ${policy.dataType}`);
    }

    return processed;
  }

  // Clean up old sessions
  private async cleanupSessions(cutoffDate: Date): Promise<number> {
    // Implementation would depend on session storage (Redis/DB)
    // Example for database sessions:
    // const result = await prisma.session.deleteMany({
    //   where: { updatedAt: { lt: cutoffDate } },
    // });
    // return result.count;
    return 0;
  }

  // Archive old audit logs
  private async archiveAuditLogs(cutoffDate: Date): Promise<number> {
    // Move to cold storage (S3 Glacier, etc.)
    const oldLogs = await prisma.auditLog.findMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    if (oldLogs.length > 0) {
      // Archive to S3
      await addJob('backup.create', {
        tenantId: 'system',
        payload: {
          type: 'audit_logs',
          data: oldLogs,
          date: cutoffDate,
        },
      });

      // Delete from database
      await prisma.auditLog.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      });
    }

    return oldLogs.length;
  }

  // Anonymize deleted orders
  private async anonymizeDeletedOrders(cutoffDate: Date): Promise<number> {
    // Soft-deleted orders older than retention period
    const orders = await prisma.order.findMany({
      where: {
        status: 'CANCELLED',
        updatedAt: { lt: cutoffDate },
      },
    });

    for (const order of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          customerName: 'ANONYMIZED',
          customerEmail: `deleted_${order.id}@anonymized.local`,
          customerPhone: null,
          shippingAddress: 'ANONYMIZED',
          billingAddress: 'ANONYMIZED',
          notes: null,
        },
      });
    }

    return orders.length;
  }

  // Clean up marketing data for unsubscribed users
  private async cleanupMarketingData(cutoffDate: Date): Promise<number> {
    // Remove email events for old campaigns
    const result = await prisma.emailEvent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  // Clean up temporary files
  private async cleanupTempFiles(cutoffDate: Date): Promise<number> {
    // Implementation would cleanup R2/S3 temp folder
    // const files = await listTempFiles(cutoffDate);
    // await Promise.all(files.map(f => deleteFile(f.key)));
    return 0;
  }

  // Anonymize analytics data
  private async anonymizeAnalytics(cutoffDate: Date): Promise<number> {
    // Aggregate and anonymize old analytics
    // Keep aggregated stats but remove individual records
    return 0;
  }

  // Archive support tickets
  private async archiveSupportTickets(cutoffDate: Date): Promise<number> {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        status: 'CLOSED',
        updatedAt: { lt: cutoffDate },
      },
    });

    if (tickets.length > 0) {
      // Archive to cold storage
      await addJob('backup.create', {
        tenantId: 'system',
        payload: {
          type: 'support_tickets',
          data: tickets,
          date: cutoffDate,
        },
      });

      // Delete from database
      await prisma.supportTicket.deleteMany({
        where: {
          id: { in: tickets.map(t => t.id) },
        },
      });
    }

    return tickets.length;
  }
}

// User data export (GDPR Article 15)
export async function exportUserData(
  userId: string,
  tenantId: string
): Promise<Record<string, unknown>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: { items: true },
      },
      sessions: true,
      auditLogs: { take: 100 },
      supportTickets: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    personalInfo: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
    },
    orders: user.orders.map(o => ({
      id: o.id,
      total: o.totalAmount,
      date: o.orderDate,
      status: o.status,
      items: o.items,
    })),
    sessions: user.sessions.map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    })),
    activity: user.auditLogs.map(log => ({
      action: log.action,
      timestamp: log.timestamp,
      details: log.metadata,
    })),
    supportTickets: user.supportTickets.map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt,
    })),
  };
}

// User data deletion (GDPR Article 17 - Right to erasure)
export async function deleteUserData(
  userId: string,
  tenantId: string
): Promise<void> {
  // 1. Anonymize orders (keep financial records but remove PII)
  await prisma.order.updateMany({
    where: { userId },
    data: {
      customerName: 'DELETED USER',
      customerEmail: `deleted_${userId}@deleted.local`,
      customerPhone: null,
      shippingAddress: 'DELETED',
      billingAddress: 'DELETED',
    },
  });

  // 2. Delete sessions
  await prisma.session.deleteMany({
    where: { userId },
  });

  // 3. Delete or anonymize support tickets
  await prisma.supportTicket.updateMany({
    where: { userId },
    data: {
      description: '[Content removed due to user deletion]',
    },
  });

  // 4. Delete user account
  await prisma.user.delete({
    where: { id: userId },
  });

  // 5. Log deletion for compliance
  console.info(`[GDPR] User ${userId} data deleted from tenant ${tenantId}`);
}

// Consent management
export interface ConsentRecord {
  userId: string;
  type: 'marketing' | 'analytics' | 'cookies' | 'terms';
  granted: boolean;
  timestamp: Date;
  ip: string;
  userAgent: string;
}

export async function recordConsent(consent: ConsentRecord): Promise<void> {
  await prisma.consent.create({
    data: {
      userId: consent.userId,
      type: consent.type,
      granted: consent.granted,
      ip: consent.ip,
      userAgent: consent.userAgent,
    },
  });
}

export async function checkConsent(
  userId: string,
  type: ConsentRecord['type']
): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: { userId, type },
    orderBy: { createdAt: 'desc' },
  });

  return consent?.granted || false;
}

// Data portability (GDPR Article 20)
export async function exportDataPortability(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const data = await exportUserData(userId, '');

  if (format === 'csv') {
    // Convert to CSV
    return convertToCSV(data);
  }

  return JSON.stringify(data, null, 2);
}

function convertToCSV(data: Record<string, unknown>): string {
  // Simple JSON to CSV conversion for flat structures
  const flat = flattenObject(data);
  const keys = Object.keys(flat);
  const values = Object.values(flat).map(v => JSON.stringify(v));
  
  return [keys.join(','), values.join(',')].join('\n');
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k] as Record<string, unknown>, pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {} as Record<string, unknown>);
}

// Export retention manager
export const dataRetention = new DataRetentionManager();

export { DataRetentionManager };
export type { RetentionPolicy };

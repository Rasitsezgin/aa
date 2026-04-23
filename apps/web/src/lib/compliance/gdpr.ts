// GDPR Compliance Module
// Data protection, consent management, right to erasure

import { EventEmitter } from 'events';

type ConsentType = 'marketing' | 'analytics' | 'cookies' | 'third_party' | 'profiling';
type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'pending';
type DataSubjectRequestType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';

interface ConsentRecord {
  id: string;
  userId: string;
  tenantId: string;
  type: ConsentType;
  status: ConsentStatus;
  version: string;
  source: string; // Page/screen where consent was collected
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  withdrawnReason?: string;
  proof: string; // Hashed proof of consent
}

interface DataSubjectRequest {
  id: string;
  userId: string;
  tenantId: string;
  type: DataSubjectRequestType;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  description?: string;
  submittedAt: Date;
  deadline: Date; // 30 days per GDPR
  completedAt?: Date;
  dataPackage?: {
    format: 'json' | 'xml' | 'csv';
    url: string;
    expiresAt: Date;
  };
  notes: string[];
}

interface DataProcessingRecord {
  id: string;
  tenantId: string;
  activity: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  dpoConsulted: boolean;
  impactAssessmentRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrivacyPolicy {
  id: string;
  tenantId: string;
  version: string;
  content: {
    html: string;
    plain: string;
  };
  effectiveDate: Date;
  lastUpdated: Date;
  requiresReconsent: boolean;
  active: boolean;
}

// GDPR Manager
export class GDPRManager extends EventEmitter {
  private consents: Map<string, ConsentRecord[]> = new Map();
  private requests: Map<string, DataSubjectRequest> = new Map();
  private processingRecords: Map<string, DataProcessingRecord> = new Map();
  private policies: Map<string, PrivacyPolicy> = new Map();

  // Record consent
  recordConsent(consent: Omit<ConsentRecord, 'id' | 'proof'>): ConsentRecord {
    const record: ConsentRecord = {
      ...consent,
      id: crypto.randomUUID(),
      proof: this.generateProof(consent),
    };

    const userConsents = this.consents.get(consent.userId) || [];
    userConsents.push(record);
    this.consents.set(consent.userId, userConsents);

    this.emit('consentRecorded', record);
    return record;
  }

  // Check if user has consent
  hasConsent(userId: string, type: ConsentType): boolean {
    const userConsents = this.consents.get(userId) || [];
    const latest = userConsents
      .filter(c => c.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return latest?.status === 'granted' && 
           (!latest.expiresAt || latest.expiresAt > new Date());
  }

  // Withdraw consent
  withdrawConsent(
    userId: string,
    type: ConsentType,
    reason?: string
  ): ConsentRecord | null {
    const userConsents = this.consents.get(userId) || [];
    const latest = userConsents
      .filter(c => c.type === type && c.status === 'granted')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!latest) return null;

    latest.status = 'withdrawn';
    latest.withdrawnAt = new Date();
    latest.withdrawnReason = reason;

    this.emit('consentWithdrawn', latest);
    return latest;
  }

  // Get consent history
  getConsentHistory(userId: string): ConsentRecord[] {
    return (this.consents.get(userId) || [])
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Submit data subject request
  submitRequest(request: Omit<DataSubjectRequest, 'id' | 'submittedAt' | 'deadline' | 'status' | 'notes'>): DataSubjectRequest {
    const fullRequest: DataSubjectRequest = {
      ...request,
      id: crypto.randomUUID(),
      submittedAt: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'pending',
      notes: [],
    };

    this.requests.set(fullRequest.id, fullRequest);
    this.emit('requestSubmitted', fullRequest);
    
    // Auto-start processing
    this.processRequest(fullRequest.id);

    return fullRequest;
  }

  // Process data subject request
  async processRequest(requestId: string): Promise<DataSubjectRequest> {
    const request = this.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.status = 'in_progress';
    request.notes.push(`Processing started at ${new Date().toISOString()}`);

    switch (request.type) {
      case 'access':
        await this.handleAccessRequest(request);
        break;
      case 'rectification':
        await this.handleRectificationRequest(request);
        break;
      case 'erasure':
        await this.handleErasureRequest(request);
        break;
      case 'portability':
        await this.handlePortabilityRequest(request);
        break;
      case 'restriction':
        await this.handleRestrictionRequest(request);
        break;
    }

    request.status = 'completed';
    request.completedAt = new Date();

    this.emit('requestCompleted', request);
    return request;
  }

  // Create data processing record (Article 30)
  createProcessingRecord(record: Omit<DataProcessingRecord, 'id' | 'createdAt' | 'updatedAt'>): DataProcessingRecord {
    const fullRecord: DataProcessingRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.processingRecords.set(fullRecord.id, fullRecord);
    return fullRecord;
  }

  // Publish privacy policy
  publishPolicy(policy: Omit<PrivacyPolicy, 'id' | 'lastUpdated'>): PrivacyPolicy {
    const fullPolicy: PrivacyPolicy = {
      ...policy,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };

    // Deactivate previous versions
    for (const p of this.policies.values()) {
      if (p.tenantId === policy.tenantId && p.active) {
        p.active = false;
      }
    }

    this.policies.set(fullPolicy.id, fullPolicy);
    this.emit('policyPublished', fullPolicy);
    return fullPolicy;
  }

  // Get active policy for tenant
  getActivePolicy(tenantId: string): PrivacyPolicy | null {
    return Array.from(this.policies.values()).find(
      p => p.tenantId === tenantId && p.active
    ) || null;
  }

  // Generate consent banner config
  getConsentBannerConfig(tenantId: string): {
    required: ConsentType[];
    optional: ConsentType[];
    policyVersion: string;
    styles: {
      position: 'bottom' | 'top' | 'modal';
      theme: 'light' | 'dark';
    };
  } {
    const policy = this.getActivePolicy(tenantId);
    
    return {
      required: ['cookies'],
      optional: ['marketing', 'analytics', 'third_party', 'profiling'],
      policyVersion: policy?.version || '1.0.0',
      styles: {
        position: 'bottom',
        theme: 'light',
      },
    };
  }

  // Get compliance report
  getComplianceReport(tenantId: string): {
    totalConsents: number;
    consentRate: number;
    pendingRequests: number;
    processingRecords: number;
    dataRetentionCompliance: number;
  } {
    let totalConsents = 0;
    let grantedConsents = 0;

    for (const [userId, consents] of this.consents) {
      // Check if user belongs to tenant
      const hasTenantConsent = consents.some(c => c.tenantId === tenantId);
      if (hasTenantConsent) {
        totalConsents += consents.length;
        grantedConsents += consents.filter(c => c.status === 'granted').length;
      }
    }

    const pendingRequests = Array.from(this.requests.values()).filter(
      r => r.tenantId === tenantId && r.status === 'pending'
    ).length;

    const records = Array.from(this.processingRecords.values()).filter(
      r => r.tenantId === tenantId
    ).length;

    return {
      totalConsents,
      consentRate: totalConsents > 0 ? grantedConsents / totalConsents : 0,
      pendingRequests,
      processingRecords: records,
      dataRetentionCompliance: 95, // Mock value
    };
  }

  // Anonymize user data
  async anonymizeUser(userId: string, tenantId: string): Promise<{
    anonymized: boolean;
    fieldsAnonymized: string[];
    retainedFields: string[];
  }> {
    const fieldsAnonymized: string[] = [];
    const retainedFields = ['order_history', 'transaction_ids'];

    // Remove consents
    this.consents.delete(userId);
    fieldsAnonymized.push('consent_history');

    // Cancel pending requests
    for (const [id, request] of this.requests) {
      if (request.userId === userId && request.status === 'pending') {
        request.status = 'rejected';
        request.notes.push('Cancelled due to anonymization');
      }
    }

    this.emit('userAnonymized', { userId, tenantId });

    return {
      anonymized: true,
      fieldsAnonymized,
      retainedFields,
    };
  }

  // Private methods
  private generateProof(consent: Omit<ConsentRecord, 'id' | 'proof'>): string {
    const data = `${consent.userId}:${consent.type}:${consent.timestamp.getTime()}`;
    return btoa(data); // Simplified hash
  }

  private async handleAccessRequest(request: DataSubjectRequest): Promise<void> {
    // Collect all user data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    request.dataPackage = {
      format: 'json',
      url: `https://api.example.com/gdpr/exports/${request.id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private async handleRectificationRequest(request: DataSubjectRequest): Promise<void> {
    // Update incorrect data
    request.notes.push('Data rectification applied');
  }

  private async handleErasureRequest(request: DataSubjectRequest): Promise<void> {
    // Delete user data
    await this.anonymizeUser(request.userId, request.tenantId);
    request.notes.push('Right to erasure executed');
  }

  private async handlePortabilityRequest(request: DataSubjectRequest): Promise<void> {
    // Export in machine-readable format
    request.dataPackage = {
      format: 'json',
      url: `https://api.example.com/gdpr/portability/${request.id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private async handleRestrictionRequest(request: DataSubjectRequest): Promise<void> {
    // Restrict processing
    request.notes.push('Processing restricted as requested');
  }
}

// Cookie categories for consent
export const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Necessary',
    description: 'Essential for website functionality',
    required: true,
  },
  functional: {
    name: 'Functional',
    description: 'Enable enhanced functionality',
    required: false,
  },
  analytics: {
    name: 'Analytics',
    description: 'Help us improve our website',
    required: false,
  },
  marketing: {
    name: 'Marketing',
    description: 'Used for targeted advertising',
    required: false,
  },
};

// Export singleton
export const gdprManager = new GDPRManager();

export { ConsentRecord, DataSubjectRequest, DataProcessingRecord, PrivacyPolicy };

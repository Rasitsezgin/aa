import type { IntegrationCategory } from '../enums/integration-category.enum';
import type { IntegrationSyncType } from '../enums/integration-category.enum';

/** BullMQ job payload — her iş tenant_id ile etiketlenir */
export interface IntegrationSyncJobPayload {
  tenantId: string;
  integrationId: string;
  providerId: string;
  category: IntegrationCategory;
  syncType: IntegrationSyncType;
  platform?: string;
  manual?: boolean;
  retry?: boolean;
  priority?: number;
  enqueuedAt: string;
}

/** Fair-queue tenant bucket meta */
export interface TenantQueueState {
  tenantId: string;
  activeJobs: number;
  lastEnqueuedAt: number;
}

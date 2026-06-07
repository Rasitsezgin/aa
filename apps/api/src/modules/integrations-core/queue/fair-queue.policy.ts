import type { TenantQueueState } from '../dto/integration-sync-job.dto';

/**
 * Multi-tenant fair queuing politikası.
 * Aynı tenant'ın aynı anda çok fazla job çalıştırmasını sınırlar.
 */
export class FairQueuePolicy {
  private readonly tenantStates = new Map<string, TenantQueueState>();
  private readonly maxConcurrentPerTenant: number;

  constructor(maxConcurrentPerTenant = 3) {
    this.maxConcurrentPerTenant = maxConcurrentPerTenant;
  }

  /** Tenant kuyruğa eklenebilir mi? */
  canEnqueue(tenantId: string): boolean {
    const state = this.tenantStates.get(tenantId);
    if (!state) return true;
    return state.activeJobs < this.maxConcurrentPerTenant;
  }

  /** Job başladığında aktif sayacı artırır */
  onJobStart(tenantId: string): void {
    const state = this.tenantStates.get(tenantId) ?? {
      tenantId,
      activeJobs: 0,
      lastEnqueuedAt: Date.now(),
    };
    state.activeJobs += 1;
    state.lastEnqueuedAt = Date.now();
    this.tenantStates.set(tenantId, state);
  }

  /** Job bittiğinde aktif sayacı düşürür */
  onJobComplete(tenantId: string): void {
    const state = this.tenantStates.get(tenantId);
    if (!state) return;
    state.activeJobs = Math.max(0, state.activeJobs - 1);
    this.tenantStates.set(tenantId, state);
  }

  /** Tenant bazlı job önceliği — yoğun tenant'lar düşük öncelik alır */
  resolvePriority(tenantId: string, basePriority = 5): number {
    const state = this.tenantStates.get(tenantId);
    if (!state) return basePriority;
    const penalty = Math.min(state.activeJobs, 3);
    return Math.max(1, basePriority - penalty);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreaker } from '../resilience/circuit-breaker';
import { ProviderRateLimitPolicy } from './provider-rate-limit.policy';
import { FairQueuePolicy } from './fair-queue.policy';
import type { IntegrationSyncJobPayload } from '../dto/integration-sync-job.dto';

export interface JobExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  skipped?: boolean;
  reason?: string;
  retryAfterMs?: number;
}

/**
 * Job Processor orchestrator — Circuit Breaker + Rate Limit + Fair Queue.
 * Worker her job'ı bu executor üzerinden çalıştırır.
 */
@Injectable()
export class IntegrationJobExecutor {
  private readonly logger = new Logger(IntegrationJobExecutor.name);
  private readonly circuitBreaker = new CircuitBreaker();
  private readonly rateLimit = new ProviderRateLimitPolicy();
  private readonly fairQueue = new FairQueuePolicy(3);

  /** Job çalıştırılabilir mi? (circuit + rate limit + fair queue) */
  canExecute(payload: IntegrationSyncJobPayload): JobExecutionResult {
    const { tenantId, providerId } = payload;

    if (!this.circuitBreaker.canExecute(tenantId, providerId)) {
      return {
        success: false,
        skipped: true,
        reason: 'circuit-open',
        retryAfterMs: 60_000,
      };
    }

    if (!this.rateLimit.canCall(tenantId, providerId)) {
      return {
        success: false,
        skipped: true,
        reason: 'rate-limit',
        retryAfterMs: 5_000,
      };
    }

    if (!this.fairQueue.canEnqueue(tenantId)) {
      return {
        success: false,
        skipped: true,
        reason: 'tenant-concurrency-limit',
        retryAfterMs: 10_000,
      };
    }

    return { success: true };
  }

  /** Job başlangıcı — sayaçları artır */
  onJobStart(payload: IntegrationSyncJobPayload): void {
    this.fairQueue.onJobStart(payload.tenantId);
    this.rateLimit.recordCall(payload.tenantId, payload.providerId);
  }

  /** Job başarılı tamamlandı */
  onJobSuccess(payload: IntegrationSyncJobPayload): void {
    this.circuitBreaker.recordSuccess(payload.tenantId, payload.providerId);
    this.fairQueue.onJobComplete(payload.tenantId);
  }

  /** Job hata ile tamamlandı */
  onJobFailure(payload: IntegrationSyncJobPayload, error: unknown): void {
    this.circuitBreaker.recordFailure(payload.tenantId, payload.providerId, error);
    this.fairQueue.onJobComplete(payload.tenantId);
    this.logger.warn(
      `Job failed [${payload.tenantId}/${payload.providerId}]: ${(error as Error)?.message}`,
    );
  }

  resolvePriority(tenantId: string): number {
    return this.fairQueue.resolvePriority(tenantId);
  }

  getCircuitState(tenantId: string, providerId: string): string {
    return this.circuitBreaker.getState(tenantId, providerId);
  }

  getRemainingQuota(tenantId: string, providerId: string): number {
    return this.rateLimit.remainingQuota(tenantId, providerId);
  }
}

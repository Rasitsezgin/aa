import { Logger } from '@nestjs/common';
import { CircuitState } from '../enums/integration-category.enum';

interface CircuitRecord {
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt?: number;
  lastFailureAt?: number;
}

/**
 * Circuit Breaker — provider+tenant bazlı hata izolasyonu.
 * API limit aşımı veya sürekli hata durumunda adapter çağrılarını geçici durdurur.
 */
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private readonly circuits = new Map<string, CircuitRecord>();

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 60_000,
    private readonly halfOpenSuccessThreshold = 2,
  ) {}

  private key(tenantId: string, providerId: string): string {
    return `${tenantId}:${providerId}`;
  }

  /** İstek gönderilebilir mi? */
  canExecute(tenantId: string, providerId: string): boolean {
    const record = this.circuits.get(this.key(tenantId, providerId));
    if (!record) return true;

    if (record.state === CircuitState.OPEN) {
      const elapsed = Date.now() - (record.openedAt ?? 0);
      if (elapsed >= this.resetTimeoutMs) {
        record.state = CircuitState.HALF_OPEN;
        record.successes = 0;
        this.logger.log(`Circuit half-open: ${tenantId}/${providerId}`);
        return true;
      }
      return false;
    }

    return true;
  }

  /** Başarılı çağrı kaydı */
  recordSuccess(tenantId: string, providerId: string): void {
    const k = this.key(tenantId, providerId);
    const record = this.circuits.get(k) ?? {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
    };

    if (record.state === CircuitState.HALF_OPEN) {
      record.successes += 1;
      if (record.successes >= this.halfOpenSuccessThreshold) {
        record.state = CircuitState.CLOSED;
        record.failures = 0;
        record.successes = 0;
        this.logger.log(`Circuit closed: ${tenantId}/${providerId}`);
      }
    } else {
      record.failures = 0;
      record.state = CircuitState.CLOSED;
    }

    this.circuits.set(k, record);
  }

  /** Başarısız çağrı kaydı — eşik aşılırsa devreyi açar */
  recordFailure(tenantId: string, providerId: string, error?: unknown): void {
    const k = this.key(tenantId, providerId);
    const record = this.circuits.get(k) ?? {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
    };

    record.failures += 1;
    record.lastFailureAt = Date.now();

    if (
      record.state === CircuitState.HALF_OPEN ||
      record.failures >= this.failureThreshold
    ) {
      record.state = CircuitState.OPEN;
      record.openedAt = Date.now();
      this.logger.warn(
        `Circuit OPEN: ${tenantId}/${providerId} — ${(error as Error)?.message ?? 'unknown'}`,
      );
    }

    this.circuits.set(k, record);
  }

  getState(tenantId: string, providerId: string): CircuitState {
    return this.circuits.get(this.key(tenantId, providerId))?.state ?? CircuitState.CLOSED;
  }
}

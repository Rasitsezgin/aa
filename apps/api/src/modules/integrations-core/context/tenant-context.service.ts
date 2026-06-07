import {
  Injectable,
  ForbiddenException,
  Scope,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  tenantId: string;
  userId?: string;
  integrationId?: string;
}

/**
 * Request/worker bağlamında tenant_id taşır.
 * HTTP interceptor ve queue worker bu servisi set eder;
 * adapter'lar requireTenantId() ile okur.
 */
@Injectable({ scope: Scope.DEFAULT })
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContextStore>();

  /** Mevcut async bağlamda tenant çalıştırır */
  run<T>(store: TenantContextStore, fn: () => T): T {
    return this.storage.run(store, fn);
  }

  async runAsync<T>(
    store: TenantContextStore,
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.storage.run(store, fn);
  }

  /** Aktif tenant_id — yoksa hata fırlatır (fail-closed) */
  requireTenantId(): string {
    const tenantId = this.storage.getStore()?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant bağlamı bulunamadı. İşlem tenant_id olmadan çalıştırılamaz.',
      );
    }
    return tenantId;
  }

  getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  /** Sorgu filtrelerine otomatik tenant_id ekler */
  withTenantFilter<T extends Record<string, unknown>>(
    where: T = {} as T,
  ): T & { tenantId: string } {
    return { ...where, tenantId: this.requireTenantId() };
  }
}

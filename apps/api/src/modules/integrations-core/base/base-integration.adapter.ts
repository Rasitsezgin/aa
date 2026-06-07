import { Logger } from '@nestjs/common';
import type { IntegrationCategory } from '../enums/integration-category.enum';
import { IntegrationSyncType } from '../enums/integration-category.enum';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../interfaces/integration-context.interface';
import type { IIntegrationProvider } from '../interfaces/integration-provider.interface';

/**
 * Tüm adapter'ların extend ettiği temel sınıf.
 * Ortak loglama, tenant doğrulama ve hata sarmalama sağlar.
 */
export abstract class BaseIntegrationAdapter implements IIntegrationProvider {
  protected readonly logger: Logger;

  abstract readonly providerId: string;
  abstract readonly displayName: string;
  abstract readonly category: IntegrationCategory;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /** Tenant bağlamının geçerli olduğunu doğrular */
  protected assertContext(ctx: TenantIntegrationContext): void {
    if (!ctx.tenantId) {
      throw new Error(`${this.providerId}: tenantId zorunludur`);
    }
    if (!ctx.integrationId) {
      throw new Error(`${this.providerId}: integrationId zorunludur`);
    }
  }

  abstract testConnection(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<{ success: boolean; message: string }>;

  /** Varsayılan: ürün + sipariş sync desteklenir */
  supportedSyncTypes(): IntegrationSyncType[] {
    return [IntegrationSyncType.PRODUCTS, IntegrationSyncType.ORDERS];
  }

  /** Adapter içi hataları standart formata çevirir */
  protected fail(message: string, error?: unknown) {
    const detail = error instanceof Error ? error.message : String(error ?? '');
    this.logger.warn(`${this.providerId}: ${message}${detail ? ` — ${detail}` : ''}`);
    return { success: false as const, message: detail || message };
  }

  protected ok(message: string) {
    return { success: true as const, message };
  }
}

import type { IntegrationCategory } from '../enums/integration-category.enum';

/** Tenant bağlamı — tüm entegrasyon işlemlerinde zorunlu */
export interface TenantIntegrationContext {
  tenantId: string;
  integrationId: string;
  providerId: string;
  category: IntegrationCategory;
  userId?: string;
}

/** Şifre çözülmüş kimlik bilgileri */
export interface DecryptedCredentials {
  apiKey: string;
  apiSecret: string;
  extra: Record<string, unknown>;
}

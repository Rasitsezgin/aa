import type { IntegrationCategory } from '../../enums/integration-category.enum';
import type { IntegrationSyncType } from '../../enums/integration-category.enum';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';

/**
 * Tüm 8 kategori adapter'ının extend ettiği kök sözleşme.
 * Factory/Registry bu interface üzerinden provider'ları yönetir.
 */
export interface IIntegrationProvider {
  readonly providerId: string;
  readonly displayName: string;
  readonly category: IntegrationCategory;

  /** Kimlik bilgisi ve bağlantı doğrulama */
  testConnection(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<{ success: boolean; message: string }>;

  /** Desteklenen iş tipleri */
  supportedSyncTypes(): IntegrationSyncType[];
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EncryptionService } from '../../../common/encryption.service';
import { injectTenantId } from '../context/tenant-aware-prisma.helper';
import type { DecryptedCredentials } from '../interfaces/integration-context.interface';

/**
 * Tenant bağlamında şifreli kimlik bilgilerini çözer.
 * Tüm adapter'lar API key'e doğrudan erişmez — bu servis üzerinden alır.
 */
@Injectable()
export class TenantCredentialResolverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /** Integration tablosundan tenant-scoped credential çözer */
  async resolveIntegrationCredentials(
    tenantId: string,
    integrationId: string,
  ): Promise<DecryptedCredentials> {
    const integration = await this.prisma.integration.findFirst({
      where: injectTenantId(tenantId, { id: integrationId, isActive: true }),
      select: { apiKey: true, apiSecret: true, apiExtra: true },
    });

    if (!integration) {
      throw new NotFoundException('Entegrasyon bulunamadı veya pasif');
    }

    return {
      apiKey: this.encryption.decrypt(integration.apiKey),
      apiSecret: this.encryption.decrypt(integration.apiSecret),
      extra: (integration.apiExtra as Record<string, unknown>) ?? {},
    };
  }

  /** ServiceCredential tablosundan (kargo, e-fatura vb.) credential çözer */
  async resolveServiceCredentials(
    tenantId: string,
    serviceType: string,
    providerKey: string,
  ): Promise<DecryptedCredentials> {
    const row = await this.prisma.serviceCredential.findFirst({
      where: injectTenantId(tenantId, {
        serviceType: serviceType as never,
        isActive: true,
        apiExtra: { path: ['providerId'], equals: providerKey },
      } as never),
      select: { apiKey: true, apiSecret: true, apiExtra: true, apiUrl: true },
    });

    if (!row) {
      throw new NotFoundException(`${providerKey} kimlik bilgisi bulunamadı`);
    }

    const extra = (row.apiExtra as Record<string, unknown>) ?? {};
    return {
      apiKey: row.apiKey ? this.encryption.decrypt(row.apiKey) : '',
      apiSecret: row.apiSecret ? this.encryption.decrypt(row.apiSecret) : '',
      extra: {
        ...extra,
        apiUrl: row.apiUrl ? this.encryption.decrypt(row.apiUrl) : undefined,
      },
    };
  }
}

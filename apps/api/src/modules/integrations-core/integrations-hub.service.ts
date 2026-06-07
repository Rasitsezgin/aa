import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import { IntegrationCategory } from './enums/integration-category.enum';
import { IntegrationSyncType } from './enums/integration-category.enum';
import {
  getProviderById,
  getProvidersByCategory,
  PROVIDER_CATALOG,
} from './catalog/provider-catalog';
import { IntegrationAdapterRegistry } from './registry/integration-adapter.registry';
import { IntegrationSyncQueueService } from './queue/integration-sync-queue.service';
import { TenantCredentialResolverService } from './credentials/tenant-credential-resolver.service';
import { TenantContextService } from './context/tenant-context.service';
import { injectTenantId } from './context/tenant-aware-prisma.helper';
import {
  normalizeMarketplaceCredentials,
  resolvePlatformFromMarketplaceId,
} from '../marketplace/marketplace-connect.util';
import type { Platform } from '@pazaryonetimi/database';

/**
 * Birleşik entegrasyon hub servisi — connect, test, sync, catalog.
 * Tüm işlemler tenant_id ile scope'lanır.
 */
@Injectable()
export class IntegrationsHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly adapterRegistry: IntegrationAdapterRegistry,
    private readonly syncQueue: IntegrationSyncQueueService,
    private readonly credentialResolver: TenantCredentialResolverService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /** Katalog listesi — kategori filtresi opsiyonel */
  getCatalog(category?: IntegrationCategory) {
    if (category) {
      return getProvidersByCategory(category);
    }
    return PROVIDER_CATALOG;
  }

  /** Tenant'ın aktif entegrasyonlarını listeler */
  async listTenantIntegrations(tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('tenantId zorunludur');
    }

    const rows = await this.prisma.integration.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        platform: true,
        isActive: true,
        apiExtra: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return rows.map((row) => {
      const extra = (row.apiExtra as Record<string, unknown>) ?? {};
      const providerId = String(extra.marketplaceId ?? row.platform.toLowerCase());
      const catalog = getProviderById(providerId);

      return {
        id: row.id,
        tenantId,
        providerId,
        providerName: catalog?.name ?? row.platform,
        category: catalog?.category ?? IntegrationCategory.MARKETPLACE,
        platform: row.platform,
        isActive: row.isActive,
        status: row.isActive ? 'connected' : 'disconnected',
        lastSyncAt: row.updatedAt.toISOString(),
        hasAdapter: this.adapterRegistry.has(providerId),
      };
    });
  }

  /** Yeni entegrasyon bağlar — kimlik bilgileri şifrelenerek saklanır */
  async connectProvider(
    tenantId: string,
    providerId: string,
    credentials: Record<string, unknown>,
  ) {
    const catalog = getProviderById(providerId);
    if (!catalog) {
      throw new NotFoundException(`Sağlayıcı bulunamadı: ${providerId}`);
    }

    const platform =
      (catalog.platform as Platform) ??
      resolvePlatformFromMarketplaceId(providerId);
    if (!platform) {
      throw new BadRequestException(`${providerId} platform eşlemesi yok`);
    }

    const normalized = normalizeMarketplaceCredentials(
      platform,
      credentials,
      providerId,
    );

    const existingWhere: {
      tenantId: string;
      platform: Platform;
      isActive: boolean;
      apiExtra?: { path: string[]; equals: string };
    } = {
      tenantId,
      platform,
      isActive: true,
    };
    existingWhere.apiExtra = {
      path: ['marketplaceId'],
      equals: providerId,
    };

    const existing = await this.prisma.integration.findFirst({
      where: existingWhere,
    });

    let integration;
    if (existing) {
      integration = await this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          apiKey: this.encryption.encrypt(normalized.apiKey),
          apiSecret: this.encryption.encrypt(normalized.apiSecret),
          apiExtra: normalized.apiExtra,
          isActive: true,
        },
      });
    } else {
      integration = await this.prisma.integration.create({
        data: {
          tenantId,
          platform,
          apiKey: this.encryption.encrypt(normalized.apiKey),
          apiSecret: this.encryption.encrypt(normalized.apiSecret),
          apiExtra: normalized.apiExtra,
          isActive: true,
        },
      });
    }

    const queueResult = await this.syncQueue.enqueueSync({
      tenantId,
      integrationId: integration.id,
      providerId,
      category: catalog.category,
      syncType: IntegrationSyncType.ALL,
      platform: catalog.platform,
      manual: true,
    });

    return {
      success: true,
      integrationId: integration.id,
      providerId,
      message: `${catalog.name} bağlandı`,
      initialSync: queueResult,
    };
  }

  /** Adapter üzerinden bağlantı testi */
  async testProvider(
    tenantId: string,
    integrationId: string,
    providerId: string,
  ) {
    const credentials = await this.credentialResolver.resolveIntegrationCredentials(
      tenantId,
      integrationId,
    );

    if (!this.adapterRegistry.has(providerId)) {
      return {
        success: true,
        message: 'Bağlantı kayıtlı (adapter testi henüz yok)',
      };
    }

    const adapter = this.adapterRegistry.get(providerId);
    return adapter.testConnection(
      {
        tenantId,
        integrationId,
        providerId,
        category: getProviderById(providerId)?.category ?? IntegrationCategory.MARKETPLACE,
      },
      credentials,
    );
  }

  /** Manuel sync tetikler */
  async triggerSync(
    tenantId: string,
    integrationId: string,
    syncType: IntegrationSyncType = IntegrationSyncType.ALL,
  ) {
    const integration = await this.prisma.integration.findFirst({
      where: injectTenantId(tenantId, { id: integrationId, isActive: true }),
    });

    if (!integration) {
      throw new NotFoundException('Entegrasyon bulunamadı');
    }

    const extra = (integration.apiExtra as Record<string, unknown>) ?? {};
    const providerId = String(extra.marketplaceId ?? integration.platform.toLowerCase());
    const catalog = getProviderById(providerId);

    return this.syncQueue.enqueueSync({
      tenantId,
      integrationId,
      providerId,
      category: catalog?.category ?? IntegrationCategory.MARKETPLACE,
      syncType,
      platform: catalog?.platform,
      manual: true,
    });
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import type { Platform, Integration } from '@pazaryonetimi/database';
import {
  ALL_MARKETPLACES,
  MarketplaceConfig,
  getMarketplaceById,
  getMarketplacesByRegion,
  getMarketplacesByPlan,
  canAccessMarketplace,
  getActiveMarketplaces,
  PlatformRegion,
  SubscriptionPlan,
  REGION_NAMES,
  CATEGORY_NAMES,
  PLAN_NAMES,
} from './marketplace-registry';
import { EncryptionService } from '../../common/encryption.service';
import {
  hasAmazonSpApiCredentials,
  parseAmazonSpApiCredentials,
} from '../marketplace/amazon-sp-api.config';
import { AmazonSpApiClient } from '../marketplace/amazon-sp-api.client';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { getHepsiburadaListingApiBase } from '../marketplace/marketplace-sync.constants';

export interface IntegrationCredentials {
  [key: string]: string;
}

export interface UserIntegration {
  id: string;
  tenantId: string;
  marketplaceId: string;
  marketplace: MarketplaceConfig;
  credentials: IntegrationCredentials;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

// Platform enum değerlerine marketplaceId eşleştirmesi
const PLATFORM_MAP: Record<string, Platform> = {
  trendyol: 'TRENDYOL',
  hepsiburada: 'HEPSIBURADA',
  n11: 'N11',
  ciceksepeti: 'CICEKSEPETI',
  'amazon-tr': 'AMAZON',
  'amazon-us': 'AMAZON',
  'amazon-de': 'AMAZON',
  'amazon-uk': 'AMAZON',
  'ebay-us': 'EBAY',
  'ebay-uk': 'EBAY',
  'ebay-de': 'EBAY',
  'aliexpress': 'ALIEXPRESS',
  alibaba: 'ALIBABA',
  'shopee-sg': 'SHOPEE',
  'lazada-sg': 'LAZADA',
  'rakuten-jp': 'RAKUTEN',
  zalando: 'ZALANDO',
  allegro: 'ALLEGRO',
  'bol-com': 'BOL',
  cdiscount: 'CDISCOUNT',
  otto: 'OTTO',
  'mercadolibre-mx': 'MERCADOLIBRE',
  'mercadolibre-br': 'MERCADOLIBRE',
  'walmart-us': 'WALMART',
  etsy: 'ETSY',
  wayfair: 'WAYFAIR',
};

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_MAP);

function getPlatformEnum(marketplaceId: string): Platform | null {
  return PLATFORM_MAP[marketplaceId] || null;
}

function getMarketplaceIdFromPlatform(
  platform: Platform,
  apiExtra?: any,
): string {
  // apiExtra içinde marketplaceId varsa kullan
  if (apiExtra && typeof apiExtra === 'object' && 'marketplaceId' in apiExtra) {
    return apiExtra.marketplaceId as string;
  }
  // Varsayılan eşleştirme
  const platformMap: Partial<Record<Platform, string>> = {
    TRENDYOL: 'trendyol',
    HEPSIBURADA: 'hepsiburada',
    AMAZON: 'amazon-tr',
    N11: 'n11',
    CICEKSEPETI: 'ciceksepeti',
    GITTIGIDIYOR: 'gittigidiyor',
    PTTAVM: 'pttavm',
    MORHIPO: 'morhipo',
    AMAZON_US: 'amazon-us',
    AMAZON_UK: 'amazon-uk',
    AMAZON_DE: 'amazon-de',
    AMAZON_FR: 'amazon-fr',
    EBAY: 'ebay',
    ETSY: 'etsy',
    ALIEXPRESS: 'aliexpress',
    SHOPEE: 'shopee',
    LAZADA: 'lazada',
    WALMART: 'walmart',
    SHOPIFY: 'shopify',
    WOOCOMMERCE: 'woocommerce',
    WEBSITE: 'website',
    OTHER: 'other',
  };
  return platformMap[platform] || platform.toLowerCase();
}

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private marketplaceService: MarketplaceService,
    @Optional() @InjectQueue('sync') private readonly syncQueue?: Queue,
  ) {}

  private encrypt(text: string): string {
    return this.encryption.encrypt(text);
  }

  private decrypt(encryptedText: string): string {
    return this.encryption.decrypt(encryptedText);
  }

  // Tüm pazaryerlerini listele
  async getAllMarketplaces(
    tenantId: string,
    filters?: {
      region?: PlatformRegion;
      category?: string;
      status?: string;
      search?: string;
    },
  ): Promise<{
    marketplaces: (MarketplaceConfig & { userIntegration?: UserIntegration })[];
    regions: typeof REGION_NAMES;
    categories: typeof CATEGORY_NAMES;
  }> {
    // Kullanıcının mevcut entegrasyonlarını al
    const userIntegrations = await this.prisma.integration.findMany({
      where: { tenantId },
    });

    let marketplaces = getActiveMarketplaces();

    // Filtreleme
    if (filters?.region) {
      marketplaces = marketplaces.filter((m) => m.region === filters.region);
    }
    if (filters?.category) {
      marketplaces = marketplaces.filter(
        (m) => m.category === filters.category,
      );
    }
    if (filters?.status) {
      marketplaces = marketplaces.filter((m) => m.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      marketplaces = marketplaces.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.country.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search),
      );
    }

    // Kullanıcı entegrasyonlarını eşleştir
    const marketplacesWithIntegration = marketplaces.map((marketplace) => {
      // Platform enum veya marketplaceId ile eşleştir
      const integration = userIntegrations.find((i) => {
        const integrationMarketplaceId = getMarketplaceIdFromPlatform(
          i.platform,
          i.apiExtra,
        );
        return integrationMarketplaceId === marketplace.id;
      });

      if (integration) {
        return {
          ...marketplace,
          userIntegration: {
            id: integration.id,
            tenantId: integration.tenantId,
            marketplaceId: marketplace.id,
            marketplace,
            credentials: {}, // Güvenlik için credentials gizli
            isActive: integration.isActive,
            status: integration.isActive ? 'connected' : 'disconnected',
            lastSync: integration.updatedAt || undefined,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
          } as UserIntegration,
        };
      }
      return marketplace;
    });

    // Popülerliğe göre sırala
    marketplacesWithIntegration.sort((a, b) => b.popularity - a.popularity);

    return {
      marketplaces: marketplacesWithIntegration,
      regions: REGION_NAMES,
      categories: CATEGORY_NAMES,
    };
  }

  // Kullanıcının entegrasyonlarını listele
  async getUserIntegrations(tenantId: string): Promise<UserIntegration[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return integrations
      .map((integration) => {
        const marketplaceId = getMarketplaceIdFromPlatform(
          integration.platform,
          integration.apiExtra,
        );
        const marketplace = getMarketplaceById(marketplaceId);
        return {
          id: integration.id,
          tenantId: integration.tenantId,
          marketplaceId,
          marketplace: marketplace!,
          credentials: {}, // Güvenlik için boş
          isActive: integration.isActive,
          status: integration.isActive ? 'connected' : 'disconnected',
          lastSync: integration.updatedAt || undefined,
          createdAt: integration.createdAt,
          updatedAt: integration.updatedAt,
        } as UserIntegration;
      })
      .filter((i) => i.marketplace);
  }

  // Pazaryeri detayını getir
  async getMarketplaceDetails(
    marketplaceId: string,
    tenantId?: string,
  ): Promise<MarketplaceConfig & { userIntegration?: UserIntegration }> {
    const marketplace = getMarketplaceById(marketplaceId);
    if (!marketplace) {
      throw new NotFoundException('Pazaryeri bulunamadı');
    }

    if (tenantId) {
      // Platform enum'unu al
      const platformEnum = getPlatformEnum(marketplaceId);
      if (platformEnum) {
        const integration = await this.prisma.integration.findFirst({
          where: { tenantId, platform: platformEnum },
        });

        if (integration) {
          // apiExtra'da doğru marketplaceId var mı kontrol et
          const integrationMarketplaceId = getMarketplaceIdFromPlatform(
            integration.platform,
            integration.apiExtra,
          );
          if (integrationMarketplaceId === marketplaceId) {
            return {
              ...marketplace,
              userIntegration: {
                id: integration.id,
                tenantId: integration.tenantId,
                marketplaceId,
                marketplace,
                credentials: {},
                isActive: integration.isActive,
                status: integration.isActive ? 'connected' : 'disconnected',
                lastSync: integration.updatedAt || undefined,
                createdAt: integration.createdAt,
                updatedAt: integration.updatedAt,
              } as UserIntegration,
            };
          }
        }
      }
    }

    return marketplace;
  }

  // Entegrasyon oluştur/bağlan
  async connectMarketplace(
    tenantId: string,
    marketplaceId: string,
    credentials: IntegrationCredentials,
  ): Promise<{
    success: boolean;
    integration: UserIntegration;
    message: string;
  }> {
    const marketplace = getMarketplaceById(marketplaceId);
    if (!marketplace) {
      throw new NotFoundException('Pazaryeri bulunamadı');
    }

    // Kullanıcının planını kontrol et (şimdilik PROFESSIONAL varsayıyoruz)
    const userPlan: SubscriptionPlan = 'PROFESSIONAL';
    if (!canAccessMarketplace(marketplace, userPlan)) {
      throw new BadRequestException(
        `Bu pazaryerine erişmek için ${PLAN_NAMES[marketplace.minimumPlan]} planına sahip olmanız gerekiyor.`,
      );
    }

    // Zorunlu alanları kontrol et
    for (const field of marketplace.requiredFields) {
      if (field.required && !credentials[field.key]) {
        throw new BadRequestException(`${field.label} alanı zorunludur`);
      }
    }

    // Platform enum'unu kontrol et
    const platformEnum = getPlatformEnum(marketplaceId);
    if (!platformEnum) {
      throw new BadRequestException(
        `Bu pazaryeri henüz desteklenmiyor: ${marketplace.name}. Yakında eklenecek!`,
      );
    }

    // apiKey ve apiSecret'ı ayarla
    const apiKey =
      credentials['apiKey'] ||
      credentials['supplierId'] ||
      credentials['sellerId'] ||
      '';
    const apiSecret =
      credentials['apiSecret'] ||
      credentials['refreshToken'] ||
      credentials['secretKey'] ||
      credentials['apiToken'] ||
      '';

    // Diğer credentials'ı apiExtra'ya kaydet
    const apiExtra = {
      ...credentials,
      marketplaceId, // Hangi marketplace olduğunu kaydet
    };

    // Mevcut entegrasyonu kontrol et
    const existing = await this.prisma.integration.findFirst({
      where: {
        tenantId,
        platform: platformEnum,
        apiExtra: { path: ['marketplaceId'], equals: marketplaceId } as any,
      },
    });

    let integration: Integration;
    if (existing) {
      // Güncelle
      integration = await this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          apiKey: this.encrypt(apiKey),
          apiSecret: this.encrypt(apiSecret),
          apiExtra,
          isActive: true,
        },
      });
    } else {
      // Yeni oluştur
      integration = await this.prisma.integration.create({
        data: {
          tenantId,
          platform: platformEnum,
          apiKey: this.encrypt(apiKey),
          apiSecret: this.encrypt(apiSecret),
          apiExtra,
          isActive: true,
        },
      });
    }

    // Bağlantıyı test et
    const testResult = await this.testConnection(integration.id, tenantId);

    return {
      success: testResult.success,
      integration: {
        id: integration.id,
        tenantId: integration.tenantId,
        marketplaceId,
        marketplace,
        credentials: {},
        isActive: testResult.success,
        status: testResult.success ? 'connected' : 'error',
        errorMessage: testResult.success ? undefined : testResult.message,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      } as UserIntegration,
      message: testResult.message,
    };
  }

  // Bağlantıyı test et
  async testConnection(
    integrationId: string,
    tenantId: string,
  ): Promise<ConnectionTestResult> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, tenantId },
    });

    if (!integration) {
      throw new NotFoundException('Entegrasyon bulunamadı');
    }

    const marketplaceId = getMarketplaceIdFromPlatform(
      integration.platform,
      integration.apiExtra,
    );
    const marketplace = getMarketplaceById(marketplaceId);
    if (!marketplace) {
      return { success: false, message: 'Pazaryeri yapılandırması bulunamadı' };
    }

    // Credentials'ı çöz
    const credentials: Record<string, string> = {};
    // apiKey ve apiSecret'ı çöz
    if (integration.apiKey) {
      credentials['apiKey'] = this.decrypt(integration.apiKey);
    }
    if (integration.apiSecret) {
      credentials['apiSecret'] = this.decrypt(integration.apiSecret);
    }
    // apiExtra'dan diğer bilgileri al
    if (integration.apiExtra && typeof integration.apiExtra === 'object') {
      const extra = integration.apiExtra as Record<string, unknown>;
      for (const [key, value] of Object.entries(extra)) {
        if (typeof value === 'string' && key !== 'marketplaceId') {
          credentials[key] = value;
        }
      }
    }

    // Gerçek API bağlantısı burada yapılacak
    // Şimdilik simüle ediyoruz
    try {
      // Her marketplace için farklı test mantığı olabilir
      switch (marketplace.id) {
        case 'trendyol':
          return await this.testTrendyolConnection(credentials);
        case 'hepsiburada':
          return await this.testHepsiburadaConnection(credentials);
        case 'n11':
          return await this.testN11Connection(credentials);
        case 'ciceksepeti':
          return await this.testCiceksepetiConnection(credentials);
        case 'amazon-tr':
        case 'amazon-us':
        case 'amazon-uk':
        case 'amazon-de':
          return await this.testAmazonConnection(credentials);
        default: {
          const hasAllRequired = marketplace.requiredFields
            .filter((f) => f.required)
            .every((f) => credentials[f.key]);

          if (!hasAllRequired) {
            return { success: false, message: 'Eksik kimlik bilgileri' };
          }

          return {
            success: true,
            message:
              'Kimlik bilgileri format kontrolu tamamlandi. Gercek API testi desteklenmiyor.',
          };
        }
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Bağlantı hatası' };
    }
  }

  private async testTrendyolConnection(
    credentials: Record<string, string>,
  ): Promise<ConnectionTestResult> {
    const { supplierId, apiKey, apiSecret } = credentials;
    if (!supplierId || !apiKey || !apiSecret) {
      return {
        success: false,
        message: 'Trendyol kimlik bilgileri eksik veya hatalı',
      };
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch(
      `https://api.trendyol.com/sapigw/suppliers/${encodeURIComponent(supplierId)}/products?page=0&size=1`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
          'User-Agent': 'PazarYonetimi/1.0',
        },
      },
    );

    if (response.ok) {
      return {
        success: true,
        message: 'Trendyol API bağlantısı doğrulandı',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: 'Trendyol API kimlik bilgileri geçersiz',
      };
    }

    return {
      success: false,
      message: `Trendyol API testi başarısız (HTTP ${response.status})`,
    };
  }

  private async testHepsiburadaConnection(
    credentials: Record<string, string>,
  ): Promise<ConnectionTestResult> {
    const { merchantId, apiKey } = credentials;
    if (!merchantId || !apiKey) {
      return {
        success: false,
        message: 'Hepsiburada kimlik bilgileri eksik veya hatalı',
      };
    }

    const hbBase = getHepsiburadaListingApiBase();
    const endpoints = [
      `${hbBase}/ListingExternalService/v1/Listings/merchantid/${encodeURIComponent(merchantId)}?page=1&size=1`,
      `${hbBase}/ListingExternalService/v1/Listings?merchantId=${encodeURIComponent(merchantId)}&page=1&size=1`,
    ];

    for (const url of endpoints) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${apiKey}`,
          Accept: 'application/json',
          'User-Agent': 'PazarYonetimi/1.0',
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Hepsiburada API bağlantısı doğrulandı',
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Hepsiburada API kimlik bilgileri geçersiz',
        };
      }
    }

    return {
      success: false,
      message: 'Hepsiburada API testi başarısız',
    };
  }

  private async testN11Connection(
    credentials: Record<string, string>,
  ): Promise<ConnectionTestResult> {
    const { apiKey, apiSecret } = credentials;
    if (!apiKey || !apiSecret) {
      return {
        success: false,
        message: 'N11 kimlik bilgileri eksik veya hatalı',
      };
    }

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://www.n11.com/ws/schemas">
  <soapenv:Header>
    <sch:Authentication>
      <appKey>${this.escapeXml(apiKey)}</appKey>
      <appSecret>${this.escapeXml(apiSecret)}</appSecret>
    </sch:Authentication>
  </soapenv:Header>
  <soapenv:Body>
    <sch:GetProductListRequest>
      <pagingData>
        <currentPage>0</currentPage>
        <pageSize>1</pageSize>
      </pagingData>
    </sch:GetProductListRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch('https://api.n11.com/ws/ProductService/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
      body: soapBody,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `N11 API testi başarısız (HTTP ${response.status})`,
      };
    }

    const text = await response.text();
    const status = text.match(/<status>([^<]*)<\/status>/i)?.[1]?.toLowerCase();
    if (status && status !== 'success') {
      const errorMessage = text.match(/<errorMessage>([^<]*)<\/errorMessage>/i)?.[1];
      return {
        success: false,
        message: errorMessage || 'N11 API kimlik bilgileri geçersiz',
      };
    }

    return {
      success: true,
      message: 'N11 API bağlantısı doğrulandı',
    };
  }

  private async testCiceksepetiConnection(
    credentials: Record<string, string>,
  ): Promise<ConnectionTestResult> {
    const { apiKey } = credentials;
    if (!apiKey) {
      return {
        success: false,
        message: 'Çiçeksepeti API anahtarı eksik',
      };
    }

    const response = await fetch('https://apis.ciceksepeti.com/api/v1/Products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ pageSize: 1, page: 1 }),
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Çiçeksepeti API bağlantısı doğrulandı',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: 'Çiçeksepeti API anahtarı geçersiz',
      };
    }

    return {
      success: false,
      message: `Çiçeksepeti API testi başarısız (HTTP ${response.status})`,
    };
  }

  private async testAmazonConnection(
    credentials: Record<string, string>,
  ): Promise<ConnectionTestResult> {
    const spApiReady = hasAmazonSpApiCredentials({
      apiKey: credentials.apiKey || credentials.sellerId,
      apiSecret: credentials.apiSecret || credentials.refreshToken,
      apiExtra: credentials,
    });

    if (!spApiReady) {
      const missing = [
        !credentials.clientId && 'Client ID',
        !credentials.clientSecret && 'Client Secret',
        !(credentials.refreshToken || credentials.apiSecret) && 'Refresh Token',
        !credentials.awsAccessKeyId && 'AWS Access Key',
        !credentials.awsSecretAccessKey && 'AWS Secret Key',
        !credentials.roleArn && 'IAM Role ARN',
        !(credentials.sellerId || credentials.apiKey) && 'Seller ID',
      ].filter(Boolean);

      return {
        success: false,
        message:
          missing.length > 0
            ? `Amazon SP-API için eksik alanlar: ${missing.join(', ')}`
            : 'Amazon SP-API kimlik bilgileri eksik',
      };
    }

    const parsed = parseAmazonSpApiCredentials({
      apiKey: credentials.apiKey || credentials.sellerId,
      apiSecret: credentials.apiSecret || credentials.refreshToken,
      apiExtra: credentials,
    });

    if (!parsed) {
      return {
        success: false,
        message: 'Amazon SP-API kimlik bilgileri çözümlenemedi',
      };
    }

    const lwa = await AmazonSpApiClient.testLwaCredentials({
      refreshToken: parsed.refreshToken,
      clientId: parsed.clientId,
      clientSecret: parsed.clientSecret,
    });

    return {
      success: lwa.success,
      message: lwa.success
        ? 'Amazon SP-API LWA bağlantısı doğrulandı'
        : lwa.message,
    };
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Entegrasyonu devre dışı bırak
  async disconnectMarketplace(
    tenantId: string,
    marketplaceId: string,
  ): Promise<{ success: boolean; message: string }> {
    const platformEnum = getPlatformEnum(marketplaceId);
    if (!platformEnum) {
      throw new BadRequestException('Desteklenmeyen pazaryeri');
    }

    const integration = await this.prisma.integration.findFirst({
      where: { tenantId, platform: platformEnum },
    });

    if (!integration) {
      throw new NotFoundException('Entegrasyon bulunamadı');
    }

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Entegrasyon başarıyla devre dışı bırakıldı',
    };
  }

  // Entegrasyonu tamamen sil
  async deleteIntegration(
    tenantId: string,
    marketplaceId: string,
  ): Promise<{ success: boolean; message: string }> {
    const platformEnum = getPlatformEnum(marketplaceId);
    if (!platformEnum) {
      throw new BadRequestException('Desteklenmeyen pazaryeri');
    }

    const integration = await this.prisma.integration.findFirst({
      where: { tenantId, platform: platformEnum },
    });

    if (!integration) {
      throw new NotFoundException('Entegrasyon bulunamadı');
    }

    await this.prisma.integration.delete({
      where: { id: integration.id },
    });

    return { success: true, message: 'Entegrasyon başarıyla silindi' };
  }

  // Senkronizasyon başlat
  async syncMarketplace(
    tenantId: string,
    marketplaceId: string,
    syncType: 'products' | 'orders' | 'inventory' | 'all',
  ): Promise<{ success: boolean; message: string; jobId?: string }> {
    const platformEnum = getPlatformEnum(marketplaceId);
    if (!platformEnum) {
      throw new BadRequestException('Desteklenmeyen pazaryeri');
    }

    const integration = await this.prisma.integration.findFirst({
      where: { tenantId, platform: platformEnum, isActive: true },
    });

    if (!integration) {
      throw new NotFoundException('Aktif entegrasyon bulunamadı');
    }

    const mappedSyncType =
      syncType === 'inventory' ? 'products' : syncType;

    const result = await this.marketplaceService.syncIntegrationByStoreId(
      tenantId,
      integration.id,
      mappedSyncType,
    );

    return {
      success: true,
      message: `${syncType} senkronizasyonu tamamlandı`,
      integrationId: integration.id,
      result,
    };
  }

  async retryIntegrationSync(
    tenantId: string,
    integrationId: string,
    syncType: 'health-check' | 'order-sync' | 'inventory-sync' | 'all' = 'all',
  ) {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, tenantId, isActive: true },
      select: { id: true, tenantId: true, platform: true },
    });

    if (!integration) {
      throw new NotFoundException('Aktif entegrasyon bulunamadı');
    }

    const jobs: Array<{ name: string; id?: string | number }> = [];
    const basePayload = {
      integrationId: integration.id,
      tenantId: integration.tenantId,
      platform: integration.platform,
      manual: true,
      retry: true,
    };

    const jobTypes =
      syncType === 'all'
        ? (['health-check', 'order-sync', 'inventory-sync'] as const)
        : ([syncType] as const);

    if (this.syncQueue) {
      for (const name of jobTypes) {
        const job = await this.syncQueue.add(name, basePayload, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 50,
          removeOnFail: 25,
        });
        jobs.push({ name, id: job.id });
      }
    }

    let directResult: Record<string, unknown> | null = null;
    if (jobs.length === 0) {
      const mappedType =
        syncType === 'order-sync'
          ? 'orders'
          : syncType === 'inventory-sync'
            ? 'products'
            : 'all';
      directResult = (await this.marketplaceService.syncIntegrationByStoreId(
        tenantId,
        integration.id,
        mappedType,
      )) as Record<string, unknown>;
    }

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { updatedAt: new Date() },
    });

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'integration.sync.retry',
        resource: 'integration',
        resourceId: integrationId,
        details: {
          syncType,
          jobs,
          queued: jobs.length > 0,
          direct: directResult !== null,
        },
      },
    });

    return {
      success: true,
      queued: jobs.length > 0,
      message: jobs.length > 0
        ? 'Senkronizasyon kuyruğa eklendi'
        : 'Senkronizasyon doğrudan çalıştırıldı',
      integrationId,
      jobs,
      result: directResult,
    };
  }

  // Bölgeye göre pazaryerlerini getir
  async getMarketplacesByRegion(
    region: PlatformRegion,
  ): Promise<MarketplaceConfig[]> {
    return getMarketplacesByRegion(region);
  }

  // Plana göre erişilebilir pazaryerlerini getir
  async getAccessibleMarketplaces(
    plan: SubscriptionPlan,
  ): Promise<MarketplaceConfig[]> {
    return getMarketplacesByPlan(plan);
  }

  // İstatistikler
  async getIntegrationStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRegion: Record<string, number>;
  }> {
    const integrations = await this.prisma.integration.findMany({
      where: { tenantId },
    });

    const byRegion: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    for (const integration of integrations) {
      const marketplace = getMarketplaceById(integration.platform);
      if (marketplace) {
        byRegion[marketplace.region] = (byRegion[marketplace.region] || 0) + 1;
        if (integration.isActive) {
          active++;
        } else {
          inactive++;
        }
      }
    }

    return {
      total: integrations.length,
      active,
      inactive,
      byRegion,
    };
  }
}

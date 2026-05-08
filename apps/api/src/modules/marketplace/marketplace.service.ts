import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ScrapingService } from '../scraping/scraping.service';
import { OrdersService } from '../orders/orders.service';
import { TrendyolBridge } from './trendyol.bridge';
import { AmazonBridge } from './amazon.bridge';
import { HepsiburadaBridge } from './hepsiburada.bridge';
import { N11Bridge } from './n11.bridge';
import { CicekSepetiBridge } from './ciceksepeti.bridge';
import { Platform as PrismaPlatform, Prisma } from '@prisma/client';
import { EncryptionService } from '../../common/encryption.service';
import { EbayBridge } from './ebay.bridge';
import { AlibabaBridge } from './alibaba.bridge';
import { AliexpressBridge } from './aliexpress.bridge';
import { WalmartBridge } from './walmart.bridge';
import { EtsyBridge } from './etsy.bridge';
import { ShopeeBridge } from './shopee.bridge';
import { MercadoLibreBridge } from './mercadolibre.bridge';
import { RakutenBridge } from './rakuten.bridge';
import { WayfairBridge } from './wayfair.bridge';
import { ZalandoBridge } from './zalando.bridge';
import { LazadaBridge } from './lazada.bridge';
import { CoupangBridge } from './coupang.bridge';
import { OttoBridge } from './otto.bridge';
import { AllegroBridge } from './allegro.bridge';
import { CdiscountBridge } from './cdiscount.bridge';
import { BolBridge } from './bol.bridge';
import {
  MarketplaceAnalysisResponse,
  computeConfidenceFromSources,
} from './analysis.types';

export interface MarketplaceReview {
  externalId: string;
  productId?: string;
  productName: string;
  customerName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  reviewDate: Date;
  helpful?: number;
  verified?: boolean;
}

export interface MarketplaceBridge {
  syncProducts(): Promise<any>;
  syncOrders(): Promise<any>;
  updateStock(sku: string, stock: number): Promise<any>;
  updatePrice(sku: string, price: number): Promise<any>;
  getReviews?(page?: number, size?: number): Promise<MarketplaceReview[]>;
}

export enum Platform {
  TRENDYOL = 'TRENDYOL',
  AMAZON = 'AMAZON',
  HEPSIBURADA = 'HEPSIBURADA',
  N11 = 'N11',
  CICEKSEPETI = 'CICEKSEPETI',
  EBAY = 'EBAY',
  ALIBABA = 'ALIBABA',
  ALIEXPRESS = 'ALIEXPRESS',
  WALMART = 'WALMART',
  ETSY = 'ETSY',
  SHOPEE = 'SHOPEE',
  MERCADOLIBRE = 'MERCADOLIBRE',
  RAKUTEN = 'RAKUTEN',
  WAYFAIR = 'WAYFAIR',
  ZALANDO = 'ZALANDO',
  LAZADA = 'LAZADA',
  COUPANG = 'COUPANG',
  OTTO = 'OTTO',
  ALLEGRO = 'ALLEGRO',
  CDISCOUNT = 'CDISCOUNT',
  BOL = 'BOL',
  GENERIC = 'GENERIC',
}

@Injectable({ scope: Scope.REQUEST })
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    private prisma: PrismaService,
    private scrapingService: ScrapingService,
    private encryption: EncryptionService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {}

  async getBridgeForTenant(
    tenantId: string,
    platform: Platform,
  ): Promise<MarketplaceBridge> {
    const integration = await this.prisma.integration.findFirst({
      where: { tenantId, platform: platform as any, isActive: true },
    });

    if (!integration) {
      throw new Error(
        `${platform} entegrasyonu bu mağaza için bulunamadı veya pasif.`,
      );
    }

    const apiKey = this.encryption.decrypt(integration.apiKey);
    const apiSecret = this.encryption.decrypt(integration.apiSecret);

    switch (platform) {
      case Platform.TRENDYOL:
        const extra = integration.apiExtra as any;
        return new TrendyolBridge(
          apiKey,
          apiSecret,
          extra?.supplierId || '',
          this.scrapingService,
          !!extra?.isTestMode,
        );
      case Platform.AMAZON:
        return new AmazonBridge(apiKey, apiSecret, this.scrapingService);
      case Platform.HEPSIBURADA:
        return new HepsiburadaBridge(
          apiKey,
          (integration.apiExtra as any)?.merchantId || '',
          this.scrapingService,
        );
      case Platform.N11:
        return new N11Bridge(apiKey, apiSecret, this.scrapingService);
      case Platform.CICEKSEPETI:
        return new CicekSepetiBridge(apiKey, apiSecret, this.scrapingService);
      case Platform.EBAY:
        const ebayExtra = integration.apiExtra as any;
        return new EbayBridge(
          apiKey,
          apiSecret,
          ebayExtra?.devId || '',
          ebayExtra?.authToken || '',
          this.scrapingService,
          !!ebayExtra?.isSandbox,
        );
      case Platform.ALIBABA:
        const alibabaExtra = integration.apiExtra as any;
        return new AlibabaBridge(
          apiKey,
          apiSecret,
          alibabaExtra?.accessToken || '',
          this.scrapingService,
        );
      case Platform.ALIEXPRESS:
        const aliExtra = integration.apiExtra as any;
        return new AliexpressBridge(
          apiKey,
          apiSecret,
          aliExtra?.accessToken || '',
          this.scrapingService,
        );
      case Platform.WALMART:
        const walmartExtra = integration.apiExtra as any;
        return new WalmartBridge(
          apiKey,
          apiSecret,
          this.scrapingService,
          !!walmartExtra?.isSandbox,
        );
      case Platform.ETSY:
        const etsyExtra = integration.apiExtra as any;
        return new EtsyBridge(
          apiKey,
          apiSecret,
          etsyExtra?.accessToken || '',
          this.scrapingService,
        );
      case Platform.SHOPEE:
        const shopeeExtra = integration.apiExtra as any;
        return new ShopeeBridge(
          apiKey,
          apiSecret,
          shopeeExtra?.shopId || '',
          shopeeExtra?.accessToken || '',
          this.scrapingService,
          !!shopeeExtra?.isSandbox,
        );
      case Platform.MERCADOLIBRE:
        const mlExtra = integration.apiExtra as any;
        return new MercadoLibreBridge(
          apiKey,
          apiSecret,
          mlExtra?.accessToken || '',
          mlExtra?.siteId || 'MLM',
          this.scrapingService,
        );
      case Platform.RAKUTEN:
        const rakutenExtra = integration.apiExtra as any;
        return new RakutenBridge(
          apiKey,
          apiSecret,
          rakutenExtra?.applicationId || '',
          this.scrapingService,
        );
      case Platform.WAYFAIR:
        return new WayfairBridge(
          apiKey,
          apiSecret,
          (integration.apiExtra as any)?.supplierId || '',
          this.scrapingService,
        );
      case Platform.ZALANDO:
        return new ZalandoBridge(
          apiKey,
          (integration.apiExtra as any)?.partnerId || '',
          this.scrapingService,
        );
      case Platform.LAZADA:
        const lazadaExtra = integration.apiExtra as any;
        return new LazadaBridge(
          apiKey,
          apiSecret,
          lazadaExtra?.accessToken || '',
          this.scrapingService,
          lazadaExtra?.countryCode || 'MY',
        );
      case Platform.COUPANG:
        return new CoupangBridge(
          apiKey,
          apiSecret,
          (integration.apiExtra as any)?.vendorId || '',
          this.scrapingService,
        );
      case Platform.OTTO:
        return new OttoBridge(
          apiKey,
          apiSecret,
          (integration.apiExtra as any)?.partnerId || '',
          this.scrapingService,
        );
      case Platform.ALLEGRO:
        const allegroExtra = integration.apiExtra as any;
        return new AllegroBridge(
          apiKey,
          apiSecret,
          allegroExtra?.accessToken || '',
          this.scrapingService,
        );
      case Platform.CDISCOUNT:
        const cdiscountExtra = integration.apiExtra as any;
        return new CdiscountBridge(
          apiKey,
          apiSecret,
          cdiscountExtra?.token || '',
          this.scrapingService,
        );
      case Platform.BOL:
        return new BolBridge(
          apiKey,
          apiSecret,
          this.scrapingService,
          (integration.apiExtra as any)?.isProduction || false,
        );
      default:
        throw new Error(`Desteklenmeyen platform: ${platform}`);
    }
  }

  async syncAllPlatformsForTenant(tenantId: string) {
    const integrations = await this.prisma.integration.findMany({
      where: { tenantId, isActive: true },
    });

    const results: any[] = [];
    for (const integration of integrations) {
      try {
        const bridge = await this.getBridgeForTenant(
          tenantId,
          integration.platform as unknown as Platform,
        );
        const res = await bridge.syncProducts();
        results.push({
          platform: integration.platform,
          integrationId: integration.id,
          ...res,
        });
      } catch (error) {
        results.push({
          platform: integration.platform,
          integrationId: integration.id,
          success: false,
          error: (error as Error).message,
        });
      }
    }
    return results;
  }

  async syncIntegrationByStoreId(tenantId: string, storeId: string) {
    if (!tenantId || !storeId) {
      throw new BadRequestException('tenantId ve storeId zorunludur');
    }

    const integration = await this.prisma.integration.findFirst({
      where: {
        id: storeId,
        tenantId,
        isActive: true,
      },
    });

    if (!integration) {
      throw new NotFoundException('Aktif mağaza entegrasyonu bulunamadı');
    }

    const bridge = await this.getBridgeForTenant(
      tenantId,
      integration.platform as unknown as Platform,
    );
    const result = await bridge.syncProducts();
    return {
      integrationId: integration.id,
      platform: integration.platform,
      ...result,
    };
  }

  async probeAllIntegrationsForTenant(
    tenantId: string,
    options?: { includeOrders?: boolean; productLimit?: number },
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const integrations = await this.prisma.integration.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, platform: true },
    });

    const results: Array<Record<string, unknown>> = [];
    for (const integration of integrations) {
      try {
        const probe = await this.probeIntegrationContract(
          tenantId,
          integration.platform as unknown as Platform,
          options,
        );
        results.push({
          integrationId: integration.id,
          integrationPlatform: integration.platform,
          ...probe,
        });
      } catch (error) {
        results.push({
          integrationId: integration.id,
          platform: integration.platform,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const successful = results.filter((r) => r.success === true).length;
    return {
      tenantId,
      total: results.length,
      successful,
      failed: results.length - successful,
      results,
    };
  }

  async syncPlatformOrdersForTenant(tenantId: string, platform: Platform) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const bridge = await this.getBridgeForTenant(tenantId, platform);
    const raw = await bridge.syncOrders();
    const orders = this.extractOrders(raw);

    let created = 0;
    let updated = 0;
    let failed = 0;

    // Pre-fetch all existing orders for this tenant+platform in a single query
    const marketplaceOrderIds = orders
      .map((source) => {
        try {
          return this.normalizeOrderForPersistence(tenantId, platform, source)
            .marketplaceOrderId;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];

    const existingOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        platform: platform as unknown as PrismaPlatform,
        marketplaceOrderId: { in: marketplaceOrderIds },
      },
      select: { id: true, marketplaceOrderId: true },
    });
    const existingMap = new Map(
      existingOrders.map((o) => [o.marketplaceOrderId, o.id]),
    );

    for (const source of orders) {
      try {
        const normalized = this.normalizeOrderForPersistence(
          tenantId,
          platform,
          source,
        );
        const existingId = existingMap.get(normalized.marketplaceOrderId);

        if (existingId) {
          await this.prisma.order.update({
            where: { id: existingId },
            data: normalized.orderData,
          });
          updated += 1;
        } else {
          const createdOrder = await this.prisma.order.create({
            data: normalized.orderData,
            include: { items: true },
          });
          created += 1;

          // OTOMASYON: Eğer sipariş kargolanmış şekilde geldiyse fatura kes
          if (createdOrder.status === 'SHIPPED') {
            this.ordersService
              .autoCreateInvoiceForOrder(createdOrder, tenantId)
              .catch((err: Error) => {
                this.logger.error(
                  `Pazaryeri senkronizasyonunda otomatik fatura hatası: ${err.message}`,
                );
              });
          }
        }
      } catch (error) {
        failed += 1;
        this.logger.warn(
          `Order sync failed for platform=${platform}: ${(error as Error).message}`,
        );
      }
    }

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'marketplace.orders.sync',
        resource: 'order',
        details: {
          platform,
          total: orders.length,
          created,
          updated,
          failed,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      platform,
      total: orders.length,
      created,
      updated,
      failed,
    };
  }

  async updateMarketplaceStock(
    tenantId: string,
    platform: Platform,
    sku: string,
    stock: number,
    requestKey?: string,
  ) {
    if (!tenantId || !sku) {
      throw new BadRequestException('tenantId ve sku zorunludur');
    }

    const key = requestKey || `${platform}:stock:${sku}:${stock}`;
    const duplicate = await this.findRecentIdempotentLog(
      tenantId,
      'marketplace.stock.update',
      key,
    );
    if (duplicate) {
      return {
        success: true,
        skipped: true,
        reason: 'idempotent_request',
        requestKey: key,
      };
    }

    const bridge = await this.getBridgeForTenant(tenantId, platform);
    const result = await this.withRetry(
      () => bridge.updateStock(sku, stock),
      3,
      400,
    );

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'marketplace.stock.update',
        resource: 'product',
        resourceId: sku,
        details: {
          platform,
          stock,
          requestKey: key,
          result,
        } as Prisma.InputJsonValue,
      },
    });

    return { ...result, requestKey: key };
  }

  async updateMarketplacePrice(
    tenantId: string,
    platform: Platform,
    sku: string,
    price: number,
    requestKey?: string,
  ) {
    if (!tenantId || !sku) {
      throw new BadRequestException('tenantId ve sku zorunludur');
    }

    const key = requestKey || `${platform}:price:${sku}:${price}`;
    const duplicate = await this.findRecentIdempotentLog(
      tenantId,
      'marketplace.price.update',
      key,
    );
    if (duplicate) {
      return {
        success: true,
        skipped: true,
        reason: 'idempotent_request',
        requestKey: key,
      };
    }

    const bridge = await this.getBridgeForTenant(tenantId, platform);
    const result = await this.withRetry(
      () => bridge.updatePrice(sku, price),
      3,
      400,
    );

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'marketplace.price.update',
        resource: 'product',
        resourceId: sku,
        details: {
          platform,
          price,
          requestKey: key,
          result,
        } as Prisma.InputJsonValue,
      },
    });

    return { ...result, requestKey: key };
  }

  async probeIntegrationContract(
    tenantId: string,
    platform: Platform,
    options?: { includeOrders?: boolean; productLimit?: number },
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    const includeOrders = options?.includeOrders ?? false;
    const productLimit = Math.max(
      1,
      Math.min(20, Number(options?.productLimit ?? 5)),
    );

    const startedAt = Date.now();
    const bridge = await this.getBridgeForTenant(tenantId, platform);
    const bridgeAny = bridge as unknown as {
      getStoreInfo?: (storeId?: string) => Promise<unknown>;
      getStoreProducts?: (storeId?: string, limit?: number) => Promise<unknown>;
    };

    const checks: Array<{
      name: string;
      passed: boolean;
      detail: string;
      sample?: Prisma.InputJsonValue;
    }> = [];

    try {
      const info = bridgeAny.getStoreInfo
        ? await this.withRetry(() => bridgeAny.getStoreInfo!(), 2, 300)
        : null;
      const infoObj =
        info && typeof info === 'object'
          ? (info as Record<string, unknown>)
          : null;
      const infoPassed = Boolean(infoObj?.storeId && infoObj?.storeName);

      checks.push({
        name: 'storeInfoShape',
        passed: infoPassed,
        detail: infoPassed
          ? 'storeId/storeName alanlari mevcut'
          : 'storeInfo response shape eksik',
        sample: infoObj
          ? ({
              storeId: infoObj.storeId ?? null,
              storeName: infoObj.storeName ?? null,
              totalProducts: infoObj.totalProducts ?? null,
            } as Prisma.InputJsonValue)
          : undefined,
      });
    } catch (error) {
      checks.push({
        name: 'storeInfoShape',
        passed: false,
        detail: `storeInfo hatasi: ${(error as Error).message}`,
      });
    }

    try {
      const productsRaw = bridgeAny.getStoreProducts
        ? await this.withRetry(
            () => bridgeAny.getStoreProducts!(undefined, productLimit),
            2,
            300,
          )
        : [];

      const products = Array.isArray(productsRaw) ? productsRaw : [];
      const first =
        products[0] && typeof products[0] === 'object'
          ? (products[0] as Record<string, unknown>)
          : null;

      const firstHasShape = Boolean(
        first &&
        (first.title || first.name) &&
        (first.productId || first.id || first.sku),
      );
      const productShapeOk =
        Array.isArray(productsRaw) && (products.length === 0 || firstHasShape);

      checks.push({
        name: 'productsShape',
        passed: productShapeOk,
        detail: productShapeOk
          ? `${products.length} urun alindi, liste shape dogrulandi`
          : 'urun listesi bos veya beklenen alanlar eksik',
        sample: first
          ? ({
              productId: first.productId ?? first.id ?? first.sku ?? null,
              title: first.title ?? first.name ?? null,
              salePrice: first.salePrice ?? first.price ?? null,
            } as Prisma.InputJsonValue)
          : undefined,
      });
    } catch (error) {
      checks.push({
        name: 'productsShape',
        passed: false,
        detail: `products hatasi: ${(error as Error).message}`,
      });
    }

    if (includeOrders) {
      try {
        const ordersRaw = await this.withRetry(
          () => bridge.syncOrders(),
          2,
          400,
        );
        const orders = this.extractOrders(ordersRaw);
        const firstOrder = orders[0] || null;
        const orderShapeOk = Boolean(
          !firstOrder ||
          firstOrder.orderNumber ||
          firstOrder.orderId ||
          firstOrder.id ||
          firstOrder.packageNumber,
        );

        checks.push({
          name: 'ordersShape',
          passed: orderShapeOk,
          detail: `orders count: ${orders.length}`,
          sample: firstOrder
            ? ({
                orderNumber: firstOrder.orderNumber ?? null,
                orderId: firstOrder.orderId ?? firstOrder.id ?? null,
                status: firstOrder.status ?? firstOrder.orderStatus ?? null,
              } as Prisma.InputJsonValue)
            : undefined,
        });
      } catch (error) {
        checks.push({
          name: 'ordersShape',
          passed: false,
          detail: `orders hatasi: ${(error as Error).message}`,
        });
      }
    }

    const passedChecks = checks.filter((check) => check.passed).length;
    const success = passedChecks === checks.length && checks.length > 0;
    const durationMs = Date.now() - startedAt;

    const result = {
      success,
      tenantId,
      platform,
      checkedAt: new Date().toISOString(),
      durationMs,
      checks,
      score:
        checks.length > 0
          ? Math.round((passedChecks / checks.length) * 100)
          : 0,
    };

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'marketplace.contract.probe',
        resource: 'integration',
        details: result as unknown as Prisma.InputJsonValue,
      },
    });

    return result;
  }

  /**
   * Pazaryerinden mağaza analizi yap
   */
  async analyzeStore(
    platform: Platform,
    storeId: string,
  ): Promise<MarketplaceAnalysisResponse> {
    const bridge = (await this.getTempBridge(platform)) as any;

    if (platform === Platform.TRENDYOL) {
      return bridge.analyzeStoreSEO(storeId);
    } else if (platform === Platform.HEPSIBURADA) {
      return bridge.analyzeStoreSEO(storeId);
    }

    // Universal Fallback for ANY other platform or direct URL
    if (storeId.startsWith('http')) {
      const scrapedData = await this.scrapingService.scrapeStore(storeId);
      if (scrapedData) {
        const metricSources = {
          storeName: 'scraped',
          rating: 'scraped',
          followers: 'scraped',
          productCount: 'scraped',
          totalProducts: 'scraped',
          responseTime: 'scraped_or_unknown',
          monthlyTraffic: 'not_available',
          monthlyTurnover: 'not_available',
        } as const;

        return {
          platform: scrapedData.platform || 'GENERIC',
          storeId: storeId,
          storeName: scrapedData.storeName,
          seoScore: Math.round(scrapedData.rating * 10), // Approx conversion
          dataSources: {
            overall: 'scraped+calculated',
            seoScore: 'calculated',
            products: 'not_available',
            metrics: metricSources,
            reasons: {
              monthlyTraffic:
                'Universal scrape akisi aylik trafik degeri saglamiyor.',
              monthlyTurnover:
                'Universal scrape akisi aylik ciro degeri saglamiyor.',
            },
            evidence: {
              adapter: 'marketplace.service.generic',
              inputUrl: storeId,
            },
          },
          confidence: computeConfidenceFromSources(metricSources),
          metrics: {
            storeName: scrapedData.storeName,
            rating: scrapedData.rating,
            followers: scrapedData.followerCount,
            totalProducts: scrapedData.productCount,
            productCount: scrapedData.productCount,
            responseTime: scrapedData.responseTime || 'Bilinmiyor',
          },
          products: [], // Generic scraper might not get full product list yet
          recommendations: ['Global pazar yeri analizi tamamlandı.'],
          timestamp: new Date(),
        };
      }
    }

    throw new Error(
      `${platform} için analiz henüz implementasyon edilmedi ve URL geçerli değil.`,
    );
  }

  /**
   * Mağaza ürünlerini getir
   */
  async getStoreProducts(
    platform: Platform,
    storeId: string,
    limit: number = 10,
  ) {
    const bridge = (await this.getTempBridge(platform)) as any;

    if (platform === Platform.TRENDYOL) {
      return bridge.getStoreProducts(storeId, limit);
    } else if (platform === Platform.HEPSIBURADA) {
      return bridge.getStoreProducts(storeId, limit);
    }

    throw new Error(
      `${platform} için ürün getirme henüz implementasyon edilmedi`,
    );
  }

  /**
   * Pazaryerinde ürün ara (auto-discovery için)
   */
  async searchProducts(
    platform: Platform,
    query: string,
    limit: number = 5,
  ): Promise<Array<Record<string, unknown>>> {
    try {
      const bridge = (await this.getTempBridge(platform)) as any;
      if (typeof bridge.searchProducts === 'function') {
        const results = await bridge.searchProducts(query, limit);
        return Array.isArray(results) ? results : [];
      }
    } catch {
      // Platform may not support search
    }
    return [];
  }

  /**
   * Mağaza bilgilerini getir
   */
  async getStoreInfo(platform: Platform, storeId: string) {
    const bridge = (await this.getTempBridge(platform)) as any;

    if (platform === Platform.TRENDYOL) {
      return bridge.getStoreInfo(storeId);
    } else if (platform === Platform.HEPSIBURADA) {
      return bridge.getStoreInfo(storeId);
    }

    throw new Error(
      `${platform} için mağaza bilgisi henüz implementasyon edilmedi`,
    );
  }

  /**
   * API Key olmadan geçici bridge oluştur (public store analizi için)
   */
  private async getTempBridge(platform: Platform): Promise<MarketplaceBridge> {
    switch (platform) {
      case Platform.TRENDYOL:
        // Trendyol public API'si kullanıyoruz
        return new TrendyolBridge('public', 'public', '', this.scrapingService);
      case Platform.AMAZON:
        return new AmazonBridge('public', 'public', this.scrapingService);
      case Platform.HEPSIBURADA:
        return new HepsiburadaBridge('public', 'public', this.scrapingService);
      case Platform.N11:
        return new N11Bridge('public', 'public', this.scrapingService);
      case Platform.CICEKSEPETI:
        return new CicekSepetiBridge('public', 'public', this.scrapingService);
      default:
        throw new Error(`${platform} köprüsü henüz hazır değil.`);
    }
  }

  // ==================== STORE MANAGEMENT ====================
  async getStores(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    try {
      const [integrations, productGroups, orderGroups] = await Promise.all([
        this.prisma.integration.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.marketplaceProduct.groupBy({
          by: ['platform'],
          _count: { _all: true },
          where: {
            product: { tenantId },
          },
        }),
        this.prisma.order.groupBy({
          by: ['platform'],
          _count: { _all: true },
          _sum: { totalAmount: true },
          where: { tenantId },
        }),
      ]);

      const productCountByPlatform = new Map(
        productGroups.map((group) => [group.platform, group._count._all]),
      );
      const orderStatsByPlatform = new Map(
        orderGroups.map((group) => [
          group.platform,
          {
            orderCount: group._count._all,
            revenue: Number(group._sum.totalAmount ?? 0),
          },
        ]),
      );

      return integrations.map((integration) => {
        const orderStats = orderStatsByPlatform.get(integration.platform);
        const lastSync = integration.updatedAt?.toISOString() || null;
        const hoursSinceUpdate = integration.updatedAt
          ? (Date.now() - integration.updatedAt.getTime()) / (1000 * 60 * 60)
          : Number.POSITIVE_INFINITY;

        const health = !integration.isActive
          ? 0
          : hoursSinceUpdate <= 24
            ? 95
            : hoursSinceUpdate <= 24 * 7
              ? 85
              : 70;

        return {
          id: integration.id,
          platform: integration.platform,
          name: `${integration.platform} Mağazası`,
          status: integration.isActive ? 'connected' : 'disconnected',
          lastSync,
          productCount: productCountByPlatform.get(integration.platform) ?? 0,
          orderCount: orderStats?.orderCount ?? 0,
          revenue: orderStats?.revenue ?? 0,
          health,
          createdAt: integration.createdAt.toISOString(),
        };
      });
    } catch (error) {
      this.logger.error(
        `getStores failed for tenant ${tenantId}`,
        error as Error,
      );
      throw new InternalServerErrorException(
        'Mağaza entegrasyonları alınamadı',
      );
    }
  }

  async getIntegrations(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }

    try {
      const integrations = await this.prisma.integration.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      return integrations.map((integration) => ({
        id: integration.id,
        platform: integration.platform,
        isActive: integration.isActive,
        lastSyncAt: integration.updatedAt?.toISOString(),
        settings: integration.apiExtra,
        createdAt: integration.createdAt.toISOString(),
        status: integration.isActive ? 'active' : 'inactive',
      }));
    } catch (error) {
      this.logger.error(
        `getIntegrations failed for tenant ${tenantId}`,
        error as Error,
      );
      throw new InternalServerErrorException('Entegrasyonlar alınamadı');
    }
  }

  async connectStore(
    tenantId: string,
    platform: string,
    credentials: Record<string, unknown>,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId zorunludur');
    }
    if (!platform) {
      throw new BadRequestException('platform zorunludur');
    }

    const normalizedPlatform = platform.toUpperCase() as PrismaPlatform;
    if (!Object.values(PrismaPlatform).includes(normalizedPlatform)) {
      throw new BadRequestException(`Desteklenmeyen platform: ${platform}`);
    }

    const sanitizedCredentials = this.validateAndNormalizeCredentials(
      normalizedPlatform,
      credentials,
    );

    try {
      const existing = await this.prisma.integration.findFirst({
        where: {
          tenantId,
          platform: normalizedPlatform,
          isActive: true,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `${normalizedPlatform} mağazası zaten bağlı`,
        );
      }

      const integration = await this.prisma.integration.create({
        data: {
          tenantId,
          platform: normalizedPlatform,
          isActive: true,
          apiKey: this.encryption.encrypt(sanitizedCredentials.apiKey),
          apiSecret: this.encryption.encrypt(sanitizedCredentials.apiSecret),
          apiExtra: sanitizedCredentials.apiExtra,
        },
      });
      return {
        success: true,
        integration,
        message: `${normalizedPlatform} mağazası başarıyla bağlandı`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `connectStore failed for tenant ${tenantId}`,
        error as Error,
      );
      throw new InternalServerErrorException('Mağaza bağlanamadı');
    }
  }

  async disconnectStore(tenantId: string, storeId: string) {
    if (!tenantId || !storeId) {
      throw new BadRequestException('tenantId ve storeId zorunludur');
    }

    try {
      const integration = await this.prisma.integration.findFirst({
        where: { id: storeId, tenantId },
        select: { id: true, isActive: true },
      });

      if (!integration) {
        throw new NotFoundException('Mağaza bağlantısı bulunamadı');
      }

      if (!integration.isActive) {
        return { success: true, message: 'Mağaza bağlantısı zaten pasif' };
      }

      await this.prisma.integration.update({
        where: { id: integration.id },
        data: { isActive: false },
      });
      return { success: true, message: 'Mağaza bağlantısı kesildi' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `disconnectStore failed for tenant ${tenantId}`,
        error as Error,
      );
      throw new InternalServerErrorException('Mağaza bağlantısı kesilemedi');
    }
  }

  private extractOrders(raw: any): Record<string, unknown>[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    if (Array.isArray(raw.orders))
      return raw.orders as Record<string, unknown>[];
    if (Array.isArray(raw.content))
      return raw.content as Record<string, unknown>[];
    if (
      raw.data &&
      typeof raw.data === 'object' &&
      Array.isArray((raw.data as { items?: unknown }).items)
    ) {
      return (raw.data as { items: Record<string, unknown>[] }).items;
    }
    return [];
  }

  private normalizeOrderForPersistence(
    tenantId: string,
    platform: Platform,
    source: Record<string, unknown>,
  ) {
    const marketplaceOrderId = String(
      source.orderNumber ??
        source.orderId ??
        source.id ??
        source.packageNumber ??
        `ORD-${Date.now()}`,
    );

    const totalAmount = this.toNumber(
      source.totalAmount ?? source.totalPrice ?? source.amount,
    );
    const taxAmount = this.toNumber(source.taxAmount ?? source.tax ?? 0);

    const statusRaw = String(
      source.status ?? source.orderStatus ?? 'PENDING',
    ).toUpperCase();
    const status = (
      [
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ].includes(statusRaw)
        ? statusRaw
        : 'PENDING'
    ) as
      | 'PENDING'
      | 'CONFIRMED'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELLED'
      | 'RETURNED';

    const paymentRaw = String(source.paymentStatus ?? 'UNPAID').toUpperCase();
    const paymentStatus = (
      ['UNPAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(paymentRaw)
        ? paymentRaw
        : 'UNPAID'
    ) as 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

    const orderDate = source.orderDate
      ? new Date(String(source.orderDate))
      : new Date();

    return {
      platform,
      marketplaceOrderId,
      orderData: {
        tenantId,
        platform: platform as unknown as PrismaPlatform,
        marketplaceOrderId,
        status,
        paymentStatus,
        customerName: source.customerName ? String(source.customerName) : null,
        customerEmail: source.customerEmail
          ? String(source.customerEmail)
          : null,
        customerPhone: source.customerPhone
          ? String(source.customerPhone)
          : null,
        shippingAddress: source.shippingAddress
          ? String(source.shippingAddress)
          : null,
        billingAddress: source.billingAddress
          ? String(source.billingAddress)
          : null,
        totalAmount,
        taxAmount,
        shippingCost: this.toNumber(source.shippingCost ?? 0),
        commissionAmount: this.toNumber(source.commissionAmount ?? 0),
        netProfit: this.toNumber(source.netProfit ?? 0),
        currency: source.currency ? String(source.currency) : 'TRY',
        trackingNumber: source.trackingNumber
          ? String(source.trackingNumber)
          : null,
        shippingProvider: source.shippingProvider
          ? String(source.shippingProvider)
          : null,
        notes: source.notes ? String(source.notes) : null,
        orderDate,
      },
    };
  }

  private toNumber(value: unknown): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private async findRecentIdempotentLog(
    tenantId: string,
    action: string,
    requestKey: string,
  ) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const logs = await this.prisma.activityLog.findMany({
      where: {
        tenantId,
        action,
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return logs.find((log) => {
      const details = log.details as { requestKey?: string } | null;
      return details?.requestKey === requestKey;
    });
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    delayMs: number,
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * (attempt + 1)),
          );
        }
      }
    }
    throw lastError;
  }

  private validateAndNormalizeCredentials(
    platform: PrismaPlatform,
    credentials: Record<string, unknown>,
  ) {
    const apiKey =
      typeof credentials.apiKey === 'string' ? credentials.apiKey.trim() : '';
    const apiSecret =
      typeof credentials.apiSecret === 'string'
        ? credentials.apiSecret.trim()
        : '';

    if (!apiKey) {
      throw new UnprocessableEntityException('apiKey zorunludur');
    }

    if (!apiSecret) {
      throw new UnprocessableEntityException('apiSecret zorunludur');
    }

    const apiExtraEntries = Object.entries(credentials).filter(
      ([key, value]) => {
        if (key === 'apiKey' || key === 'apiSecret') return false;
        return value !== undefined;
      },
    );
    const apiExtra: Record<string, unknown> =
      Object.fromEntries(apiExtraEntries);

    if (platform === PrismaPlatform.TRENDYOL) {
      const supplierId =
        typeof credentials.supplierId === 'string'
          ? credentials.supplierId.trim()
          : '';
      if (!supplierId) {
        throw new UnprocessableEntityException(
          'Trendyol için supplierId zorunludur',
        );
      }
      apiExtra.supplierId = supplierId;
    }

    if (platform === PrismaPlatform.HEPSIBURADA) {
      const merchantId =
        typeof credentials.merchantId === 'string'
          ? credentials.merchantId.trim()
          : '';
      if (!merchantId) {
        throw new UnprocessableEntityException(
          'Hepsiburada için merchantId zorunludur',
        );
      }
      apiExtra.merchantId = merchantId;
    }

    return {
      apiKey,
      apiSecret,
      apiExtra: apiExtra as Prisma.InputJsonValue,
    };
  }
}

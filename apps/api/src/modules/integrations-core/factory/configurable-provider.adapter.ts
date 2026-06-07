import { IntegrationCategory } from '../enums/integration-category.enum';
import { IntegrationSyncType } from '../enums/integration-category.enum';
import { BaseIntegrationAdapter } from '../base/base-integration.adapter';
import type { OmnichannelProviderMeta } from '../catalog/omnichannel-catalog';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../interfaces/integration-context.interface';
import type { IIntegrationProvider } from '../interfaces/providers/base.provider';
import type { SyncResultDto } from '../dto/sync-result.dto';
import type { NormalizedProductDto } from '../dto/normalized-product.dto';
import type { NormalizedOrderDto } from '../dto/normalized-order.dto';
import type { CargoShipmentDto } from '../dto/cargo-shipment.dto';
import type { CargoTrackingDto } from '../dto/cargo-tracking.dto';
import type { NormalizedInvoiceDto } from '../dto/normalized-invoice.dto';
import type { ErpCustomerDto, ErpInvoiceDto, ErpStockDto } from '../dto/erp-sync.dto';
import type { SocialFeedProductDto } from '../dto/social-feed-product.dto';
import type { GlobalListingDto } from '../dto/global-listing.dto';
import type {
  FulfillmentInventoryDto,
  FulfillmentOrderDto,
} from '../dto/fulfillment.dto';
import { normalizeGenericProduct } from '../normalizers/product.normalizer';
import { normalizeGenericTracking } from '../normalizers/cargo.normalizer';
import { MarketplaceBridgeResolver } from './marketplace-bridge.resolver';
import {
  PROVIDER_CARGO_BRIDGE_MAP,
  PROVIDER_PLATFORM_MAP,
  type CargoBridgeKind,
} from './provider-platform.map';
import { Platform } from '@pazaryonetimi/database';
import { ArasKargoBridge } from '../../shipping/carriers/aras-kargo.bridge';
import { YurticiKargoBridge } from '../../shipping/carriers/yurtici-kargo.bridge';
import { MngKargoBridge } from '../../shipping/carriers/mng-kargo.bridge';
import { PttKargoBridge } from '../../shipping/carriers/ptt-kargo.bridge';
import type { ShipmentRequest } from '../../shipping/carriers/carrier.interface';
import { EdmIntegrator } from '../../e-invoice/integrators/edm.bridge';
import { LogoIntegrator } from '../../e-invoice/integrators/logo.bridge';
import { ParasutIntegrator } from '../../e-invoice/integrators/parasut.bridge';
import type { IntegratorConfig } from '../../e-invoice/integrators/integrator.interface';

/** Boş sync sonucu şablonu */
function emptySync<T>(
  ctx: TenantIntegrationContext,
  providerId: string,
  syncType: IntegrationSyncType,
  started: number,
): SyncResultDto<T> {
  return {
    success: true,
    tenantId: ctx.tenantId,
    providerId,
    syncType,
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    items: [],
    durationMs: Date.now() - started,
  };
}

/**
 * Katalog meta + opsiyonel bridge ile çalışan yapılandırılabilir adapter.
 * Bridge yoksa güvenli fallback (boş sync + credential doğrulama) döner.
 */
export class ConfigurableProviderAdapter
  extends BaseIntegrationAdapter
  implements IIntegrationProvider
{
  readonly providerId: string;
  readonly displayName: string;
  readonly category: IntegrationCategory;
  private readonly platform: Platform | null;
  private readonly cargoKind: CargoBridgeKind | null;
  private readonly invoiceIntegratorKey: string | null;

  constructor(
    meta: OmnichannelProviderMeta,
    private readonly bridgeResolver: MarketplaceBridgeResolver,
    options?: {
      platform?: Platform | null;
      cargoKind?: CargoBridgeKind | null;
      invoiceIntegratorKey?: string | null;
    },
  ) {
    super();
    this.providerId = meta.id;
    this.displayName = meta.name;
    this.category = meta.category;
    this.platform =
      options?.platform ?? PROVIDER_PLATFORM_MAP[meta.id] ?? null;
    this.cargoKind =
      options?.cargoKind ?? PROVIDER_CARGO_BRIDGE_MAP[meta.id] ?? null;
    this.invoiceIntegratorKey = options?.invoiceIntegratorKey ?? null;
  }

  async testConnection(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    this.assertContext(ctx);
    if (!credentials.apiKey && !credentials.extra.username) {
      return this.fail('API kimlik bilgisi zorunludur');
    }
    return this.ok(`${this.displayName} bağlantı bilgileri doğrulandı`);
  }

  private buildIntegratorConfig(credentials: DecryptedCredentials): IntegratorConfig {
    const username = credentials.apiKey || String(credentials.extra.username ?? '');
    const password = credentials.apiSecret || String(credentials.extra.password ?? '');
    return {
      apiUrl: String(credentials.extra.apiUrl ?? ''),
      apiKey: username,
      apiSecret: password,
      username,
      password,
    };
  }

  private toShipmentRequest(dto: CargoShipmentDto): ShipmentRequest {
    return {
      senderAddress: {
        name: dto.sender.name,
        phone: dto.sender.phone,
        address: dto.sender.address,
        city: dto.sender.city,
        district: dto.sender.district,
        postalCode: dto.sender.postalCode,
        email: dto.sender.email,
      },
      receiverAddress: {
        name: dto.receiver.name,
        phone: dto.receiver.phone,
        address: dto.receiver.address,
        city: dto.receiver.city,
        district: dto.receiver.district,
        postalCode: dto.receiver.postalCode,
        email: dto.receiver.email,
      },
      weight: dto.weightKg,
      description: dto.description,
      isCod: dto.isCod,
      codAmount: dto.codAmount,
    };
  }

  private buildCargoBridge(credentials: DecryptedCredentials, kind: CargoBridgeKind) {
    const cfg = {
      apiUser: credentials.apiKey,
      apiPassword: credentials.apiSecret,
      customerCode: String(credentials.extra.customerCode ?? ''),
      apiUrl: String(credentials.extra.apiUrl ?? ''),
    };
    switch (kind) {
      case 'yurtici':
        return new YurticiKargoBridge({
          apiUser: cfg.apiUser,
          apiPassword: cfg.apiPassword,
          apiUrl: cfg.apiUrl,
        });
      case 'aras':
        return new ArasKargoBridge(cfg);
      case 'mng':
        return new MngKargoBridge({
          apiUrl: cfg.apiUrl,
          apiToken: cfg.apiUser,
        });
      case 'ptt':
        return new PttKargoBridge({
          apiUrl: cfg.apiUrl,
          apiUser: cfg.apiUser,
          apiPassword: cfg.apiPassword,
        });
      default:
        return null;
    }
  }

  private async syncViaMarketplaceBridge(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    syncType: IntegrationSyncType,
  ): Promise<SyncResultDto<NormalizedProductDto | NormalizedOrderDto>> {
    const started = Date.now();
    if (!this.platform) {
      return emptySync(ctx, this.providerId, syncType, started);
    }

    const bridge = this.bridgeResolver.resolve(this.platform, credentials);
    if (!bridge) {
      return emptySync(ctx, this.providerId, syncType, started);
    }

    try {
      if (syncType === IntegrationSyncType.ORDERS) {
        const raw = await bridge.syncOrders();
        const orders = (raw?.orders ?? []) as Record<string, unknown>[];
        return {
          success: true,
          tenantId: ctx.tenantId,
          providerId: this.providerId,
          syncType,
          total: orders.length,
          created: orders.length,
          updated: 0,
          failed: 0,
          items: orders as unknown as NormalizedOrderDto[],
          durationMs: Date.now() - started,
        };
      }

      const raw = await bridge.syncProducts();
      const products = (raw?.products ?? []) as Record<string, unknown>[];
      const items = products.map((p) =>
        normalizeGenericProduct(p, String(this.platform)),
      );
      return {
        success: true,
        tenantId: ctx.tenantId,
        providerId: this.providerId,
        syncType,
        total: items.length,
        created: items.length,
        updated: 0,
        failed: 0,
        items,
        durationMs: Date.now() - started,
      };
    } catch (error) {
      return {
        success: false,
        tenantId: ctx.tenantId,
        providerId: this.providerId,
        syncType,
        total: 0,
        created: 0,
        updated: 0,
        failed: 1,
        items: [],
        errors: [(error as Error).message],
        durationMs: Date.now() - started,
      };
    }
  }

  async syncProducts(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    return this.syncViaMarketplaceBridge(
      ctx,
      credentials,
      IntegrationSyncType.PRODUCTS,
    ) as Promise<SyncResultDto<NormalizedProductDto>>;
  }

  async syncOrders(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    return this.syncViaMarketplaceBridge(
      ctx,
      credentials,
      IntegrationSyncType.ORDERS,
    ) as Promise<SyncResultDto<NormalizedOrderDto>>;
  }

  async syncListings(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    const started = Date.now();
    const productResult = await this.syncProducts(ctx, credentials);
    const items: GlobalListingDto[] = productResult.items.map((p) => ({
      externalId: p.externalId,
      sku: p.sku,
      title: p.title,
      marketplace: this.providerId,
      country: 'GLOBAL',
      salePrice: p.salePrice,
      currency: p.currency ?? 'TRY',
      stock: p.stock,
      status: 'active' as const,
    }));
    return {
      ...productResult,
      syncType: IntegrationSyncType.PRODUCTS,
      items,
      total: items.length,
      durationMs: Date.now() - started,
    };
  }

  async createShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: CargoShipmentDto,
  ) {
    this.assertContext(ctx);
    if (!this.cargoKind) {
      return { success: false, message: 'Kargo bridge yapılandırılmamış' };
    }
    try {
      const bridge = this.buildCargoBridge(credentials, this.cargoKind);
      if (!bridge) {
        return { success: false, message: 'Kargo bridge oluşturulamadı' };
      }
      const result = await bridge.createShipment(this.toShipmentRequest(payload));
      return {
        success: true,
        trackingNumber: result.trackingNumber,
        message: 'Gönderi oluşturuldu',
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async trackShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ): Promise<CargoTrackingDto> {
    this.assertContext(ctx);
    if (!this.cargoKind) {
      return normalizeGenericTracking(
        trackingNumber,
        this.displayName,
        ctx.tenantId,
        this.providerId,
        { status: 'unknown' },
      );
    }
    const bridge = this.buildCargoBridge(credentials, this.cargoKind);
    if (!bridge) {
      return normalizeGenericTracking(
        trackingNumber,
        this.displayName,
        ctx.tenantId,
        this.providerId,
        {},
      );
    }
    const raw = await bridge.trackShipment(trackingNumber);
    return normalizeGenericTracking(
      trackingNumber,
      this.displayName,
      ctx.tenantId,
      this.providerId,
      raw as unknown as Record<string, unknown>,
    );
  }

  async cancelShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ) {
    this.assertContext(ctx);
    if (!this.cargoKind) {
      return { success: false, message: 'İptal desteklenmiyor' };
    }
    try {
      const bridge = this.buildCargoBridge(credentials, this.cargoKind);
      if (!bridge) {
        return { success: false, message: 'Bridge yok' };
      }
      const ok = await bridge.cancelShipment(trackingNumber);
      return { success: ok, message: ok ? 'İptal edildi' : 'İptal başarısız' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async syncInvoices(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    const started = Date.now();
    if (this.invoiceIntegratorKey) {
      try {
        const config = this.buildIntegratorConfig(credentials);
        const integrator = this.resolveInvoiceIntegrator(this.invoiceIntegratorKey);
        if (integrator) {
          await integrator.checkStatus('health-check', config);
        }
      } catch {
        // fallback to empty
      }
    }
    return emptySync<NormalizedInvoiceDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.INVOICES,
      started,
    );
  }

  private resolveInvoiceIntegrator(key: string) {
    switch (key) {
      case 'edm':
        return new EdmIntegrator();
      case 'logo':
        return new LogoIntegrator();
      case 'parasut':
        return new ParasutIntegrator();
      default:
        return null;
    }
  }

  async syncCustomers(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    return emptySync<ErpCustomerDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.ERP_SYNC,
      Date.now(),
    );
  }

  async syncStock(ctx: TenantIntegrationContext, credentials: DecryptedCredentials) {
    return emptySync<ErpStockDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.INVENTORY,
      Date.now(),
    );
  }

  async syncProductFeed(ctx: TenantIntegrationContext, _credentials: DecryptedCredentials) {
    return emptySync<SocialFeedProductDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.FEED_SYNC,
      Date.now(),
    );
  }

  async syncInventory(ctx: TenantIntegrationContext, _credentials: DecryptedCredentials) {
    return emptySync<FulfillmentInventoryDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.FULFILLMENT_SYNC,
      Date.now(),
    );
  }

  async syncFulfillmentOrders(
    ctx: TenantIntegrationContext,
    _credentials: DecryptedCredentials,
  ) {
    return emptySync<FulfillmentOrderDto>(
      ctx,
      this.providerId,
      IntegrationSyncType.FULFILLMENT_SYNC,
      Date.now(),
    );
  }

  async updateStock(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    sku: string,
    quantity: number,
  ) {
    this.assertContext(ctx);
    if (!this.platform) {
      return { success: false, message: 'Stok güncelleme henüz desteklenmiyor' };
    }
    const bridge = this.bridgeResolver.resolve(this.platform, credentials);
    if (!bridge?.updateStock) {
      return { success: false, message: 'Bridge stok güncellemeyi desteklemiyor' };
    }
    try {
      await bridge.updateStock(sku, quantity);
      return { success: true, message: `Stok güncellendi: ${sku}` };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async updatePrice(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    sku: string,
    price: number,
  ) {
    this.assertContext(ctx);
    if (!this.platform) {
      return { success: false, message: 'Fiyat güncelleme henüz desteklenmiyor' };
    }
    const bridge = this.bridgeResolver.resolve(this.platform, credentials);
    if (!bridge?.updatePrice) {
      return { success: false, message: 'Bridge fiyat güncellemeyi desteklemiyor' };
    }
    try {
      await bridge.updatePrice(sku, price);
      return { success: true, message: `Fiyat güncellendi: ${sku}` };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  supportedSyncTypes(): IntegrationSyncType[] {
    switch (this.category) {
      case IntegrationCategory.CARGO:
        return [
          IntegrationSyncType.SHIPMENTS,
          IntegrationSyncType.TRACKING,
          IntegrationSyncType.HEALTH_CHECK,
        ];
      case IntegrationCategory.INVOICE:
        return [IntegrationSyncType.INVOICES, IntegrationSyncType.HEALTH_CHECK];
      case IntegrationCategory.ERP:
        return [
          IntegrationSyncType.ERP_SYNC,
          IntegrationSyncType.INVOICES,
          IntegrationSyncType.INVENTORY,
        ];
      case IntegrationCategory.SOCIAL_FEED:
        return [IntegrationSyncType.FEED_SYNC, IntegrationSyncType.HEALTH_CHECK];
      case IntegrationCategory.FULFILLMENT:
        return [IntegrationSyncType.FULFILLMENT_SYNC, IntegrationSyncType.INVENTORY];
      default:
        return [
          IntegrationSyncType.PRODUCTS,
          IntegrationSyncType.ORDERS,
          IntegrationSyncType.STOCK_UPDATE,
          IntegrationSyncType.PRICE_UPDATE,
        ];
    }
  }
}

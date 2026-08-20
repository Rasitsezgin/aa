import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { IntegrationCategory } from '../enums/integration-category.enum';
import type { IIntegrationProvider } from '../interfaces/providers/base.provider';
import type { IMarketplaceProvider } from '../interfaces/providers/marketplace.provider';
import type { IEcommerceProvider } from '../interfaces/providers/ecommerce.provider';
import type { ICargoProvider } from '../interfaces/providers/cargo.provider';
import type { IInvoiceProvider } from '../interfaces/providers/invoice.provider';
import type { IErpProvider } from '../interfaces/providers/erp.provider';
import type { ISocialFeedProvider } from '../interfaces/providers/social-feed.provider';
import type { IGlobalMarketplaceProvider } from '../interfaces/providers/global-marketplace.provider';
import type { IFulfillmentProvider } from '../interfaces/providers/fulfillment.provider';
import { TrendyolAdapter } from '../adapters/marketplace/trendyol.adapter';
import { HepsiburadaAdapter } from '../adapters/marketplace/hepsiburada.adapter';
import { N11Adapter } from '../adapters/marketplace/n11.adapter';
import { AmazonTrAdapter } from '../adapters/marketplace/amazon-tr.adapter';
import { CiceksepetiAdapter } from '../adapters/marketplace/ciceksepeti.adapter';
import { PttAvmAdapter } from '../adapters/marketplace/pttavm.adapter';
import { EtsyAdapter } from '../adapters/marketplace/etsy.adapter';
import { AliexpressAdapter } from '../adapters/marketplace/aliexpress.adapter';
import { EbayAdapter } from '../adapters/marketplace/ebay.adapter';
import { ShopifyAdapter } from '../adapters/ecommerce/shopify.adapter';
import { IkasAdapter } from '../adapters/ecommerce/ikas.adapter';
import { YurticiKargoAdapter } from '../adapters/shipping/yurtici-kargo.adapter';
import { ArasKargoAdapter } from '../adapters/shipping/aras-kargo.adapter';
import { ParasutAdapter } from '../adapters/accounting/parasut.adapter';
import { UyumsoftAdapter } from '../adapters/invoice/uyumsoft.adapter';
import { LogoAdapter } from '../adapters/erp/logo.adapter';
import { GoogleMerchantAdapter } from '../adapters/social/google-merchant.adapter';
import { AmazonFbaAdapter } from '../adapters/fulfillment/amazon-fba.adapter';
import { IntegrationAdapterFactory } from '../factory/integration-adapter.factory';

/**
 * Abstract Factory + Registry — 90+ provider adapter yönetimi.
 * Özel adapter'lar + fabrika üretimi yapılandırılabilir adapter'lar.
 */
@Injectable()
export class IntegrationAdapterRegistry implements OnModuleInit {
  private readonly providers = new Map<string, IIntegrationProvider>();

  constructor(
    private readonly trendyolAdapter: TrendyolAdapter,
    private readonly hepsiburadaAdapter: HepsiburadaAdapter,
    private readonly n11Adapter: N11Adapter,
    private readonly amazonTrAdapter: AmazonTrAdapter,
    private readonly ciceksepetiAdapter: CiceksepetiAdapter,
    private readonly pttAvmAdapter: PttAvmAdapter,
    private readonly etsyAdapter: EtsyAdapter,
    private readonly aliexpressAdapter: AliexpressAdapter,
    private readonly ebayAdapter: EbayAdapter,
    private readonly shopifyAdapter: ShopifyAdapter,
    private readonly ikasAdapter: IkasAdapter,
    private readonly yurticiKargoAdapter: YurticiKargoAdapter,
    private readonly arasKargoAdapter: ArasKargoAdapter,
    private readonly parasutAdapter: ParasutAdapter,
    private readonly uyumsoftAdapter: UyumsoftAdapter,
    private readonly logoAdapter: LogoAdapter,
    private readonly googleMerchantAdapter: GoogleMerchantAdapter,
    private readonly amazonFbaAdapter: AmazonFbaAdapter,
    private readonly adapterFactory: IntegrationAdapterFactory,
  ) {
    [
      this.trendyolAdapter,
      this.hepsiburadaAdapter,
      this.n11Adapter,
      this.amazonTrAdapter,
      this.ciceksepetiAdapter,
      this.pttAvmAdapter,
      this.etsyAdapter,
      this.aliexpressAdapter,
      this.ebayAdapter,
      this.shopifyAdapter,
      this.ikasAdapter,
      this.yurticiKargoAdapter,
      this.arasKargoAdapter,
      this.parasutAdapter,
      this.uyumsoftAdapter,
      this.logoAdapter,
      this.googleMerchantAdapter,
      this.amazonFbaAdapter,
    ].forEach((a) => this.register(a));
  }

  onModuleInit(): void {
    for (const adapter of this.adapterFactory.createSupplementalAdapters()) {
      if (!this.providers.has(adapter.providerId)) {
        this.register(adapter);
      }
    }
  }

  private register(provider: IIntegrationProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  get(providerId: string): IIntegrationProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new NotFoundException(`Entegrasyon adapter bulunamadı: ${providerId}`);
    }
    return provider;
  }

  getMarketplace(providerId: string): IMarketplaceProvider {
    return this.assertCapability(providerId, 'syncProducts') as IMarketplaceProvider;
  }

  getEcommerce(providerId: string): IEcommerceProvider {
    return this.assertCapability(providerId, 'syncProducts') as IEcommerceProvider;
  }

  getCargo(providerId: string): ICargoProvider {
    return this.assertCapability(providerId, 'createShipment') as ICargoProvider;
  }

  getInvoice(providerId: string): IInvoiceProvider {
    return this.assertCapability(providerId, 'syncInvoices') as IInvoiceProvider;
  }

  getErp(providerId: string): IErpProvider {
    return this.assertCapability(providerId, 'syncCustomers') as IErpProvider;
  }

  getSocialFeed(providerId: string): ISocialFeedProvider {
    return this.assertCapability(providerId, 'syncProductFeed') as ISocialFeedProvider;
  }

  getGlobalMarketplace(providerId: string): IGlobalMarketplaceProvider {
    return this.assertCapability(providerId, 'syncListings') as IGlobalMarketplaceProvider;
  }

  getFulfillment(providerId: string): IFulfillmentProvider {
    return this.assertCapability(providerId, 'syncInventory') as IFulfillmentProvider;
  }

  private assertCapability(providerId: string, method: string): IIntegrationProvider {
    const provider = this.get(providerId);
    if (!(method in provider)) {
      throw new NotFoundException(`${providerId} bu capability'yi desteklemiyor: ${method}`);
    }
    return provider;
  }

  listByCategory(category: IntegrationCategory): IIntegrationProvider[] {
    return [...this.providers.values()].filter((p) => p.category === category);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  listRegistered(): string[] {
    return [...this.providers.keys()];
  }

  count(): number {
    return this.providers.size;
  }
}

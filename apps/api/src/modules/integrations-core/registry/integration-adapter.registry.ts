import { Injectable, NotFoundException } from '@nestjs/common';
import type { IntegrationCategory } from '../enums/integration-category.enum';
import type { IIntegrationProvider } from '../interfaces/integration-provider.interface';
import type { IMarketplaceProvider } from '../interfaces/integration-provider.interface';
import { TrendyolAdapter } from '../adapters/marketplace/trendyol.adapter';
import { HepsiburadaAdapter } from '../adapters/marketplace/hepsiburada.adapter';
import { N11Adapter } from '../adapters/marketplace/n11.adapter';
import { ShopifyAdapter } from '../adapters/ecommerce/shopify.adapter';
import { YurticiKargoAdapter } from '../adapters/shipping/yurtici-kargo.adapter';
import { ParasutAdapter } from '../adapters/accounting/parasut.adapter';

/**
 * Factory + Registry: providerId → adapter instance.
 * Yeni platform eklemek için sadece adapter yazıp buraya kaydetmek yeterli.
 */
@Injectable()
export class IntegrationAdapterRegistry {
  private readonly providers = new Map<string, IIntegrationProvider>();

  constructor(
    private readonly trendyolAdapter: TrendyolAdapter,
    private readonly hepsiburadaAdapter: HepsiburadaAdapter,
    private readonly n11Adapter: N11Adapter,
    private readonly shopifyAdapter: ShopifyAdapter,
    private readonly yurticiKargoAdapter: YurticiKargoAdapter,
    private readonly parasutAdapter: ParasutAdapter,
  ) {
    this.register(this.trendyolAdapter);
    this.register(this.hepsiburadaAdapter);
    this.register(this.n11Adapter);
    this.register(this.shopifyAdapter);
    this.register(this.yurticiKargoAdapter);
    this.register(this.parasutAdapter);
  }

  private register(provider: IIntegrationProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  get(providerId: string): IIntegrationProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new NotFoundException(
        `Entegrasyon adapter bulunamadı: ${providerId}`,
      );
    }
    return provider;
  }

  getMarketplace(providerId: string): IMarketplaceProvider {
    const provider = this.get(providerId);
    if (!('syncProducts' in provider)) {
      throw new NotFoundException(
        `${providerId} pazaryeri adapter'ı değil`,
      );
    }
    return provider as IMarketplaceProvider;
  }

  listByCategory(category: IntegrationCategory): IIntegrationProvider[] {
    return [...this.providers.values()].filter(
      (p) => p.category === category,
    );
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }
}

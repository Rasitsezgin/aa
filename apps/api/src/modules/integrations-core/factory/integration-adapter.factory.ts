import { Injectable } from '@nestjs/common';
import { OMNICHANNEL_CATALOG } from '../catalog/omnichannel-catalog';
import type { IIntegrationProvider } from '../interfaces/providers/base.provider';
import { MarketplaceBridgeResolver } from './marketplace-bridge.resolver';
import { ConfigurableProviderAdapter } from './configurable-provider.adapter';
import {
  DEDICATED_ADAPTER_IDS,
  PROVIDER_CARGO_BRIDGE_MAP,
  PROVIDER_INVOICE_INTEGRATOR_MAP,
  PROVIDER_PLATFORM_MAP,
} from './provider-platform.map';
import { IntegrationCategory } from '../enums/integration-category.enum';

/**
 * Abstract Factory — omnichannel katalogdaki tüm platformlar için adapter üretir.
 * Özel adapter'lar (Trendyol, Logo vb.) hariç tutulur; onlar registry'de ayrı kayıtlıdır.
 */
@Injectable()
export class IntegrationAdapterFactory {
  constructor(private readonly bridgeResolver: MarketplaceBridgeResolver) {}

  /** Katalogdaki tüm platformlar için yapılandırılabilir adapter'lar */
  createSupplementalAdapters(): IIntegrationProvider[] {
    const adapters: IIntegrationProvider[] = [];

    for (const meta of OMNICHANNEL_CATALOG) {
      if (DEDICATED_ADAPTER_IDS.has(meta.id)) {
        continue;
      }

      adapters.push(
        new ConfigurableProviderAdapter(meta, this.bridgeResolver, {
          platform: PROVIDER_PLATFORM_MAP[meta.id] ?? null,
          cargoKind: PROVIDER_CARGO_BRIDGE_MAP[meta.id] ?? null,
          invoiceIntegratorKey:
            meta.category === IntegrationCategory.INVOICE
              ? PROVIDER_INVOICE_INTEGRATOR_MAP[meta.id] ?? null
              : null,
        }),
      );
    }

    return adapters;
  }
}

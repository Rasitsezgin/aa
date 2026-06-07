import type { IMarketplaceProvider } from './marketplace.provider';

/**
 * E-ticaret altyapı sağlayıcıları — İkas, Ticimax, Shopify, WooCommerce vb.
 * Ürün/sipariş sync pazaryeri ile aynı sözleşmeyi paylaşır.
 */
export interface IEcommerceProvider extends IMarketplaceProvider {}

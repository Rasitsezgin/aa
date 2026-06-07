/**
 * Geriye dönük uyumluluk — tüm provider interface'leri providers/ altından export edilir.
 * Yeni kod doğrudan `./providers` import etmelidir.
 */
export type {
  IIntegrationProvider,
  IMarketplaceProvider,
  IEcommerceProvider,
  ICargoProvider,
  IShippingProvider,
  IInvoiceProvider,
  IAccountingProvider,
  ISocialFeedProvider,
  IGlobalMarketplaceProvider,
  IErpProvider,
  IFulfillmentProvider,
} from './providers';

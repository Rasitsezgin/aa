import { ServiceType } from '@pazaryonetimi/database';
import { IntegrationCategory } from '../enums/integration-category.enum';

/** Hub providerId → ServiceCredential.serviceType eşlemesi */
export const PROVIDER_SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  'yurtici-kargo': ServiceType.SHIPPING_YURTICI,
  'aras-kargo': ServiceType.SHIPPING_ARAS,
  'mng-kargo': ServiceType.SHIPPING_MNG,
  uyumsoft: ServiceType.EINVOICE_OTHER,
  parasut: ServiceType.EINVOICE_PARASUT,
  logo: ServiceType.EINVOICE_LOGO,
  'qnb-efinans': ServiceType.EINVOICE_EFINANS,
  bizimhesap: ServiceType.EINVOICE_OTHER,
  'google-merchant': ServiceType.EINVOICE_OTHER,
  'amazon-fba': ServiceType.SHIPPING_OTHER,
  ikas: ServiceType.EINVOICE_OTHER,
};

/** Kategori bazlı varsayılan ServiceType */
export function resolveServiceType(
  providerId: string,
  category: IntegrationCategory,
): ServiceType {
  if (PROVIDER_SERVICE_TYPE_MAP[providerId]) {
    return PROVIDER_SERVICE_TYPE_MAP[providerId];
  }
  switch (category) {
    case IntegrationCategory.CARGO:
      return ServiceType.SHIPPING_OTHER;
    case IntegrationCategory.INVOICE:
    case IntegrationCategory.ERP:
      return ServiceType.EINVOICE_OTHER;
    case IntegrationCategory.FULFILLMENT:
      return ServiceType.SHIPPING_OTHER;
    case IntegrationCategory.SOCIAL_FEED:
      return ServiceType.EINVOICE_OTHER;
    default:
      return ServiceType.EINVOICE_OTHER;
  }
}

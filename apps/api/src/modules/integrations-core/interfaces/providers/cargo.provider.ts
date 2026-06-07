import type { CargoShipmentDto } from '../../dto/cargo-shipment.dto';
import type { CargoTrackingDto } from '../../dto/cargo-tracking.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Kargo sistemleri — Yurtiçi, Aras, DHL, Hepsijet vb.
 * Tüm kargo API'leri standart CargoTrackingDTO'ya normalize edilir.
 */
export interface ICargoProvider extends IIntegrationProvider {
  createShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: CargoShipmentDto,
  ): Promise<{ success: boolean; trackingNumber?: string; message: string }>;

  trackShipment(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ): Promise<CargoTrackingDto>;

  cancelShipment?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    trackingNumber: string,
  ): Promise<{ success: boolean; message: string }>;

  syncShipments?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<CargoTrackingDto>>;
}

/** Geriye dönük uyumluluk */
export type IShippingProvider = ICargoProvider;

import type { FulfillmentInventoryDto, FulfillmentOrderDto } from '../../dto/fulfillment.dto';
import type { SyncResultDto } from '../../dto/sync-result.dto';
import type {
  DecryptedCredentials,
  TenantIntegrationContext,
} from '../integration-context.interface';
import type { IIntegrationProvider } from './base.provider';

/**
 * Fulfillment sağlayıcıları — Amazon FBA, Hepsilojistik, Parkpalet vb.
 */
export interface IFulfillmentProvider extends IIntegrationProvider {
  syncInventory(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<FulfillmentInventoryDto>>;

  syncFulfillmentOrders(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
  ): Promise<SyncResultDto<FulfillmentOrderDto>>;

  createInboundShipment?(
    ctx: TenantIntegrationContext,
    credentials: DecryptedCredentials,
    payload: Record<string, unknown>,
  ): Promise<{ success: boolean; shipmentId?: string; message: string }>;
}

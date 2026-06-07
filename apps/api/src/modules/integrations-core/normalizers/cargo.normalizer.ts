import type { CargoTrackingDto } from '../dto/cargo-tracking.dto';

/** Yurtiçi Kargo tracking yanıtını standart DTO'ya dönüştürür */
export function normalizeYurticiTracking(
  trackingNumber: string,
  raw: {
    status?: string;
    events?: Array<{
      date?: Date | string;
      status?: string;
      description?: string;
      location?: string;
    }>;
    estimatedDelivery?: Date | string;
  },
  tenantId: string,
  providerId = 'yurtici-kargo',
): CargoTrackingDto {
  const statusMap: Record<string, CargoTrackingDto['status']> = {
    'in-transit': 'in-transit',
    delivered: 'delivered',
    pending: 'pending',
    cancelled: 'cancelled',
  };

  return {
    tenantId,
    providerId,
    trackingNumber,
    carrier: 'Yurtiçi Kargo',
    status: statusMap[String(raw.status ?? 'unknown')] ?? 'unknown',
    estimatedDelivery: raw.estimatedDelivery
      ? new Date(raw.estimatedDelivery).toISOString()
      : undefined,
    events: (raw.events ?? []).map((e) => ({
      date: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
      status: String(e.status ?? ''),
      description: String(e.description ?? ''),
      location: e.location,
    })),
    raw: raw as Record<string, unknown>,
  };
}

/** Genel kargo tracking normalizer */
export function normalizeGenericTracking(
  trackingNumber: string,
  carrier: string,
  tenantId: string,
  providerId: string,
  raw: Record<string, unknown>,
): CargoTrackingDto {
  return {
    tenantId,
    providerId,
    trackingNumber,
    carrier,
    status: 'unknown',
    events: [],
    raw,
  };
}

/** Standart kargo takip modeli — tüm kargo API'leri buraya normalize edilir */
export interface CargoTrackingEventDto {
  date: string;
  status: string;
  description: string;
  location?: string;
}

export interface CargoTrackingDto {
  tenantId: string;
  providerId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'returned' | 'cancelled' | 'unknown';
  estimatedDelivery?: string;
  events: CargoTrackingEventDto[];
  raw?: Record<string, unknown>;
}

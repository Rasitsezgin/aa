export interface ShipmentRequest {
  senderAddress: AddressInfo;
  receiverAddress: AddressInfo;
  weight: number; // kg
  dimensions?: { length: number; width: number; height: number }; // cm
  description?: string;
  orderValue?: number;
  isCod?: boolean; // Kapıda ödeme
  codAmount?: number;
}

export interface AddressInfo {
  name: string;
  fullName?: string;
  phone: string;
  address: string;
  addressLine?: string;
  city: string;
  district: string;
  postalCode?: string;
  email?: string;
}

export interface ShipmentResponse {
  trackingNumber: string;
  barcode?: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
}

export interface TrackingEvent {
  date: Date;
  status: string;
  location?: string;
  description: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status:
    | 'preparing'
    | 'shipped'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'returned'
    | 'exception';
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

export interface ShippingRate {
  carrier: string;
  serviceName: string;
  cost: number;
  currency: string;
  estimatedDays: number;
}

export interface CarrierBridge {
  readonly carrierName: string;

  /** Kargo gönderisi oluştur */
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;

  /** Kargo takibi sorgula */
  trackShipment(trackingNumber: string): Promise<TrackingResult>;

  /** Ücret hesapla */
  calculateRate(request: ShipmentRequest): Promise<ShippingRate>;

  /** Kargo iptal et */
  cancelShipment(trackingNumber: string): Promise<boolean>;
}

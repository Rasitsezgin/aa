/** Kargo gönderi oluşturma isteği — tenant-scoped */
export interface CargoAddressDto {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  email?: string;
}

export interface CargoShipmentDto {
  tenantId: string;
  orderId?: string;
  orderNumber?: string;
  sender: CargoAddressDto;
  receiver: CargoAddressDto;
  weightKg: number;
  dimensions?: { lengthCm: number; widthCm: number; heightCm: number };
  description?: string;
  isCod?: boolean;
  codAmount?: number;
  packageCount?: number;
}

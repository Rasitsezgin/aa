import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  unit: string; // "ADET", "KG", "LT", "MT", "KUTU", "PAKET"

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  taxRate: number; // KDV oranı: 0, 1, 10, 20

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class InvoiceBuyerDto {
  @IsString()
  title: string; // Firma adı veya ad soyad

  @IsString()
  taxNumber: string; // VKN veya TCKN

  @IsOptional()
  @IsString()
  taxOffice?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateEInvoiceDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  type?: string; // SATIS, IADE, ISTISNA, OZELMATRAH

  @IsOptional()
  @IsString()
  scenario?: string; // TEMEL, TICARI

  @ValidateNested()
  @Type(() => InvoiceBuyerDto)
  buyer: InvoiceBuyerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelEInvoiceDto {
  @IsString()
  reason: string;
}

export class QueryEInvoiceDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

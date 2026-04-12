import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsEnum,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class DimensionsDto {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;
}

export class CreateShipmentDto {
  @IsString()
  orderId: string;

  @IsString()
  carrier: string; // "Aras" | "Yurtiçi" | "MNG" | "PTT"

  @ValidateNested()
  @Type(() => AddressDto)
  senderAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  receiverAddress: AddressDto;

  @IsNumber()
  @Min(0.1)
  weight: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCod?: boolean;

  @IsOptional()
  @IsNumber()
  codAmount?: number;
}

export class CalculateRateDto {
  @IsString()
  city: string;

  @IsNumber()
  @Min(0.1)
  weight: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsString()
  carrier?: string; // Belirli bir taşıyıcı için, boş bırakılırsa hepsi döner
}

export class BulkCreateShipmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentDto)
  shipments: CreateShipmentDto[];
}

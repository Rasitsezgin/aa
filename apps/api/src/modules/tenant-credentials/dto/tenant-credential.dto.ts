import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ServiceType } from '@pazaryonetimi/database';

export class CreateServiceCredentialDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  apiExtra?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateServiceCredentialDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  apiUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  apiExtra?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentCardDto {
  @IsString()
  cardHolderName: string;

  @IsString()
  cardNumber: string;

  @IsString()
  expireMonth: string;

  @IsString()
  expireYear: string;

  @IsString()
  cvc: string;
}

export class PaymentBuyerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  identityNumber: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  ip?: string;
}

export class PaymentAddressDto {
  @IsString()
  contactName: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class PaymentItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string; // TRY default

  @IsOptional()
  @IsNumber()
  installment?: number;

  @ValidateNested()
  @Type(() => PaymentCardDto)
  card: PaymentCardDto;

  @ValidateNested()
  @Type(() => PaymentBuyerDto)
  buyer: PaymentBuyerDto;

  @ValidateNested()
  @Type(() => PaymentAddressDto)
  shippingAddress: PaymentAddressDto;

  @ValidateNested()
  @Type(() => PaymentAddressDto)
  billingAddress: PaymentAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];
}

export class Create3DPaymentDto extends CreatePaymentDto {
  @IsString()
  callbackUrl: string;
}

export class RefundPaymentDto {
  @IsString()
  paymentTransactionId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckInstallmentDto {
  @IsString()
  binNumber: string; // Kartın ilk 6 hanesi

  @IsNumber()
  @Min(0.01)
  amount: number;
}

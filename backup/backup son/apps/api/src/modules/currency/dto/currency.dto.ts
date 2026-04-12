import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  from: string; // "USD", "EUR", "GBP", "TRY"

  @IsString()
  to: string;
}

export class SetExchangeRateDto {
  @IsString()
  baseCurrency: string;

  @IsString()
  targetCurrency: string;

  @IsNumber()
  @Min(0.0001)
  rate: number;

  @IsOptional()
  @IsString()
  source?: string;
}

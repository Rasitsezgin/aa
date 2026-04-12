import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto, SetExchangeRateDto } from './dto/currency.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  /** Güncel kurlar (public) */
  @Public()
  @Get('rates')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  getLatestRates(@Query('base') base?: string) {
    return this.currencyService.getLatestRates(base || 'TRY');
  }

  /** Döviz çevirme (public) */
  @Public()
  @Post('convert')
  convert(@Body() dto: ConvertCurrencyDto) {
    return this.currencyService.convert(dto);
  }

  /** Kur geçmişi */
  @Get('history')
  getRateHistory(
    @Query('base') base: string,
    @Query('target') target: string,
    @Query('days') days?: string,
  ) {
    return this.currencyService.getRateHistory(
      base,
      target,
      days ? parseInt(days, 10) : 30,
    );
  }

  /** Manuel kur girişi (admin) */
  @Post('rates')
  setRate(@Body() dto: SetExchangeRateDto) {
    return this.currencyService.setRate(dto);
  }

  /** TCMB kurlarını çek */
  @Post('fetch-tcmb')
  fetchTCMB() {
    return this.currencyService.fetchRatesFromTCMB();
  }
}

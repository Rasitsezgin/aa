import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConvertCurrencyDto, SetExchangeRateDto } from './dto/currency.dto';

const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  // In-memory cache for fast lookups
  private rateCache = new Map<string, { rate: number; updatedAt: Date }>();

  constructor(private readonly prisma: PrismaService) {
    this.loadLatestRates().catch(() => {
      this.logger.warn(
        'Başlangıç kurları yüklenemedi, varsayılan kurlar kullanılacak',
      );
    });
  }

  /** Döviz çevirme */
  async convert(dto: ConvertCurrencyDto): Promise<{
    amount: number;
    rate: number;
    from: string;
    to: string;
    result: number;
    date: Date;
  }> {
    if (dto.from === dto.to) {
      return {
        amount: dto.amount,
        rate: 1,
        from: dto.from,
        to: dto.to,
        result: dto.amount,
        date: new Date(),
      };
    }

    const rate = await this.getRate(dto.from, dto.to);
    const result = Math.round(dto.amount * rate * 100) / 100;

    return {
      amount: dto.amount,
      rate,
      from: dto.from,
      to: dto.to,
      result,
      date: new Date(),
    };
  }

  /** İki para birimi arasındaki güncel kuru getir */
  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    // Önce cache'e bak
    const cacheKey = `${from}_${to}`;
    const cached = this.rateCache.get(cacheKey);
    if (cached && Date.now() - cached.updatedAt.getTime() < 3600000) {
      // 1 saat
      return cached.rate;
    }

    // DB'den al
    const dbRate = await this.prisma.exchangeRate.findFirst({
      where: { baseCurrency: from, targetCurrency: to },
      orderBy: { date: 'desc' },
    });

    if (dbRate) {
      const rate = Number(dbRate.rate);
      this.rateCache.set(cacheKey, { rate, updatedAt: new Date() });
      return rate;
    }

    // Ters kur dene
    const reverseRate = await this.prisma.exchangeRate.findFirst({
      where: { baseCurrency: to, targetCurrency: from },
      orderBy: { date: 'desc' },
    });

    if (reverseRate) {
      const rate = 1 / Number(reverseRate.rate);
      this.rateCache.set(cacheKey, { rate, updatedAt: new Date() });
      return rate;
    }

    // TRY üzerinden cross-rate dene
    if (from !== 'TRY' && to !== 'TRY') {
      const fromToTry = await this.getRate(from, 'TRY');
      const toToTry = await this.getRate(to, 'TRY');
      if (fromToTry && toToTry) {
        return fromToTry / toToTry;
      }
    }

    // Varsayılan kurlar (fallback)
    const fallbackRates: Record<string, number> = {
      USD_TRY: 38.5,
      EUR_TRY: 40.8,
      GBP_TRY: 48.5,
    };

    const fallbackRate = fallbackRates[cacheKey];
    if (fallbackRate) {
      this.logger.warn(
        `Kur bulunamadı: ${from}→${to}, varsayılan kullanılıyor: ${fallbackRate}`,
      );
      return fallbackRate;
    }

    const reverseFallback = fallbackRates[`${to}_${from}`];
    if (reverseFallback) {
      return 1 / reverseFallback;
    }

    throw new BadRequestException(`Kur bulunamadı: ${from} → ${to}`);
  }

  /** Manuel kur girişi */
  async setRate(dto: SetExchangeRateDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rate = await this.prisma.exchangeRate.upsert({
      where: {
        baseCurrency_targetCurrency_date: {
          baseCurrency: dto.baseCurrency,
          targetCurrency: dto.targetCurrency,
          date: today,
        },
      },
      update: { rate: dto.rate, source: dto.source || 'manual' },
      create: {
        baseCurrency: dto.baseCurrency,
        targetCurrency: dto.targetCurrency,
        rate: dto.rate,
        source: dto.source || 'manual',
        date: today,
      },
    });

    // Cache güncelle
    const cacheKey = `${dto.baseCurrency}_${dto.targetCurrency}`;
    this.rateCache.set(cacheKey, { rate: dto.rate, updatedAt: new Date() });

    this.logger.log(
      `Kur güncellendi: ${dto.baseCurrency}/${dto.targetCurrency} = ${dto.rate}`,
    );
    return rate;
  }

  /** Tüm güncel kurları getir */
  async getLatestRates(baseCurrency: string = 'TRY') {
    const rates: { currency: string; rate: number; baseCurrency: string }[] =
      [];

    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency === baseCurrency) continue;

      try {
        const rate = await this.getRate(currency, baseCurrency);
        rates.push({
          currency,
          rate,
          baseCurrency,
        });
      } catch {
        // Bu para birimi için kur yok, atla
      }
    }

    return { baseCurrency, rates, date: new Date() };
  }

  /** Kur geçmişi */
  async getRateHistory(
    baseCurrency: string,
    targetCurrency: string,
    days: number = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        targetCurrency,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  /** TCMB'den kurları çek (her gün 15:30'da) */
  // @Cron('30 15 * * 1-5') // Hafta içi her gün 15:30
  async fetchRatesFromTCMB() {
    this.logger.log('TCMB kurları çekiliyor...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rates: { base: string; target: string; rate: number }[] = [];

    try {
      const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
      if (!response.ok) throw new Error(`TCMB HTTP ${response.status}`);
      const xml = await response.text();

      // Parse USD, EUR, GBP from TCMB XML
      const currencyMap: Record<string, string> = {
        'US DOLLAR': 'USD',
        EURO: 'EUR',
        'POUND STERLING': 'GBP',
      };
      const currencyRegex =
        /<Currency[^>]*CurrencyCode="(\w+)"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>[\s\S]*?<ForexSelling>([\d.]+)<\/ForexSelling>[\s\S]*?<\/Currency>/g;

      let match: RegExpExecArray | null;
      while ((match = currencyRegex.exec(xml)) !== null) {
        const code = match[1];
        if (['USD', 'EUR', 'GBP'].includes(code)) {
          const buying = parseFloat(match[2]);
          const selling = parseFloat(match[3]);
          const midRate = Math.round(((buying + selling) / 2) * 10000) / 10000;
          if (!isNaN(midRate) && midRate > 0) {
            rates.push({ base: code, target: 'TRY', rate: midRate });
          }
        }
      }

      if (rates.length === 0) {
        this.logger.warn('TCMB XML parse edildi ancak kur verisi bulunamadı');
      }
    } catch (error) {
      this.logger.error(`TCMB API hatası: ${(error as Error).message}`);
      this.logger.warn('TCMB kurları çekilemedi, mevcut kurlar korunuyor');
      return { success: false, error: (error as Error).message };
    }

    for (const r of rates) {
      await this.prisma.exchangeRate.upsert({
        where: {
          baseCurrency_targetCurrency_date: {
            baseCurrency: r.base,
            targetCurrency: r.target,
            date: today,
          },
        },
        update: { rate: r.rate, source: 'TCMB' },
        create: {
          baseCurrency: r.base,
          targetCurrency: r.target,
          rate: r.rate,
          source: 'TCMB',
          date: today,
        },
      });
    }

    // Cache'i güncelle
    await this.loadLatestRates();

    this.logger.log(
      `TCMB kurları güncellendi: ${rates.map((r) => `${r.base}/${r.target}=${r.rate}`).join(', ')}`,
    );
    return { success: true, rates };
  }

  /** Cache'e en güncel kurları yükle */
  private async loadLatestRates() {
    for (const base of SUPPORTED_CURRENCIES) {
      for (const target of SUPPORTED_CURRENCIES) {
        if (base === target) continue;
        const rate = await this.prisma.exchangeRate.findFirst({
          where: { baseCurrency: base, targetCurrency: target },
          orderBy: { date: 'desc' },
        });
        if (rate) {
          this.rateCache.set(`${base}_${target}`, {
            rate: Number(rate.rate),
            updatedAt: rate.createdAt,
          });
        }
      }
    }
  }
}

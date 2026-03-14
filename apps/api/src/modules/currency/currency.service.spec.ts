import { CurrencyService } from './currency.service';
import { BadRequestException } from '@nestjs/common';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      exchangeRate: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn(),
      },
    };

    service = new CurrencyService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convert', () => {
    it('should return same amount for same currency', async () => {
      const result = await service.convert({ from: 'TRY', to: 'TRY', amount: 100 });
      expect(result.rate).toBe(1);
      expect(result.result).toBe(100);
    });

    it('should convert using fallback rates when DB is empty', async () => {
      mockPrisma.exchangeRate.findFirst.mockResolvedValue(null);
      const result = await service.convert({ from: 'USD', to: 'TRY', amount: 10 });
      expect(result.rate).toBe(38.50);
      expect(result.result).toBe(385);
    });

    it('should convert using DB rate', async () => {
      mockPrisma.exchangeRate.findFirst.mockResolvedValueOnce({ rate: 39.00, createdAt: new Date() });
      const result = await service.convert({ from: 'USD', to: 'TRY', amount: 5 });
      expect(result.rate).toBe(39);
      expect(result.result).toBe(195);
    });
  });

  describe('getRate', () => {
    it('should return 1 for same currency', async () => {
      const rate = await service.getRate('EUR', 'EUR');
      expect(rate).toBe(1);
    });

    it('should throw for unsupported pair without fallback', async () => {
      mockPrisma.exchangeRate.findFirst.mockResolvedValue(null);
      await expect(service.getRate('JPY', 'CHF')).rejects.toThrow(BadRequestException);
    });

    it('should use reverse rate if direct not found', async () => {
      mockPrisma.exchangeRate.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ rate: 38.50, createdAt: new Date() });
      const rate = await service.getRate('TRY', 'USD');
      expect(rate).toBeCloseTo(1 / 38.50, 5);
    });
  });

  describe('setRate', () => {
    it('should upsert exchange rate and update cache', async () => {
      mockPrisma.exchangeRate.upsert.mockResolvedValue({ baseCurrency: 'USD', targetCurrency: 'TRY', rate: 39.00 });
      const result = await service.setRate({ baseCurrency: 'USD', targetCurrency: 'TRY', rate: 39.00 });
      expect(mockPrisma.exchangeRate.upsert).toHaveBeenCalled();
      expect(result.rate).toBe(39.00);
    });
  });

  describe('getLatestRates', () => {
    it('should return rates for all supported currencies', async () => {
      const result = await service.getLatestRates('TRY');
      expect(result.baseCurrency).toBe('TRY');
      expect(result.rates.length).toBeGreaterThan(0);
      expect(result.date).toBeInstanceOf(Date);
    });
  });

  describe('getRateHistory', () => {
    it('should query rate history with date filter', async () => {
      mockPrisma.exchangeRate.findMany.mockResolvedValue([
        { rate: 38.00, date: new Date('2025-01-01') },
        { rate: 38.50, date: new Date('2025-01-02') },
      ]);
      const result = await service.getRateHistory('USD', 'TRY', 7);
      expect(result).toHaveLength(2);
      expect(mockPrisma.exchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ baseCurrency: 'USD', targetCurrency: 'TRY' }),
          orderBy: { date: 'asc' },
        }),
      );
    });
  });

  describe('fetchRatesFromTCMB', () => {
    it('should upsert simulated TCMB rates', async () => {
      mockPrisma.exchangeRate.upsert.mockResolvedValue({});
      const result = await service.fetchRatesFromTCMB();
      expect(result.success).toBe(true);
      expect(result.rates).toHaveLength(3);
      expect(mockPrisma.exchangeRate.upsert).toHaveBeenCalledTimes(3);
    });
  });
});

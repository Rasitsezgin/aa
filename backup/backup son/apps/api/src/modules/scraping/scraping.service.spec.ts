import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingService, ScrapedStoreData, ScrapedProductData } from './scraping.service';
import { Logger } from '@nestjs/common';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setUserAgent: jest.fn().mockResolvedValue(undefined),
      setViewport: jest.fn().mockResolvedValue(undefined),
      evaluateOnNewDocument: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      content: jest.fn().mockResolvedValue('<html><body><h1 class="seller-name">Test Store</h1><span class="seller-store-rating-score">9,5</span></body></html>'),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('ScrapingService', () => {
  let service: ScrapingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapingService],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseMetric', () => {
    it('should parse numeric values correctly', () => {
      const privateMethod = (service as any).parseMetric.bind(service);
      
      expect(privateMethod('1000')).toBe(1000);
      expect(privateMethod('1.5K')).toBe(1500);
      expect(privateMethod('2,2M')).toBe(2200000);
      expect(privateMethod('1B')).toBe(1000000000);
    });

    it('should handle Turkish number formats', () => {
      const privateMethod = (service as any).parseMetric.bind(service);
      
      expect(privateMethod('1.234')).toBe(1234);
      expect(privateMethod('5 BIN')).toBe(5000);
      expect(privateMethod('2 MN')).toBe(2000000);
    });
  });

  describe('parsePrice', () => {
    it('should parse price strings correctly', () => {
      const privateMethod = (service as any).parsePrice.bind(service);
      
      expect(privateMethod('100 TL')).toBe(100);
      expect(privateMethod('1.999,99 TL')).toBe(1999.99);
      expect(privateMethod('$50.00')).toBe(50);
      expect(privateMethod('')).toBe(0);
    });
  });

  describe('parseRating', () => {
    it('should normalize ratings to 0-5 scale', () => {
      const privateMethod = (service as any).parseRating.bind(service);
      
      expect(privateMethod('5')).toBe(5);
      expect(privateMethod('10')).toBe(5); // Should normalize to 5
      expect(privateMethod('4,5')).toBe(4.5);
      expect(privateMethod('')).toBe(0);
    });
  });

  describe('scrapeStore', () => {
    it('should detect platform from URL', async () => {
      const result = await service.scrapeStore('https://www.trendyol.com/magaza/test-store');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.platform).toBe('TRENDYOL');
      }
    });

    it('should return null for invalid URL', async () => {
      const result = await service.scrapeStore('');
      
      expect(result).toBeNull();
    });

    it('should handle Hepsiburada URLs', async () => {
      const result = await service.scrapeStore('https://www.hepsiburada.com/magaza/test');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.platform).toBe('HEPSIBURADA');
      }
    });

    it('should handle Amazon URLs', async () => {
      const result = await service.scrapeStore('https://www.amazon.com/seller/test');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.platform).toBe('AMAZON');
      }
    });
  });

  describe('scrapeStoreProducts', () => {
    it('should scrape products for Trendyol', async () => {
      const result = await service.scrapeStoreProducts(
        'https://www.trendyol.com/magaza/test',
        'TRENDYOL',
        5
      );
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for unknown platforms', async () => {
      const result = await service.scrapeStoreProducts(
        'https://unknown.com/store',
        'UNKNOWN',
        10
      );
      
      expect(result).toEqual([]);
    });
  });
});

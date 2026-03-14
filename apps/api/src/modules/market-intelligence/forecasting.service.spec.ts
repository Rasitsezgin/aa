import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingService } from './forecasting.service';
import { PrismaService } from '../../database/prisma.service';

describe('ForecastingService', () => {
  let service: ForecastingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      orderItem: {
        findMany: jest.fn(),
      },
      priceHistory: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      salesForecast: {
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ForecastingService>(ForecastingService);
  });

  describe('generateProductForecast', () => {
    it('should return null if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      const result = await service.generateProductForecast('p1');
      expect(result).toBeNull();
    });

    it('should return forecast with no historical data', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', title: 'Test', price: 100, stock: 50, tenantId: 't1',
      });
      prisma.orderItem.findMany.mockResolvedValue([]);

      const result = await service.generateProductForecast('p1');
      expect(result).toBeDefined();
      expect(result!.productId).toBe('p1');
      expect(result!.forecasts).toBeDefined();
      expect(Array.isArray(result!.forecasts)).toBe(true);
    });

    it('should generate forecast from historical orders', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', title: 'Test', price: 100, stock: 20, tenantId: 't1',
      });

      const orderItems: { quantity: number; unitPrice: number; order: { createdAt: Date } }[] = [];
      for (let d = 0; d < 30; d++) {
        const date = new Date(Date.now() - d * 86400000);
        orderItems.push({
          quantity: 2 + Math.floor(d % 3),
          unitPrice: 100,
          order: { createdAt: date },
        });
      }
      prisma.orderItem.findMany.mockResolvedValue(orderItems);

      const result = await service.generateProductForecast('p1');
      expect(result!.avgDailySales).toBeGreaterThan(0);
      expect(result!.totalHistoricalSales).toBeGreaterThan(0);
      expect(result!.forecasts.length).toBeGreaterThan(0);
    });

    it('should detect stock warning when stock is low', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', title: 'Test', price: 100, stock: 3, tenantId: 't1',
      });

      const orderItems: { quantity: number; unitPrice: number; order: { createdAt: Date } }[] = [];
      for (let d = 0; d < 14; d++) {
        const date = new Date(Date.now() - d * 86400000);
        orderItems.push({
          quantity: 5,
          unitPrice: 100,
          order: { createdAt: date },
        });
      }
      prisma.orderItem.findMany.mockResolvedValue(orderItems);

      const result = await service.generateProductForecast('p1');
      // stock(3) < avgDailySales * 7 → should produce a warning string
      expect(result!.stockWarning).toBeTruthy();
    });
  });
});

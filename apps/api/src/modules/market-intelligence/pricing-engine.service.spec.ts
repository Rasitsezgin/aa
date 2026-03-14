import { Test, TestingModule } from '@nestjs/testing';
import { PricingEngineService, PricingResult } from './pricing-engine.service';
import { PrismaService } from '../../database/prisma.service';

describe('PricingEngineService', () => {
  let service: PricingEngineService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      pricingRule: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      competitorProduct: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingEngineService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PricingEngineService>(PricingEngineService);
  });

  describe('calculateOptimalPrice', () => {
    it('should return pricing result when no rules exist', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', price: 100, costPrice: 50, stock: 10, tenantId: 't1', category: 'test',
      });
      prisma.competitorProduct.findMany.mockResolvedValue([
        { currentPrice: 90 },
        { currentPrice: 110 },
      ]);

      const result = await service.calculateOptimalPrice('p1', '', {});
      expect(result).toBeDefined();
      expect(result!.currentPrice).toBe(100);
      expect(result!.suggestedPrice).toBeGreaterThan(0);
      expect(result!.confidence).toBeGreaterThan(0);
      expect(result!.confidence).toBeLessThanOrEqual(100);
      expect(result!.competitorSummary).toBeDefined();
    });

    it('should enforce cost floor (minimum margin)', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'p1', price: 100, costPrice: 95, stock: 10, tenantId: 't1', category: 'test',
      });
      prisma.competitorProduct.findMany.mockResolvedValue([
        { currentPrice: 80 },
      ]);

      const result = await service.calculateOptimalPrice('p1', '', {});
      // Cost floor: 95 * 1.03 = 97.85
      expect(result!.suggestedPrice).toBeGreaterThanOrEqual(95 * 1.03 - 0.01);
    });

    it('should return null for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      const result = await service.calculateOptimalPrice('nonexistent', '', {});
      expect(result).toBeNull();
    });
  });

  describe('getRules', () => {
    it('should return rules for tenant', async () => {
      prisma.pricingRule.findMany.mockResolvedValue([
        { id: 'r1', name: 'Test Rule', tenantId: 't1' },
      ]);

      const rules = await service.getRules('t1');
      expect(rules).toHaveLength(1);
      expect(prisma.pricingRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
    });
  });

  describe('createRule', () => {
    it('should create a pricing rule', async () => {
      prisma.pricingRule.create.mockResolvedValue({
        id: 'r1', name: 'New Rule', tenantId: 't1',
      });

      const rule = await service.createRule('t1', {
        name: 'New Rule',
        type: 'percentage',
        action: { type: 'percentage', value: -5 },
        priority: 1,
      });

      expect(rule.name).toBe('New Rule');
      expect(prisma.pricingRule.create).toHaveBeenCalled();
    });
  });

  describe('deleteRule', () => {
    it('should delete a pricing rule', async () => {
      prisma.pricingRule.findFirst.mockResolvedValue({ id: 'r1', tenantId: 't1' });
      prisma.pricingRule.delete.mockResolvedValue({ id: 'r1' });
      const result = await service.deleteRule('r1', 't1');
      expect(result.success).toBe(true);
      expect(prisma.pricingRule.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
    });
  });
});

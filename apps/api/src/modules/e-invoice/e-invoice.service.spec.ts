import { EInvoiceService } from './e-invoice.service';
import { BadRequestException } from '@nestjs/common';

describe('EInvoiceService', () => {
  let service: EInvoiceService;
  let mockPrisma: any;
  let mockConfig: any;

  beforeEach(async () => {
    mockPrisma = {
      order: { findFirst: jest.fn(), update: jest.fn() },
      invoice: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    mockConfig = {
      get: jest.fn((key: string, defaultValue?: string) => defaultValue || ''),
    };

    service = new EInvoiceService(mockPrisma, mockConfig);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should throw if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      await expect(
        service.createInvoice('tenant1', {
          orderId: 'non-existent',
          buyer: { title: 'Firma', taxNumber: '1234567890', address: 'A', city: 'Ist' },
          items: [{ name: 'Urun', quantity: 1, unit: 'ADET', unitPrice: 100, taxRate: 20 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an e-invoice with correct totals', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order1', tenantId: 'tenant1', items: [] });
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv1', invoiceNumber: 'PYN2026000000001' });

      const result = await service.createInvoice('tenant1', {
        orderId: 'order1',
        buyer: { title: 'Acme Ltd', taxNumber: '1234567890', taxOffice: 'Kadikoy', address: 'Test', city: 'Istanbul' },
        items: [
          { name: 'Laptop', quantity: 1, unit: 'ADET', unitPrice: 5000, taxRate: 20 },
          { name: 'Mouse', quantity: 2, unit: 'ADET', unitPrice: 200, taxRate: 20 },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.invoiceNumber).toBeDefined();
      expect(result.gibInvoiceId).toBeDefined();
      expect(result.status).toBe('SENT');
      expect(result.totalAmount).toBe(6480);
    });
  });

  describe('cancelInvoice', () => {
    it('should throw if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      await expect(
        service.cancelInvoice('tenant1', 'non-existent', { reason: 'Hata' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if already cancelled', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'CANCELLED' });
      await expect(
        service.cancelInvoice('tenant1', 'inv1', { reason: 'Tekrar' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cancel invoice successfully', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv1', status: 'SENT', invoiceNumber: 'PYN123' });
      mockPrisma.invoice.update.mockResolvedValue({});

      const result = await service.cancelInvoice('tenant1', 'inv1', { reason: 'test' });
      expect(result.success).toBe(true);
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CANCELLED' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv1' }]);
      mockPrisma.invoice.count.mockResolvedValue(1);

      const result = await service.findAll('tenant1');
      expect(result.invoices).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return invoice statistics', async () => {
      mockPrisma.invoice.count.mockResolvedValue(15);
      mockPrisma.invoice.groupBy.mockResolvedValue([]);
      mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 50000, taxAmount: 9000 } });

      const result = await service.getStats('tenant1');
      expect(result.total).toBe(15);
      expect(result.totals.amount).toBe(50000);
      expect(result.totals.tax).toBe(9000);
    });
  });
});
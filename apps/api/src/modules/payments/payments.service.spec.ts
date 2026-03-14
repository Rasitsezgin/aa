import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPrisma: any;
  let mockTenantCredentials: any;

  beforeEach(async () => {
    mockPrisma = {
      order: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    mockTenantCredentials = {
      getDecryptedCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        apiUrl: 'https://sandbox-api.iyzipay.com',
        apiExtra: {},
      }),
    };

    service = new PaymentsService(mockPrisma, mockTenantCredentials);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should throw if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.createPayment('tenant1', {
          orderId: 'non-existent',
          amount: 100,
          card: { cardHolderName: 'Test', cardNumber: '4111111111111111', expireMonth: '12', expireYear: '2030', cvc: '123' },
          buyer: { id: 'b1', name: 'Test', surname: 'User', email: 't@t.com', phone: '555', identityNumber: '11111111111', address: 'A', city: 'İst' },
          shippingAddress: { contactName: 'Test', city: 'İst', address: 'A' },
          billingAddress: { contactName: 'Test', city: 'İst', address: 'B' },
          items: [{ id: 'p1', name: 'Ürün', category: 'Genel', price: 100 }],
        }),
      ).rejects.toThrow('Sipariş bulunamadı');
    });

    it('should create payment and update order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order1', tenantId: 'tenant1', items: [] });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay1', transactionId: 'IYZ123' });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await service.createPayment('tenant1', {
        orderId: 'order1',
        amount: 250,
        card: { cardHolderName: 'Test', cardNumber: '4111111111111111', expireMonth: '12', expireYear: '2030', cvc: '123' },
        buyer: { id: 'b1', name: 'Test', surname: 'User', email: 't@t.com', phone: '555', identityNumber: '11111111111', address: 'A', city: 'İst' },
        shippingAddress: { contactName: 'Test', city: 'İst', address: 'A' },
        billingAddress: { contactName: 'Test', city: 'İst', address: 'B' },
        items: [{ id: 'p1', name: 'Ürün', category: 'Genel', price: 250 }],
      });

      expect(result.success).toBe(true);
      expect(result.amount).toBe(250);
      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order1' },
          data: { paymentStatus: 'PAID' },
        }),
      );
    });
  });

  describe('refundPayment', () => {
    it('should throw if payment not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.refundPayment('tenant1', { paymentTransactionId: 'non-existent', amount: 50 }),
      ).rejects.toThrow('Ödeme işlemi bulunamadı');
    });

    it('should throw if already refunded', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay1', status: 'refunded' });

      await expect(
        service.refundPayment('tenant1', { paymentTransactionId: 'IYZ123', amount: 50 }),
      ).rejects.toThrow('Bu ödeme zaten iade edilmiş');
    });

    it('should process full refund', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pay1',
        status: 'completed',
        amount: 100,
        orderId: 'order1',
        currency: 'TRY',
        paymentMethod: 'credit-card',
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'ref1' });
      mockPrisma.payment.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({});

      const result = await service.refundPayment('tenant1', {
        paymentTransactionId: 'IYZ123',
        amount: 100,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('full_refund');
    });
  });

  describe('checkInstallments', () => {
    it('should return installment options', async () => {
      const result = await service.checkInstallments({ binNumber: '411111', amount: 1000 });

      expect(result.installmentOptions).toBeInstanceOf(Array);
      expect(result.installmentOptions.length).toBeGreaterThan(0);
      expect(result.installmentOptions[0].installmentNumber).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return paginated payments', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([{ id: 'pay1' }]);
      mockPrisma.payment.count.mockResolvedValue(1);

      const result = await service.findAll('tenant1');

      expect(result.payments).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return payment statistics', async () => {
      mockPrisma.payment.count.mockResolvedValue(10);
      mockPrisma.payment.groupBy.mockResolvedValue([]);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 5000, netAmount: 4875, commission: 125 } });

      const result = await service.getStats('tenant1');

      expect(result.total).toBe(10);
      expect(result.revenue.totalAmount).toBe(5000);
    });
  });
});

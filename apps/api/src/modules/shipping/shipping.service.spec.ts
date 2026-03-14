import { ShippingService } from './shipping.service';
import { BadRequestException } from '@nestjs/common';

describe('ShippingService', () => {
  let service: ShippingService;
  let mockPrisma: any;
  let mockTenantCredentials: any;

  beforeEach(async () => {
    mockPrisma = {
      order: { findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      shipment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    mockTenantCredentials = {
      getDecryptedCredentials: jest.fn().mockResolvedValue(null),
      getActiveServiceTypes: jest.fn().mockResolvedValue([]),
    };

    service = new ShippingService(mockPrisma, mockTenantCredentials);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRates', () => {
    it('should return rates from all carriers sorted by cost', async () => {
      const result = await service.calculateRates('t1', { weight: 5, city: 'Ankara' });
      expect(result.length).toBe(4);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].cost).toBeGreaterThanOrEqual(result[i - 1].cost);
      }
    });

    it('should return rate for specific carrier', async () => {
      const result = await service.calculateRates('t1', { weight: 3, city: 'Izmir', carrier: 'Aras' });
      expect(result).toHaveLength(1);
      expect(result[0].carrier).toBe('Aras');
    });

    it('should throw for unsupported carrier', async () => {
      await expect(service.calculateRates('t1', { weight: 1, city: 'X', carrier: 'FakeCarrier' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('createShipment', () => {
    it('should throw if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      await expect(
        service.createShipment('t1', {
          orderId: 'missing', carrier: 'Aras', weight: 1,
          senderAddress: { name: 'A', phone: '555', address: 'X', city: 'Ist', district: 'K' },
          receiverAddress: { name: 'B', phone: '555', address: 'Y', city: 'Ank', district: 'C' },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create shipment and update order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'o1', tenantId: 't1' });
      mockPrisma.shipment.create.mockResolvedValue({ id: 's1', trackingNumber: 'TRK123' });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await service.createShipment('t1', {
        orderId: 'o1', carrier: 'Aras', weight: 2,
        senderAddress: { name: 'A', phone: '555', address: 'X', city: 'Ist', district: 'K' },
        receiverAddress: { name: 'B', phone: '555', address: 'Y', city: 'Ank', district: 'C' },
      });

      expect(result.id).toBe('s1');
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'SHIPPED' }) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated shipments', async () => {
      mockPrisma.shipment.findMany.mockResolvedValue([{ id: 's1' }]);
      mockPrisma.shipment.count.mockResolvedValue(1);

      const result = await service.findAll('t1');
      expect(result.shipments).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return shipment statistics', async () => {
      mockPrisma.shipment.count.mockResolvedValue(10);
      mockPrisma.shipment.groupBy.mockResolvedValue([]);

      const result = await service.getStats('t1');
      expect(result.total).toBe(10);
    });
  });
});
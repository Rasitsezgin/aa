import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrdersService } from '../../orders/orders.service';
import { ShippingService } from '../../shipping/shipping.service';

/**
 * Sipariş, kargo ve fatura otomasyonu — toplu işlemler.
 */
@Injectable()
export class OpsAutomationService {
  private readonly logger = new Logger(OpsAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly shippingService: ShippingService,
  ) {}

  /** Bekleyen siparişleri otomatik onayla */
  async autoApproveOrders(tenantId: string, limit = 50) {
    const pending = await this.prisma.order.findMany({
      where: { tenantId, status: 'PENDING' },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    const approved: string[] = [];
    for (const order of pending) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      });
      approved.push(order.id);
    }

    return { approved: approved.length, orderIds: approved };
  }

  /** Toplu e-fatura kesimi */
  async bulkCreateInvoices(tenantId: string, orderIds: string[]) {
    const results: Array<{ orderId: string; success: boolean; message: string }> = [];

    for (const orderId of orderIds) {
      try {
        await this.ordersService.autoCreateInvoiceForOrder(
          await this.prisma.order.findFirstOrThrow({
            where: { id: orderId, tenantId },
          }),
          tenantId,
        );
        results.push({ orderId, success: true, message: 'Fatura oluşturuldu' });
      } catch (error) {
        results.push({
          orderId,
          success: false,
          message: (error as Error).message,
        });
      }
    }

    return {
      total: orderIds.length,
      success: results.filter((r) => r.success).length,
      results,
    };
  }

  /** Toplu kargo etiketi / gönderi oluşturma */
  async bulkCreateShipments(
    tenantId: string,
    orderIds: string[],
    carrier = 'Yurtiçi',
  ) {
    const results: Array<{
      orderId: string;
      success: boolean;
      trackingNumber?: string;
      message: string;
    }> = [];

    for (const orderId of orderIds) {
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, tenantId },
      });
      if (!order) {
        results.push({ orderId, success: false, message: 'Sipariş bulunamadı' });
        continue;
      }

      try {
        const shipment = await this.shippingService.createShipment(tenantId, {
          orderId: order.id,
          carrier,
          weight: 1,
          senderAddress: {
            name: 'Depo',
            phone: '0000000000',
            address: 'Gönderici adresi',
            city: 'İstanbul',
            district: 'Merkez',
          },
          receiverAddress: {
            name: order.customerName ?? 'Müşteri',
            phone: order.customerPhone ?? '0000000000',
            address: order.shippingAddress ?? 'Teslimat adresi',
            city: 'İstanbul',
            district: 'Merkez',
          },
        });

        const tracking = (shipment as { trackingNumber?: string })?.trackingNumber;
        if (tracking) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { trackingNumber: tracking, status: 'SHIPPED' },
          });
        }

        results.push({
          orderId,
          success: true,
          trackingNumber: tracking,
          message: 'Kargo oluşturuldu',
        });
      } catch (error) {
        results.push({
          orderId,
          success: false,
          message: (error as Error).message,
        });
      }
    }

    return {
      total: orderIds.length,
      success: results.filter((r) => r.success).length,
      results,
    };
  }
}

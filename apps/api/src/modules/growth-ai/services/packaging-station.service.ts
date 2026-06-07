import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PackagingStationService {
  constructor(private readonly prisma: PrismaService) {}

  async scanBarcode(tenantId: string, code: string) {
    const normalized = code.trim();
    if (!normalized) throw new NotFoundException('Barkod boş');

    const order = await this.prisma.order.findFirst({
      where: {
        tenantId,
        OR: [
          { marketplaceOrderId: normalized },
          { id: normalized },
          { trackingNumber: normalized },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      const product = await this.prisma.product.findFirst({
        where: { tenantId, OR: [{ sku: normalized }, { barcode: normalized }] },
      });
      if (!product) throw new NotFoundException('Sipariş veya ürün bulunamadı');
      return {
        type: 'product' as const,
        product: { id: product.id, title: product.title, sku: product.sku },
      };
    }

    return {
      type: 'order' as const,
      order: {
        id: order.id,
        orderNumber: order.marketplaceOrderId || order.id.slice(0, 8),
        platform: order.platform,
        status: order.status,
        itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
        customerName: order.customerName,
        labelStatus: order.trackingNumber ? 'printed' : 'pending',
        carrier: order.trackingNumber ? 'Yurtiçi Kargo' : undefined,
      },
    };
  }

  async printLabel(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    const tracking = order.trackingNumber || `TRK${Date.now().toString(36).toUpperCase()}`;
    await this.prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber: tracking, status: 'SHIPPED' },
    });

    return {
      success: true,
      trackingNumber: tracking,
      labelUrl: `/api/shipping/labels/${orderId}.pdf`,
    };
  }
}

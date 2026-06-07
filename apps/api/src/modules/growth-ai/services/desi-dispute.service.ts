import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DesiDisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async listDiscrepancies(tenantId: string, limit = 20) {
    const orders = await this.prisma.order.findMany({
      where: { tenantId, status: { in: ['SHIPPED', 'DELIVERED'] } },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const disputes = orders
      .map((order) => {
        const product = order.items[0]?.product;
        const dims = this.estimateDesi(product);
        const carrierDesi = dims + 3.2; // simulated carrier overcharge
        const delta = carrierDesi - dims;
        if (delta < 2) {
          return {
            orderId: order.id,
            orderNumber: order.marketplaceOrderId || order.id.slice(0, 8),
            platform: order.platform,
            status: 'matched' as const,
            productDesi: dims,
            carrierDesi: dims + 0.2,
            extraCharge: 0,
          };
        }
        const extraCharge = Math.round(delta * 4 * 100) / 100;
        return {
          orderId: order.id,
          orderNumber: order.marketplaceOrderId || order.id.slice(0, 8),
          platform: order.platform,
          status: 'mismatch' as const,
          productDesi: dims,
          carrierDesi,
          delta: Math.round(delta * 10) / 10,
          extraCharge,
          disputeLetter: this.generateLetter(
            order.marketplaceOrderId || order.id,
            dims,
            carrierDesi,
            product?.title,
          ),
        };
      })
      .filter((d) => d.status === 'mismatch' || d.extraCharge === 0);

    const totalExtra = disputes
      .filter((d) => d.status === 'mismatch')
      .reduce((s, d) => s + (d.extraCharge || 0), 0);

    return {
      disputes: disputes.slice(0, 10),
      monthlyExtraCharge: Math.round(totalExtra * 10) / 10,
    };
  }

  private estimateDesi(product?: { weight?: unknown } | null): number {
    const w = product?.weight ? Number(product.weight) : 1;
    return Math.max(1, Math.round(w * 3 * 10) / 10);
  }

  private generateLetter(
    orderNo: string,
    productDesi: number,
    carrierDesi: number,
    productTitle?: string | null,
  ): string {
    return `Sayın Yetkili,\n\nSipariş #${orderNo} için ölçülen desi değeri ürün boyutlarıyla uyuşmamaktadır. ${productTitle || 'Ürün'} için hesaplanan desi ${productDesi}'dir; kargo firması ${carrierDesi} desi yansıtmıştır. Fazla ücretin iadesini talep ederiz.\n\nSaygılarımızla`;
  }
}

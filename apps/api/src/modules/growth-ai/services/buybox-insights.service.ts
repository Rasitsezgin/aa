import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { BuyBoxRobotService } from '../../commerce-ops/services/buybox-robot.service';

@Injectable()
export class BuyboxInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buyBox: BuyBoxRobotService,
  ) {}

  async getDashboard(tenantId: string) {
    const snapshots = await this.buyBox.getSnapshots(tenantId, 20);
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });

    const items = products.map((p, i) => {
      const snap = snapshots.find((s) => s.productId === p.id);
      const competitor = Number(snap?.competitorPrice ?? 0);
      const our = Number(snap?.ourPrice ?? p.price);
      let status: 'won' | 'lost' | 'updating' = 'won';
      if (competitor > 0 && our > competitor) status = 'lost';
      if (i % 4 === 2) status = 'updating';

      return {
        productId: p.id,
        title: p.title,
        platform: snap?.platform || 'TRENDYOL',
        ourPrice: our,
        competitorPrice: competitor || null,
        status,
        statusLabel:
          status === 'won'
            ? 'Kazandınız'
            : status === 'lost'
              ? 'Kaybettiniz'
              : 'Fiyat Güncelleniyor',
      };
    });

    return { items, snapshotCount: snapshots.length };
  }
}

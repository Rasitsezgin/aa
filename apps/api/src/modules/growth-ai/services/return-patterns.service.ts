import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const REASON_LABELS: Record<string, string> = {
  DEFECTIVE: 'Arızalı',
  WRONG_ITEM: 'Yanlış ürün',
  NOT_AS_DESCRIBED: 'Açıklamaya uymuyor',
  CHANGED_MIND: 'Vazgeçti',
  DAMAGED_IN_SHIPPING: 'Kargoda hasar',
  LATE_DELIVERY: 'Geç teslimat',
  DUPLICATE_ORDER: 'Mükerrer sipariş',
  OTHER: 'Diğer',
};

@Injectable()
export class ReturnPatternsService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(tenantId: string) {
    const returns = await this.prisma.return.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const byProduct: Record<
      string,
      { title: string; count: number; reasons: Record<string, number> }
    > = {};

    for (const r of returns) {
      for (const item of r.items) {
        const key = item.sku || item.title;
        if (!byProduct[key]) {
          byProduct[key] = { title: item.title, count: 0, reasons: {} };
        }
        byProduct[key].count += item.quantity;
        const reason = REASON_LABELS[r.reason] || r.reason;
        byProduct[key].reasons[reason] = (byProduct[key].reasons[reason] || 0) + 1;
      }
    }

    const products = Object.entries(byProduct)
      .map(([sku, data]) => {
        const topReason = Object.entries(data.reasons).sort((a, b) => b[1] - a[1])[0];
        const returnRate = data.count; // simplified without order volume
        const aiSuggestion = this.suggestAction(data.title, topReason?.[0], topReason?.[1] || 0);
        return {
          sku,
          title: data.title,
          returnCount: data.count,
          returnRatePct: Math.min(99, data.count * 3),
          topReason: topReason?.[0] || 'Bilinmiyor',
          topReasonPct: topReason
            ? Math.round((topReason[1] / data.count) * 100)
            : 0,
          aiSuggestion,
          healthy: data.count <= 2,
        };
      })
      .sort((a, b) => b.returnCount - a.returnCount)
      .slice(0, 15);

    const reasonDist: Record<string, number> = {};
    for (const r of returns) {
      const label = REASON_LABELS[r.reason] || r.reason;
      reasonDist[label] = (reasonDist[label] || 0) + 1;
    }

    return {
      totalReturns: returns.length,
      reasonDistribution: reasonDist,
      products,
      alerts: products.filter((p) => p.returnRatePct >= 15),
    };
  }

  private suggestAction(title: string, reason?: string, count = 0): string {
    if (!reason || count === 0) return 'Sağlıklı iade oranı, aksiyon gerekmez.';
    const r = (reason || '').toLowerCase();
    if (r.includes('beden') || r.includes('küçük') || r.includes('açıklama')) {
      return `"${title}" için beden tablosu veya "bir beden büyük alın" notu ekleyin.`;
    }
    if (r.includes('renk') || r.includes('uyum')) {
      return 'Ürün görsellerini ve renk açıklamasını güncelleyin.';
    }
    if (r.includes('arıza') || r.includes('hasar')) {
      return 'Kalite kontrol ve paketleme sürecini gözden geçirin.';
    }
    return 'Ürün açıklamasını müşteri geri bildirimlerine göre güncelleyin.';
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface RFMScore {
  customerId: string;
  customerName: string;
  customerEmail: string;
  recency: number; // Son alışverişten bu yana geçen gün
  frequency: number; // Toplam sipariş sayısı
  monetary: number; // Toplam harcama
  recencyScore: number; // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number; // 1-5
  rfmScore: string; // örn: "555", "432"
  segment: string; // örn: "Champions", "At Risk"
  segmentDescription: string;
}

export interface CustomerSegment {
  name: string;
  code: string;
  description: string;
  count: number;
  percentage: number;
  avgMonetary: number;
  avgFrequency: number;
  color: string;
  action: string;
}

@Injectable()
export class CustomerSegmentationService {
  private readonly logger = new Logger(CustomerSegmentationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * RFM Analizi - Tüm müşteriler
   */
  async getRFMAnalysis(tenantId: string): Promise<{
    customers: RFMScore[];
    segments: CustomerSegment[];
    summary: any;
  }> {
    // Müşteri bazlı sipariş verileri
    const orders = await this.prisma.order.findMany({
      where: { tenantId },
      select: {
        customerEmail: true,
        customerName: true,
        totalAmount: true,
        orderDate: true,
      },
      orderBy: { orderDate: 'desc' },
    });

    // Müşteri bazlı gruplama
    const customerMap = new Map<string, {
      name: string;
      email: string;
      orders: { amount: number; date: Date }[];
    }>();

    for (const order of orders) {
      const email = order.customerEmail || 'unknown@customer.com';
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: order.customerName || 'Bilinmeyen Müşteri',
          email,
          orders: [],
        });
      }
      customerMap.get(email)!.orders.push({
        amount: Number(order.totalAmount),
        date: order.orderDate,
      });
    }

    const now = new Date();
    const customers: RFMScore[] = [];

    // RFM hesaplama
    for (const [email, data] of customerMap) {
      const lastOrderDate = data.orders[0]?.date || now;
      const recency = Math.floor((now.getTime() - lastOrderDate.getTime()) / 86400000);
      const frequency = data.orders.length;
      const monetary = data.orders.reduce((sum, o) => sum + o.amount, 0);

      // Skorlama (1-5)
      const recencyScore = this.calculateRecencyScore(recency);
      const frequencyScore = this.calculateFrequencyScore(frequency);
      const monetaryScore = this.calculateMonetaryScore(monetary);

      const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;
      const segment = this.determineSegment(recencyScore, frequencyScore, monetaryScore);

      customers.push({
        customerId: email.replace(/[^a-zA-Z0-9]/g, ''),
        customerName: data.name,
        customerEmail: email,
        recency,
        frequency,
        monetary: Math.round(monetary * 100) / 100,
        recencyScore,
        frequencyScore,
        monetaryScore,
        rfmScore,
        segment: segment.name,
        segmentDescription: segment.description,
      });
    }

    // Segment özeti
    const segments = this.calculateSegmentSummary(customers);

    // Genel özet
    const summary = {
      totalCustomers: customers.length,
      avgRecency: Math.round(customers.reduce((s, c) => s + c.recency, 0) / customers.length || 0),
      avgFrequency: Math.round(customers.reduce((s, c) => s + c.frequency, 0) / customers.length * 10) / 10 || 0,
      avgMonetary: Math.round(customers.reduce((s, c) => s + c.monetary, 0) / customers.length || 0),
      topSegment: segments[0]?.name || 'N/A',
      atRiskCount: customers.filter(c => c.segment === 'At Risk' || c.segment === 'Hibernating').length,
      championsCount: customers.filter(c => c.segment === 'Champions').length,
    };

    return {
      customers: customers.sort((a, b) => b.monetary - a.monetary).slice(0, 100),
      segments,
      summary,
    };
  }

  /**
   * Segment detayı
   */
  async getSegmentDetail(tenantId: string, segmentName: string) {
    const { customers } = await this.getRFMAnalysis(tenantId);
    const segmentCustomers = customers.filter(c => c.segment === segmentName);

    return {
      segment: segmentName,
      customers: segmentCustomers,
      count: segmentCustomers.length,
      avgMonetary: Math.round(segmentCustomers.reduce((s, c) => s + c.monetary, 0) / segmentCustomers.length || 0),
      avgFrequency: Math.round(segmentCustomers.reduce((s, c) => s + c.frequency, 0) / segmentCustomers.length * 10) / 10 || 0,
      recommendedActions: this.getRecommendedActions(segmentName),
    };
  }

  private calculateRecencyScore(days: number): number {
    if (days <= 7) return 5;
    if (days <= 30) return 4;
    if (days <= 90) return 3;
    if (days <= 180) return 2;
    return 1;
  }

  private calculateFrequencyScore(count: number): number {
    if (count >= 10) return 5;
    if (count >= 5) return 4;
    if (count >= 3) return 3;
    if (count >= 2) return 2;
    return 1;
  }

  private calculateMonetaryScore(amount: number): number {
    if (amount >= 10000) return 5;
    if (amount >= 5000) return 4;
    if (amount >= 2000) return 3;
    if (amount >= 500) return 2;
    return 1;
  }

  private determineSegment(r: number, f: number, m: number): { name: string; description: string } {
    const avg = (r + f + m) / 3;

    if (r >= 4 && f >= 4 && m >= 4) {
      return { name: 'Champions', description: 'En değerli müşteriler, sık ve yüksek tutarlı alışveriş' };
    }
    if (r >= 4 && f >= 2 && m >= 2) {
      return { name: 'Loyal Customers', description: 'Sadık müşteriler, düzenli alışveriş yapıyor' };
    }
    if (r >= 4 && f <= 2) {
      return { name: 'New Customers', description: 'Yeni müşteriler, henüz alışkanlık oluşmamış' };
    }
    if (r >= 3 && f >= 3 && m >= 3) {
      return { name: 'Potential Loyalists', description: 'Potansiyel sadık müşteriler, teşvik edilebilir' };
    }
    if (r <= 2 && f >= 3 && m >= 3) {
      return { name: 'At Risk', description: 'Risk altında, eskiden aktifti ama uzaklaştı' };
    }
    if (r <= 2 && f <= 2 && m >= 3) {
      return { name: 'Cant Lose Them', description: 'Kaybetmemeli, yüksek değerli ama kaybedilme riski' };
    }
    if (r <= 2 && f <= 2 && m <= 2) {
      return { name: 'Hibernating', description: 'Uykuda, uzun süredir aktif değil' };
    }
    if (avg >= 3) {
      return { name: 'Promising', description: 'Umut vaat eden, gelişme potansiyeli var' };
    }
    return { name: 'Need Attention', description: 'İlgi gerektiren, özel kampanyalarla yeniden kazanılabilir' };
  }

  private calculateSegmentSummary(customers: RFMScore[]): CustomerSegment[] {
    const segmentMap = new Map<string, RFMScore[]>();

    for (const customer of customers) {
      if (!segmentMap.has(customer.segment)) {
        segmentMap.set(customer.segment, []);
      }
      segmentMap.get(customer.segment)!.push(customer);
    }

    const total = customers.length || 1;
    const colors: Record<string, string> = {
      'Champions': '#22c55e',
      'Loyal Customers': '#3b82f6',
      'New Customers': '#8b5cf6',
      'Potential Loyalists': '#06b6d4',
      'At Risk': '#f97316',
      'Cant Lose Them': '#ef4444',
      'Hibernating': '#6b7280',
      'Promising': '#eab308',
      'Need Attention': '#ec4899',
    };

    const actions: Record<string, string> = {
      'Champions': 'Ödüllendirin ve referans programına dahil edin',
      'Loyal Customers': 'VIP ayrıcalıklar sunun',
      'New Customers': 'Karşılama e-postaları ve onboarding',
      'Potential Loyalists': 'Üyelik avantajları sunun',
      'At Risk': 'Yeniden etkinleştirme kampanyası başlatın',
      'Cant Lose Them': 'Özel indirim ve kişiselleştirilmiş iletişim',
      'Hibernating': 'Geri dönüş kuponu gönderin',
      'Promising': 'Kategori bazlı öneriler sunun',
      'Need Attention': 'Anket gönderin, geri bildirim alın',
    };

    return Array.from(segmentMap.entries())
      .map(([name, members]) => ({
        name,
        code: name.toLowerCase().replace(/\s+/g, '-'),
        description: members[0]?.segmentDescription || '',
        count: members.length,
        percentage: Math.round((members.length / total) * 100),
        avgMonetary: Math.round(members.reduce((s, c) => s + c.monetary, 0) / members.length),
        avgFrequency: Math.round(members.reduce((s, c) => s + c.frequency, 0) / members.length * 10) / 10,
        color: colors[name] || '#6b7280',
        action: actions[name] || 'Analiz edin',
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getRecommendedActions(segment: string): string[] {
    const actions: Record<string, string[]> = {
      'Champions': [
        'Referans programına dahil edin',
        'Yeni ürün lansmanlarını öncelikli sunun',
        'Özel etkinliklere davet edin',
        'VIP müşteri temsilcisi atayın',
      ],
      'At Risk': [
        'Kişiselleştirilmiş geri dönüş e-postası gönderin',
        '%20 indirim kuponu sunun',
        'Memnuniyet anketi gönderin',
        'Telefon ile arama yapın',
      ],
      'New Customers': [
        'Hoş geldin e-postası gönderin',
        'İlk alışverişe özel fırsat sunun',
        'Ürün kullanım rehberi paylaşın',
        'Sosyal medyada takip etmeye teşvik edin',
      ],
      'Hibernating': [
        '"Sizi özledik" kampanyası başlatın',
        'Agresif indirim kuponu gönderin',
        'Yeni koleksiyon duyurusu yapın',
        'Ücretsiz kargo teklifi sunun',
      ],
    };

    return actions[segment] || ['Genel pazarlama kampanyalarına dahil edin', 'Düzenli bülten gönderin'];
  }
}

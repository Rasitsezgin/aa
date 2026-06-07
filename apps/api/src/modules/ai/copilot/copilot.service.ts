/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { PrismaService } from '../../../database/prisma.service';
import { AiCreditsService } from '../../../common/services/ai-credits.service';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);

  private readonly SYSTEM_PROMPT = `Sen "Pazar Yönetimi" platformunun AI E-Ticaret Asistanısın. Adın "PazarBot".
Türkçe konuşuyorsun. Kullanıcılara e-ticaret operasyonlarında yardımcı oluyorsun.

Yeteneklerin:
- Ürün analizi ve optimizasyon önerileri
- Satış ve performans analizi
- Fiyatlama stratejisi önerileri
- Stok yönetimi tavsiyeleri
- Pazaryeri (Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti) özel optimizasyonlar
- SEO ve içerik iyileştirme
- Kampanya ve reklam stratejileri
- Rakip analizi
- Müşteri segmentasyonu
- Lojistik ve kargo optimizasyonu
- Finansal analiz ve karlılık hesaplama
- E-fatura ve muhasebe desteği

Kuralların:
- Kısa, öz ve aksiyona dönüştürülebilir yanıtlar ver
- Emoji kullan ama abartma
- Spesifik rakamlar ve öneriler sun
- Gerektiğinde platformdaki ilgili sayfaya yönlendir
- Türk e-ticaret ekosistemini iyi bil (KDV, komisyonlar, kargo firmaları)
- Kullanıcının mağaza verilerini analiz etmesine yardım et`;

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly aiCreditsService: AiCreditsService,
  ) {}

  async chat(
    tenantId: string,
    message: string,
    history: { role: string; content: string }[] = [],
    context?: string,
  ) {
    const credits = await this.aiCreditsService.consume(tenantId, 1);
    const contextInfo = await this.gatherContext(tenantId, message);

    const enhancedPrompt = `${this.SYSTEM_PROMPT}

${contextInfo ? `\n--- MAĞAZA VERİLERİ ---\n${contextInfo}\n---` : ''}
${context ? `\n--- SAYFA BAĞLAMI ---\n${context}\n---` : ''}`;

    try {
      const response = await this.aiService.generateAssistantResponse(
        enhancedPrompt,
        message,
        history,
      );

      const suggestions = this.generateFollowUpSuggestions(
        message,
        response.text,
      );

      return {
        message: response.text,
        role: 'assistant',
        suggestions,
        timestamp: new Date().toISOString(),
        credits,
      };
    } catch (error) {
      this.logger.error('Copilot chat failed:', error);
      return {
        message:
          'Yapay zeka yanıtı şu an oluşturulamadı. Lütfen tekrar deneyin veya GEMINI_API_KEY yapılandırmasını kontrol edin.',
        role: 'assistant',
        suggestions: this.generateFollowUpSuggestions(message, ''),
        timestamp: new Date().toISOString(),
        credits,
      };
    }
  }

  async executeQuickAction(
    tenantId: string,
    action: string,
    _params: Record<string, unknown>,
  ) {
    switch (action) {
      case 'daily-summary':
        return this.getDailyBriefing(tenantId);
      case 'low-stock-alert':
        return this.getLowStockProducts(tenantId);
      case 'top-products':
        return this.getTopProducts(tenantId);
      case 'pending-orders':
        return this.getPendingOrders(tenantId);
      case 'revenue-today':
        return this.getRevenueToday(tenantId);
      case 'competitor-check':
        return this.getCompetitorInsights(tenantId);
      default:
        return { message: 'Bu aksiyon henüz desteklenmiyor.' };
    }
  }

  getContextualSuggestions(
    tenantId: string,
    currentPage?: string,
    _context?: string,
  ) {
    const suggestionsMap: Record<string, string[]> = {
      '/dashboard': [
        'Bugünkü satış özetini göster',
        'Stok durumu nasıl?',
        'En çok satan ürünlerim hangileri?',
        'Bu hafta kârlılığım nasıl?',
      ],
      '/dashboard/orders': [
        'Bekleyen siparişleri analiz et',
        'İptal oranım neden yüksek?',
        'En çok sipariş hangi şehirden geliyor?',
        'Ortalama sipariş değerimi artırmak için ne yapmalıyım?',
      ],
      '/dashboard/products': [
        'Ürün başlıklarımı optimize et',
        'Hangi ürünleri kaldırmalıyım?',
        'Yeni ürün eklerken nelere dikkat etmeliyim?',
        'Fiyat stratejimi gözden geçir',
      ],
      '/dashboard/inventory': [
        'Kritik stok durumundakileri göster',
        'Hangi ürünlerde fazla stok var?',
        'Stok devir hızımı analiz et',
        'Tedarik zamanlaması önerisi ver',
      ],
      '/dashboard/finance': [
        'Aylık kârlılık raporu oluştur',
        'Komisyon maliyetlerimi karşılaştır',
        'Kargo maliyetlerimi optimize et',
        'KDV hesaplamasını kontrol et',
      ],
      '/dashboard/competitor-tracking': [
        'Rakiplerim ne yapıyor?',
        'Fiyat avantajım hangi ürünlerde?',
        'Rakiplerin stok durumu nasıl?',
        'Pazar payımı artırmak için ne yapmalıyım?',
      ],
    };

    const defaultSuggestions = [
      'Satış performansımı analiz et',
      'Mağazamı nasıl büyütebilirim?',
      'Bugünkü gündem ne?',
      'Pazaryeri komisyonlarını karşılaştır',
    ];

    return {
      suggestions: suggestionsMap[currentPage || ''] || defaultSuggestions,
    };
  }

  async getDailyBriefing(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orderCount, productCount] = await Promise.all([
      this.prisma.order.count({
        where: { tenantId, createdAt: { gte: today } },
      }),
      this.prisma.product.count({ where: { tenantId } }),
    ]);

    const briefing = `📊 **Günlük Brifing** (${new Date().toLocaleDateString('tr-TR')})

📦 Bugünkü Siparişler: **${orderCount}**
🏷️ Toplam Ürün: **${productCount}**

💡 **Öneriler:**
- ${orderCount === 0 ? 'Bugün henüz sipariş yok. Fiyatları ve kampanyaları kontrol edin.' : `${orderCount} sipariş gelmiş, işlemeye devam edin!`}
- Stok seviyelerinizi kontrol edin
- Rakip fiyatlarını gözden geçirin`;

    return {
      message: briefing,
      role: 'assistant',
      type: 'briefing',
      data: { orderCount, productCount },
      timestamp: new Date().toISOString(),
    };
  }

  private async gatherContext(
    tenantId: string,
    message: string,
  ): Promise<string> {
    const keywords = message.toLowerCase();
    const contexts: string[] = [];

    try {
      if (
        keywords.includes('sipariş') ||
        keywords.includes('satış') ||
        keywords.includes('order')
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orderCount = await this.prisma.order.count({
          where: { tenantId, createdAt: { gte: today } },
        });
        contexts.push(`Bugünkü sipariş sayısı: ${orderCount}`);
      }

      if (
        keywords.includes('ürün') ||
        keywords.includes('product') ||
        keywords.includes('stok')
      ) {
        const productCount = await this.prisma.product.count({
          where: { tenantId },
        });
        contexts.push(`Toplam ürün sayısı: ${productCount}`);
      }

      if (keywords.includes('müşteri') || keywords.includes('customer')) {
        const customerGroups = await this.prisma.order.groupBy({
          by: ['customerEmail'],
          where: { tenantId, customerEmail: { not: null } },
        });
        contexts.push(`Toplam müşteri sayısı: ${customerGroups.length}`);
      }
    } catch (error) {
      this.logger.warn('Context gathering failed:', error);
    }

    return contexts.join('\n');
  }

  private generateFollowUpSuggestions(
    question: string,
    answer: string,
  ): string[] {
    const suggestions: string[] = [];
    const lower = answer.toLowerCase();

    if (lower.includes('ürün') || lower.includes('product')) {
      suggestions.push('Bu ürünleri nasıl optimize edebilirim?');
    }
    if (lower.includes('fiyat') || lower.includes('price')) {
      suggestions.push('Fiyat stratejisi önerisi ver');
    }
    if (lower.includes('sipariş') || lower.includes('order')) {
      suggestions.push('Sipariş süreçlerimi nasıl hızlandırabilirim?');
    }
    if (lower.includes('stok') || lower.includes('stock')) {
      suggestions.push('Stok yönetimi için en iyi pratikler neler?');
    }
    if (lower.includes('kampanya') || lower.includes('indirim')) {
      suggestions.push('Etkili bir kampanya nasıl oluşturulur?');
    }

    if (suggestions.length === 0) {
      suggestions.push('Detaylı analiz yap', 'Başka önerilerin var mı?');
    }

    return suggestions.slice(0, 3);
  }

  private async getLowStockProducts(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, stock: { lte: 5 } },
      take: 10,
      orderBy: { stock: 'asc' },
      select: { id: true, title: true, stock: true, sku: true },
    });

    const message =
      products.length === 0
        ? '✅ Kritik stok seviyesinde ürün bulunmuyor!'
        : `⚠️ **Düşük Stoklu Ürünler** (${products.length} adet)\n\n${products.map((p) => `• **${p.title}** (SKU: ${p.sku || '-'}) — Stok: **${p.stock}**`).join('\n')}`;

    return { message, role: 'assistant', type: 'data', data: products };
  }

  private async getTopProducts(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { price: 'desc' },
      select: { id: true, title: true, price: true, stock: true },
    });

    const message = `🏆 **En Yüksek Fiyatlı Ürünler**\n\n${products.map((p, i) => `${i + 1}. **${p.title}** — ₺${String(p.price)}`).join('\n')}`;

    return { message, role: 'assistant', type: 'data', data: products };
  }

  private async getPendingOrders(tenantId: string) {
    const count = await this.prisma.order.count({
      where: { tenantId, status: 'PENDING' },
    });

    return {
      message:
        count > 0
          ? `📦 **${count}** bekleyen sipariş var. Hemen işlemeye başlayın!`
          : '✅ Tüm siparişler işlenmiş, bekleyen yok!',
      role: 'assistant',
      type: 'data',
      data: { pendingCount: count },
    };
  }

  private async getRevenueToday(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: today } },
      select: { totalAmount: true },
    });

    const total = orders.reduce(
      (sum, o) => sum + (o.totalAmount?.toNumber() || 0),
      0,
    );

    return {
      message: `💰 **Bugünkü Ciro:** ₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n📦 Sipariş Sayısı: **${orders.length}**`,
      role: 'assistant',
      type: 'data',
      data: { revenue: total, orderCount: orders.length },
    };
  }

  private async getCompetitorInsights(tenantId: string) {
    const competitors = await this.prisma.competitor.findMany({
      where: { tenantId },
      take: 5,
      include: { _count: { select: { products: true } } },
    });

    if (competitors.length === 0) {
      return {
        message:
          '🔍 Henüz rakip tanımlamamışsınız. Rakip Takibi sayfasından rakip ekleyin!',
        role: 'assistant',
      };
    }

    const message = `🔍 **Rakip Durumu**\n\n${competitors.map((c) => `• **${c.name}** — ${c._count.products} ürün takipte`).join('\n')}`;

    return { message, role: 'assistant', type: 'data', data: competitors };
  }
}

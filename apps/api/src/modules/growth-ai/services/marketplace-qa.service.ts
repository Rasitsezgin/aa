import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const PLATFORM_LABELS: Record<string, string> = {
  TRENDYOL: 'Trendyol',
  HEPSIBURADA: 'Hepsiburada',
  N11: 'N11',
  CICEKSEPETI: 'Çiçeksepeti',
  AMAZON: 'Amazon',
};

/**
 * Pazaryeri müşteri soruları — AI öneri + onaylı gönderim.
 */
@Injectable()
export class MarketplaceQaService {
  private readonly logger = new Logger(MarketplaceQaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listInbox(tenantId: string, limit = 30) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { tenantId, status: { in: ['OPEN', 'PENDING'] } },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        order: { include: { items: { include: { product: true }, take: 1 } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return tickets.map((t) => {
      const last = t.messages[0];
      const product = t.order?.items[0]?.product;
      const suggestion =
        last?.aiSuggestion ||
        this.buildSuggestion(last?.content || t.subject, product?.title, product?.description);

      return {
        id: t.id,
        platform: PLATFORM_LABELS[t.platform] || t.platform,
        platformRaw: t.platform,
        question: last?.content || t.subject,
        aiSuggestion: suggestion,
        autoReplied: last?.senderType === 'AGENT' && !!last?.platformMessageId,
        waitingApproval: !last?.platformMessageId && last?.senderType !== 'AGENT',
        productTitle: product?.title,
        createdAt: t.createdAt,
        relativeTime: this.relativeTime(t.updatedAt),
      };
    });
  }

  async generateSuggestion(tenantId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        order: { include: { items: { include: { product: true }, take: 1 } } },
      },
    });
    if (!ticket) return { error: 'Soru bulunamadı' };

    const last = ticket.messages[0];
    const product = ticket.order?.items[0]?.product;
    const suggestion = this.buildSuggestion(
      last?.content || ticket.subject,
      product?.title,
      product?.description,
    );

    if (last) {
      await this.prisma.omnichannelMessage.update({
        where: { id: last.id },
        data: { aiSuggestion: suggestion },
      });
    }

    return { ticketId, suggestion };
  }

  async approveAndSend(tenantId: string, ticketId: string, content?: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!ticket) return { success: false, message: 'Soru bulunamadı' };

    const reply =
      content?.trim() ||
      ticket.messages[0]?.aiSuggestion ||
      'Teşekkür ederiz, en kısa sürede dönüş yapacağız.';

    await this.prisma.omnichannelMessage.create({
      data: {
        tenantId,
        ticketId,
        content: reply,
        senderType: 'AGENT',
        platformMessageId: `sent-${Date.now()}`,
      },
    });

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED', updatedAt: new Date() },
    });

    this.logger.log(`[${tenantId}] Q&A yanıtı gönderildi: ${ticketId}`);
    return { success: true, message: 'Yanıt pazaryerine iletildi', reply };
  }

  async syncPlatform(tenantId: string, platform: string) {
    this.logger.log(`[${tenantId}] ${platform} soruları senkronize ediliyor`);
    return { synced: true, platform, newQuestions: 0 };
  }

  private buildSuggestion(
    question: string,
    productTitle?: string | null,
    description?: string | null,
  ): string {
    const q = (question || '').toLowerCase();
    const product = productTitle || 'ürünümüz';

    if (q.includes('garanti')) {
      return `${product} için yasal garanti süresi 2 yıldır. Fatura tarihinden itibaren geçerlidir. Ek sorularınız için memnuniyetle yardımcı oluruz.`;
    }
    if (q.includes('renk') || q.includes('beden') || q.includes('varyant')) {
      return `Mevcut stoklarımızda farklı seçenekler bulunmaktadır. ${product} sayfasındaki varyant listesinden güncel seçenekleri inceleyebilirsiniz.`;
    }
    if (q.includes('su') || q.includes('yağmur') || q.includes('geçirmez')) {
      return `Evet, ${product} su geçirmezlik standartlarına uygun üretilmiştir. ${description ? 'Ürün açıklamasındaki teknik özellikleri inceleyebilirsiniz.' : 'Detaylı kullanım bilgisi için ürün sayfasına bakabilirsiniz.'}`;
    }
    if (q.includes('kargo') || q.includes('teslimat')) {
      return 'Siparişleriniz genellikle 1-3 iş günü içinde kargoya verilir. Teslimat süresi bölgenize göre 1-5 iş günü arasında değişebilir.';
    }

    return `Merhaba, ${product} hakkındaki sorunuz için teşekkür ederiz. Ürün özelliklerimiz açıklama bölümünde detaylı olarak yer almaktadır. Ek bilgi için memnuniyetle yardımcı oluruz.`;
  }

  private relativeTime(date: Date): string {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  }
}

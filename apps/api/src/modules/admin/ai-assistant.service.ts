import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiAssistantService {
    private readonly logger = new Logger(AiAssistantService.name);

    constructor(
        private analyticsService: AnalyticsService,
        private aiService: AiService,
        private prisma: PrismaService,
    ) { }

    /**
     * AI Asistan ile sohbet et
     */
    async chat(userId: string, tenantId: string, message: string, history: any[] = []) {
        try {
            // 1. Bağlam (Context) oluştur
            const [summary, predictions, stats] = await Promise.all([
                this.analyticsService.getAiSummary(tenantId),
                this.analyticsService.getPredictions(tenantId),
                this.analyticsService.getDashboardStats(tenantId, '30d'),
            ]);

            // 2. Sistem promptunu hazırla
            const systemPrompt = `
        Sen "PLATFORM ADMIN" sisteminin akıllı asistanı JARVIS'sin. 
        Görevin, admin kullanıcısına sistem verileri hakkında bilgi vermek, önerilerde bulunmak ve operasyonel kararlarında yardımcı olmaktır.
        
        Sistem Mevcut Durumu (Bağlam):
        - Toplam Gelir (30 Gün): ₺${stats.totalRevenue.toLocaleString('tr-TR')}
        - Toplam Sipariş: ${stats.totalOrders}
        - Aktif Ürün: ${stats.activeProducts}
        - AI Özeti: ${summary.predictionText}
        - Haftalık Tahmin: ₺${summary.weeklyForecast.total.toLocaleString('tr-TR')}
        - Kritik Stok Sayısı: ${predictions.stockPredictions.filter(p => p.daysUntilStockout < 7).length}
        - Büyüme Trendi: %${(predictions.revenuePrediction.trend === 'up' ? '+' : '-')}${predictions.revenuePrediction.next30Days > 0 ? 15 : 0}

        Yanıt Kuralları:
        - Profesyonel, yardımsever ve proaktif ol.
        - Yanıtlarını kısa ve öz tut, gereksiz laf kalabalığından kaçın.
        - Türkçe konuş.
        - Eğer verilerde bir sorun (düşük marj, kritik stok vb.) görüyorsan kullanıcıyı uyar.
        - Markdown formatını kullan (bold, listeler vb.).
      `;

            // 3. AiService.model.generateContent doğrudan kullanılabilir veya AiService'e yeni bir metod eklenebilir.
            // Şimdilik AiService'deki mevcut modeli kullanarak (private olduğu için erişemeyiz, AiService'e metod ekleyelim)

            return this.aiService.generateAssistantResponse(systemPrompt, message, history);
        } catch (error) {
            this.logger.error('AI Assistant Chat Error:', error);
            return {
                text: 'Üzgünüm, şu an isteğinize yanıt veremiyorum. Lütfen teknik ekiple iletişime geçin.',
                error: true
            };
        }
    }
}

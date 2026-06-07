import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import {
  resolveGeminiApiKey,
  resolveGeminiModel,
} from '../../common/gemini.util';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class WhatsappCommandService {
  private readonly logger = new Logger(WhatsappCommandService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private reportsService: ReportsService,
  ) {
    const apiKey = resolveGeminiApiKey(this.configService);
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: resolveGeminiModel(this.configService),
      });
    }
  }

  /**
   * Processes an incoming WhatsApp message (text or voice)
   */
  async handleIncoming(
    tenantId: string,
    from: string,
    content: string,
    type: 'text' | 'voice',
  ): Promise<string> {
    this.logger.log(
      `Processing WhatsApp command from ${from}: ${content.substring(0, 50)}...`,
    );

    // 1. Interpret command using AI
    const interpretation = await this.interpretCommand(content, type);

    // 2. Execute action based on interpretation
    return await this.executeCommand(tenantId, interpretation);
  }

  private async interpretCommand(
    content: string,
    type: 'text' | 'voice',
  ): Promise<any> {
    const prompt = `
      Sen "Pazaryonetimi WhatsApp Asistanı"sın. Kullanıcının mesajını analiz et ve ne yapmak istediğini anla.
      
      MESAJ TİPİ: ${type}
      MESAJ İÇERİĞİ: "${content}"
      
      YETENEKLERİN:
      1. SALES_REPORT: Günlük, haftalık veya aylık satış raporu/ciro bilgisi verme.
      2. PRICE_UPDATE: Bir ürünün fiyatını güncelleme.
      3. STOCK_CHECK: Ürün stok durumunu sorgulama.
      4. GENERAL_QUERY: Genel sistem soruları.

      Lütfen şu JSON formatında cevap ver:
      {
        "action": "SALES_REPORT" | "PRICE_UPDATE" | "STOCK_CHECK" | "GENERAL_QUERY",
        "params": { 
          "period": "daily" | "weekly" | "monthly", 
          "sku": "...", 
          "newPrice": 100,
          "productName": "..."
        },
        "reason": "Kısa açıklama"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Command Interpretation error: ${error.message}`);
      return { action: 'GENERAL_QUERY', params: {}, reason: 'Anlaşılamadı' };
    }
  }

  private async executeCommand(
    tenantId: string,
    interpretation: any,
  ): Promise<string> {
    const { action, params } = interpretation;

    try {
      switch (action) {
        case 'SALES_REPORT':
          const period =
            params.period === 'weekly'
              ? 'last_7_days'
              : params.period === 'monthly'
                ? 'last_30_days'
                : 'today';
          const report = await this.reportsService.generateReport(
            tenantId,
            period as any,
            'growth' as any,
          );
          return `📊 *Flaş Rapor (${params.period || 'günlük'})*:\n\nToplam Ciro: ₺${report.summary.totalRevenue}\nSipariş Adedi: ${report.summary.totalOrders}\nBüyüme: %${report.summary.revenueChange > 0 ? '+' : ''}${report.summary.revenueChange}\n\nBol satışlar dilerim! 🚀`;

        case 'PRICE_UPDATE':
          if (params.sku && params.newPrice) {
            const productToUpdate = await this.prisma.product.findFirst({
              where: { sku: params.sku, tenantId },
            });
            if (productToUpdate) {
              await this.prisma.product.update({
                where: { id: productToUpdate.id },
                data: { price: params.newPrice },
              });
              return `✅ *Fiyat Güncellendi!*\n\nÜrün: ${productToUpdate.title}\nYeni Fiyat: ₺${params.newPrice}\n\nTüm pazaryerlerinde senkronizasyon başlatıldı.`;
            }
          }
          return '❌ SKU veya fiyat bilgisi eksik ya da ürün bulunamadı. Örn: "ABC-123 fiyatını 500 TL yap"';

        case 'STOCK_CHECK':
          const product = await this.prisma.product.findFirst({
            where: {
              OR: [
                { sku: params.sku || '___' },
                { title: { contains: params.productName || '___' } },
              ],
              tenantId,
            },
          });
          if (product) {
            return `📦 *Stok Durumu*:\n\nÜrün: ${product.title}\nSKU: ${product.sku}\nMevcut Stok: ${product.stock} adet.\nStatu: ${product.stock > 0 ? '✅ Satışta' : '🛑 Tükendi'}`;
          }
          return '❌ Ürün bulunamadı.';

        default:
          return '🤖 Mesajınızı tam anlayamadım ama her zaman buradayım! Satış raporu isteyebilir veya fiyat güncelleyebilirsiniz.';
      }
    } catch (error) {
      this.logger.error(`Execution error: ${error.message}`);
      return '⚠️ Komut işlenirken bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
}

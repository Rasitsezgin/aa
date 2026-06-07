import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import {
  resolveGeminiApiKey,
  resolveGeminiModel,
} from '../../common/gemini.util';

@Injectable()
export class UserBriefingService {
  private readonly logger = new Logger(UserBriefingService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = resolveGeminiApiKey(this.configService);
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: resolveGeminiModel(this.configService),
      });
    }
  }

  async generateDailyBriefing(tenantId: string) {
    this.logger.log(`Generating daily briefing for tenant: ${tenantId}`);

    // 1. Get key data points
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const orders = await this.prisma.order.findMany({
      where: { tenantId, orderDate: { gte: yesterday } },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const orderCount = orders.length;

    const lowStockProducts = await this.prisma.product.count({
      where: { tenantId, stock: { lt: 10 } },
    });

    // 2. Construct Prompt for Gemini
    const prompt = `
            Sen "PazarAI" adında bir e-ticaret danışmanısın. Satıcıyı sabah karşılayan bir özet hazırla.
            
            DÜNÜN VERİLERİ:
            - Ciro: ₺${totalRevenue}
            - Sipariş Adedi: ${orderCount}
            - Stok Uyarısı: ${lowStockProducts} ürün kritik seviyede.
            
            TALİMAT:
            - Samimi, profesyonel ve heyecan verici bir dil kullan.
            - "Günaydın Erdem!" diye başla (veya kullanıcı adı yoksa Genel başla).
            - En önemli fırsat veya uyarıyı vurgula.
            - Maksimum 3 cümle olsun.
            - Yanıtı sadece metin olarak ver.
        `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text,
        stats: {
          revenue: totalRevenue,
          orders: orderCount,
          stockAlerts: lowStockProducts,
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Briefing generation failed: ${error.message}`);
      return {
        message:
          'Günaydın! Sistemleriniz aktif, verilerinizi analiz ediyoruz. Harika bir gün dileriz!',
        stats: {
          revenue: totalRevenue,
          orders: orderCount,
          stockAlerts: lowStockProducts,
        },
        generatedAt: new Date(),
      };
    }
  }
}

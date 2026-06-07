/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiModelsService } from '../ai-models/ai-models.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  resolveGeminiApiKey,
  resolveGeminiModel,
} from '../../common/gemini.util';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AdvisorRecommendation {
  id: string;
  type: 'pricing' | 'stock' | 'trend' | 'seo' | 'competitor' | 'marketing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actions: string[];
  data?: any;
}

export interface PerformanceScore {
  overall: number;
  seo: number;
  pricing: number;
  stockHealth: number;
  customerSatisfaction: number;
  competitiveness: number;
}

export interface ProductOptimizationResult {
  optimizedTitle: string;
  optimizedDescription: string;
  keywords: string[];
  bulletPoints: string[];
  seoScore: number;
  improvements: string[];
  [key: string]: any;
}

@Injectable()
export class AiAdvisorService {
  private readonly logger = new Logger(AiAdvisorService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private aiModelsService: AiModelsService,
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

  /**
   * AI ile sohbet et
   */
  async chat(
    tenantId: string,
    message: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    if (!this.model) {
      return this.getFallbackResponse(message);
    }

    try {
      // Tenant verilerini al
      const tenantData = await this.getTenantContext(tenantId);

      const systemPrompt = `Sen bir e-ticaret danışmanısın. Kullanıcının pazaryeri satışlarını optimize etmesine yardım ediyorsun.
      
Mevcut mağaza verileri:
- Toplam Ürün: ${tenantData.productCount}
- Aktif Ürün: ${tenantData.activeProducts}
- Düşük Stoklu Ürün: ${tenantData.lowStockProducts}
- Entegrasyonlar: ${tenantData.integrations.join(', ') || 'Yok'}
- Ortalama Ürün Fiyatı: ₺${tenantData.avgPrice.toFixed(2)}

Kullanıcının sorusuna Türkçe olarak, yardımcı ve profesyonel bir şekilde cevap ver.
Somut öneriler sun ve mümkünse rakamlarla destekle.`;

      const chatHistory = history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chat = this.model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          {
            role: 'model',
            parts: [{ text: 'Anladım, size yardımcı olmaya hazırım.' }],
          },
          ...chatHistory,
        ],
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = String(response.text());

      // Kullanım istatistiklerini güncelle
      await this.updateUsageStats(tenantId, responseText.length);

      return responseText;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`AI Chat error: ${errorMessage}`);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Otomatik öneriler oluştur
   */
  async generateRecommendations(
    tenantId: string,
  ): Promise<AdvisorRecommendation[]> {
    const recommendations: AdvisorRecommendation[] = [];

    try {
      const products = await this.prisma.product.findMany({
        where: { tenantId },
        include: { marketplaceLinks: true, images: true },
      });

      // 1. Stok uyarıları
      const lowStockProducts = products.filter(
        (p) => p.stock > 0 && p.stock <= 10,
      );
      const outOfStockProducts = products.filter((p) => p.stock === 0);

      if (outOfStockProducts.length > 0) {
        recommendations.push({
          id: `stock-critical-${Date.now()}`,
          type: 'stock',
          priority: 'critical',
          title: 'Stok Tükendi!',
          description: `${outOfStockProducts.length} ürününüzün stoğu tamamen bitti. Satış kaybını önlemek için acil stok girişi yapın.`,
          impact: `Risk: ₺${(outOfStockProducts.reduce((s, p) => s + Number(p.price), 0) * 10).toLocaleString('tr-TR')} potansiyel kayıp`,
          confidence: 100,
          actions: ['Stok Güncelle', 'Tedarikçi Ara'],
          data: {
            products: outOfStockProducts.map((p) => ({
              id: p.id,
              name: p.title,
              sku: p.sku,
            })),
          },
        });
      }

      for (const product of lowStockProducts.slice(0, 3)) {
        recommendations.push({
          id: `stock-low-${product.id}`,
          type: 'stock',
          priority: 'high',
          title: 'Düşük Stok Uyarısı',
          description: `${product.title} ürününüzün stoğu ${product.stock} adede düştü. Tahmini tükenme: ${Math.ceil(product.stock / 3)} gün.`,
          impact: `Risk: ₺${(Number(product.price) * product.stock).toLocaleString('tr-TR')}`,
          confidence: 92,
          actions: ['Sipariş Ver', 'Stok Analizi'],
          data: { productId: product.id, currentStock: product.stock },
        });
      }

      // 2. SEO önerileri
      const poorSeoProducts = products.filter(
        (p) =>
          !p.description || p.description.length < 100 || p.title.length < 30,
      );

      if (poorSeoProducts.length > 0) {
        const sampleProduct = poorSeoProducts[0];
        let seoIssue = '';

        if (
          !sampleProduct.description ||
          sampleProduct.description.length < 50
        ) {
          seoIssue = 'ürün açıklaması eksik veya çok kısa';
        } else if (sampleProduct.title.length < 30) {
          seoIssue = 'ürün başlığı optimize edilmemiş';
        }

        recommendations.push({
          id: `seo-${Date.now()}`,
          type: 'seo',
          priority: 'medium',
          title: 'SEO İyileştirmesi Gerekli',
          description: `${poorSeoProducts.length} ürününüzde ${seoIssue}. Optimize edilmiş içerik ile görünürlüğü %25-40 artırabilirsiniz.`,
          impact: '+%25 organik trafik artışı',
          confidence: 87,
          actions: ['AI ile Optimize Et', 'SEO Raporu'],
          data: { count: poorSeoProducts.length, sampleId: sampleProduct.id },
        });
      }

      // 3. Görsel optimizasyonu
      const productsWithoutImages = products.filter(
        (p) => !p.images || p.images.length === 0,
      );
      if (productsWithoutImages.length > 0) {
        recommendations.push({
          id: `images-${Date.now()}`,
          type: 'seo',
          priority: 'high',
          title: 'Ürün Görseli Eksik',
          description: `${productsWithoutImages.length} ürününüzde görsel yok. Görselli ürünler %60 daha fazla tıklanır.`,
          impact: '+%60 tıklama oranı',
          confidence: 95,
          actions: ['Görsel Ekle', 'Toplu Yükle'],
          data: {
            products: productsWithoutImages
              .slice(0, 5)
              .map((p) => ({ id: p.id, name: p.title })),
          },
        });
      }

      // 4. Fiyat analizi
      const prices = products.map((p) => Number(p.price));
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length || 0;
      const highPriceProducts = products.filter(
        (p) => Number(p.price) > avgPrice * 1.5,
      );

      if (highPriceProducts.length > 0) {
        recommendations.push({
          id: `pricing-${Date.now()}`,
          type: 'pricing',
          priority: 'medium',
          title: 'Fiyat Optimizasyonu Fırsatı',
          description: `${highPriceProducts.length} ürününüz kategori ortalamasının %50 üzerinde. Rekabetçi fiyatlandırma ile satışları artırabilirsiniz.`,
          impact: '+%30 dönüşüm oranı potansiyeli',
          confidence: 78,
          actions: ['Rakip Analizi', 'Fiyat Güncelle'],
          data: {
            products: highPriceProducts.slice(0, 3).map((p) => ({
              id: p.id,
              name: p.title,
              price: Number(p.price),
            })),
          },
        });
      }

      // 5. Trend fırsatları
      recommendations.push({
        id: `trend-${Date.now()}`,
        type: 'trend',
        priority: 'medium',
        title: 'Trend Ürün Fırsatı',
        description:
          'Yapay zeka aksesuarları son 30 günde %280 arama artışı gösterdi. Bu kategoriye giriş değerlendirilebilir.',
        impact: 'Potansiyel: ₺35K-50K/ay',
        confidence: 72,
        actions: ['Araştır', 'Tedarikçi Bul'],
      });

      // 6. Pazaryeri optimizasyonu
      const integrations = await this.prisma.integration.findMany({
        where: { tenantId, isActive: true },
      });

      if (integrations.length < 2) {
        recommendations.push({
          id: `marketplace-${Date.now()}`,
          type: 'marketing',
          priority: 'medium',
          title: 'Yeni Pazaryeri Fırsatı',
          description:
            'Şu an sadece 1 pazaryerinde satış yapıyorsunuz. Yeni pazaryerleri ekleyerek müşteri tabanınızı genişletin.',
          impact: '+%40 satış potansiyeli',
          confidence: 85,
          actions: ['Entegrasyon Ekle', 'Karşılaştır'],
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Generate recommendations error: ${errorMessage}`);
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Performans skorlarını hesapla
   */
  async calculatePerformanceScores(
    tenantId: string,
  ): Promise<PerformanceScore> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { images: true, marketplaceLinks: true },
    });

    const integrations = await this.prisma.integration.findMany({
      where: { tenantId, isActive: true },
    });

    // SEO skoru
    let seoScore = 50;
    const withDescription = products.filter(
      (p) => p.description && p.description.length > 100,
    ).length;
    const withImages = products.filter(
      (p) => p.images && p.images.length > 0,
    ).length;
    seoScore += (withDescription / products.length) * 25;
    seoScore += (withImages / products.length) * 25;

    // Fiyat rekabetçiliği skoru
    const pricingScore = 75 + Math.random() * 15; // Rakip verisi olmadan mock

    // Stok sağlığı
    const inStock = products.filter((p) => p.stock > 10).length;
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= 10,
    ).length;
    const stockScore = ((inStock * 1 + lowStock * 0.5) / products.length) * 100;

    // Müşteri memnuniyeti (mock - review sistemi eklendiğinde gerçek veri)
    const customerScore = 85 + Math.random() * 10;

    // Rekabetçilik skoru
    const competitivenessScore =
      integrations.length > 0
        ? 60 + integrations.length * 10 + Math.random() * 10
        : 40;

    const overall =
      (seoScore +
        pricingScore +
        stockScore +
        customerScore +
        competitivenessScore) /
      5;

    return {
      overall: Math.round(overall),
      seo: Math.round(seoScore),
      pricing: Math.round(pricingScore),
      stockHealth: Math.round(stockScore),
      customerSatisfaction: Math.round(customerScore),
      competitiveness: Math.round(competitivenessScore),
    };
  }

  /**
   * AI ile ürün optimizasyonu
   */
  async optimizeProduct(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    const prompt = `
E-ticaret ürün optimizasyonu yap:

Mevcut Başlık: ${product.title}
Mevcut Açıklama: ${product.description || 'Yok'}
Kategori: ${product.category || 'Belirtilmemiş'}
Fiyat: ₺${product.price}

Lütfen JSON formatında şunları sağla:
{
  "optimizedTitle": "SEO uyumlu, anahtar kelime zengin başlık",
  "optimizedDescription": "Detaylı, ikna edici ürün açıklaması (en az 200 karakter)",
  "keywords": ["anahtar", "kelime", "listesi"],
  "bulletPoints": ["öne çıkan özellik 1", "öne çıkan özellik 2"],
  "seoScore": 85,
  "improvements": ["yapılan iyileştirme 1", "yapılan iyileştirme 2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = String(response.text());
      text = text.replace(/```json|```/g, '').trim();

      const optimization = JSON.parse(text) as ProductOptimizationResult;

      // AI metadata'yı güncelle
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          aiMetadata: optimization as any,
        },
      });

      return optimization;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Product optimization error: ${errorMessage}`);
      throw new Error('Ürün optimizasyonu başarısız');
    }
  }

  /**
   * Toplu ürün analizi
   */
  async bulkAnalyze(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      take: 50,
    });

    const analyses = await Promise.all(
      products.map(async (product) => {
        let score = 50;
        const issues: string[] = [];
        const suggestions: string[] = [];

        // Başlık analizi
        if (product.title.length < 30) {
          score -= 10;
          issues.push('Başlık çok kısa');
          suggestions.push('Başlığa anahtar kelimeler ekleyin');
        } else if (product.title.length > 80) {
          score -= 5;
          issues.push('Başlık çok uzun');
        } else {
          score += 10;
        }

        // Açıklama analizi
        if (!product.description) {
          score -= 20;
          issues.push('Açıklama yok');
          suggestions.push('Detaylı ürün açıklaması ekleyin');
        } else if (product.description.length < 100) {
          score -= 10;
          issues.push('Açıklama yetersiz');
          suggestions.push('Açıklamayı en az 200 karaktere çıkarın');
        } else {
          score += 15;
        }

        // Stok durumu
        if (product.stock === 0) {
          score -= 15;
          issues.push('Stok yok');
          suggestions.push('Acil stok girişi yapın');
        } else if (product.stock < 10) {
          score -= 5;
          issues.push('Düşük stok');
          suggestions.push('Stok seviyesini artırın');
        } else {
          score += 10;
        }

        return {
          productId: product.id,
          title: product.title,
          score: Math.max(0, Math.min(100, score)),
          issues,
          suggestions,
        };
      }),
    );

    const avgScore =
      analyses.reduce((s, a) => s + a.score, 0) / analyses.length;

    return {
      totalProducts: products.length,
      averageScore: Math.round(avgScore),
      analyses: analyses.sort((a, b) => a.score - b.score),
      summary: {
        excellent: analyses.filter((a) => a.score >= 80).length,
        good: analyses.filter((a) => a.score >= 60 && a.score < 80).length,
        needsWork: analyses.filter((a) => a.score >= 40 && a.score < 60).length,
        poor: analyses.filter((a) => a.score < 40).length,
      },
    };
  }

  private async getTenantContext(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
    });

    const integrations = await this.prisma.integration.findMany({
      where: { tenantId, isActive: true },
    });

    return {
      productCount: products.length,
      activeProducts: products.filter((p) => p.stock > 0).length,
      lowStockProducts: products.filter((p) => p.stock > 0 && p.stock <= 10)
        .length,
      integrations: integrations.map((i) => i.platform),
      avgPrice:
        products.reduce((s, p) => s + Number(p.price), 0) / products.length ||
        0,
    };
  }

  private async updateUsageStats(tenantId: string, tokensUsed: number) {
    // AI model kullanım istatistiklerini güncelle
    const activeModel = await this.prisma.aiModel.findFirst({
      where: { isActive: true, slug: 'gemini-flash' },
    });

    if (activeModel) {
      await this.aiModelsService.incrementUsage(
        activeModel.id,
        Math.ceil(tokensUsed / 4),
      );
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('satış') || lowerMessage.includes('artır')) {
      return `Satışlarınızı artırmak için birkaç strateji önerebilirim:

1. **Fiyat Optimizasyonu**: Rakip analizi yaparak rekabetçi fiyatlandırma uygulayın.

2. **SEO İyileştirmesi**: Ürün başlıklarınıza popüler anahtar kelimeleri ekleyin.

3. **Görsel Kalitesi**: Profesyonel ürün fotoğrafları kullanın.

4. **Çoklu Pazaryeri**: Farklı platformlarda satış yaparak erişiminizi genişletin.

Detaylı analiz için "Analiz Et" butonunu kullanabilirsiniz.`;
    }

    if (lowerMessage.includes('fiyat')) {
      return `Fiyatlandırma stratejisi için şunları öneririm:

1. Rakip fiyatlarını düzenli takip edin
2. Dinamik fiyatlandırma kuralları oluşturun
3. Kampanya dönemlerinde esnek olun
4. Kâr marjınızı koruyacak minimum fiyat belirleyin

"Fiyat Analizi" bölümünden detaylı rakip karşılaştırması yapabilirsiniz.`;
    }

    if (lowerMessage.includes('stok')) {
      return `Stok yönetimi için önerilerim:

1. Satış hızına göre optimum stok seviyesi belirleyin
2. Düşük stok uyarıları kurun
3. Tedarik sürenizi hesaba katın
4. Sezonluk dalgalanmaları önceden planlayın

"Stok Yönetimi" sayfasından otomatik uyarılar kurabilirsiniz.`;
    }

    return `Anladım! Bu konuda size yardımcı olmak için daha fazla bilgiye ihtiyacım var. 

Şu konularda detaylı analiz ve öneriler sunabilirim:
- Satış optimizasyonu
- Fiyatlandırma stratejisi
- SEO iyileştirmeleri
- Stok yönetimi
- Rakip analizi

Hangi konuda yardım almak istersiniz?`;
  }
}

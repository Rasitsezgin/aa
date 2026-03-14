/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../database/prisma.service';

// Platform bazlı kurallar
const PLATFORM_RULES: Record<
  string,
  {
    maxTitleLength: number;
    maxDescriptionLength: number;
    forbiddenPatterns: RegExp[];
    requiredElements: string[];
    tips: string[];
  }
> = {
  TRENDYOL: {
    maxTitleLength: 100,
    maxDescriptionLength: 10000,
    forbiddenPatterns: [/kampanya/i, /indirim/i, /ücretsiz kargo/i, /<[^>]+>/g],
    requiredElements: ['marka', 'ürün tipi', 'renk/beden'],
    tips: [
      'Başlık: Marka + Ürün Tipi + Özellik + Renk/Beden formatında olmalı',
      'HTML tag kullanmayın, düz metin olmalı',
      'Kampanya, indirim gibi kelimeler yasaktır',
      'En az 5 anahtar kelime kullanın',
    ],
  },
  HEPSIBURADA: {
    maxTitleLength: 150,
    maxDescriptionLength: 15000,
    forbiddenPatterns: [/<script/i, /javascript:/i],
    requiredElements: ['marka', 'model', 'özellik'],
    tips: [
      'Detaylı ürün özellikleri ile açıklama yazın',
      'Teknik özellikleri madde işaretleriyle listeleyin',
      'Marka adını başlıkta belirtin',
    ],
  },
  AMAZON: {
    maxTitleLength: 200,
    maxDescriptionLength: 2000,
    forbiddenPatterns: [/en iyi/i, /birinci/i, /<[^>]+>/g],
    requiredElements: ['marka', 'anahtar özellik', 'miktar/boyut'],
    tips: [
      'Bullet point formatında 5 temel özellik belirtin',
      'Müşteri odaklı fayda cümleleri kullanın',
      'Büyük harf kullanımını sınırlı tutun',
      'Backend keywords alanını doldurun',
    ],
  },
  N11: {
    maxTitleLength: 120,
    maxDescriptionLength: 10000,
    forbiddenPatterns: [/<script/i],
    requiredElements: ['ürün adı', 'temel özellik'],
    tips: [
      'Açık ve net başlıklar kullanın',
      'Ürün özelliklerini detaylıca yazın',
      'Arama trendlerini takip edin',
    ],
  },
  CICEKSEPETI: {
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    forbiddenPatterns: [/<script/i, /javascript:/i],
    requiredElements: ['ürün adı'],
    tips: [
      'Duygusal ve hediye odaklı açıklamalar yazın',
      'Teslimat bilgisini vurgulayın',
    ],
  },
};

@Injectable()
export class ContentAnalysisService {
  private readonly logger = new Logger(ContentAnalysisService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isAvailable: boolean = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'undefined' && apiKey !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });
        this.isAvailable = true;
      } catch {
        this.logger.warn('Failed to initialize Gemini AI for content analysis');
      }
    }
  }

  /**
   * Derinlemesine ürün içerik analizi - SEO, okunabilirlik, platform uyumu, rekabetçilik
   */
  async analyzeContent(
    tenantId: string,
    title: string,
    description: string | undefined,
    platform: string,
    productId?: string,
  ) {
    const platformRules =
      PLATFORM_RULES[platform.toUpperCase()] || PLATFORM_RULES.TRENDYOL;

    // 1. Temel metrik hesaplamaları (AI olmadan hızlı)
    const basicMetrics = this.calculateBasicMetrics(
      title,
      description || '',
      platformRules,
    );

    // 2. AI ile derinlemesine analiz
    let aiAnalysis: any = null;
    if (this.isAvailable && this.model) {
      aiAnalysis = await this.performAiAnalysis(
        title,
        description || '',
        platform,
      );
    }

    // 3. Nihai skor hesaplama
    const seoScore = aiAnalysis?.seoScore ?? basicMetrics.seoScore;
    const readabilityScore =
      aiAnalysis?.readabilityScore ?? basicMetrics.readabilityScore;
    const keywordScore = aiAnalysis?.keywordScore ?? basicMetrics.keywordScore;
    const competitivenessScore = aiAnalysis?.competitivenessScore ?? 50;
    const overallScore = Math.round(
      seoScore * 0.35 +
        readabilityScore * 0.25 +
        keywordScore * 0.25 +
        competitivenessScore * 0.15,
    );

    // 4. Tespit edilen sorunları birleştir
    const detectedIssues = [
      ...basicMetrics.issues,
      ...(aiAnalysis?.issues || []),
    ];

    const suggestions = [
      ...basicMetrics.suggestions,
      ...(aiAnalysis?.suggestions || []),
    ];

    // 5. DB'ye kaydet
    const analysis = await this.prisma.contentAnalysis.create({
      data: {
        tenantId,
        productId: productId || null,
        originalTitle: title,
        originalDescription: description || null,
        platform: platform.toUpperCase(),
        seoScore,
        readabilityScore,
        keywordScore,
        competitivenessScore,
        overallScore,
        analysisResult: aiAnalysis,
        suggestions,
        detectedKeywords:
          aiAnalysis?.keywords ||
          this.extractKeywords(title, description || ''),
        detectedIssues,
      },
    });

    return {
      id: analysis.id,
      scores: {
        overall: overallScore,
        seo: seoScore,
        readability: readabilityScore,
        keyword: keywordScore,
        competitiveness: competitivenessScore,
      },
      issues: detectedIssues,
      suggestions,
      keywords:
        aiAnalysis?.keywords || this.extractKeywords(title, description || ''),
      platformCompliance: basicMetrics.platformCompliance,
      characterAnalysis: basicMetrics.characterAnalysis,
      aiInsights: aiAnalysis?.insights || null,
    };
  }

  /**
   * Ürün ID'sine göre geçmiş analizleri getir
   */
  async getAnalysisHistory(tenantId: string, productId: string) {
    return this.prisma.contentAnalysis.findMany({
      where: { tenantId, productId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Toplu ürün analizi - birden fazla ürünü analiz et
   */
  async bulkAnalyze(tenantId: string, productIds: string[], platform: string) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, title: true, description: true },
    });

    const results: any[] = [];
    for (const product of products) {
      try {
        const result = await this.analyzeContent(
          tenantId,
          product.title,
          product.description || undefined,
          platform,
          product.id,
        );
        results.push({ productId: product.id, success: true, ...result });
      } catch (error) {
        results.push({
          productId: product.id,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      total: products.length,
      analyzed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Tenant bazlı içerik sağlığı dashboard'u
   */
  async getContentHealthDashboard(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      select: { id: true, title: true, description: true, aiMetadata: true },
    });

    const recentAnalyses = await this.prisma.contentAnalysis.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Son analizlere göre ortalama skorlar
    const avgScores =
      recentAnalyses.length > 0
        ? {
            seo: Math.round(
              recentAnalyses.reduce((s, a) => s + a.seoScore, 0) /
                recentAnalyses.length,
            ),
            readability: Math.round(
              recentAnalyses.reduce((s, a) => s + a.readabilityScore, 0) /
                recentAnalyses.length,
            ),
            keyword: Math.round(
              recentAnalyses.reduce((s, a) => s + a.keywordScore, 0) /
                recentAnalyses.length,
            ),
            overall: Math.round(
              recentAnalyses.reduce((s, a) => s + a.overallScore, 0) /
                recentAnalyses.length,
            ),
          }
        : { seo: 0, readability: 0, keyword: 0, overall: 0 };

    // Düşük skorlu ürünleri bul
    const lowScoreProducts = recentAnalyses
      .filter((a) => a.overallScore < 60 && a.productId)
      .slice(0, 10);

    // Açıklaması eksik ürünler
    const missingDescription = products.filter(
      (p) => !p.description || p.description.length < 50,
    );

    // Optimizasyon geçmişi
    const recentOptimizations = await this.prisma.contentOptimization.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        productId: true,
        platform: true,
        seoScoreBefore: true,
        seoScoreAfter: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      totalProducts: products.length,
      averageScores: avgScores,
      lowScoreCount: lowScoreProducts.length,
      lowScoreProducts,
      missingDescriptionCount: missingDescription.length,
      totalAnalyses: recentAnalyses.length,
      recentOptimizations,
      healthStatus:
        avgScores.overall >= 80
          ? 'excellent'
          : avgScores.overall >= 60
            ? 'good'
            : avgScores.overall >= 40
              ? 'needs_improvement'
              : 'critical',
    };
  }

  // ==================== PRIVATE METHODS ====================

  private calculateBasicMetrics(
    title: string,
    description: string,
    rules: (typeof PLATFORM_RULES)[string],
  ) {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Başlık uzunluk kontrolü
    const titleLength = title.length;
    const titleOk = titleLength > 20 && titleLength <= rules.maxTitleLength;
    if (titleLength < 20) {
      issues.push(
        `Başlık çok kısa (${titleLength} karakter). En az 20 karakter önerilir.`,
      );
      suggestions.push(
        'Başlığa marka adı, ürün tipi ve temel özellikler ekleyin.',
      );
    }
    if (titleLength > rules.maxTitleLength) {
      issues.push(
        `Başlık çok uzun (${titleLength}/${rules.maxTitleLength} karakter).`,
      );
      suggestions.push(
        `Başlığı ${rules.maxTitleLength} karakterin altına düşürün.`,
      );
    }

    // Açıklama uzunluk kontrolü
    const descLength = description.length;
    if (descLength < 100) {
      issues.push(
        `Açıklama çok kısa (${descLength} karakter). En az 100 karakter önerilir.`,
      );
      suggestions.push(
        'Ürün özelliklerini, faydalarını ve teknik detayları ekleyin.',
      );
    }
    if (descLength > rules.maxDescriptionLength) {
      issues.push(
        `Açıklama çok uzun (${descLength}/${rules.maxDescriptionLength} karakter).`,
      );
    }

    // Yasaklı kelime/pattern kontrolü
    const forbiddenFound: string[] = [];
    for (const pattern of rules.forbiddenPatterns) {
      const matches = (title + ' ' + description).match(pattern);
      if (matches) {
        forbiddenFound.push(...matches.slice(0, 3));
      }
    }
    if (forbiddenFound.length > 0) {
      issues.push(`Yasaklı içerik tespit edildi: ${forbiddenFound.join(', ')}`);
      suggestions.push(
        'Platform kurallarına aykırı kelime/etiketleri kaldırın.',
      );
    }

    // Platform uyumluluğu
    const platformCompliance = {
      titleLength: titleOk,
      descriptionLength:
        descLength > 100 && descLength <= rules.maxDescriptionLength,
      noForbiddenContent: forbiddenFound.length === 0,
      score: 0,
    };
    platformCompliance.score =
      ([
        platformCompliance.titleLength,
        platformCompliance.descriptionLength,
        platformCompliance.noForbiddenContent,
      ].filter(Boolean).length /
        3) *
      100;

    // Karakter analizi
    const characterAnalysis = {
      titleLength,
      maxTitleLength: rules.maxTitleLength,
      descriptionLength: descLength,
      maxDescriptionLength: rules.maxDescriptionLength,
      wordCount: description.split(/\s+/).filter(Boolean).length,
      sentenceCount: description.split(/[.!?]+/).filter(Boolean).length,
      paragraphCount: description.split(/\n\n+/).filter(Boolean).length,
      hasBulletPoints: /[•\-*]/.test(description),
      hasEmojis:
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{2600}-\u{26FF}]/u.test(
          description,
        ),
      hasUpperCase: /[A-ZÇĞIİÖŞÜ]{3,}/.test(title),
    };

    // SEO Skor hesaplama
    let seoScore = 50;
    if (titleOk) seoScore += 15;
    if (descLength >= 100) seoScore += 10;
    if (descLength >= 300) seoScore += 5;
    if (characterAnalysis.hasBulletPoints) seoScore += 5;
    if (forbiddenFound.length === 0) seoScore += 10;
    if (!characterAnalysis.hasUpperCase) seoScore += 5;
    seoScore = Math.min(100, Math.max(0, seoScore));

    // Okunabilirlik Skoru
    let readabilityScore = 50;
    const avgWordPerSentence =
      characterAnalysis.wordCount /
      Math.max(1, characterAnalysis.sentenceCount);
    if (avgWordPerSentence < 25) readabilityScore += 15;
    if (characterAnalysis.hasBulletPoints) readabilityScore += 10;
    if (characterAnalysis.paragraphCount > 1) readabilityScore += 10;
    if (characterAnalysis.hasEmojis) readabilityScore += 5;
    if (descLength >= 200 && descLength <= 3000) readabilityScore += 10;
    readabilityScore = Math.min(100, Math.max(0, readabilityScore));

    // Anahtar kelime Skoru
    let keywordScore = 40;
    const words = (title + ' ' + description).toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (uniqueWords.size > 20) keywordScore += 15;
    if (uniqueWords.size > 50) keywordScore += 10;
    // Başlıktaki kelimeler açıklamada geçiyor mu?
    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const titleWordsInDesc = titleWords.filter((w) =>
      description.toLowerCase().includes(w),
    );
    if (titleWordsInDesc.length > titleWords.length * 0.5) keywordScore += 15;
    if (titleWordsInDesc.length === titleWords.length) keywordScore += 10;
    keywordScore = Math.min(100, Math.max(0, keywordScore));

    return {
      seoScore,
      readabilityScore,
      keywordScore,
      issues,
      suggestions,
      platformCompliance,
      characterAnalysis,
    };
  }

  private async performAiAnalysis(
    title: string,
    description: string,
    platform: string,
  ) {
    if (!this.model) return null;

    const prompt = `
Sen bir e-ticaret SEO ve içerik uzmanısın. ${platform} pazaryerinde satışa sunulan ürünün içeriğini derinlemesine analiz et.

ÜRÜN BAŞLIĞI: ${title}
ÜRÜN AÇIKLAMASI: ${description || '(Açıklama yok)'}
PLATFORM: ${platform}

Aşağıdaki JSON formatında detaylı analiz döndür:
{
    "seoScore": 0-100,
    "readabilityScore": 0-100,
    "keywordScore": 0-100,
    "competitivenessScore": 0-100,
    "keywords": ["anahtar", "kelimeler"],
    "missingKeywords": ["eksik", "anahtar", "kelimeler"],
    "issues": [
        "Tespit edilen sorun 1",
        "Tespit edilen sorun 2"
    ],
    "suggestions": [
        "Yapılması gereken iyileştirme 1",
        "Yapılması gereken iyileştirme 2"
    ],
    "insights": {
        "targetAudience": "Hedef kitle tahmini",
        "toneAnalysis": "Mevcut ton analizi",
        "uniqueSellingPoints": ["USP 1", "USP 2"],
        "competitiveAdvantages": ["Avantaj 1"],
        "contentGaps": ["Eksik bilgi 1", "Eksik bilgi 2"]
    }
}

Önemli:
- ${platform} platformunun kurallarına ve algoritmasına göre analiz yap
- Türkçe pazar koşullarını dikkate al
- Rakip analiz perspektifinden değerlendir
- Arama trendlerine uygunluğu dikkate al
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('AI content analysis failed:', error);
      return null;
    }
  }

  private extractKeywords(title: string, description: string): string[] {
    const stopWords = new Set([
      've',
      'ile',
      'için',
      'bir',
      'bu',
      'da',
      'de',
      'den',
      'dan',
      'ya',
      'ye',
      'mi',
      'mu',
      'mı',
      'mü',
      'ki',
      'ne',
      'en',
      'çok',
      'gibi',
      'olan',
      'the',
      'and',
      'or',
      'for',
      'in',
      'on',
      'at',
      'to',
      'of',
      'a',
      'an',
    ]);

    const text = (title + ' ' + description).toLowerCase();
    const words = text
      .replace(/[^\wçğıöşüÇĞİÖŞÜ\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Kelime frekansı
    const freq: Record<string, number> = {};
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }

    // En sık kullanılan kelimeleri döndür
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }
}

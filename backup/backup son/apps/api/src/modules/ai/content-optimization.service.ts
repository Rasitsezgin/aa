/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../database/prisma.service';
import { ContentSyncService } from './content-sync.service';

const TONE_PROMPTS: Record<string, string> = {
  professional:
    'Profesyonel, resmi ve güven veren bir ton kullan. Teknik detaylara önem ver.',
  friendly:
    'Samimi, sıcak ve arkadaşça bir ton kullan. Emoji kullanabilirsin. Müşteriyle konuşur gibi yaz.',
  luxury:
    'Lüks, prestijli ve sofistike bir ton kullan. Ürünün değerini ve ayrıcalığını vurgula.',
  fun: 'Eğlenceli, enerjik ve dikkat çekici bir ton kullan. Emoji ve yaratıcı ifadeler kullan.',
  technical:
    'Teknik, detaylı ve bilimsel bir ton kullan. Spesifikasyonlara ve performans verilerine odaklan.',
};

@Injectable()
export class ContentOptimizationService {
  private readonly logger = new Logger(ContentOptimizationService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isAvailable: boolean = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private syncService: ContentSyncService,
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
        this.logger.warn(
          'Failed to initialize Gemini AI for content optimization',
        );
      }
    }
  }

  /**
   * Tek ürün içerik optimizasyonu - AI ile gelişmiş
   */
  async optimizeContent(
    tenantId: string,
    title: string,
    description: string | undefined,
    platform: string,
    options: {
      tone?: string;
      productId?: string;
      analysisId?: string;
      keywords?: string[];
      category?: string;
      templateId?: string;
    } = {},
  ) {
    const tone = options.tone || 'professional';

    // Template varsa kullan
    let templatePrompt = '';
    if (options.templateId) {
      const template = await this.prisma.contentTemplate.findUnique({
        where: { id: options.templateId },
      });
      if (template?.promptTemplate) {
        templatePrompt = `\nÖzel Şablon Talimatları: ${template.promptTemplate}`;
        await this.prisma.contentTemplate.update({
          where: { id: options.templateId },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    // Platform kurallarını yükle
    const customRules = await this.prisma.contentRule.findMany({
      where: { tenantId, platform: platform.toUpperCase(), isActive: true },
    });

    const customRulesText =
      customRules.length > 0
        ? '\nÖzel Kurallar:\n' +
          customRules
            .map((r) => `- ${r.ruleName}: ${JSON.stringify(r.ruleValue)}`)
            .join('\n')
        : '';

    // AI optimizasyonu
    const optimizationResult = await this.performOptimization(
      title,
      description || '',
      platform,
      tone,
      options.keywords || [],
      options.category || '',
      templatePrompt + customRulesText,
    );

    if (!optimizationResult) {
      throw new Error('AI optimization failed. Please try again.');
    }

    // Versiyon numarasını hesapla
    let version = 1;
    if (options.productId) {
      const lastOpt = await this.prisma.contentOptimization.findFirst({
        where: { productId: options.productId, tenantId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      if (lastOpt) version = lastOpt.version + 1;
    }

    // DB'ye kaydet
    const optimization = await this.prisma.contentOptimization.create({
      data: {
        tenantId,
        productId: options.productId || null,
        analysisId: options.analysisId || null,
        platform: platform.toUpperCase(),
        version,
        originalTitle: title,
        originalDescription: description || null,
        optimizedTitle: optimizationResult.optimizedTitle,
        optimizedDescription: optimizationResult.optimizedDescription,
        keywords: optimizationResult.keywords,
        seoScoreBefore: optimizationResult.seoScoreBefore || 0,
        seoScoreAfter: optimizationResult.seoScoreAfter,
        improvements: optimizationResult.improvements,
        tone,
        status: 'draft',
        aiModelUsed: 'gemini-1.5-flash',
      },
    });

    return {
      id: optimization.id,
      version,
      optimizedTitle: optimizationResult.optimizedTitle,
      optimizedDescription: optimizationResult.optimizedDescription,
      keywords: optimizationResult.keywords,
      seoScoreBefore: optimizationResult.seoScoreBefore,
      seoScoreAfter: optimizationResult.seoScoreAfter,
      improvements: optimizationResult.improvements,
      tone,
      platform,
      status: 'draft',
    };
  }

  /**
   * AI ile ürün açıklaması oluşturma (sıfırdan)
   */
  async generateDescription(
    tenantId: string,
    productName: string,
    platform: string,
    tone: string,
    options: {
      keywords?: string[];
      category?: string;
      features?: string[];
      templateId?: string;
    } = {},
  ) {
    if (!this.isAvailable || !this.model) {
      throw new Error(
        'AI service is not configured. Please set GEMINI_API_KEY.',
      );
    }

    let templateGuidance = '';
    if (options.templateId) {
      const template = await this.prisma.contentTemplate.findUnique({
        where: { id: options.templateId },
      });
      if (template) {
        templateGuidance = `
Şablon Adı: ${template.name}
${template.titleTemplate ? `Başlık Şablonu: ${template.titleTemplate}` : ''}
${template.descriptionTemplate ? `Açıklama Şablonu: ${template.descriptionTemplate}` : ''}
${template.promptTemplate ? `Ek Talimatlar: ${template.promptTemplate}` : ''}`;
        await this.prisma.contentTemplate.update({
          where: { id: options.templateId },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const prompt = `
Sen bir e-ticaret içerik uzmanısın. Aşağıdaki ürün için ${platform} pazaryerine uygun, SEO optimizasyonlu, satışı artıran bir başlık ve açıklama oluştur.

ÜRÜN ADI: ${productName}
PLATFORM: ${platform}
${options.keywords?.length ? `ANAHTAR KELİMELER: ${options.keywords.join(', ')}` : ''}
${options.category ? `KATEGORİ: ${options.category}` : ''}
${options.features?.length ? `ÖZELLİKLER: ${options.features.join(', ')}` : ''}

TON: ${TONE_PROMPTS[tone] || TONE_PROMPTS.professional}

${templateGuidance}

KURALLAR:
- ${platform} platformunun SEO algoritmasına uygun yaz
- Başlık ilgi çekici, anahtar kelimeleri barındıran ve platform kurallarına uygun olmalı
- Açıklama ikna edici, detaylı, faydaları vurgulayan olmalı
- Madde işaretleri, emoji ve yapısal formatlama kullan
- Türk tüketicisinin beklentilerini yansıt
- HTML tag kullanma, sadece düz metin ve unicode formatı kullan

JSON formatında döndür:
{
    "title": "Optimize edilmiş başlık",
    "description": "Detaylı, SEO uyumlu açıklama",
    "keywords": ["anahtar", "kelimeler"],
    "seoScore": 0-100,
    "highlights": ["Öne çıkan özellik 1", "Öne çıkan özellik 2"],
    "callToAction": "Harekete geçirici mesaj"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('AI description generation failed:', error);
      throw new Error('Failed to generate description');
    }
  }

  /**
   * Optimizasyon onaylama ve ürüne uygulama
   */
  async applyOptimization(
    tenantId: string,
    optimizationId: string,
    syncToPlatform: boolean = false,
  ) {
    const optimization = await this.prisma.contentOptimization.findFirst({
      where: { id: optimizationId, tenantId },
    });

    if (!optimization) {
      throw new NotFoundException('Optimization not found');
    }

    // Ürünü güncelle
    if (optimization.productId) {
      await this.prisma.product.update({
        where: { id: optimization.productId },
        data: {
          title: optimization.optimizedTitle,
          description: optimization.optimizedDescription,
          aiMetadata: {
            lastOptimizationId: optimization.id,
            lastOptimizedAt: new Date().toISOString(),
            seoScore: optimization.seoScoreAfter,
            keywords: optimization.keywords,
            platform: optimization.platform,
          },
        },
      });
    }

    // Optimizasyon durumunu güncelle
    await this.prisma.contentOptimization.update({
      where: { id: optimizationId },
      data: {
        status: 'applied',
        appliedAt: new Date(),
      },
    });

    // Platform'a gönder
    let syncResult: any = null;
    if (syncToPlatform && optimization.productId) {
      try {
        syncResult = await this.syncService.syncToMarketplace(
          optimization.productId,
          optimization.platform,
          {
            title: optimization.optimizedTitle,
            description: optimization.optimizedDescription,
          },
        );
        await this.prisma.contentOptimization.update({
          where: { id: optimizationId },
          data: {
            syncedToPlatform: true,
            syncResult,
          },
        });
      } catch (error) {
        this.logger.error('Marketplace sync failed:', error);
        syncResult = { success: false, error: (error as Error).message };
      }
    }

    return {
      success: true,
      applied: true,
      synced: syncToPlatform ? syncResult?.success || false : false,
      syncResult,
    };
  }

  /**
   * Toplu optimizasyon onaylama
   */
  async bulkApplyOptimizations(
    tenantId: string,
    optimizationIds: string[],
    syncToPlatform: boolean = false,
  ) {
    const results: any[] = [];
    for (const id of optimizationIds) {
      try {
        const result = await this.applyOptimization(
          tenantId,
          id,
          syncToPlatform,
        );
        results.push({ optimizationId: id, ...result });
      } catch (error) {
        results.push({
          optimizationId: id,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      total: optimizationIds.length,
      applied: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Toplu ürün optimizasyonu - batch job olarak
   */
  async createBatchOptimization(
    tenantId: string,
    name: string,
    productIds: string[],
    platform: string,
    tone: string = 'professional',
    config?: any,
  ) {
    // Batch job oluştur
    const batchJob = await this.prisma.contentBatchJob.create({
      data: {
        tenantId,
        name,
        platform: platform.toUpperCase(),
        tone,
        status: 'pending',
        totalProducts: productIds.length,
        config: config || {},
      },
    });

    // Batch öğelerini oluştur
    await this.prisma.contentBatchItem.createMany({
      data: productIds.map((pid) => ({
        batchJobId: batchJob.id,
        productId: pid,
        status: 'pending',
      })),
    });

    // Asenkron olarak işlemeye başla
    this.processBatchJob(batchJob.id, tenantId, platform, tone, config).catch(
      (err) => this.logger.error(`Batch job ${batchJob.id} failed:`, err),
    );

    return {
      id: batchJob.id,
      name,
      status: 'pending',
      totalProducts: productIds.length,
    };
  }

  /**
   * Batch job durumunu getir
   */
  async getBatchJobStatus(tenantId: string, jobId: string) {
    const job = await this.prisma.contentBatchJob.findFirst({
      where: { id: jobId, tenantId },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true } },
            optimization: {
              select: {
                id: true,
                seoScoreBefore: true,
                seoScoreAfter: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Batch job not found');
    }

    return job;
  }

  /**
   * Tenant'ın tüm batch job'larını listele
   */
  async listBatchJobs(tenantId: string) {
    return this.prisma.contentBatchJob.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Optimizasyon geçmişini getir
   */
  async getOptimizationHistory(tenantId: string, productId?: string) {
    return this.prisma.contentOptimization.findMany({
      where: {
        tenantId,
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  async createTemplate(tenantId: string, data: any) {
    return this.prisma.contentTemplate.create({
      data: { tenantId, ...data },
    });
  }

  async updateTemplate(tenantId: string, templateId: string, data: any) {
    const template = await this.prisma.contentTemplate.findFirst({
      where: { id: templateId, tenantId },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.contentTemplate.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(tenantId: string, templateId: string) {
    const template = await this.prisma.contentTemplate.findFirst({
      where: { id: templateId, tenantId },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.contentTemplate.delete({ where: { id: templateId } });
  }

  async listTemplates(tenantId: string) {
    return this.prisma.contentTemplate.findMany({
      where: { tenantId },
      orderBy: [{ isDefault: 'desc' }, { usageCount: 'desc' }],
    });
  }

  // ==================== CONTENT RULES ====================

  async createRule(tenantId: string, data: any) {
    return this.prisma.contentRule.create({
      data: { tenantId, ...data },
    });
  }

  async listRules(tenantId: string, platform?: string) {
    return this.prisma.contentRule.findMany({
      where: {
        tenantId,
        ...(platform ? { platform: platform.toUpperCase() } : {}),
      },
    });
  }

  async deleteRule(tenantId: string, ruleId: string) {
    const rule = await this.prisma.contentRule.findFirst({
      where: { id: ruleId, tenantId },
    });
    if (!rule) throw new NotFoundException('Rule not found');

    return this.prisma.contentRule.delete({ where: { id: ruleId } });
  }

  // ==================== PRIVATE METHODS ====================

  private async processBatchJob(
    jobId: string,
    tenantId: string,
    platform: string,
    tone: string,
    config?: any,
  ) {
    await this.prisma.contentBatchJob.update({
      where: { id: jobId },
      data: { status: 'processing', startedAt: new Date() },
    });

    const items = await this.prisma.contentBatchItem.findMany({
      where: { batchJobId: jobId },
      include: { product: true },
    });

    let successCount = 0;
    let failCount = 0;
    let totalScoreBefore = 0;
    let totalScoreAfter = 0;

    for (const item of items) {
      try {
        await this.prisma.contentBatchItem.update({
          where: { id: item.id },
          data: { status: 'processing' },
        });

        // Yüksek skorlu ürünleri atla
        if (config?.skipHighScore && config?.minScoreThreshold) {
          const existing = item.product.aiMetadata as any;
          if (existing?.seoScore >= config.minScoreThreshold) {
            await this.prisma.contentBatchItem.update({
              where: { id: item.id },
              data: { status: 'completed' },
            });
            successCount++;
            continue;
          }
        }

        const result = await this.optimizeContent(
          tenantId,
          item.product.title,
          item.product.description || undefined,
          platform,
          { tone, productId: item.productId },
        );

        await this.prisma.contentBatchItem.update({
          where: { id: item.id },
          data: { status: 'completed', optimizationId: result.id },
        });

        totalScoreBefore += result.seoScoreBefore || 0;
        totalScoreAfter += result.seoScoreAfter || 0;
        successCount++;

        // Otomatik uygula
        if (config?.autoApply) {
          await this.applyOptimization(
            tenantId,
            result.id,
            config?.autoSync || false,
          );
        }
      } catch (error) {
        failCount++;
        await this.prisma.contentBatchItem.update({
          where: { id: item.id },
          data: { status: 'failed', errorMessage: (error as Error).message },
        });
      }

      // İlerlemeyi güncelle
      await this.prisma.contentBatchJob.update({
        where: { id: jobId },
        data: { processedProducts: { increment: 1 } },
      });
    }

    // Tamamla
    await this.prisma.contentBatchJob.update({
      where: { id: jobId },
      data: {
        status: failCount === items.length ? 'failed' : 'completed',
        successCount,
        failCount,
        avgScoreBefore:
          successCount > 0 ? Math.round(totalScoreBefore / successCount) : 0,
        avgScoreAfter:
          successCount > 0 ? Math.round(totalScoreAfter / successCount) : 0,
        completedAt: new Date(),
      },
    });

    this.logger.log(
      `Batch job ${jobId} completed: ${successCount} success, ${failCount} failed`,
    );
  }

  private async performOptimization(
    title: string,
    description: string,
    platform: string,
    tone: string,
    keywords: string[],
    category: string,
    additionalInstructions: string,
  ) {
    if (!this.isAvailable || !this.model) {
      throw new Error(
        'AI service is not configured. Please set GEMINI_API_KEY.',
      );
    }

    const prompt = `
Sen bir e-ticaret SEO uzmanısın. Aşağıdaki ürün içeriğini ${platform} platformu için optimize et.

MEVCUT BAŞLIK: ${title}
MEVCUT AÇIKLAMA: ${description || '(Açıklama yok)'}
PLATFORM: ${platform}
${keywords.length ? `HEDEF ANAHTAR KELİMELER: ${keywords.join(', ')}` : ''}
${category ? `KATEGORİ: ${category}` : ''}

TON: ${TONE_PROMPTS[tone] || TONE_PROMPTS.professional}

${additionalInstructions}

KURALLAR:
- Mevcut içeriğin iyi yanlarını koru, zayıf yanlarını güçlendir
- ${platform} platformunun arama algoritmasına uygun, keşfedilebilir bir başlık oluştur
- Açıklamayı ikna edici, detaylı ve faydaları vurgulayan şekilde yeniden yaz
- Madde işaretleri ve yapısal formatlama kullan
- Anahtar kelimeleri doğal bir şekilde içeriğe yerleştir
- Platform karakter limitlerini aşma
- HTML tag kullanma

JSON formatında döndür:
{
    "optimizedTitle": "...",
    "optimizedDescription": "...",
    "keywords": ["anahtar", "kelime", "listesi"],
    "seoScoreBefore": 0-100,
    "seoScoreAfter": 0-100,
    "improvements": ["İyileştirme 1", "İyileştirme 2", "İyileştirme 3"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('AI optimization failed:', error);
      return null;
    }
  }
}

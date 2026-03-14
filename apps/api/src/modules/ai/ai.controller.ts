/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiImageService } from './image/ai-image.service';
import { AiImageGenerationService } from './image/ai-image-generation.service';
import { ContentSyncService } from './content-sync.service';
import { ContentAnalysisService } from './content-analysis.service';
import { ContentOptimizationService } from './content-optimization.service';
import { SatisPilotuService } from './satis-pilotu.service';
import { AiStudioService } from './ai-studio.service';
import { UserBriefingService } from './user-briefing.service';
import type { LifestyleRequest } from './ai-studio.service';
import { AnomalyDetectionService } from '../system/anomaly-detection.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import {
  AnalyzeContentDto,
  OptimizeContentDto,
  BatchOptimizeDto,
  ApplyOptimizationDto,
  BulkApplyOptimizationsDto,
  GenerateDescriptionDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateContentRuleDto,
} from './dto';

@Controller('ai')
@UseGuards(CanAccessModuleGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiImageService: AiImageService,
    private readonly aiImageGenService: AiImageGenerationService,
    private readonly syncService: ContentSyncService,
    private readonly contentAnalysis: ContentAnalysisService,
    private readonly contentOptimization: ContentOptimizationService,
    private readonly satisPilotu: SatisPilotuService,
    private readonly anomalyDetection: AnomalyDetectionService,
    private readonly aiStudio: AiStudioService,
    private readonly briefingService: UserBriefingService,
  ) {}

  // ==================== MEVCUT ENDPOINTS ====================
  // ... (rest of endpoints) ...

  @Post('sync-content')
  async syncContent(
    @Body() body: { productId: string; platform: string; data: any },
  ) {
    return this.syncService.syncToMarketplace(
      body.productId,
      body.platform,
      body.data,
    );
  }

  @Post('generate-image')
  @RequireModule('IMAGE_AI')
  async generateImage(
    @Body()
    body: {
      prompt: string;
      size?: '256x256' | '512x512' | '1024x1024';
    },
  ) {
    return {
      url: await this.aiImageGenService.generateImage(body.prompt, body.size),
    };
  }

  @Post('analyze-content')
  @RequireModule('AI_CONTENT')
  async analyzeContent(@Body() body: { title: string; description: string }) {
    return this.aiService.analyzeProductContent(body.title, body.description);
  }

  @Post('analyze-competitor')
  @RequireModule('COMPETITOR_ANALYSIS')
  async analyzeCompetitor(
    @Body() body: { productInfo: string; competitorInfo: string },
  ) {
    return this.aiService.analyzeCompetitor(
      body.productInfo,
      body.competitorInfo,
    );
  }

  @Post('remove-bg')
  @RequireModule('IMAGE_AI')
  async removeBg(@Body() body: { imageUrl: string }) {
    return { url: await this.aiImageService.removeBackground(body.imageUrl) };
  }

  @Post('upscale')
  @RequireModule('IMAGE_AI')
  async upscale(@Body() body: { imageUrl: string }) {
    return { url: await this.aiImageService.upscale(body.imageUrl) };
  }

  @Post('optimize-content')
  @RequireModule('AI_CONTENT')
  async optimizeContent(
    @Body() body: { title: string; description: string; platform: string },
  ) {
    return this.aiService.optimizeProductContent(
      body.title,
      body.description,
      body.platform,
    );
  }

  // ==================== GELİŞMİŞ İÇERİK ANALİZİ ====================

  @Post('content/analyze')
  @RequireModule('AI_CONTENT')
  async deepAnalyzeContent(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: AnalyzeContentDto,
  ) {
    return this.contentAnalysis.analyzeContent(
      tenantId,
      dto.title,
      dto.description,
      dto.platform || 'TRENDYOL',
      dto.productId,
    );
  }

  @Post('content/bulk-analyze')
  @RequireModule('AI_CONTENT')
  async bulkAnalyzeContent(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { productIds: string[]; platform: string },
  ) {
    return this.contentAnalysis.bulkAnalyze(
      tenantId,
      body.productIds,
      body.platform,
    );
  }

  @Get('content/health')
  @RequireModule('AI_CONTENT')
  async getContentHealth(@Headers('x-tenant-id') tenantId: string) {
    return this.contentAnalysis.getContentHealthDashboard(tenantId);
  }

  @Get('content/analysis-history/:productId')
  @RequireModule('AI_CONTENT')
  async getAnalysisHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.contentAnalysis.getAnalysisHistory(tenantId, productId);
  }

  // ==================== GELİŞMİŞ İÇERİK OPTİMİZASYONU ====================

  @Post('content/optimize')
  @RequireModule('AI_CONTENT')
  async deepOptimizeContent(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: OptimizeContentDto,
  ) {
    return this.contentOptimization.optimizeContent(
      tenantId,
      dto.title,
      dto.description,
      dto.platform,
      {
        tone: dto.tone,
        productId: dto.productId,
        keywords: dto.keywords,
        category: dto.category,
        templateId: dto.templateId,
      },
    );
  }

  @Post('content/generate-description')
  @RequireModule('AI_CONTENT')
  async generateDescription(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: GenerateDescriptionDto,
  ) {
    return this.contentOptimization.generateDescription(
      tenantId,
      dto.productName,
      dto.platform,
      dto.tone,
      {
        keywords: dto.keywords,
        category: dto.category,
        features: dto.features,
        templateId: dto.templateId,
      },
    );
  }

  @Post('content/apply')
  @RequireModule('AI_CONTENT')
  async applyOptimization(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: ApplyOptimizationDto,
  ) {
    return this.contentOptimization.applyOptimization(
      tenantId,
      dto.optimizationId,
      dto.syncToPlatform,
    );
  }

  @Post('content/bulk-apply')
  @RequireModule('AI_CONTENT')
  async bulkApplyOptimizations(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BulkApplyOptimizationsDto,
  ) {
    return this.contentOptimization.bulkApplyOptimizations(
      tenantId,
      dto.optimizationIds,
      dto.syncToPlatform,
    );
  }

  @Get('content/optimization-history')
  @RequireModule('AI_CONTENT')
  async getOptimizationHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Query('productId') productId?: string,
  ) {
    return this.contentOptimization.getOptimizationHistory(tenantId, productId);
  }

  // ==================== BATCH OPTİMİZASYON ====================

  @Post('content/batch')
  @RequireModule('AI_CONTENT')
  async createBatchOptimization(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: BatchOptimizeDto,
  ) {
    return this.contentOptimization.createBatchOptimization(
      tenantId,
      dto.name,
      dto.productIds,
      dto.platform,
      dto.tone,
      dto.config,
    );
  }

  @Get('content/batch')
  @RequireModule('AI_CONTENT')
  async listBatchJobs(@Headers('x-tenant-id') tenantId: string) {
    return this.contentOptimization.listBatchJobs(tenantId);
  }

  @Get('content/batch/:jobId')
  @RequireModule('AI_CONTENT')
  async getBatchJobStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.contentOptimization.getBatchJobStatus(tenantId, jobId);
  }

  // ==================== ŞABLONLAR ====================

  @Post('content/templates')
  @RequireModule('AI_CONTENT')
  async createTemplate(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.contentOptimization.createTemplate(tenantId, dto);
  }

  @Get('content/templates')
  @RequireModule('AI_CONTENT')
  async listTemplates(@Headers('x-tenant-id') tenantId: string) {
    return this.contentOptimization.listTemplates(tenantId);
  }

  @Put('content/templates/:id')
  @RequireModule('AI_CONTENT')
  async updateTemplate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.contentOptimization.updateTemplate(tenantId, id, dto);
  }

  @Delete('content/templates/:id')
  @RequireModule('AI_CONTENT')
  async deleteTemplate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contentOptimization.deleteTemplate(tenantId, id);
  }

  // ==================== İÇERİK KURALLARI ====================

  @Post('content/rules')
  @RequireModule('AI_CONTENT')
  async createRule(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateContentRuleDto,
  ) {
    return this.contentOptimization.createRule(tenantId, dto);
  }

  @Get('content/rules')
  @RequireModule('AI_CONTENT')
  async listRules(
    @Headers('x-tenant-id') tenantId: string,
    @Query('platform') platform?: string,
  ) {
    return this.contentOptimization.listRules(tenantId, platform);
  }

  @Delete('content/rules/:id')
  @RequireModule('AI_CONTENT')
  async deleteRule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.contentOptimization.deleteRule(tenantId, id);
  }

  // ==================== YORUM YANIT ÜRETECI ====================

  /**
   * POST /ai/review-reply
   * Müşteri yorumu için AI destekli kişiselleştirilmiş yanıt üret
   */
  @Post('review-reply')
  @RequireModule('AI_CONTENT')
  async generateReviewReply(
    @Headers('x-tenant-id') _tenantId: string,
    @Body()
    body: {
      rating: number;
      comment: string;
      product?: string;
      platform?: string;
    },
  ) {
    const toneMap: Record<number, string> = {
      5: 'minnettarlık ve mutluluk dolu, samimi',
      4: 'teşekkür edici ve yapıcı',
      3: 'anlayışlı ve çözüm odaklı',
      2: 'özür dileyen ve yardım teklif eden',
      1: 'içtenlikle özür dileyen ve hızlı çözüm vaat eden',
    };
    const tone = toneMap[body.rating] || toneMap[3];

    try {
      const result = await this.aiService.generateReplyDraft(
        body.comment,
        `Ton: ${tone}, Platform: ${body.platform || 'Pazaryeri'}, Ürün: ${body.product || 'ürünümüz'}, Puan: ${body.rating}/5`,
      );
      const reply =
        typeof result === 'string' ? result : (result?.draft ?? result);
      return { reply };
    } catch {
      const fallbacks: Record<number, string> = {
        5: 'Harika yorumunuz için çok teşekkür ederiz! Memnuniyetiniz bizim için her şeyden değerli. Tekrar görüşmek dileğiyle 🙏',
        4: 'Güzel geri bildiriminiz için teşekkür ederiz! Daha iyi olabilmek için yorumlarınızı dikkate alıyoruz.',
        3: 'Değerli yorumunuz için teşekkür ederiz. Deneyiminizi nasıl iyileştirebileceğimizi öğrenmek isteriz.',
        2: 'Yaşadığınız olumsuz deneyim için özür dileriz. Sizi memnun etmek için buradayız, lütfen bize ulaşın.',
        1: 'Yaşadığınız sorun için içtenlikle özür dileriz. Ekibimiz durumu çözmek için sizinle iletişime geçecektir.',
      };
      return { reply: fallbacks[body.rating] || fallbacks[3] };
    }
  }

  // ==================== SATIŞ PİLOTU (AUTONOMOUS AGENT) ====================

  /**
   * POST /ai/satis-pilotu/run
   * Otonom anomali kontrolünü ve aksiyoner döngüyü başlat
   */
  @Post('satis-pilotu/run')
  @RequireModule('AUTOMATION')
  async runSatisPilotu(@Headers('x-tenant-id') tenantId: string) {
    // 1. Önce güncel anomalileri tespit et
    const anomalies = await this.anomalyDetection.checkAllAnomalies(tenantId);

    // 2. Satış Pilotu bu anomalileri işlesin ve otonom aksiyonlar alsın
    const actions = await this.satisPilotu.processAnomalies(
      tenantId,
      anomalies,
    );

    return {
      processedAnomalies: anomalies.length,
      launchedActions: actions.length,
      actions: actions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /ai/satis-pilotu/history
   * Ajanın son aktivitelerini listele
   */
  @Get('satis-pilotu/history')
  @RequireModule('AUTOMATION')
  async getAgentHistory(@Headers('x-tenant-id') tenantId: string) {
    // ActivityLog tablosundan ajana ait olanları getir
    // (PrismaService üzerinden doğrudan controller'da query atmak yerine service'e de taşınabilir)
    return this.satisPilotu['prisma'].activityLog.findMany({
      where: {
        tenantId,
        resource: 'ai_agent',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ==================== AI BRIEFING ====================

  @Get('briefing')
  async getBriefing(@Headers('x-tenant-id') tenantId: string) {
    return this.briefingService.generateDailyBriefing(tenantId || 'default');
  }

  // ==================== AI STUDIO 2.0 ====================

  /**
   * POST /ai/studio/lifestyle
   * Create a premium lifestyle image from a product photo
   */
  @Post('studio/lifestyle')
  @RequireModule('AI_CONTENT')
  async generateLifestyle(@Body() dto: LifestyleRequest) {
    return { url: await this.aiStudio.generateLifestyleImage(dto) };
  }

  /**
   * POST /ai/studio/video-short
   * Generate a promotional video concept/script for a product
   */
  @Post('studio/video-short')
  @RequireModule('AI_CONTENT')
  async generateVideoShort(@Body() body: { productId: string }) {
    return this.aiStudio.generateVideoShort(body.productId);
  }
}

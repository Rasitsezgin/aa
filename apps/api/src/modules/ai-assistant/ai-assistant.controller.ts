import { Controller, Post, Get, Delete, Put, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { AIAssistantService, AIAssistantConversation } from './ai-assistant.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { AILearningService } from './services/ai-learning.service';
import { AIPredictiveService } from './services/ai-predictive.service';
import { AISmartIntentService } from './services/ai-smart-intent.service';
import { PrismaService } from '../../database/prisma.service';

interface ChatMessageDto {
  content: string;
  conversationId?: string;
}

interface CreateConversationDto {
  title?: string;
}

@Controller('ai-assistant')
@UseGuards(CanAccessModuleGuard)
export class AIAssistantController {
  constructor(
    private readonly assistantService: AIAssistantService,
    private readonly learningService: AILearningService,
    private readonly predictiveService: AIPredictiveService,
    private readonly smartIntent: AISmartIntentService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== CONVERSATIONS ====================

  @Post('conversations')
  @RequireModule('AI_ASSISTANT')
  async createConversation(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateConversationDto,
  ): Promise<AIAssistantConversation> {
    return this.assistantService.createConversation(tenantId, userId, dto.title);
  }

  @Get('conversations')
  @RequireModule('AI_ASSISTANT')
  async getConversations(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: string,
  ): Promise<AIAssistantConversation[]> {
    return this.assistantService.getConversations(
      tenantId,
      userId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('conversations/:id')
  @RequireModule('AI_ASSISTANT')
  async getConversation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') conversationId: string,
  ): Promise<AIAssistantConversation | null> {
    return this.assistantService.getConversation(conversationId, tenantId);
  }

  @Put('conversations/:id/title')
  @RequireModule('AI_ASSISTANT')
  async updateConversationTitle(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') conversationId: string,
    @Body() dto: { title: string },
  ): Promise<void> {
    await this.assistantService.updateConversationTitle(conversationId, tenantId, dto.title);
  }

  @Put('conversations/:id/archive')
  @RequireModule('AI_ASSISTANT')
  async archiveConversation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') conversationId: string,
  ): Promise<void> {
    await this.assistantService.archiveConversation(conversationId, tenantId);
  }

  @Delete('conversations/:id')
  @RequireModule('AI_ASSISTANT')
  async deleteConversation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') conversationId: string,
  ): Promise<void> {
    await this.assistantService.deleteConversation(conversationId, tenantId);
  }

  // ==================== CHAT ====================

  @Post('chat')
  @RequireModule('AI_ASSISTANT')
  async sendMessage(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: ChatMessageDto,
  ) {
    let conversationId = dto.conversationId;

    // Create new conversation if not provided
    if (!conversationId) {
      const conversation = await this.assistantService.createConversation(
        tenantId,
        userId,
        'Yeni Konuşma',
      );
      conversationId = conversation.id;
    }

    const response = await this.assistantService.sendMessage(
      conversationId,
      tenantId,
      userId,
      dto.content,
    );

    return {
      conversationId,
      message: response,
    };
  }

  // ==================== QUICK ACTIONS ====================

  @Post('quick/brand-sync')
  @RequireModule('AI_ASSISTANT')
  async quickBrandSync(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: { platform: string },
  ) {
    const conversation = await this.assistantService.createConversation(
      tenantId,
      userId,
      `Marka Eşitleme - ${dto.platform}`,
    );

    const response = await this.assistantService.sendMessage(
      conversation.id,
      tenantId,
      userId,
      `${dto.platform} pazaryerinden markaları eşitle`,
    );

    return {
      conversationId: conversation.id,
      message: response,
    };
  }

  @Post('quick/category-sync')
  @RequireModule('AI_ASSISTANT')
  async quickCategorySync(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: { platform: string },
  ) {
    const conversation = await this.assistantService.createConversation(
      tenantId,
      userId,
      `Kategori Eşitleme - ${dto.platform}`,
    );

    const response = await this.assistantService.sendMessage(
      conversation.id,
      tenantId,
      userId,
      `${dto.platform} pazaryerinden kategorileri eşitle`,
    );

    return {
      conversationId: conversation.id,
      message: response,
    };
  }

  @Post('quick/product-upload')
  @RequireModule('AI_ASSISTANT')
  async quickProductUpload(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: { platform: string; productId?: string; sku?: string },
  ) {
    const conversation = await this.assistantService.createConversation(
      tenantId,
      userId,
      `Ürün Yükleme - ${dto.platform}`,
    );

    let message = `${dto.platform} pazaryerine ürün yükle`;
    if (dto.sku) {
      message += ` SKU: ${dto.sku}`;
    } else if (dto.productId) {
      message += ` Ürün ID: ${dto.productId}`;
    }

    const response = await this.assistantService.sendMessage(
      conversation.id,
      tenantId,
      userId,
      message,
    );

    return {
      conversationId: conversation.id,
      message: response,
    };
  }

  // ==================== SMART FEATURES ====================

  @Get('insights/patterns')
  @RequireModule('AI_ASSISTANT')
  async getUserPatterns(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.learningService.detectPatterns(tenantId, userId);
  }

  @Get('insights/suggestions')
  @RequireModule('AI_ASSISTANT')
  async getPredictiveSuggestions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const [nextActions, alerts, optimizations] = await Promise.all([
      this.predictiveService.predictNextActions(tenantId, userId),
      this.predictiveService.generateProactiveAlerts(tenantId, userId),
      this.predictiveService.generateOptimizations(tenantId, userId),
    ]);

    return {
      nextActions,
      alerts,
      optimizations,
    };
  }

  @Get('insights/preferences')
  @RequireModule('AI_ASSISTANT')
  async getUserPreferences(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('category') category?: string,
  ) {
    if (category) {
      return this.learningService.getPreferencesByCategory(tenantId, userId, category);
    }
    
    const [platforms, actions] = await Promise.all([
      this.learningService.getPreferencesByCategory(tenantId, userId, 'platforms'),
      this.learningService.getPreferencesByCategory(tenantId, userId, 'actions'),
    ]);

    return {
      platforms,
      actions,
    };
  }

  @Post('feedback')
  @RequireModule('AI_ASSISTANT')
  async submitFeedback(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: {
      actionType: string;
      actionData: any;
      feedbackType: 'positive' | 'negative' | 'correction' | 'ignore';
      feedbackText?: string;
      correction?: any;
    },
  ) {
    await this.learningService.recordFeedback(tenantId, userId, dto);
    return { success: true };
  }

  @Get('intent/analyze')
  @RequireModule('AI_ASSISTANT')
  async analyzeIntent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('message') message: string,
  ) {
    return this.smartIntent.detectIntent(message, tenantId, userId);
  }

  @Get('learning/history')
  @RequireModule('AI_ASSISTANT')
  async getLearningHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.prisma.aILearningLog.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('preferences/set')
  @RequireModule('AI_ASSISTANT')
  async setUserPreference(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: {
      category: string;
      key: string;
      value: any;
    },
  ) {
    await this.learningService.learnPreference(tenantId, userId, {
      category: dto.category,
      key: dto.key,
      value: dto.value,
      confidence: 0.95,
      learnedFrom: 'explicit',
    });
    return { success: true };
  }
}

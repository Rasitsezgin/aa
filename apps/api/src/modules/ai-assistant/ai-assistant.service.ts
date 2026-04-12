/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  MarketplaceService,
  Platform,
} from '../marketplace/marketplace.service';
import { AIAssistantGateway } from './ai-assistant.gateway';
import { AiService } from '../ai/ai.service';
import { AIContextMemoryService } from './services/ai-context-memory.service';
import { AISmartIntentService } from './services/ai-smart-intent.service';
import { AILearningService } from './services/ai-learning.service';
import { AIPredictiveService } from './services/ai-predictive.service';
import { AIAssistantMarketplaceIntegrationService } from './services/ai-marketplace-integration.service';

export interface AIAssistantContext {
  tenantId: string;
  userId: string;
  platform?: string;
  conversationId?: string;
}

export interface AIAssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    data?: any;
    status?: 'pending' | 'completed' | 'failed';
    suggestions?: any[];
    insights?: string[];
    followUpSuggestions?: string[];
  };
}

export interface AIAssistantConversation {
  id: string;
  tenantId: string;
  userId: string;
  title?: string;
  messages: AIAssistantMessage[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantAction {
  type:
    | 'BRAND_SYNC'
    | 'CATEGORY_SYNC'
    | 'ATTRIBUTE_SYNC'
    | 'PRODUCT_UPLOAD'
    | 'VARIANT_MANAGE'
    | 'BULK_UPLOAD'
    | 'GENERAL';
  payload: any;
  platform?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

@Injectable()
export class AIAssistantService {
  private readonly logger = new Logger(AIAssistantService.name);

  constructor(
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
    private aiService: AiService,
    private contextMemory: AIContextMemoryService,
    private smartIntent: AISmartIntentService,
    private learningService: AILearningService,
    private predictiveService: AIPredictiveService,
    private marketplaceIntegration: AIAssistantMarketplaceIntegrationService,
  ) {}

  // ==================== CONVERSATION MANAGEMENT ====================

  async createConversation(
    tenantId: string,
    userId: string,
    title?: string,
  ): Promise<AIAssistantConversation> {
    const conversation = await this.prisma.aIAssistantConversation.create({
      data: {
        tenantId,
        userId,
        title: title || 'Yeni Konuşma',
        status: 'active',
      },
    });

    return {
      id: conversation.id,
      tenantId: conversation.tenantId,
      userId: conversation.userId,
      title: conversation.title || undefined,
      messages: [],
      status: conversation.status as 'active' | 'archived',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<AIAssistantConversation | null> {
    const conversation = await this.prisma.aIAssistantConversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      tenantId: conversation.tenantId,
      userId: conversation.userId,
      title: conversation.title || undefined,
      messages: conversation.messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.createdAt,
        metadata: m.metadata as any,
      })),
      status: conversation.status as 'active' | 'archived',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async getConversations(
    tenantId: string,
    userId: string,
    limit = 20,
  ): Promise<AIAssistantConversation[]> {
    const conversations = await this.prisma.aIAssistantConversation.findMany({
      where: { tenantId, userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    });

    return conversations.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      userId: c.userId,
      title: c.title || undefined,
      messages: [],
      status: c.status as 'active' | 'archived',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  // ==================== MESSAGE PROCESSING ====================

  async sendMessage(
    conversationId: string,
    tenantId: string,
    userId: string,
    content: string,
  ): Promise<AIAssistantMessage> {
    // Save user message
    await this.prisma.aIAssistantMessage.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    });

    // Get conversation history for context
    const history = await this.prisma.aIAssistantMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // Build conversation context for smart intent detection
    const conversationContext = {
      previousMessages: history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      activeWorkflow: undefined, // Could be retrieved from context memory
      userGoals: [], // Could be populated from context memory
      recentErrors: [], // Could be populated from error history
    };

    // Use smart intent detection with context
    const intentResult = await this.smartIntent.detectIntent(
      content,
      tenantId,
      userId,
      conversationContext,
    );

    // Get predictive suggestions
    const predictiveSuggestions =
      await this.predictiveService.predictNextActions(tenantId, userId);

    // Get personalized recommendations
    const personalizedRecs =
      await this.predictiveService.getPersonalizedRecommendations(
        tenantId,
        userId,
        { platform: intentResult.platform },
      );

    // Process action
    let response: AIAssistantMessage;

    if (intentResult.confidence > 0.6 && intentResult.type !== 'GENERAL') {
      // High confidence intent - execute action
      response = await this.executeSmartAction(intentResult, {
        tenantId,
        userId,
        platform: intentResult.platform,
        conversationId,
      });

      // Learn from this interaction
      await this.learningService.processEvent(tenantId, userId, {
        type: 'action_completed',
        data: {
          actionType: intentResult.type,
          platform: intentResult.platform,
          confidence: intentResult.confidence,
        },
      });
    } else {
      // Low confidence or general intent - use AI response
      const systemPrompt = await this.getEnhancedSystemPrompt(tenantId, userId);
      const aiResponse = await this.aiService.generateAssistantResponse(
        systemPrompt,
        content,
        history.map((h) => ({ role: h.role, content: h.content })),
      );

      response = {
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date(),
        metadata: {
          suggestions: [
            ...predictiveSuggestions.slice(0, 3),
            ...personalizedRecs.slice(0, 2),
          ].map((s) => ({
            title: s.title,
            type: s.type,
          })),
        },
      };
    }

    // Save assistant response
    const savedMessage = await this.prisma.aIAssistantMessage.create({
      data: {
        conversationId,
        role: response.role,
        content: response.content,
        metadata: response.metadata as any,
      },
    });

    // Update conversation timestamp
    await this.prisma.aIAssistantConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Store conversation context for future reference
    await this.contextMemory.storeMemory(tenantId, userId, {
      key: `conversation_${conversationId}_last_intent`,
      memoryType: 'product_context',
      value: {
        intent: intentResult.type,
        platform: intentResult.platform,
        timestamp: new Date(),
      },
      expiresIn: 60,
    });

    return {
      role: savedMessage.role as 'assistant',
      content: savedMessage.content,
      timestamp: savedMessage.createdAt,
      metadata: savedMessage.metadata as any,
    };
  }

  private async executeSmartAction(
    intentResult: any,
    context: AIAssistantContext,
  ): Promise<AIAssistantMessage> {
    // Convert smart intent result to old action format for compatibility
    const action: AssistantAction = {
      type: intentResult.type,
      payload: intentResult.payload,
      platform: intentResult.platform,
    };

    // Get context-aware enhancements
    const contextSnapshot = await this.contextMemory.buildContextSnapshot(
      context.tenantId,
      context.userId,
    );

    // Add context hints to the action execution
    const response = await this.executeAction(
      action.type,
      action.payload,
      context,
    );

    // Enhance response with smart insights
    if (
      intentResult.suggestedFollowUp &&
      intentResult.suggestedFollowUp.length > 0
    ) {
      response.metadata = {
        ...response.metadata,
        followUpSuggestions: intentResult.suggestedFollowUp,
      };
    }

    if (intentResult.contextHints && intentResult.contextHints.length > 0) {
      response.metadata = {
        ...response.metadata,
        insights: intentResult.contextHints,
      };
    }

    return response;
  }

  private async getEnhancedSystemPrompt(
    tenantId: string,
    userId: string,
  ): Promise<string> {
    // Get user preferences
    const platformPref = await this.learningService.getPreference(
      tenantId,
      userId,
      'platforms',
      'preferred_platform',
    );

    // Get user patterns
    const patterns = await this.learningService.detectPatterns(
      tenantId,
      userId,
    );

    // Build personalized prompt
    let personalizedContext = '';

    if (platformPref) {
      personalizedContext += `\nKullanıcının tercih ettiği platform: ${platformPref.value}\n`;
    }

    if (patterns.length > 0) {
      const topPatterns = patterns.slice(0, 3);
      personalizedContext += `\nKullanıcının sık yaptığı işlemler: ${topPatterns.map((p) => p.patternName).join(', ')}\n`;
    }

    return `Sen Sopyo AI Hub - Pazaryonetimi AI Asistanısın. E-ticaret ve pazaryeri yönetimi konusunda uzman bir dijital asistansın.

${personalizedContext}

YETENEKLERİN:
1. **Marka Eşitleme**: Pazaryerlerinden markaları çekip senkronize etme
2. **Kategori Eşitleme**: Kategori hiyerarşilerini ve özelliklerini eşitleme
3. **Özellik/Attribute Eşitleme**: Ürün özelliklerini, varyantları ve seçenekleri yönetme
4. **Ürün Yükleme**: Tekli ve toplu ürün yükleme işlemleri
5. **Varyant Yönetimi**: Stok, fiyat ve varyant senkronizasyonu
6. **İçerik Optimizasyonu**: AI destekli ürün başlığı ve açıklama iyileştirme

KURALLAR:
- Her zaman profesyonel ve yardımsever bir ton kullan
- Türkçe yanıt ver, teknik terimleri gerektiğinde İngilizce olarak parantez içinde belirt
- Kullanıcının isteğini netleştirmek için gerekli soruları sor
- İşlem başlatmadan önce kullanıcıdan onay al
- Hata durumlarında çözüm önerileri sun
- Karmaşık işlemleri adım adım açıkla
- Kullanıcının geçmiş tercihlerini ve alışkanlıklarını dikkate al

YANIT FORMATI:
- Markdown formatını kullanabilirsin (kalın, liste, vb.)
- Önemli bilgileri vurgula
- Adım adım talimatlar için numaralı listeler kullan

Şu anda kullanıcıya yardımcı olmaya hazırsın.`;
  }

  // ==================== INTENT PARSING (Legacy) ====================

  private async parseIntent(message: string): Promise<AssistantAction> {
    const lowerMessage = message.toLowerCase();

    // Brand sync patterns
    if (
      this.matchesAny(lowerMessage, [
        'marka eşitle',
        'marka senkronize',
        'markaları güncelle',
        'marka güncelle',
        'brand sync',
        'senkronize marka',
      ])
    ) {
      const platform = this.extractPlatform(lowerMessage);
      return { type: 'BRAND_SYNC', payload: {}, platform };
    }

    // Category sync patterns
    if (
      this.matchesAny(lowerMessage, [
        'kategori eşitle',
        'kategori senkronize',
        'kategorileri güncelle',
        'kategori güncelle',
        'category sync',
        'senkronize kategori',
        'kategori çek',
        'kategorileri çek',
      ])
    ) {
      const platform = this.extractPlatform(lowerMessage);
      return { type: 'CATEGORY_SYNC', payload: {}, platform };
    }

    // Attribute sync patterns
    if (
      this.matchesAny(lowerMessage, [
        'özellik eşitle',
        'özellik senkronize',
        'özellikleri güncelle',
        'attribute sync',
        'özellik çek',
        'varyant özellik',
      ])
    ) {
      const platform = this.extractPlatform(lowerMessage);
      return { type: 'ATTRIBUTE_SYNC', payload: {}, platform };
    }

    // Product upload patterns
    if (
      this.matchesAny(lowerMessage, [
        'ürün yükle',
        'ürün gönder',
        'ürün ekle',
        'product upload',
        'yeni ürün',
        'ürün oluştur',
        'upload product',
      ])
    ) {
      const platform = this.extractPlatform(lowerMessage);
      return { type: 'PRODUCT_UPLOAD', payload: {}, platform };
    }

    // Variant management patterns
    if (
      this.matchesAny(lowerMessage, [
        'varyant',
        'varyantları',
        'variant',
        'beden',
        'renk',
        'boyut',
        'seçenek',
        'seçenekleri',
        'options',
      ])
    ) {
      const platform = this.extractPlatform(lowerMessage);
      return { type: 'VARIANT_MANAGE', payload: {}, platform };
    }

    // Bulk upload patterns
    if (
      this.matchesAny(lowerMessage, [
        'toplu yükle',
        'bulk upload',
        'toplu ürün',
        'excel yükle',
        'csv yükle',
        'import',
        'toplu import',
      ])
    ) {
      return { type: 'BULK_UPLOAD', payload: {} };
    }

    return { type: 'GENERAL', payload: {} };
  }

  private matchesAny(message: string, patterns: string[]): boolean {
    return patterns.some((pattern) => message.includes(pattern));
  }

  private extractPlatform(message: string): string | undefined {
    const platforms: Record<string, string[]> = {
      TRENDYOL: ['trendyol', 'trend'],
      AMAZON: ['amazon', 'amazonda'],
      HEPSIBURADA: ['hepsiburada', 'hb', 'hepsi'],
      N11: ['n11', 'n 11'],
      CICEKSEPETI: ['çiçek sepeti', 'ciceksepeti', 'çiçek'],
      PTTAVM: ['ptt', 'pttavm'],
      GITTIGIDIYOR: ['gittigidiyor', 'gg', 'gitti'],
      MORHIPO: ['morhipo'],
      ALIBABA: ['alibaba', '1688'],
      ALIEXPRESS: ['aliexpress', 'ali express'],
      SHOPEE: ['shopee', 'shope'],
      EBAY: ['ebay', 'e-bay'],
      ETSY: ['etsy'],
      WALMART: ['walmart'],
      LAZADA: ['lazada'],
    };

    for (const [platform, keywords] of Object.entries(platforms)) {
      if (keywords.some((kw) => message.includes(kw))) {
        return platform;
      }
    }

    return undefined;
  }

  // ==================== ACTION EXECUTION ====================

  private async executeAction(
    actionType: string,
    payload: any,
    context: AIAssistantContext,
  ): Promise<AIAssistantMessage> {
    try {
      switch (actionType) {
        case 'BRAND_SYNC':
          return await this.handleBrandSync(context, payload);
        case 'CATEGORY_SYNC':
          return await this.handleCategorySync(context, payload);
        case 'ATTRIBUTE_SYNC':
          return await this.handleAttributeSync(context, payload);
        case 'PRODUCT_UPLOAD':
          return await this.handleProductUpload(context, payload);
        case 'VARIANT_MANAGE':
          return await this.handleVariantManage(context, payload);
        case 'BULK_UPLOAD':
          return await this.handleBulkUpload(context, payload);
        default:
          return {
            role: 'assistant',
            content:
              'Bu işlemi şu anda gerçekleştiremiyorum. Lütfen daha spesifik bir istekte bulunun.',
            timestamp: new Date(),
          };
      }
    } catch (error) {
      this.logger.error(`Action execution failed: ${actionType}`, error);
      return {
        role: 'assistant',
        content: `İşlem sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        timestamp: new Date(),
        metadata: { status: 'failed' },
      };
    }
  }

  // ==================== BRAND SYNC ====================

  private async handleBrandSync(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    const platform = context.platform || payload.platform;

    if (!platform) {
      return {
        role: 'assistant',
        content:
          'Hangi pazaryerinden marka eşitlemek istediğinizi belirtin. Örneğin: "Trendyol\'dan markaları eşitle"',
        timestamp: new Date(),
      };
    }

    // Start actual sync using marketplace integration
    const job = await this.marketplaceIntegration.syncBrands(
      context.tenantId,
      context.userId,
      platform,
    );

    return {
      role: 'assistant',
      content: `**${platform}** pazaryerinden marka eşitleme işlemi başlatıldı.\n\n**İşlem ID:** ${job.id}\n**Durum:** ${job.status}\n\nİşlem tamamlandığında size bildirim gönderilecektir. İşlem durumunu "İşlem ID: ${job.id}" yazarak kontrol edebilirsiniz.`,
      timestamp: new Date(),
      metadata: {
        action: 'BRAND_SYNC',
        data: { platform, jobId: job.id, status: job.status },
        status: 'pending',
      },
    };
  }

  // ==================== CATEGORY SYNC ====================

  private async handleCategorySync(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    const platform = context.platform || payload.platform;

    if (!platform) {
      return {
        role: 'assistant',
        content:
          'Hangi pazaryerinden kategori eşitlemek istediğinizi belirtin.',
        timestamp: new Date(),
      };
    }

    // Start actual sync
    const job = await this.marketplaceIntegration.syncCategories(
      context.tenantId,
      context.userId,
      platform,
    );

    return {
      role: 'assistant',
      content: `**${platform}** pazaryerinden kategori eşitleme işlemi başlatıldı.\n\n**İşlem ID:** ${job.id}\n**Durum:** ${job.status}\n\nKategori hiyerarşisi ve özellik bilgileri otomatik olarak çekilecektir.`,
      timestamp: new Date(),
      metadata: {
        action: 'CATEGORY_SYNC',
        data: { platform, jobId: job.id, status: job.status },
        status: 'pending',
      },
    };
  }

  // ==================== ATTRIBUTE SYNC ====================

  private async handleAttributeSync(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    const platform = context.platform || payload.platform;

    if (!platform) {
      return {
        role: 'assistant',
        content:
          "Hangi pazaryerinden özellik eşitlemek istediğinizi belirtin. Ayrıca belirli bir kategori için özellik çekmek istiyorsanız kategori ID'sini de belirtebilirsiniz.",
        timestamp: new Date(),
      };
    }

    this.logger.log(`Attribute sync requested for ${platform}`, {
      tenantId: context.tenantId,
      platform,
      categoryId: payload.categoryId,
    });

    return {
      role: 'assistant',
      content: `**${platform}** pazaryerinden ürün özellikleri (attribute) eşitleme işlemi başlatıldı. Varyant özellikleri, zorunlu alanlar ve opsiyonel alanlar otomatik olarak senkronize edilecektir.`,
      timestamp: new Date(),
      metadata: {
        action: 'ATTRIBUTE_SYNC',
        data: { platform, categoryId: payload.categoryId, status: 'pending' },
        status: 'pending',
      },
    };
  }

  // ==================== PRODUCT UPLOAD ====================

  private async handleProductUpload(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    const platform = context.platform || payload.platform;

    if (!platform) {
      return {
        role: 'assistant',
        content: 'Ürünü hangi pazaryere yüklemek istediğinizi belirtin.',
        timestamp: new Date(),
      };
    }

    if (!payload.productId && !payload.sku) {
      return {
        role: 'assistant',
        content: `**${platform}** pazaryerine ürün yükleme için ürün ID veya SKU gerekli.`,
        timestamp: new Date(),
      };
    }

    // Start actual upload
    const job = await this.marketplaceIntegration.uploadProduct(
      context.tenantId,
      context.userId,
      platform,
      {
        productId: payload.productId,
        sku: payload.sku,
        optimize: payload.optimize !== false,
      },
    );

    return {
      role: 'assistant',
      content: `**${payload.sku || payload.productId}** ürünü **${platform}** pazaryerine yükleniyor.\n\n**İşlem ID:** ${job.id}\n**Durum:** ${job.status}\n**AI Optimizasyonu:** ${payload.optimize !== false ? 'Aktif' : 'Pasif'}\n\nİşlem adımları:\n1. Ürün bilgileri kontrol ediliyor\n2. ${payload.optimize !== false ? 'AI ile içerik optimizasyonu yapılıyor' : 'Mevcut içerik kullanılıyor'}\n3. Varyantlar senkronize ediliyor\n4. ${platform} API'sine gönderiliyor`,
      timestamp: new Date(),
      metadata: {
        action: 'PRODUCT_UPLOAD',
        data: {
          platform,
          productId: payload.productId,
          sku: payload.sku,
          jobId: job.id,
          status: job.status,
        },
        status: 'pending',
      },
    };
  }

  // ==================== VARIANT MANAGEMENT ====================

  private async handleVariantManage(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    const platform = context.platform || payload.platform;

    return {
      role: 'assistant',
      content: `Varyant yönetimi için size yardımcı olabilirim. Yapabileceklerim:\n\n**Varyant Senkronizasyonu:**\n- Tüm varyantları listele\n- Eksik varyantları tespit et ve ekle\n- Varyant stoklarını senkronize et\n- Varyant fiyatlarını güncelle\n\n**Varyant Oluşturma:**\n- Yeni varyant seti oluştur\n- Mevcut varyantları kopyala\n- Varyant grupları oluştur (Renk, Beden, Boyut vb.)\n\n${platform ? `**${platform}** platformu için:` : 'Hangi platform için işlem yapmak istediğinizi belirtin:'}\n- Varyant eşleştirmelerini yapılandır\n- Platform varyant kurallarını uygula\n\nLütfen yapmak istediğiniz spesifik işlemi belirtin.`,
      timestamp: new Date(),
      metadata: {
        action: 'VARIANT_MANAGE',
        data: { platform },
      },
    };
  }

  // ==================== BULK UPLOAD ====================

  private async handleBulkUpload(
    context: AIAssistantContext,
    payload: any,
  ): Promise<AIAssistantMessage> {
    return {
      role: 'assistant',
      content: `Toplu ürün yükleme işlemi için size yardımcı olabilirim. Seçenekler:\n\n**Excel/CSV Yükleme:**\n- Dosya yükleyerek toplu ürün ekleme\n- AI ile veri doğrulama ve temizleme\n- Otomatik kategori eşleştirme\n- Hata raporu oluşturma\n\n**Veritabanından Toplu İşlem:**\n- Tüm ürünleri bir pazaryerine yükle\n- Belirli kategorideki ürünleri yükle\n- Stoğu olan ürünleri filtrele ve yükle\n- Fiyat aralığına göre ürünleri seç ve yükle\n\n**AI Destekli Toplu İşlemler:**\n- Ürün başlıklarını toplu optimize et ve yükle\n- Görselleri toplu işle ve yükle\n- Varyantları toplu senkronize et\n\nHangi yöntemi kullanmak istediğinizi belirtin.`,
      timestamp: new Date(),
      metadata: {
        action: 'BULK_UPLOAD',
      },
    };
  }

  // ==================== SYSTEM PROMPT ====================

  private getSystemPrompt(): string {
    return `Sen Sopyo AI Hub - Pazaryonetimi AI Asistanısın. E-ticaret ve pazaryeri yönetimi konusunda uzman bir dijital asistansın.

YETENEKLERİN:
1. **Marka Eşitleme**: Pazaryerlerinden markaları çekip senkronize etme
2. **Kategori Eşitleme**: Kategori hiyerarşilerini ve özelliklerini eşitleme
3. **Özellik/Atrribute Eşitleme**: Ürün özelliklerini, varyantları ve seçenekleri yönetme
4. **Ürün Yükleme**: Tekli ve toplu ürün yükleme işlemleri
5. **Varyant Yönetimi**: Stok, fiyat ve varyant senkronizasyonu
6. **İçerik Optimizasyonu**: AI destekli ürün başlığı ve açıklama iyileştirme

KURALLAR:
- Her zaman profesyonel ve yardımsever bir ton kullan
- Türkçe yanıt ver, teknik terimleri gerektiğinde İngilizce olarak parantez içinde belirt
- Kullanıcının isteğini netleştirmek için gerekli soruları sor
- İşlem başlatmadan önce kullanıcıdan onay al
- Hata durumlarında çözüm önerileri sun
- Karmaşık işlemleri adım adım açıkla

YANIT FORMATI:
- Markdown formatını kullanabilirsin (kalın, liste, vb.)
- Önemli bilgileri vurgula
- Adım adım talimatlar için numaralı listeler kullan

Şu anda kullanıcıya yardımcı olmaya hazırsın.`;
  }

  // ==================== UTILITY METHODS ====================

  async deleteConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<void> {
    await this.prisma.aIAssistantConversation.deleteMany({
      where: { id: conversationId, tenantId },
    });
  }

  async archiveConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<void> {
    await this.prisma.aIAssistantConversation.updateMany({
      where: { id: conversationId, tenantId },
      data: { status: 'archived' },
    });
  }

  async updateConversationTitle(
    conversationId: string,
    tenantId: string,
    title: string,
  ): Promise<void> {
    await this.prisma.aIAssistantConversation.updateMany({
      where: { id: conversationId, tenantId },
      data: { title },
    });
  }
}

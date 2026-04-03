/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AiService } from '../../ai/ai.service';
import { AIContextMemoryService } from './ai-context-memory.service';

export interface IntentResult {
  type: 'BRAND_SYNC' | 'CATEGORY_SYNC' | 'ATTRIBUTE_SYNC' | 'PRODUCT_UPLOAD' | 
        'VARIANT_MANAGE' | 'BULK_UPLOAD' | 'REPORT' | 'ANALYSIS' | 'GENERAL';
  confidence: number;
  platform?: string;
  payload: any;
  suggestedFollowUp?: string[];
  contextHints?: string[];
}

export interface ConversationContext {
  previousMessages: { role: string; content: string }[];
  activeWorkflow?: string;
  userGoals: string[];
  recentErrors: string[];
}

@Injectable()
export class AISmartIntentService {
  private readonly logger = new Logger(AISmartIntentService.name);

  // Enhanced intent patterns with confidence scoring
  private readonly intentPatterns: Record<string, {
    patterns: string[];
    confidenceBoost: number;
    keywords: string[];
    negativeKeywords: string[];
  }> = {
    BRAND_SYNC: {
      patterns: [
        'marka eşitle', 'marka senkronize', 'markaları güncelle', 'marka çek',
        'brand sync', 'senkronize marka', 'marka listesi', 'marka al',
      ],
      confidenceBoost: 0.9,
      keywords: ['marka', 'brand', 'senkronize', 'eşitle', 'güncelle', 'çek'],
      negativeKeywords: ['kategori', 'ürün', 'varyant', 'özellik'],
    },
    CATEGORY_SYNC: {
      patterns: [
        'kategori eşitle', 'kategori senkronize', 'kategorileri güncelle', 'kategori çek',
        'category sync', 'senkronize kategori', 'kategori hiyerarşi', 'kategori al',
      ],
      confidenceBoost: 0.9,
      keywords: ['kategori', 'category', 'hiyerarşi', 'senkronize', 'eşitle'],
      negativeKeywords: ['marka', 'ürün'],
    },
    ATTRIBUTE_SYNC: {
      patterns: [
        'özellik eşitle', 'attribute sync', 'özellikleri çek', 'varyant özellik',
        'nitelik eşitle', 'özellik al', 'parametre eşitle',
      ],
      confidenceBoost: 0.85,
      keywords: ['özellik', 'attribute', 'nitelik', 'parametre', 'varyant özellik'],
      negativeKeywords: [],
    },
    PRODUCT_UPLOAD: {
      patterns: [
        'ürün yükle', 'ürün gönder', 'ürün ekle', 'product upload',
        'yeni ürün', 'ürün oluştur', 'upload product', 'ürün yayınla',
        'liste ürün', 'aktif et', 'pazaryerine gönder',
      ],
      confidenceBoost: 0.9,
      keywords: ['ürün', 'product', 'yükle', 'gönder', 'ekle', 'upload', 'yayınla'],
      negativeKeywords: ['marka', 'kategori'],
    },
    VARIANT_MANAGE: {
      patterns: [
        'varyant', 'varyantları', 'variant', 'beden', 'renk', 'boyut',
        'seçenek', 'seçenekleri', 'options', 'alternatif', 'versiyon',
      ],
      confidenceBoost: 0.85,
      keywords: ['varyant', 'variant', 'beden', 'renk', 'boyut', 'seçenek'],
      negativeKeywords: [],
    },
    BULK_UPLOAD: {
      patterns: [
        'toplu yükle', 'bulk upload', 'toplu ürün', 'excel yükle',
        'csv yükle', 'import', 'toplu import', 'topluca', 'seri yükle',
      ],
      confidenceBoost: 0.9,
      keywords: ['toplu', 'bulk', 'excel', 'csv', 'import', 'topluca', 'seri'],
      negativeKeywords: [],
    },
    REPORT: {
      patterns: [
        'rapor', 'raporla', 'report', 'analiz et', 'analiz yap', 'istatistik',
        'metrik', 'performans', 'satış raporu', 'stok raporu',
      ],
      confidenceBoost: 0.8,
      keywords: ['rapor', 'report', 'analiz', 'istatistik', 'metrik', 'performans'],
      negativeKeywords: [],
    },
    ANALYSIS: {
      patterns: [
        'analiz', 'değerlendir', 'incele', 'karşılaştır', 'benchmark',
        'rakip analiz', 'fiyat analiz', 'trend analiz',
      ],
      confidenceBoost: 0.8,
      keywords: ['analiz', 'değerlendir', 'incele', 'karşılaştır', 'benchmark'],
      negativeKeywords: ['rapor'],
    },
  };

  // Platform detection patterns
  private readonly platformPatterns: Record<string, string[]> = {
    'TRENDYOL': ['trendyol', 'trend', 'ty'],
    'AMAZON': ['amazon', 'amazonda', 'amz'],
    'HEPSIBURADA': ['hepsiburada', 'hb', 'hepsi'],
    'N11': ['n11', 'n 11', 'n11.com'],
    'CICEKSEPETI': ['çiçek sepeti', 'ciceksepeti', 'çiçek'],
    'PTTAVM': ['ptt', 'pttavm'],
    'GITTIGIDIYOR': ['gittigidiyor', 'gg', 'gitti'],
    'MORHIPO': ['morhipo', 'mor'],
    'ALIBABA': ['alibaba', '1688'],
    'ALIEXPRESS': ['aliexpress', 'ali express', 'aliexp'],
    'SHOPEE': ['shopee', 'shope'],
    'EBAY': ['ebay', 'e-bay'],
    'ETSY': ['etsy'],
    'WALMART': ['walmart'],
    'LAZADA': ['lazada'],
    'ALL': ['tümü', 'tüm', 'hepsi', 'all', 'tüm pazaryerleri'],
  };

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private contextMemory: AIContextMemoryService,
  ) {}

  // ==================== MAIN INTENT DETECTION ====================

  async detectIntent(
    message: string,
    tenantId: string,
    userId: string,
    conversationContext?: ConversationContext,
  ): Promise<IntentResult> {
    const lowerMessage = message.toLowerCase();
    
    // Step 1: Pattern-based detection
    let bestMatch = this.findBestPatternMatch(lowerMessage);
    
    // Step 2: Context-based refinement
    if (conversationContext) {
      bestMatch = await this.refineWithContext(bestMatch, conversationContext, lowerMessage);
    }
    
    // Step 3: Extract platform
    const platform = this.extractPlatform(lowerMessage);
    
    // Step 4: Extract additional payload
    const payload = this.extractPayload(lowerMessage, bestMatch.type);
    
    // Step 5: Learn from this interaction
    await this.learnFromInteraction(tenantId, userId, message, bestMatch);
    
    // Step 6: Generate follow-up suggestions
    const suggestedFollowUp = this.generateFollowUpSuggestions(bestMatch.type, platform, payload);
    
    return {
      type: bestMatch.type as IntentResult['type'],
      confidence: bestMatch.confidence,
      platform,
      payload,
      suggestedFollowUp,
      contextHints: bestMatch.contextHints,
    };
  }

  private findBestPatternMatch(message: string): {
    type: string;
    confidence: number;
    contextHints: string[];
  } {
    let bestMatch = { type: 'GENERAL', confidence: 0.3, contextHints: [] as string[] };

    for (const [intentType, config] of Object.entries(this.intentPatterns)) {
      let score = 0;
      const hints: string[] = [];

      // Check exact patterns
      for (const pattern of config.patterns) {
        if (message.includes(pattern)) {
          score += config.confidenceBoost;
          hints.push(`matched_pattern:${pattern}`);
        }
      }

      // Check keywords
      for (const keyword of config.keywords) {
        if (message.includes(keyword)) {
          score += 0.2;
          hints.push(`keyword:${keyword}`);
        }
      }

      // Penalize negative keywords
      for (const negative of config.negativeKeywords) {
        if (message.includes(negative)) {
          score -= 0.3;
          hints.push(`negative:${negative}`);
        }
      }

      // Normalize score
      score = Math.min(score, 1.0);

      if (score > bestMatch.confidence) {
        bestMatch = { type: intentType, confidence: score, contextHints: hints };
      }
    }

    return bestMatch;
  }

  private async refineWithContext(
    currentMatch: { type: string; confidence: number; contextHints: string[] },
    context: ConversationContext,
    message: string,
  ): Promise<{ type: string; confidence: number; contextHints: string[] }> {
    let refined = { ...currentMatch };

    // If confidence is low, use context to boost
    if (currentMatch.confidence < 0.6 && context.previousMessages.length > 0) {
      const lastUserMessage = context.previousMessages
        .reverse()
        .find(m => m.role === 'user');
      
      if (lastUserMessage) {
        const lastIntent = this.findBestPatternMatch(lastUserMessage.content.toLowerCase());
        
        // If current message is short/ambiguous, likely a follow-up
        if (message.length < 20 && lastIntent.confidence > 0.7) {
          refined.type = lastIntent.type;
          refined.confidence = 0.6;
          refined.contextHints.push('contextual_follow_up');
        }
      }
    }

    // Check for active workflow
    if (context.activeWorkflow) {
      refined.confidence += 0.1;
      refined.contextHints.push(`active_workflow:${context.activeWorkflow}`);
    }

    // Check user goals alignment
    for (const goal of context.userGoals) {
      if (message.includes(goal.toLowerCase())) {
        refined.confidence += 0.15;
        refined.contextHints.push('goal_aligned');
      }
    }

    // Check for error recovery patterns
    if (context.recentErrors.length > 0) {
      for (const error of context.recentErrors) {
        if (message.includes(error.toLowerCase())) {
          refined.confidence += 0.1;
          refined.contextHints.push('error_recovery');
        }
      }
    }

    return refined;
  }

  private extractPlatform(message: string): string | undefined {
    const platforms: string[] = [];
    
    for (const [platform, keywords] of Object.entries(this.platformPatterns)) {
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          platforms.push(platform);
          break;
        }
      }
    }

    // Return the most specific platform
    if (platforms.includes('ALL')) {
      return 'ALL';
    }
    
    return platforms.length > 0 ? platforms[0] : undefined;
  }

  private extractPayload(message: string, intentType: string): any {
    const payload: any = {};

    // Extract SKU/Product ID patterns
    const skuPatterns = [
      /SKU[\s-]?(\w+)/i,
      /ürün\s+(?:id|kodu)?[\s:]?(\w+)/i,
      /product\s+(?:id|code)?[\s:]?(\w+)/i,
    ];

    for (const pattern of skuPatterns) {
      const match = message.match(pattern);
      if (match) {
        payload.sku = match[1];
        break;
      }
    }

    // Extract category ID
    const categoryMatch = message.match(/kategori\s+(?:id)?[\s:]?(\d+)/i);
    if (categoryMatch) {
      payload.categoryId = categoryMatch[1];
    }

    // Extract numbers (could be quantities, limits)
    const numbers = message.match(/\d+/g);
    if (numbers) {
      payload.extractedNumbers = numbers.map(Number);
    }

    // Extract file types for bulk uploads
    if (intentType === 'BULK_UPLOAD') {
      if (message.includes('excel') || message.includes('xlsx') || message.includes('xls')) {
        payload.fileType = 'excel';
      } else if (message.includes('csv')) {
        payload.fileType = 'csv';
      } else if (message.includes('json')) {
        payload.fileType = 'json';
      }
    }

    // Extract date/time references
    const dateWords = ['bugün', 'yarın', 'bu hafta', 'gelecek hafta', 'today', 'tomorrow'];
    for (const word of dateWords) {
      if (message.includes(word)) {
        payload.timeReference = word;
        break;
      }
    }

    // Extract optimization preferences
    if (message.includes('optimizasyon') || message.includes('optimize')) {
      payload.optimize = !message.includes('optimizasyon yok') && !message.includes('optimize etme');
    }

    return payload;
  }

  private generateFollowUpSuggestions(
    intentType: string,
    platform?: string,
    payload?: any,
  ): string[] {
    const suggestions: string[] = [];

    switch (intentType) {
      case 'BRAND_SYNC':
        suggestions.push('Hangi kategorilerde marka eşitlemek istersiniz?');
        suggestions.push('Tüm markaları mı yoksa yeni eklenenleri mi eşitleyelim?');
        break;
      case 'CATEGORY_SYNC':
        suggestions.push('Özellikleri de eşitlemek ister misiniz?');
        suggestions.push('Hangi ana kategoriden başlayalım?');
        break;
      case 'PRODUCT_UPLOAD':
        if (!payload?.sku) {
          suggestions.push('Lütfen ürün SKU veya ID belirtin');
        }
        suggestions.push('AI optimizasyonu aktif olsun mu?');
        suggestions.push('Hangi kategoriden ürünleri yükleyelim?');
        break;
      case 'BULK_UPLOAD':
        suggestions.push('Excel dosyanızı yükleyin');
        suggestions.push('Örnek şablon indirmek ister misiniz?');
        break;
    }

    return suggestions;
  }

  // ==================== LEARNING ====================

  private async learnFromInteraction(
    tenantId: string,
    userId: string,
    message: string,
    result: { type: string; confidence: number },
  ): Promise<void> {
    // Log the interaction
    await this.prisma.aILearningLog.create({
      data: {
        tenantId,
        userId,
        eventType: 'intent_detected',
        eventData: {
          message,
          detectedIntent: result.type,
          confidence: result.confidence,
        },
        insight: `User expressed ${result.type} intent`,
      },
    });
  }

  // ==================== ADVANCED FEATURES ====================

  async detectMultiIntent(message: string): Promise<IntentResult[]> {
    const lowerMessage = message.toLowerCase();
    const intents: IntentResult[] = [];

    // Check for compound requests (e.g., "marka ve kategori eşitle")
    for (const [intentType, config] of Object.entries(this.intentPatterns)) {
      let score = 0;

      for (const pattern of config.patterns) {
        if (lowerMessage.includes(pattern)) {
          score += config.confidenceBoost;
        }
      }

      if (score > 0.5) {
        intents.push({
          type: intentType as IntentResult['type'],
          confidence: Math.min(score, 1.0),
          platform: this.extractPlatform(lowerMessage),
          payload: this.extractPayload(lowerMessage, intentType),
        });
      }
    }

    // Sort by confidence
    intents.sort((a, b) => b.confidence - a.confidence);

    return intents;
  }

  async getIntentHistory(
    tenantId: string,
    userId: string,
    limit = 10,
  ): Promise<string[]> {
    const logs = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        userId,
        eventType: 'intent_detected',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(log => (log.eventData as any)?.detectedIntent).filter(Boolean);
  }

  async suggestIntentBasedOnHistory(
    tenantId: string,
    userId: string,
    partialMessage: string,
  ): Promise<string[]> {
    const history = await this.getIntentHistory(tenantId, userId, 20);
    
    // Count frequency
    const frequency: Record<string, number> = {};
    for (const intent of history) {
      frequency[intent] = (frequency[intent] || 0) + 1;
    }

    // Return most common intents that match partial message
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([intent]) => intent);
  }
}

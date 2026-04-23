// Voice Search
// Speech-to-text search with natural language processing

import { EventEmitter } from 'events';

interface VoiceQuery {
  id: string;
  tenantId: string;
  userId?: string;
  audioUrl?: string;
  transcript: string;
  language: string;
  confidence: number;
  duration: number; // milliseconds
  entities: Array<{
    type: 'product' | 'brand' | 'category' | 'price' | 'date' | 'color' | 'size';
    value: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
  }>;
  intent: 'search' | 'filter' | 'sort' | 'navigate' | 'question';
  structuredQuery: {
    keywords: string[];
    filters: Record<string, unknown>;
    sort?: { field: string; direction: 'asc' | 'desc' };
  };
  results?: {
    products: unknown[];
    total: number;
    executionTime: number;
  };
  createdAt: Date;
}

interface VoiceCommand {
  id: string;
  name: string;
  patterns: string[];
  action: string;
  parameters?: string[];
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

interface VoiceSession {
  id: string;
  userId: string;
  tenantId: string;
  isActive: boolean;
  context: {
    lastQuery?: string;
    lastResults?: unknown[];
    currentPage?: string;
    filters?: Record<string, unknown>;
  };
  preferences: {
    language: string;
    autoPlayResults: boolean;
    speed: number; // 0.5 - 2.0
  };
  history: Array<{
    query: string;
    timestamp: Date;
    successful: boolean;
  }>;
  startedAt: Date;
  lastActivityAt: Date;
}

// Voice Search Manager
export class VoiceSearchManager extends EventEmitter {
  private sessions: Map<string, VoiceSession> = new Map();
  private queries: Map<string, VoiceQuery> = new Map();
  private commands: Map<string, VoiceCommand> = new Map();

  constructor() {
    super();
    this.registerDefaultCommands();
  }

  // Start voice session
  startSession(userId: string, tenantId: string, language: string = 'tr-TR'): VoiceSession {
    const session: VoiceSession = {
      id: crypto.randomUUID(),
      userId,
      tenantId,
      isActive: true,
      context: {},
      preferences: {
        language,
        autoPlayResults: false,
        speed: 1.0,
      },
      history: [],
      startedAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(session.id, session);
    this.emit('sessionStarted', session);
    return session;
  }

  // Process voice input
  async processVoice(
    sessionId: string,
    audioData: Buffer | string,
    options: {
      language?: string;
      context?: Record<string, unknown>;
    } = {}
  ): Promise<VoiceQuery> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Step 1: Speech-to-Text
    const transcription = await this.transcribe(audioData, options.language || session.preferences.language);

    // Step 2: Natural Language Understanding
    const nlu = await this.analyzeIntent(transcription.transcript, session);

    // Create query
    const query: VoiceQuery = {
      id: crypto.randomUUID(),
      tenantId: session.tenantId,
      userId: session.userId,
      transcript: transcription.transcript,
      language: transcription.language,
      confidence: transcription.confidence,
      duration: transcription.duration,
      entities: nlu.entities,
      intent: nlu.intent,
      structuredQuery: nlu.structuredQuery,
      createdAt: new Date(),
    };

    this.queries.set(query.id, query);

    // Step 3: Execute search based on intent
    if (nlu.intent === 'search') {
      query.results = await this.executeSearch(query, session);
    } else if (nlu.intent === 'filter') {
      await this.applyFilter(query, session);
    } else if (nlu.intent === 'sort') {
      await this.applySort(query, session);
    } else if (nlu.intent === 'navigate') {
      await this.handleNavigation(query, session);
    }

    // Update session
    session.context.lastQuery = query.transcript;
    session.context.lastResults = query.results?.products;
    session.history.push({
      query: query.transcript,
      timestamp: new Date(),
      successful: !!query.results,
    });
    session.lastActivityAt = new Date();

    this.emit('queryProcessed', query);
    return query;
  }

  // Process text query (for fallback or type-ahead)
  async processText(
    sessionId: string,
    text: string
  ): Promise<VoiceQuery> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Skip transcription, go directly to NLU
    const nlu = await this.analyzeIntent(text, session);

    const query: VoiceQuery = {
      id: crypto.randomUUID(),
      tenantId: session.tenantId,
      userId: session.userId,
      transcript: text,
      language: session.preferences.language,
      confidence: 1.0,
      duration: 0,
      entities: nlu.entities,
      intent: nlu.intent,
      structuredQuery: nlu.structuredQuery,
      createdAt: new Date(),
    };

    this.queries.set(query.id, query);

    if (nlu.intent === 'search') {
      query.results = await this.executeSearch(query, session);
    }

    return query;
  }

  // Text-to-Speech for results
  async speakResults(queryId: string): Promise<{
    audioUrl: string;
    text: string;
    duration: number;
  }> {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const text = this.generateResponseText(query);
    
    // In production, this would call TTS service
    return {
      audioUrl: `https://tts.example.com/${queryId}.mp3`,
      text,
      duration: text.length * 50, // Approximate
    };
  }

  // Get voice search analytics
  getAnalytics(tenantId: string, period: { from: Date; to: Date }): {
    totalQueries: number;
    averageConfidence: number;
    topQueries: string[];
    popularEntities: Record<string, number>;
    successRate: number;
    averageResponseTime: number;
  } {
    const queries = Array.from(this.queries.values()).filter(
      q => q.tenantId === tenantId && q.createdAt >= period.from && q.createdAt <= period.to
    );

    const entityCounts: Record<string, number> = {};
    const queryTexts: Record<string, number> = {};

    for (const query of queries) {
      // Count entities
      for (const entity of query.entities) {
        entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;
      }

      // Count queries
      queryTexts[query.transcript] = (queryTexts[query.transcript] || 0) + 1;
    }

    const successful = queries.filter(q => !!q.results).length;
    const avgConfidence = queries.length > 0 
      ? queries.reduce((sum, q) => sum + q.confidence, 0) / queries.length 
      : 0;

    return {
      totalQueries: queries.length,
      averageConfidence: avgConfidence,
      topQueries: Object.entries(queryTexts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([q]) => q),
      popularEntities: entityCounts,
      successRate: queries.length > 0 ? (successful / queries.length) * 100 : 0,
      averageResponseTime: 250, // Mock 250ms
    };
  }

  // Register custom voice command
  registerCommand(command: Omit<VoiceCommand, 'id'>): VoiceCommand {
    const cmd: VoiceCommand = {
      ...command,
      id: crypto.randomUUID(),
    };

    this.commands.set(cmd.id, cmd);
    return cmd;
  }

  // Get suggestions for voice search
  getSuggestions(
    tenantId: string,
    partialQuery: string,
    options: {
      limit?: number;
      context?: Record<string, unknown>;
    } = {}
  ): string[] {
    const suggestions = [
      'Kırmızı elbise ara',
      'Son eklenen ürünler',
      'En çok satanlar',
      'İndirimdekiler',
      'Nike ayakkabı',
      '100 TL altı ürünler',
      'Siyah çanta',
      'Bugünkü siparişlerim',
      'Stokta olmayanları göster',
      'Premium müşteriler',
    ];

    return suggestions
      .filter(s => s.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, options.limit || 5);
  }

  // End session
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.emit('sessionEnded', session);
    }
    this.sessions.delete(sessionId);
  }

  // Private methods
  private async transcribe(
    audioData: Buffer | string,
    language: string
  ): Promise<{
    transcript: string;
    confidence: number;
    language: string;
    duration: number;
  }> {
    // In production, call Google Speech-to-Text, Azure Speech, or AWS Transcribe
    
    // Mock transcription
    const mockQueries = [
      'Kırmızı elbiseleri göster',
      'Son bir haftada eklenen ürünler',
      'Fiyatı 500 liranın altında olan ayakkabılar',
      'Nike marka spor ürünleri',
      'Stokta olmayan ürünleri filtrele',
    ];

    return {
      transcript: mockQueries[Math.floor(Math.random() * mockQueries.length)],
      confidence: 0.85 + Math.random() * 0.15,
      language,
      duration: 2000,
    };
  }

  private async analyzeIntent(
    text: string,
    session: VoiceSession
  ): Promise<{
    intent: VoiceQuery['intent'];
    entities: VoiceQuery['entities'];
    structuredQuery: VoiceQuery['structuredQuery'];
  }> {
    const entities: VoiceQuery['entities'] = [];
    const keywords: string[] = [];
    const filters: Record<string, unknown> = {};

    // Extract entities using regex/patterns
    // Colors
    const colors = ['kırmızı', 'mavi', 'siyah', 'beyaz', 'yeşil', 'sarı', 'mor'];
    for (const color of colors) {
      const index = text.toLowerCase().indexOf(color);
      if (index !== -1) {
        entities.push({
          type: 'color',
          value: color,
          confidence: 0.9,
          startIndex: index,
          endIndex: index + color.length,
        });
        filters.color = color;
      }
    }

    // Price ranges
    const priceMatch = text.match(/(\d+)\s*(TL|tl)?\s*(altında|üstünde|ile|arası)/);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]);
      entities.push({
        type: 'price',
        value: `${price} TL`,
        confidence: 0.85,
        startIndex: priceMatch.index!,
        endIndex: priceMatch.index! + priceMatch[0].length,
      });
      filters.price = { lte: price };
    }

    // Categories
    const categories = ['elbise', 'ayakkabı', 'çanta', 'tişört', 'pantolon', 'aksesuar'];
    for (const cat of categories) {
      if (text.toLowerCase().includes(cat)) {
        entities.push({
          type: 'category',
          value: cat,
          confidence: 0.9,
          startIndex: text.toLowerCase().indexOf(cat),
          endIndex: text.toLowerCase().indexOf(cat) + cat.length,
        });
        keywords.push(cat);
      }
    }

    // Brands
    const brands = ['nike', 'adidas', 'zara', 'mango', 'bershka', 'koton'];
    for (const brand of brands) {
      if (text.toLowerCase().includes(brand)) {
        entities.push({
          type: 'brand',
          value: brand,
          confidence: 0.9,
          startIndex: text.toLowerCase().indexOf(brand),
          endIndex: text.toLowerCase().indexOf(brand) + brand.length,
        });
        filters.brand = brand;
      }
    }

    // Determine intent
    let intent: VoiceQuery['intent'] = 'search';
    
    if (text.includes('son') || text.includes('yeni')) {
      filters.sort = 'createdAt:desc';
    }
    
    if (text.includes('en çok satan')) {
      filters.sort = 'sales:desc';
    }

    if (text.includes('stokta olmayan') || text.includes('filtrele')) {
      intent = 'filter';
    }

    // Extract keywords (words not in entities)
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && !entities.some(e => e.value.toLowerCase() === word.toLowerCase())) {
        keywords.push(word);
      }
    }

    return {
      intent,
      entities,
      structuredQuery: {
        keywords: keywords.filter((v, i, a) => a.indexOf(v) === i), // Unique
        filters,
      },
    };
  }

  private async executeSearch(
    query: VoiceQuery,
    session: VoiceSession
  ): Promise<VoiceQuery['results']> {
    // In production, execute search against database
    const startTime = Date.now();

    // Mock results
    const products = Array.from({ length: 10 }, (_, i) => ({
      id: `prod-${i}`,
      name: `${query.structuredQuery.keywords.join(' ')} Ürün ${i + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      imageUrl: `https://cdn.example.com/product-${i}.jpg`,
      matchScore: 1 - (i * 0.05),
    }));

    return {
      products,
      total: 156,
      executionTime: Date.now() - startTime,
    };
  }

  private async applyFilter(query: VoiceQuery, session: VoiceSession): Promise<void> {
    session.context.filters = { ...session.context.filters, ...query.structuredQuery.filters };
  }

  private async applySort(query: VoiceQuery, session: VoiceSession): Promise<void> {
    if (query.structuredQuery.sort) {
      // Apply sort
    }
  }

  private async handleNavigation(query: VoiceQuery, session: VoiceSession): Promise<void> {
    // Handle navigation commands
    const navCommands: Record<string, string> = {
      'sipariş': '/orders',
      'ürün': '/products',
      'müşteri': '/customers',
      'rapor': '/reports',
      'ayar': '/settings',
    };

    for (const [key, path] of Object.entries(navCommands)) {
      if (query.transcript.toLowerCase().includes(key)) {
        session.context.currentPage = path;
        break;
      }
    }
  }

  private generateResponseText(query: VoiceQuery): string {
    if (!query.results) {
      return 'Üzgünüm, aramanızla ilgili sonuç bulamadım.';
    }

    if (query.results.total === 0) {
      return 'Aramanızla eşleşen ürün bulunamadı.';
    }

    return `${query.results.total} ürün bulundu. İlk ${query.results.products.length} ürün listeleniyor.`;
  }

  private registerDefaultCommands(): void {
    this.registerCommand({
      name: 'showOrders',
      patterns: ['siparişlerimi göster', 'bugünkü siparişler', 'son siparişlerim'],
      action: 'navigate',
      parameters: ['page'],
    });

    this.registerCommand({
      name: 'showProducts',
      patterns: ['ürünleri göster', 'stok durumu', 'tüm ürünler'],
      action: 'navigate',
      parameters: ['page'],
    });

    this.registerCommand({
      name: 'searchProducts',
      patterns: ['{keyword} ara', '{keyword} bul', '{keyword} göster'],
      action: 'search',
      parameters: ['keyword'],
    });

    this.registerCommand({
      name: 'filterByPrice',
      patterns: ['{price} altında', '{price} üstünde', 'fiyat {condition}'],
      action: 'filter',
      parameters: ['price', 'condition'],
    });
  }
}

// Supported languages
export const VOICE_SEARCH_LANGUAGES: Record<string, { name: string; code: string }> = {
  'tr-TR': { name: 'Türkçe', code: 'tr-TR' },
  'en-US': { name: 'English (US)', code: 'en-US' },
  'de-DE': { name: 'Deutsch', code: 'de-DE' },
  'fr-FR': { name: 'Français', code: 'fr-FR' },
  'ar-SA': { name: 'العربية', code: 'ar-SA' },
};

// Export singleton
export const voiceSearchManager = new VoiceSearchManager();

export { VoiceQuery, VoiceCommand, VoiceSession };

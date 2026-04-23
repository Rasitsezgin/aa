// AI Chatbot for Customer Support
// Context-aware automated support with NLP

import OpenAI from 'openai';

interface ChatbotConfig {
  name: string;
  welcomeMessage: string;
  fallbackMessage: string;
  maxContextLength: number;
  enabledChannels: ('web' | 'whatsapp' | 'telegram' | 'facebook')[];
  workingHours?: { start: string; end: string; days: number[] };
  autoEscalateAfter: number; // minutes
}

interface Conversation {
  id: string;
  tenantId: string;
  customerId?: string;
  channel: string;
  status: 'active' | 'closed' | 'escalated';
  messages: Message[];
  context: {
    currentTopic?: string;
    lastIntent?: string;
    extractedData?: Record<string, unknown>;
    orderContext?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  escalatedAt?: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'human_agent';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    actions?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

interface Intent {
  name: string;
  patterns: string[];
  responses: string[];
  action?: string;
  requiresData?: string[];
}

interface KnowledgeBase {
  id: string;
  tenantId: string;
  articles: Array<{
    id: string;
    title: string;
    content: string;
    keywords: string[];
    category: string;
  }>;
}

// AI Chatbot
export class AIChatbot {
  private openai: OpenAI;
  private config: ChatbotConfig;
  private conversations: Map<string, Conversation> = new Map();
  private intents: Map<string, Intent[]> = new Map();
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();

  constructor(config: ChatbotConfig, apiKey: string) {
    this.config = config;
    this.openai = new OpenAI({ apiKey });
  }

  // Start new conversation
  async startConversation(
    tenantId: string,
    channel: string,
    customerId?: string
  ): Promise<Conversation> {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      tenantId,
      customerId,
      channel,
      status: 'active',
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add welcome message
    conversation.messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: this.config.welcomeMessage,
      timestamp: new Date(),
    });

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  // Send message to chatbot
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Process message
    const response = await this.generateResponse(conversation, content);
    
    // Add assistant response
    conversation.messages.push(response);
    conversation.updatedAt = new Date();

    // Check for escalation
    if (this.shouldEscalate(conversation)) {
      await this.escalateToHuman(conversation);
    }

    return response;
  }

  // Generate response using AI or rule-based
  private async generateResponse(
    conversation: Conversation,
    content: string
  ): Promise<Message> {
    // Try rule-based first
    const intent = this.detectIntent(content, conversation.tenantId);
    
    if (intent && intent.confidence > 0.7) {
      const responseText = this.selectResponse(intent);
      
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        metadata: {
          intent: intent.name,
          confidence: intent.confidence,
          actions: intent.action ? [intent.action] : undefined,
        },
      };
    }

    // Try knowledge base
    const kbArticle = this.searchKnowledgeBase(content, conversation.tenantId);
    if (kbArticle) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: kbArticle.content,
        timestamp: new Date(),
        metadata: {
          intent: 'knowledge_base',
        },
      };
    }

    // Use AI (OpenAI)
    const aiResponse = await this.generateAIResponse(conversation, content);
    return aiResponse;
  }

  // Detect intent from message
  private detectIntent(
    content: string,
    tenantId: string
  ): { name: string; confidence: number; action?: string } | null {
    const intents = this.intents.get(tenantId) || [];
    let bestMatch: { name: string; confidence: number; action?: string } | null = null;
    let bestScore = 0;

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const score = this.calculateSimilarity(content.toLowerCase(), pattern.toLowerCase());
        if (score > bestScore && score > 0.5) {
          bestScore = score;
          bestMatch = { name: intent.name, confidence: score, action: intent.action };
        }
      }
    }

    return bestMatch;
  }

  // Calculate text similarity (simple)
  private calculateSimilarity(a: string, b: string): number {
    const words1 = new Set(a.split(/\s+/));
    const words2 = new Set(b.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Select response for intent
  private selectResponse(intent: { name: string; confidence: number; action?: string }): string {
    const intents = Array.from(this.intents.values()).flat();
    const fullIntent = intents.find(i => i.name === intent.name);
    
    if (!fullIntent || fullIntent.responses.length === 0) {
      return this.config.fallbackMessage;
    }

    // Random response
    const index = Math.floor(Math.random() * fullIntent.responses.length);
    return fullIntent.responses[index];
  }

  // Search knowledge base
  private searchKnowledgeBase(
    query: string,
    tenantId: string
  ): { title: string; content: string } | null {
    const kb = this.knowledgeBases.get(tenantId);
    if (!kb) return null;

    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    let bestMatch: { title: string; content: string; score: number } | null = null;

    for (const article of kb.articles) {
      const articleWords = new Set([
        ...article.keywords.map(k => k.toLowerCase()),
        ...article.title.toLowerCase().split(/\s+/),
      ]);

      const intersection = new Set([...queryWords].filter(x => articleWords.has(x)));
      const score = intersection.size;

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { title: article.title, content: article.content, score };
      }
    }

    return bestMatch ? { title: bestMatch.title, content: bestMatch.content } : null;
  }

  // Generate AI response using OpenAI
  private async generateAIResponse(
    conversation: Conversation,
    content: string
  ): Promise<Message> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a helpful customer support assistant for an e-commerce platform. 
            Keep responses concise and professional. 
            Current context: ${JSON.stringify(conversation.context)}`,
        },
        ...conversation.messages.slice(-10).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.choices[0].message.content || this.config.fallbackMessage,
        timestamp: new Date(),
        metadata: {
          intent: 'ai_generated',
          confidence: 0.95,
        },
      };
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: this.config.fallbackMessage,
        timestamp: new Date(),
        metadata: {
          intent: 'fallback',
        },
      };
    }
  }

  // Check if should escalate to human
  private shouldEscalate(conversation: Conversation): boolean {
    // Check message count
    if (conversation.messages.length > 10) return true;

    // Check time since last escalation-worthy event
    const lastUpdate = conversation.updatedAt;
    const minutesSince = (Date.now() - lastUpdate.getTime()) / 60000;
    
    if (minutesSince > this.config.autoEscalateAfter) return true;

    // Check sentiment
    const negativeMessages = conversation.messages.filter(
      m => m.metadata?.sentiment === 'negative'
    );
    if (negativeMessages.length >= 3) return true;

    return false;
  }

  // Escalate to human agent
  private async escalateToHuman(conversation: Conversation): Promise<void> {
    conversation.status = 'escalated';
    conversation.escalatedAt = new Date();

    // Add escalation message
    conversation.messages.push({
      id: crypto.randomUUID(),
      role: 'system',
      content: 'Connecting you to a human agent...',
      timestamp: new Date(),
    });

    // Would notify human agents
    console.log(`Conversation ${conversation.id} escalated to human`);
  }

  // Add intent for tenant
  addIntent(tenantId: string, intent: Intent): void {
    if (!this.intents.has(tenantId)) {
      this.intents.set(tenantId, []);
    }
    this.intents.get(tenantId)!.push(intent);
  }

  // Update knowledge base
  updateKnowledgeBase(tenantId: string, articles: KnowledgeBase['articles']): void {
    this.knowledgeBases.set(tenantId, {
      id: crypto.randomUUID(),
      tenantId,
      articles,
    });
  }

  // Get conversation analytics
  getAnalytics(tenantId: string, period: { from: Date; to: Date }): {
    totalConversations: number;
    escalatedCount: number;
    avgMessagesPerConversation: number;
    topIntents: Array<{ intent: string; count: number }>;
    satisfactionScore: number;
  } {
    const conversations = Array.from(this.conversations.values())
      .filter(c => c.tenantId === tenantId);

    const totalConversations = conversations.length;
    const escalatedCount = conversations.filter(c => c.status === 'escalated').length;
    
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const avgMessagesPerConversation = totalConversations > 0 
      ? totalMessages / totalConversations 
      : 0;

    // Count intents
    const intentCounts = new Map<string, number>();
    for (const conv of conversations) {
      for (const msg of conv.messages) {
        if (msg.metadata?.intent) {
          const count = intentCounts.get(msg.metadata.intent) || 0;
          intentCounts.set(msg.metadata.intent, count + 1);
        }
      }
    }

    const topIntents = Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));

    return {
      totalConversations,
      escalatedCount,
      avgMessagesPerConversation,
      topIntents,
      satisfactionScore: 4.2, // Would calculate from feedback
    };
  }

  // Close conversation
  closeConversation(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'closed';
      conversation.updatedAt = new Date();
    }
  }
}

// Chatbot factory
export class ChatbotFactory {
  private chatbots: Map<string, AIChatbot> = new Map();

  create(tenantId: string, config: ChatbotConfig, apiKey: string): AIChatbot {
    const chatbot = new AIChatbot(config, apiKey);
    this.chatbots.set(tenantId, chatbot);
    return chatbot;
  }

  get(tenantId: string): AIChatbot | null {
    return this.chatbots.get(tenantId) || null;
  }
}

// Predefined intents
export const DEFAULT_INTENTS: Intent[] = [
  {
    name: 'order_status',
    patterns: [
      'where is my order',
      'order status',
      'track my order',
      'when will my order arrive',
    ],
    responses: [
      'I can help you track your order. Could you please provide your order number?',
      'To check your order status, I\'ll need your order ID.',
    ],
    action: 'request_order_number',
  },
  {
    name: 'return_request',
    patterns: [
      'I want to return',
      'how do I return',
      'return policy',
      'start a return',
    ],
    responses: [
      'I can help you with returns. Please provide your order number and the reason for return.',
      'To initiate a return, I\'ll need your order details.',
    ],
    action: 'start_return_process',
  },
  {
    name: 'product_inquiry',
    patterns: [
      'do you have',
      'is this available',
      'product information',
      'tell me about',
    ],
    responses: [
      'I can help you find product information. What product are you looking for?',
      'Please provide the product name or SKU for more details.',
    ],
    action: 'search_products',
  },
  {
    name: 'greeting',
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    responses: [
      'Hello! How can I help you today?',
      'Hi there! What can I assist you with?',
    ],
  },
  {
    name: 'goodbye',
    patterns: ['bye', 'goodbye', 'see you', 'thank you', 'thanks'],
    responses: [
      'Thank you for chatting! Have a great day!',
      'You\'re welcome! Feel free to reach out anytime.',
    ],
  },
];

// Export
export const chatbotFactory = new ChatbotFactory();

export { ChatbotConfig, Conversation, Message, Intent, KnowledgeBase };

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiModelsService } from './ai-models.service';

export interface AnalysisRequest {
  domain: string;
  score: number;
  url: string;
}

export interface AdvisorResponse {
  message: string;
  suggestions: string[];
  confidence: number;
  aiModel: string;
}

@Injectable()
export class AdvisorService {
  constructor(
    private prisma: PrismaService,
    private aiModelsService: AiModelsService,
  ) { }

  async generateAdvisorMessage(
    data: AnalysisRequest,
  ): Promise<AdvisorResponse> {
    // Aktif bir AI model al
    const activeModels = await this.aiModelsService.findAllActive();

    if (!activeModels || activeModels.length === 0) {
      return this.getDefaultMessage(data);
    }

    // İlk aktif model kullan
    const selectedModel = activeModels[0];

    try {
      // API çağrısı yap
      const response = await this.callAiModel(selectedModel, data);

      // Kullanımı kaydet
      await this.aiModelsService.incrementUsage(selectedModel.id);

      // Mesajı database'e kaydet
      await this.prisma.advisorMessage.create({
        data: {
          aiModelId: selectedModel.id,
          domain: data.domain,
          score: data.score,
          message: response.message,
          suggestions: { list: response.suggestions },
        },
      });

      return {
        message: response.message,
        suggestions: response.suggestions,
        confidence: response.confidence,
        aiModel: selectedModel.name,
      };
    } catch (error) {
      console.error('AI Model API error:', error);
      return this.getDefaultMessage(data);
    }
  }

  private async callAiModel(model: any, data: AnalysisRequest) {
    const prompt = `
    Siz Pazaryonetimi AI Danışmanısınız. 
    
    Bir e-ticaret mağazasının analiz sonuçlarını değerlendiriyorsunuz:
    - Domain: ${data.domain}
    - SEO Skoru: ${data.score}/100
    - URL: ${data.url}
    
    Lütfen:
    1. Kısa ve etkileyici bir mesaj yazın (2-3 cümle, Türkçe)
    2. En önemli 3 iyileştirme önerisi verin
    
    Yanıt formatı JSON olmalı:
    {
      "message": "Danışman mesajı",
      "suggestions": ["Öneri 1", "Öneri 2", "Öneri 3"],
      "confidence": 0.85
    }
    `;

    // OpenAI, Claude, Gemini vb. ile entegrasyon
    switch (model.provider) {
      case 'openai':
        return await this.callOpenAI(model, prompt);
      case 'anthropic':
        return await this.callAnthropic(model, prompt);
      case 'google':
        return await this.callGoogle(model, prompt);
      default:
        return this.getDefaultMessage(data);
    }
  }

  private async callOpenAI(model: any, prompt: string) {
    // OpenAI API çağrısı
    const apiKey = await this.aiModelsService.decryptApiKey(model.apiKey);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch {
      return this.parseResponse(content);
    }
  }

  private async callAnthropic(model: any, prompt: string) {
    // Claude API çağrısı
    const apiKey = await this.aiModelsService.decryptApiKey(model.apiKey);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.modelId,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content[0].text;

    try {
      return JSON.parse(content);
    } catch {
      return this.parseResponse(content);
    }
  }

  private async callGoogle(model: any, prompt: string) {
    // Google Gemini API çağrısı
    const apiKey = await this.aiModelsService.decryptApiKey(model.apiKey);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    try {
      return JSON.parse(content);
    } catch {
      return this.parseResponse(content);
    }
  }

  private parseResponse(text: string) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return this.getDefaultMessageObj();
      }
    }
    return this.getDefaultMessageObj();
  }

  private getDefaultMessage(data: AnalysisRequest): AdvisorResponse {
    return {
      message: `Selam! ${data.domain} analizini tamamladım. Gördüğüm kadarıyla SEO skorun (%${data.score}) sektöre göre geride. Özellikle ürün başlıklarını düzenleyerek cironu %20 artırabiliriz.`,
      suggestions: [
        'Ürün başlıklarını optimize et',
        'WebP görsellerini kullan',
        'LCP iyileştirmesi yap',
      ],
      confidence: 0.75,
      aiModel: 'Default Advisor',
    };
  }

  private getDefaultMessageObj() {
    return {
      message: 'Mağaza analizi yapılıyor...',
      suggestions: ['Optimizasyon tavsiyesi yükleniyor...'],
      confidence: 0.5,
    };
  }

  async getAdvisorHistory(domain: string, limit: number = 10) {
    return this.prisma.advisorMessage.findMany({
      where: { domain },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { aiModel: true },
    });
  }
}

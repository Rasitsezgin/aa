import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'test-key';
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async analyzeProductContent(title: string, description: string) {
        const prompt = `
      Sen bir e-ticaret SEO uzmanısın. Aşağıdaki ürün başlığını ve açıklamasını analiz et:
      Başlık: ${title}
      Açıklama: ${description}

      Lütfen şunları sağla (JSON formatında):
      1. SEO Skoru (0-100)
      2. İyileştirilmiş Başlık Önerisi
      3. İyileştirilmiş Açıklama Önerisi
      4. Önerilen Anahtar Kelimeler (Dizi olarak)
      5. Eksiklikler ve Öneriler
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean potential markdown code blocks
            text = text.replace(/```json|```/g, '').trim();

            return JSON.parse(text);
        } catch (error) {
            this.logger.error('Gemini Analysis Error:', error);
            throw new Error('AI analysis failed');
        }
    }

    async analyzeCompetitor(productInfo: string, competitorInfo: string) {
        const prompt = `
      Rakip analizi uzmanı olarak, kendi ürünümüz ile rakip ürünün stratejilerini karşılaştır:
      Bizim Ürün Planımız/Özelliklerimiz: ${productInfo}
      Rakip Verileri: ${competitorInfo}

      Lütfen şunları analiz et (JSON formatında):
      1. Fiyat Rekabetçiliği (Düşük, Orta, Yüksek)
      2. Bizim Avantajlarımız
      3. Rakibin Avantajları
      4. Önerilen Fiyatlandırma Stratejisi
      5. Pazarlama Önerileri
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json|```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            this.logger.error('Competitor Analysis Error:', error);
            throw new Error('AI competitor analysis failed');
        }
    }

    async optimizeProductContent(title: string, description: string, platform: string) {
        const prompt = `
            ${platform} pazaryeri için ürün içeriği optimizasyonu yap. 
            Mevcut Başlık: ${title}
            Mevcut Açıklama: ${description}

            Kurallar:
            - Başlık ilgi çekici ve SEO uyumlu olmalı.
            - Açıklama ikna edici, özellik-fayda dengesi kuran ve HTML tagleri içermeyen temiz metin olmalı.
            - ${platform} karakter sınırlarına ve politikalarına uygun hareket et.

            JSON formatında dön:
            {
                "optimizedTitle": "...",
                "optimizedDescription": "...",
                "keywords": ["...", "..."],
                "seoScoreAfter": 0-100,
                "improvements": ["...", "..."]
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json|```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            this.logger.error('SEO Optimization Error:', error);
            throw new Error('AI SEO optimization failed');
        }
    }

    async generateReplyDraft(customerMessage: string, context?: string) {
        const prompt = `
            Bir e-ticaret müşteri destek uzmanı olarak, aşağıdaki müşteri mesajına profesyonel, yardımsever ve çözüm odaklı bir cevap taslağı hazırla.
            
            Müşteri Mesajı: ${customerMessage}
            ${context ? `Bağlam (Sipariş/Ürün Bilgisi): ${context}` : ''}

            Yanıt Kuralları:
            - Nazik ve profesyonel bir ton kullan.
            - Sorunu anladığını belli et.
            - Eğer bağlam varsa, spesifik bilgilerle destekle.
            - Marka imajını koru.

            JSON formatında dön:
            {
                "draft": "...",
                "sentiment": "POSITIVE/NEUTRAL/NEGATIVE",
                "extractedIssues": ["...", "..."]
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json|```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            this.logger.error('AI Reply Generation Error:', error);
            throw new Error('AI reply generation failed');
        }
    }
}

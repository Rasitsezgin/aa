/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, prefer-const */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import {
  resolveGeminiApiKey,
  resolveGeminiModel,
} from '../../common/gemini.util';
import { Anomaly } from '../system/anomaly-detection.service';

export interface AgentAction {
  type: 'UPDATE_PRICE' | 'SEND_MESSAGE' | 'NOTIFY_USER' | 'IGNORE';
  targetId?: string;
  data: any;
  reason: string;
}

@Injectable()
export class SatisPilotuService {
  private readonly logger = new Logger(SatisPilotuService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = resolveGeminiApiKey(this.configService);
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: resolveGeminiModel(this.configService),
      });
    }
  }

  /**
   * Main agent loop: Analysing anomalies and deciding on autonomous actions
   */
  async processAnomalies(
    tenantId: string,
    anomalies: Anomaly[],
  ): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    for (const anomaly of anomalies) {
      try {
        const decision = await this.getAgentDecision(tenantId, anomaly);
        if (decision.type !== 'IGNORE') {
          await this.executeAction(tenantId, decision, anomaly);
          actions.push(decision);
        }
      } catch (error) {
        this.logger.error(
          `Error processing anomaly ${anomaly.id}: ${error.message}`,
        );
      }
    }

    return actions;
  }

  /**
   * Ask AI Agent for a decision based on the anomaly and tenant context
   */
  private async getAgentDecision(
    tenantId: string,
    anomaly: Anomaly,
  ): Promise<AgentAction> {
    const prompt = `
      Sen "Satış Pilotu" adında otonom bir e-ticaret ajanısın. Görevin, mağazadaki anomalileri analiz edip en doğru aksiyonu almaktır.
      
      ANOMALİ DETAYI:
      Tip: ${anomaly.type}
      Sertlik: ${anomaly.severity}
      Başlık: ${anomaly.title}
      Açıklama: ${anomaly.description}
      Ek Veri: ${JSON.stringify(anomaly.data)}
      
      YETKİLERİN:
      1. UPDATE_PRICE: Fiyatı güncelleyebilirsin. (Eğer rekabet avantajı sağlayacaksa)
      2. SEND_MESSAGE: Müşteriye veya rakibe (destek üzerinden) mesaj yazabilirsin.
      3. NOTIFY_USER: Eğer durum çok riskliyse kullanıcıdan onay isteyebilirsin.
      4. IGNORE: Eğer anomali önemsizse görmezden gelebilirsin.

      Lütfen şu JSON formatında cevap ver:
      {
        "type": "UPDATE_PRICE" | "SEND_MESSAGE" | "NOTIFY_USER" | "IGNORE",
        "data": { "newPrice": 100, "message": "..." } // Aksiyona göre değişir
        "reason": "Neden bu aksiyonu aldığının açıklaması"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(
        `AI Decision error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        type: 'NOTIFY_USER',
        data: {},
        reason: 'AI karar mekanizması hatası',
      };
    }
  }

  /**
   * Realises the decided action
   */
  private async executeAction(
    tenantId: string,
    action: AgentAction,
    anomaly: Anomaly,
  ) {
    this.logger.log(
      `Executing autonomous action: ${action.type} for tenant ${tenantId}`,
    );

    switch (action.type) {
      case 'UPDATE_PRICE':
        if (anomaly.productId && action.data.newPrice) {
          await this.prisma.product.update({
            where: { id: anomaly.productId },
            data: { price: action.data.newPrice },
          });

          await this.logAgentActivity(
            tenantId,
            'PRICE_UPDATED',
            `Otonom fiyat güncellemesi: ${action.data.newPrice} (Eski: ${anomaly.data.ourPrice})`,
            action.reason,
          );
        }
        break;

      case 'SEND_MESSAGE':
        // Mock messaging logic
        await this.logAgentActivity(
          tenantId,
          'MESSAGE_SENT',
          `Otonom mesaj gönderildi: ${action.data.message}`,
          action.reason,
        );
        break;

      case 'NOTIFY_USER':
        // Existing notification mechanism will pick this up
        await this.logAgentActivity(
          tenantId,
          'PENDING_APPROVAL',
          `Kullanıcı onayı bekleniyor: ${action.reason}`,
          action.reason,
        );
        break;
    }
  }

  private async logAgentActivity(
    tenantId: string,
    type: string,
    message: string,
    reason: string,
  ) {
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: `agent.${type.toLowerCase()}`,
        resource: 'ai_agent',
        details: { message, reason, agentName: 'Satış Pilotu' },
      },
    });
  }
}

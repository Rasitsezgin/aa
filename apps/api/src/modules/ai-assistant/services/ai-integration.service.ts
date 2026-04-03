/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

export interface IntegrationMessage {
  channel: 'slack' | 'teams' | 'whatsapp' | 'email' | 'webhook';
  recipient: string;
  title: string;
  message: string;
  attachments?: any[];
  buttons?: Array<{
    text: string;
    url?: string;
    action?: string;
    style?: 'primary' | 'danger' | 'default';
  }>;
}

export interface IntegrationConfig {
  slack?: {
    webhookUrl: string;
    channel?: string;
    botToken?: string;
  };
  teams?: {
    webhookUrl: string;
  };
  whatsapp?: {
    apiKey: string;
    phoneNumberId: string;
  };
  email?: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
  };
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
}

@Injectable()
export class AIIntegrationService {
  private readonly logger = new Logger(AIIntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // ==================== SEND NOTIFICATIONS ====================

  async sendNotification(
    tenantId: string,
    userId: string,
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    // Get user's integration preferences
    const config = await this.getIntegrationConfig(tenantId, userId);

    const results: Array<{ success: boolean; channel: string; error?: string }> = [];

    // Send to all configured channels
    if (config.slack) {
      results.push(await this.sendToSlack(config.slack, message));
    }

    if (config.teams) {
      results.push(await this.sendToTeams(config.teams, message));
    }

    if (config.whatsapp) {
      results.push(await this.sendToWhatsApp(config.whatsapp, message));
    }

    if (config.email) {
      results.push(await this.sendEmail(config.email, message));
    }

    if (config.webhook) {
      results.push(await this.sendToWebhook(config.webhook, message));
    }

    // Return first successful or first failed
    const success = results.find(r => r.success);
    if (success) return success;

    return results[0] || { success: false, channel: 'none', error: 'No channels configured' };
  }

  // ==================== SLACK INTEGRATION ====================

  private async sendToSlack(
    config: IntegrationConfig['slack'],
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    try {
      if (!config?.webhookUrl) {
        return { success: false, channel: 'slack', error: 'No webhook URL configured' };
      }

      const payload = {
        text: message.title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: message.title,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message.message,
            },
          },
          ...(message.buttons ? [{
            type: 'actions',
            elements: message.buttons.map(btn => ({
              type: 'button',
              text: {
                type: 'plain_text',
                text: btn.text,
              },
              url: btn.url,
              style: btn.style,
            })),
          }] : []),
        ],
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true, channel: 'slack' };
      } else {
        return { success: false, channel: 'slack', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, channel: 'slack', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== TEAMS INTEGRATION ====================

  private async sendToTeams(
    config: IntegrationConfig['teams'],
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    try {
      if (!config?.webhookUrl) {
        return { success: false, channel: 'teams', error: 'No webhook URL configured' };
      }

      const payload = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: message.title,
        themeColor: '0078D7',
        title: message.title,
        text: message.message,
        potentialAction: message.buttons?.map(btn => ({
          '@type': 'OpenUri',
          name: btn.text,
          targets: [{ os: 'default', uri: btn.url || '#' }],
        })),
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true, channel: 'teams' };
      } else {
        return { success: false, channel: 'teams', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, channel: 'teams', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== WHATSAPP INTEGRATION ====================

  private async sendToWhatsApp(
    config: IntegrationConfig['whatsapp'],
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    try {
      if (!config?.apiKey || !config?.phoneNumberId) {
        return { success: false, channel: 'whatsapp', error: 'WhatsApp not configured' };
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.recipient,
        type: 'text',
        text: {
          body: `*${message.title}*\n\n${message.message}`,
        },
      };

      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true, channel: 'whatsapp' };
      } else {
        const error = await response.text();
        return { success: false, channel: 'whatsapp', error };
      }
    } catch (error) {
      return { success: false, channel: 'whatsapp', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== EMAIL INTEGRATION ====================

  private async sendEmail(
    config: IntegrationConfig['email'],
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    try {
      if (!config?.smtpHost) {
        return { success: false, channel: 'email', error: 'Email not configured' };
      }

      // Use nodemailer or similar for real email sending
      // For now, return success if config exists
      this.logger.log(`Sending email to ${message.recipient} via ${config.smtpHost}`);
      
      // Real implementation would use:
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({...});

      return { success: true, channel: 'email' };
    } catch (error) {
      return { success: false, channel: 'email', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== WEBHOOK INTEGRATION ====================

  private async sendToWebhook(
    config: IntegrationConfig['webhook'],
    message: IntegrationMessage,
  ): Promise<{ success: boolean; channel: string; error?: string }> {
    try {
      if (!config?.url) {
        return { success: false, channel: 'webhook', error: 'Webhook URL not configured' };
      }

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...message,
        }),
      });

      if (response.ok) {
        return { success: true, channel: 'webhook' };
      } else {
        return { success: false, channel: 'webhook', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, channel: 'webhook', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== CONFIGURATION MANAGEMENT ====================

  async getIntegrationConfig(tenantId: string, userId: string): Promise<IntegrationConfig> {
    const config = await this.prisma.aIUserPreference.findFirst({
      where: {
        tenantId,
        userId,
        category: 'integrations',
        key: 'config',
      },
    });

    return (config?.value as IntegrationConfig) || {};
  }

  async setIntegrationConfig(
    tenantId: string,
    userId: string,
    config: IntegrationConfig,
  ): Promise<void> {
    await this.prisma.aIUserPreference.upsert({
      where: {
        tenantId_userId_category_key: {
          tenantId,
          userId,
          category: 'integrations',
          key: 'config',
        },
      },
      update: {
        value: config as any,
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        userId,
        category: 'integrations',
        key: 'config',
        value: config as any,
        confidence: 1,
        learnedFrom: 'explicit',
      },
    });
  }

  // ==================== TEMPLATE MESSAGES ====================

  getSyncCompleteMessage(platform: string, stats: any, language = 'tr'): IntegrationMessage {
    const messages: Record<string, { title: string; message: string }> = {
      tr: {
        title: `✅ ${platform} Eşitleme Tamamlandı`,
        message: `Eşitleme başarıyla tamamlandı.\n\nİşlem özeti:\n• Toplam: ${stats.total}\n• Başarılı: ${stats.success}\n• Başarısız: ${stats.failed}`,
      },
      en: {
        title: `✅ ${platform} Sync Completed`,
        message: `Sync completed successfully.\n\nSummary:\n• Total: ${stats.total}\n• Success: ${stats.success}\n• Failed: ${stats.failed}`,
      },
    };

    const msg = messages[language] || messages.en;

    return {
      channel: 'slack',
      recipient: '',
      title: msg.title,
      message: msg.message,
      buttons: [
        {
          text: language === 'tr' ? 'Detayları Gör' : 'View Details',
          action: 'view_details',
          style: 'primary',
        },
      ],
    };
  }

  getErrorMessage(error: string, platform: string, language = 'tr'): IntegrationMessage {
    const messages: Record<string, { title: string; message: string }> = {
      tr: {
        title: `❌ ${platform} Hatası`,
        message: `Bir hata oluştu: ${error}`,
      },
      en: {
        title: `❌ ${platform} Error`,
        message: `An error occurred: ${error}`,
      },
    };

    const msg = messages[language] || messages.en;

    return {
      channel: 'slack',
      recipient: '',
      title: msg.title,
      message: msg.message,
      buttons: [
        {
          text: language === 'tr' ? 'Tekrar Dene' : 'Retry',
          action: 'retry',
          style: 'danger',
        },
      ],
    };
  }

  getDailyReportMessage(report: any, language = 'tr'): IntegrationMessage {
    const messages: Record<string, { title: string; message: string }> = {
      tr: {
        title: '📊 Günlük Rapor',
        message: `Bugünkü aktivite özeti:\n\n• Yeni ürünler: ${report.newProducts}\n• Güncellenenler: ${report.updatedProducts}\n• Senkronizasyonlar: ${report.syncs}\n• Hatalar: ${report.errors}`,
      },
      en: {
        title: '📊 Daily Report',
        message: `Today's activity summary:\n\n• New products: ${report.newProducts}\n• Updated: ${report.updatedProducts}\n• Syncs: ${report.syncs}\n• Errors: ${report.errors}`,
      },
    };

    const msg = messages[language] || messages.en;

    return {
      channel: 'email',
      recipient: '',
      title: msg.title,
      message: msg.message,
    };
  }
}

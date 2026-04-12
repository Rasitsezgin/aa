import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export enum EmailType {
  WELCOME = 'welcome',
  ABANDONED_CART = 'abandoned_cart',
  PURCHASE_CONFIRMATION = 'purchase_confirmation',
  SHIPPING_NOTIFICATION = 'shipping_notification',
  REVIEW_REQUEST = 'review_request',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_ACTIVATION = 'account_activation',
  REENGAGEMENT = 'reengagement',
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailType;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  previewText?: string;
  thumbnailUrl?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  segmentId?: string;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  unsubscribeCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  createdAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    bounceRate: number;
  };
}

export interface EmailQueue {
  id: string;
  recipientEmail: string;
  templateId: string;
  campaignId?: string;
  variables: Record<string, any>;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'bounced';
  attempts: number;
  lastAttemptAt?: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface EmailAnalytics {
  period: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  totalUnsubscribed: number;
  averageOpenRate: number;
  averageClickRate: number;
  topCampaigns: { name: string; openRate: number; clickRate: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn('SMTP configuration missing, emails will be logged to console only');
    }
  }

  // Get email templates
  async getTemplates(type?: EmailType): Promise<EmailTemplate[]> {
    const templates: EmailTemplate[] = [
      {
        id: 'tpl_1',
        name: 'Hoşgeldin Emaili',
        type: EmailType.WELCOME,
        subject: 'Hoş geldiniz {{firstName}}!',
        htmlContent: '<h1>Hoş geldiniz!</h1><p>{{firstName}}, premium erişiminiz başladı.</p>',
        variables: ['firstName', 'accountUrl'],
        previewText: 'Hesabınız başarıyla oluşturuldu',
      },
      {
        id: 'tpl_2',
        name: 'Terk Edilen Sepet',
        type: EmailType.ABANDONED_CART,
        subject: 'Sepetiniz bekleniyor! 20% İndirim',
        htmlContent: '<h1>Sepeti tamamlayın</h1><p>{{cartTotal}} tutarındaki ürünleri unutmayın.</p>',
        variables: ['cartTotal', 'cartUrl', 'discountCode'],
        previewText: 'Alışverişinizi tamamlayın ve %20 indirim alın',
      },
      {
        id: 'tpl_3',
        name: 'Sipariş Onayı',
        type: EmailType.PURCHASE_CONFIRMATION,
        subject: 'Siparişiniz onaylandı #{{orderNumber}}',
        htmlContent: '<h1>Teşekkürler!</h1><p>Siparişiniz #{{orderNumber}} onaylandı.</p>',
        variables: ['orderNumber', 'orderTotal', 'trackingUrl'],
        previewText: 'Siparişiniz onaylandı ve hazırlanıyor',
      },
      {
        id: 'tpl_4',
        name: 'Kargo Bildirimi',
        type: EmailType.SHIPPING_NOTIFICATION,
        subject: 'Siparişiniz kargoda! Takip: {{trackingNumber}}',
        htmlContent: '<h1>Siparişiniz kargoda!</h1><p>Takip numarası: {{trackingNumber}}</p>',
        variables: ['trackingNumber', 'trackingUrl', 'estimatedDelivery'],
        previewText: 'Siparişiniz kargoda, takip edin',
      },
    ];

    return type ? templates.filter(t => t.type === type) : templates;
  }

  // Get email campaigns
  async getCampaigns(status?: string): Promise<EmailCampaign[]> {
    const campaigns: EmailCampaign[] = [
      {
        id: 'camp_1',
        name: 'Kış İndirimi Kampanyası',
        subject: 'Kışta %30 İndirim!',
        templateId: 'tpl_1',
        segmentId: 'seg_loyal',
        recipientCount: 5000,
        sentCount: 4950,
        openCount: 1980,
        clickCount: 450,
        conversionCount: 95,
        unsubscribeCount: 8,
        status: 'sent',
        createdAt: new Date('2025-01-15'),
        completedAt: new Date('2025-01-16'),
        stats: {
          openRate: 39.8,
          clickRate: 9.1,
          conversionRate: 1.9,
          bounceRate: 1.0,
        },
      },
      {
        id: 'camp_2',
        name: 'Terk Edilen Sepet Kurtarma',
        subject: 'Ürünleriniz hala bekleniyor',
        templateId: 'tpl_2',
        recipientCount: 1200,
        sentCount: 1200,
        openCount: 456,
        clickCount: 120,
        conversionCount: 35,
        unsubscribeCount: 2,
        status: 'sent',
        createdAt: new Date('2025-02-01'),
        completedAt: new Date('2025-02-02'),
        stats: {
          openRate: 38.0,
          clickRate: 10.0,
          conversionRate: 2.9,
          bounceRate: 0.0,
        },
      },
      {
        id: 'camp_3',
        name: 'Yeni Ürün Tanıtımı',
        subject: 'Yeni Koleksiyonumuz Hazır!',
        templateId: 'tpl_1',
        recipientCount: 8000,
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        conversionCount: 0,
        unsubscribeCount: 0,
        status: 'scheduled',
        createdAt: new Date('2025-02-03'),
        scheduledAt: new Date('2025-02-10'),
        stats: {
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          bounceRate: 0,
        },
      },
    ];

    return status ? campaigns.filter(c => c.status === status) : campaigns;
  }

  // Get email analytics
  async getEmailAnalytics(startDate?: Date, endDate?: Date): Promise<EmailAnalytics> {
    return {
      period: 'Şubat 2025',
      totalSent: 15000,
      totalOpened: 5250,
      totalClicked: 945,
      totalConverted: 185,
      totalUnsubscribed: 15,
      averageOpenRate: 35.0,
      averageClickRate: 6.3,
      topCampaigns: [
        { name: 'Kış İndirimi Kampanyası', openRate: 39.8, clickRate: 9.1 },
        { name: 'Terk Edilen Sepet Kurtarma', openRate: 38.0, clickRate: 10.0 },
        { name: 'Müşteri Sadakati', openRate: 32.5, clickRate: 5.2 },
      ],
      deviceBreakdown: [
        { device: 'Mobil', percentage: 65 },
        { device: 'Masaüstü', percentage: 30 },
        { device: 'Tablet', percentage: 5 },
      ],
    };
  }

  // Send email with ad-hoc content
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    return this.sendSystemEmail(to, subject, html);
  }

  // Create template
  async createTemplate(params: {
    name: string;
    subject: string;
    htmlContent: string;
    type: string;
  }): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: `tpl_${Date.now()}`,
      name: params.name,
      type: params.type as EmailType,
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML tags
      variables: params.subject.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/\{\{|\}\}/g, '')) || [],
    };
    this.logger.log(`[Email] Template created: ${newTemplate.id}`);
    return newTemplate;
  }

  // Send campaign immediately
  async sendCampaign(campaignId: string): Promise<{ success: boolean; sentCount: number }> {
    this.logger.log(`[Email] Sending campaign: ${campaignId}`);
    // In real implementation, this would queue emails to be sent
    return { success: true, sentCount: 100 };
  }

  // Get analytics with period filter
  async getAnalytics(
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<EmailAnalytics> {
    return this.getEmailAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  // Delete campaign
  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    this.logger.log(`[Email] Deleting campaign: ${campaignId}`);
    return { success: true };
  }

  // Pause campaign
  async pauseCampaign(campaignId: string): Promise<{ success: boolean }> {
    this.logger.log(`[Email] Pausing campaign: ${campaignId}`);
    return { success: true };
  }

  // Resume campaign
  async resumeCampaign(campaignId: string): Promise<{ success: boolean }> {
    this.logger.log(`[Email] Resuming campaign: ${campaignId}`);
    return { success: true };
  }

  // Helper for sending system emails without templates (Ad-hoc)
  async sendSystemEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get('SMTP_FROM') || '"PazarYönetimi" <noreply@pazaryonetimi.com>',
          to,
          subject,
          html,
        });
        this.logger.log(`[Email] System email sent to ${to}`);
        return true;
      } catch (error) {
        this.logger.error(`[Email] Failed to send email to ${to}`, error);
        return false;
      }
    } else {
      this.logger.log(`[Email MOCK] To: ${to}, Subject: ${subject}`);
      return true;
    }
  }

  // Create campaign
  async createCampaign(params: {
    name: string;
    templateId: string;
    segmentId?: string;
    subject: string;
    scheduledAt?: Date;
  }): Promise<EmailCampaign> {
    return {
      id: `camp_${Date.now()}`,
      name: params.name,
      subject: params.subject,
      templateId: params.templateId,
      segmentId: params.segmentId,
      recipientCount: 1000,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      conversionCount: 0,
      unsubscribeCount: 0,
      status: 'draft',
      createdAt: new Date(),
      scheduledAt: params.scheduledAt,
      stats: {
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        bounceRate: 0,
      },
    };
  }

  // Get email queue status
  async getQueueStatus(): Promise<{
    pending: number;
    sending: number;
    sent: number;
    failed: number;
  }> {
    return {
      pending: 450,
      sending: 12,
      sent: 15420,
      failed: 18,
    };
  }

  // Get A/B test results
  async getABTestResults(campaignId: string): Promise<{
    variant: string;
    recipientCount: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    winner?: string;
  }[]> {
    return [
      {
        variant: 'Variant A: Kırmızı CTA',
        recipientCount: 2500,
        openRate: 38.5,
        clickRate: 8.2,
        conversionRate: 2.1,
      },
      {
        variant: 'Variant B: Yeşil CTA',
        recipientCount: 2500,
        openRate: 40.2,
        clickRate: 10.1,
        conversionRate: 2.8,
        winner: 'B',
      },
    ];
  }

  // Get email deliverability
  async getDeliverability(): Promise<{
    delivered: number;
    bounced: number;
    complained: number;
    suppressed: number;
    deliverability: number;
  }> {
    return {
      delivered: 14900,
      bounced: 75,
      complained: 8,
      suppressed: 17,
      deliverability: 99.4,
    };
  }
}

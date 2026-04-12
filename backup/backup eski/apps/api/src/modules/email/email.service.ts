import { Injectable } from '@nestjs/common';

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

  // Send email
  async sendEmail(
    templateId: string,
    recipientEmail: string,
    variables?: Record<string, any>,
    campaignId?: string
  ): Promise<{ success: boolean; messageId: string; message: string }> {
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      message: `Email başarıyla gönderildi: ${recipientEmail}`,
    };
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

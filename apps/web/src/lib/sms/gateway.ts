// SMS Gateway - Multi-provider SMS system
// Support for Twilio, AWS SNS, MessageBird, and custom providers

type SMSProvider = 'twilio' | 'aws_sns' | 'messagebird' | 'netgsm' | 'custom';
type MessageStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';

interface SMSProviderConfig {
  id: string;
  tenantId: string;
  provider: SMSProvider;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
  settings: {
    senderId?: string;
    defaultCountryCode?: string;
    maxMessagesPerSecond: number;
    retryAttempts: number;
    useUnicode: boolean;
  };
  priority: number;
  fallbackProviderId?: string;
}

interface SMSMessage {
  id: string;
  tenantId: string;
  providerId: string;
  to: string;
  from: string;
  body: string;
  status: MessageStatus;
  parts: number;
  cost?: number;
  externalId?: string;
  retryCount: number;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface SMSTemplate {
  id: string;
  tenantId: string;
  name: string;
  body: string;
  variables: string[];
  category: 'order' | 'shipping' | 'marketing' | 'otp' | 'notification';
  isActive: boolean;
}

interface SMSCampaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}

// SMS Gateway
export class SMSGateway {
  private providers: Map<string, SMSProviderConfig> = new Map();
  private messages: Map<string, SMSMessage> = new Map();
  private templates: Map<string, SMSTemplate> = new Map();
  private campaigns: Map<string, SMSCampaign> = new Map();

  // Register provider
  registerProvider(config: Omit<SMSProviderConfig, 'id'>): SMSProviderConfig {
    const provider: SMSProviderConfig = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.providers.set(provider.id, provider);
    return provider;
  }

  // Send single SMS
  async send(
    tenantId: string,
    message: {
      to: string;
      body: string;
      from?: string;
      scheduledAt?: Date;
    }
  ): Promise<SMSMessage> {
    // Find best provider
    const provider = this.selectProvider(tenantId);
    if (!provider) {
      throw new Error('No active SMS provider found');
    }

    // Format phone number
    const to = this.formatPhoneNumber(message.to, provider.settings.defaultCountryCode);

    // Calculate message parts
    const parts = this.calculateMessageParts(message.body, provider.settings.useUnicode);

    const sms: SMSMessage = {
      id: crypto.randomUUID(),
      tenantId,
      providerId: provider.id,
      to,
      from: message.from || provider.settings.senderId || 'Pazaryonetimi',
      body: message.body,
      status: 'pending',
      parts,
      retryCount: 0,
      scheduledAt: message.scheduledAt,
      createdAt: new Date(),
    };

    this.messages.set(sms.id, sms);

    // Send immediately or schedule
    if (message.scheduledAt && message.scheduledAt > new Date()) {
      sms.status = 'queued';
      // Would schedule with job queue
    } else {
      await this.dispatch(sms, provider);
    }

    return sms;
  }

  // Send bulk SMS
  async sendBulk(
    tenantId: string,
    messages: Array<{ to: string; body: string }>,
    options: {
      throttleMs?: number;
      templateId?: string;
    } = {}
  ): Promise<{
    total: number;
    queued: number;
    failed: number;
    messageIds: string[];
  }> {
    const results = {
      total: messages.length,
      queued: 0,
      failed: 0,
      messageIds: [] as string[],
    };

    const provider = this.selectProvider(tenantId);
    if (!provider) {
      throw new Error('No active SMS provider found');
    }

    // Rate limit
    const throttle = options.throttleMs || 1000 / provider.settings.maxMessagesPerSecond;

    for (const msg of messages) {
      try {
        const sms = await this.send(tenantId, msg);
        results.queued++;
        results.messageIds.push(sms.id);

        // Throttle
        await new Promise(resolve => setTimeout(resolve, throttle));
      } catch (error) {
        results.failed++;
      }
    }

    return results;
  }

  // Send using template
  async sendTemplate(
    tenantId: string,
    templateId: string,
    to: string,
    variables: Record<string, string>
  ): Promise<SMSMessage> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Process template
    let body = template.body;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.send(tenantId, { to, body });
  }

  // Create campaign
  async createCampaign(
    tenantId: string,
    config: {
      name: string;
      templateId: string;
      recipients: string[];
      variables?: Record<string, string>;
      scheduledAt?: Date;
    }
  ): Promise<SMSCampaign> {
    const template = this.templates.get(config.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const campaign: SMSCampaign = {
      id: crypto.randomUUID(),
      tenantId,
      name: config.name,
      templateId: config.templateId,
      recipients: config.recipients,
      status: config.scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: config.scheduledAt,
      stats: {
        total: config.recipients.length,
        sent: 0,
        delivered: 0,
        failed: 0,
      },
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  // Start campaign
  async startCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const template = this.templates.get(campaign.templateId);
    if (!template) throw new Error('Template not found');

    campaign.status = 'sending';
    campaign.startedAt = new Date();

    // Send to all recipients
    const results = await this.sendBulk(
      campaign.tenantId,
      campaign.recipients.map(to => ({ to, body: template.body }))
    );

    campaign.stats.sent = results.queued;
    campaign.stats.failed = results.failed;
    campaign.status = 'completed';
    campaign.completedAt = new Date();
  }

  // Get message status
  async getStatus(messageId: string): Promise<MessageStatus> {
    const message = this.messages.get(messageId);
    if (!message) throw new Error('Message not found');

    // Check with provider for updates
    const provider = this.providers.get(message.providerId);
    if (provider) {
      await this.checkDeliveryStatus(message, provider);
    }

    return message.status;
  }

  // Handle delivery callback
  async handleCallback(
    providerId: string,
    payload: {
      messageId: string;
      status: MessageStatus;
      timestamp?: Date;
      error?: string;
    }
  ): Promise<void> {
    // Find message by external ID or lookup
    for (const [id, msg] of this.messages) {
      if (msg.externalId === payload.messageId || msg.id === payload.messageId) {
        msg.status = payload.status;
        
        if (payload.status === 'delivered') {
          msg.deliveredAt = payload.timestamp || new Date();
        }
        
        if (payload.status === 'failed') {
          msg.error = payload.error;
          
          // Retry if configured
          const provider = this.providers.get(msg.providerId);
          if (provider && msg.retryCount < provider.settings.retryAttempts) {
            await this.retry(msg);
          }
        }

        break;
      }
    }
  }

  // Get analytics
  getAnalytics(
    tenantId: string,
    period: { from: Date; to: Date }
  ): {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    cost: number;
    byProvider: Record<string, { sent: number; delivered: number; failed: number }>;
    byDay: Record<string, { sent: number; delivered: number }>;
  } {
    const messages = Array.from(this.messages.values())
      .filter(m => m.tenantId === tenantId)
      .filter(m => m.createdAt >= period.from && m.createdAt <= period.to);

    const totalSent = messages.length;
    const totalDelivered = messages.filter(m => m.status === 'delivered').length;
    const totalFailed = messages.filter(m => m.status === 'failed').length;
    const cost = messages.reduce((sum, m) => sum + (m.cost || 0), 0);

    // By provider
    const byProvider: Record<string, { sent: number; delivered: number; failed: number }> = {};
    for (const msg of messages) {
      const provider = this.providers.get(msg.providerId)?.name || 'Unknown';
      if (!byProvider[provider]) {
        byProvider[provider] = { sent: 0, delivered: 0, failed: 0 };
      }
      byProvider[provider].sent++;
      if (msg.status === 'delivered') byProvider[provider].delivered++;
      if (msg.status === 'failed') byProvider[provider].failed++;
    }

    // By day
    const byDay: Record<string, { sent: number; delivered: number }> = {};
    for (const msg of messages) {
      const day = msg.createdAt.toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { sent: 0, delivered: 0 };
      }
      byDay[day].sent++;
      if (msg.status === 'delivered') byDay[day].delivered++;
    }

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      cost,
      byProvider,
      byDay,
    };
  }

  // Create template
  createTemplate(
    tenantId: string,
    template: Omit<SMSTemplate, 'id' | 'tenantId' | 'variables'>
  ): SMSTemplate {
    // Extract variables from body
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(template.body)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const newTemplate: SMSTemplate = {
      ...template,
      id: crypto.randomUUID(),
      tenantId,
      variables,
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  // Private methods
  private selectProvider(tenantId: string): SMSProviderConfig | null {
    const providers = Array.from(this.providers.values())
      .filter(p => p.tenantId === tenantId && p.enabled)
      .sort((a, b) => a.priority - b.priority);

    return providers[0] || null;
  }

  private formatPhoneNumber(number: string, defaultCountryCode?: string): string {
    // Remove all non-numeric
    let cleaned = number.replace(/\D/g, '');

    // Add country code if needed
    if (defaultCountryCode && !cleaned.startsWith('+')) {
      if (cleaned.length === 10 && defaultCountryCode === '90') {
        // Turkish number without country code
        cleaned = '90' + cleaned;
      } else {
        cleaned = defaultCountryCode + cleaned;
      }
    }

    return '+' + cleaned;
  }

  private calculateMessageParts(body: string, useUnicode: boolean): number {
    if (!useUnicode) {
      // GSM 7-bit encoding: 160 chars per part, 153 for multipart
      const limit = 160;
      const multipartLimit = 153;
      
      if (body.length <= limit) return 1;
      return Math.ceil(body.length / multipartLimit);
    } else {
      // UCS-2 encoding: 70 chars per part, 67 for multipart
      const limit = 70;
      const multipartLimit = 67;
      
      if (body.length <= limit) return 1;
      return Math.ceil(body.length / multipartLimit);
    }
  }

  private async dispatch(message: SMSMessage, provider: SMSProviderConfig): Promise<void> {
    try {
      switch (provider.provider) {
        case 'twilio':
          await this.sendTwilio(message, provider);
          break;
        case 'aws_sns':
          await this.sendAWS(message, provider);
          break;
        case 'netgsm':
          await this.sendNetgsm(message, provider);
          break;
        default:
          throw new Error(`Provider ${provider.provider} not implemented`);
      }

      message.status = 'sent';
      message.sentAt = new Date();
    } catch (error) {
      message.status = 'failed';
      message.error = String(error);
      
      // Try fallback
      if (provider.fallbackProviderId) {
        const fallback = this.providers.get(provider.fallbackProviderId);
        if (fallback) {
          message.providerId = fallback.id;
          await this.dispatch(message, fallback);
        }
      }
    }
  }

  private async sendTwilio(
    message: SMSMessage,
    config: SMSProviderConfig
  ): Promise<void> {
    const { accountSid, authToken } = config.credentials;
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: message.to,
          From: message.from,
          Body: message.body,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio error: ${error}`);
    }

    const data = await response.json();
    message.externalId = data.sid;
    message.cost = Number(data.price) || 0;
  }

  private async sendAWS(
    message: SMSMessage,
    config: SMSProviderConfig
  ): Promise<void> {
    // Would use AWS SDK
    console.log('Sending via AWS SNS:', message.to);
  }

  private async sendNetgsm(
    message: SMSMessage,
    config: SMSProviderConfig
  ): Promise<void> {
    // Turkish provider
    console.log('Sending via Netgsm:', message.to);
  }

  private async checkDeliveryStatus(
    message: SMSMessage,
    provider: SMSProviderConfig
  ): Promise<void> {
    // Would check with provider API
  }

  private async retry(message: SMSMessage): Promise<void> {
    message.retryCount++;
    message.status = 'pending';
    
    const provider = this.providers.get(message.providerId);
    if (provider) {
      await this.dispatch(message, provider);
    }
  }
}

// SMS template library
export class SMSTemplateLibrary {
  private templates: Map<string, Omit<SMSTemplate, 'id' | 'tenantId'>> = new Map([
    ['order_confirmation', {
      name: 'Order Confirmation',
      body: 'Merhaba {{customerName}}, {{orderNumber}} numarali siparisiniz alindi. Tutar: {{total}} TL',
      category: 'order',
      isActive: true,
    }],
    ['shipment_notification', {
      name: 'Shipment Notification',
      body: '{{customerName}}, {{orderNumber}} siparisiniz kargoya verildi. Takip: {{trackingNumber}}',
      category: 'shipping',
      isActive: true,
    }],
    ['otp', {
      name: 'One Time Password',
      body: 'Dogulama kodunuz: {{code}}. Bu kod 5 dakika gecerlidir.',
      category: 'otp',
      isActive: true,
    }],
    ['delivery_confirmation', {
      name: 'Delivery Confirmation',
      body: '{{customerName}}, {{orderNumber}} siparisiniz teslim edildi. Bizi tercih ettiginiz icin tesekkurler!',
      category: 'order',
      isActive: true,
    }],
  ]);

  getTemplate(name: string): Omit<SMSTemplate, 'id' | 'tenantId'> | null {
    return this.templates.get(name) || null;
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

// Export singleton
export const smsGateway = new SMSGateway();
export const smsTemplateLibrary = new SMSTemplateLibrary();

export { SMSProviderConfig, SMSMessage, SMSTemplate, SMSCampaign };

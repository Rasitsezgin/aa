// WhatsApp Business API Integration
// Supports both Meta Business API and third-party providers (Twilio, MessageBird)

interface WhatsAppConfig {
  provider: 'meta' | 'twilio' | 'messagebird';
  apiKey: string;
  apiSecret?: string;
  phoneNumberId: string;
  businessAccountId?: string;
  webhookSecret?: string;
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'location';
  content: string;
  templateName?: string;
  templateLanguage?: string;
  variables?: Record<string, string>;
  mediaUrl?: string;
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text: string;
  }>;
}

class WhatsAppAPI {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  // Send message
  async sendMessage(message: WhatsAppMessage): Promise<{ messageId: string; status: string }> {
    switch (this.config.provider) {
      case 'meta':
        return this.sendViaMeta(message);
      case 'twilio':
        return this.sendViaTwilio(message);
      case 'messagebird':
        return this.sendViaMessageBird(message);
      default:
        throw new Error('Unsupported WhatsApp provider');
    }
  }

  // Meta Business API
  private async sendViaMeta(message: WhatsAppMessage): Promise<{ messageId: string; status: string }> {
    const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`;

    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(message.to),
      type: message.type,
    };

    if (message.type === 'text') {
      payload.text = { body: message.content };
    } else if (message.type === 'template') {
      payload.template = {
        name: message.templateName,
        language: { code: message.templateLanguage || 'tr' },
        components: message.variables
          ? [
              {
                type: 'body',
                parameters: Object.entries(message.variables).map(([_, value]) => ({
                  type: 'text',
                  text: value,
                })),
              },
            ]
          : undefined,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { messageId: data.messages?.[0]?.id, status: 'sent' };
  }

  // Twilio API
  private async sendViaTwilio(message: WhatsAppMessage): Promise<{ messageId: string; status: string }> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.apiKey}/Messages.json`;

    const body = new URLSearchParams({
      From: `whatsapp:${this.config.phoneNumberId}`,
      To: `whatsapp:${this.formatPhoneNumber(message.to)}`,
      Body: message.content,
    });

    if (message.mediaUrl) {
      body.append('MediaUrl', message.mediaUrl);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twilio error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { messageId: data.sid, status: data.status };
  }

  // MessageBird API
  private async sendViaMessageBird(message: WhatsAppMessage): Promise<{ messageId: string; status: string }> {
    const url = 'https://conversations.messagebird.com/v1/send';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `AccessKey ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: this.formatPhoneNumber(message.to),
        from: this.config.phoneNumberId,
        type: 'whatsapp',
        content: {
          text: message.content,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('MessageBird API error');
    }

    const data = await response.json();
    return { messageId: data.id, status: 'sent' };
  }

  // Verify webhook signature (Meta)
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.config.webhookSecret) return false;

    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  // Handle incoming webhook
  async handleWebhook(payload: Record<string, unknown>): Promise<void> {
    const entry = payload.entry?.[0] as Record<string, unknown>;
    const changes = entry?.changes?.[0] as Record<string, unknown>;
    const value = changes?.value as Record<string, unknown>;

    if (value?.messages) {
      const messages = value.messages as Array<Record<string, unknown>>;
      for (const msg of messages) {
        await this.processIncomingMessage(msg);
      }
    }

    if (value?.statuses) {
      const statuses = value.statuses as Array<Record<string, unknown>>;
      for (const status of statuses) {
        await this.processStatusUpdate(status);
      }
    }
  }

  private async processIncomingMessage(msg: Record<string, unknown>): Promise<void> {
    // Store in database for omnichannel messaging
    console.log('Incoming WhatsApp message:', msg);

    // Could trigger AI response or route to support agent
    // await createOmnichannelMessage({...})
  }

  private async processStatusUpdate(status: Record<string, unknown>): Promise<void> {
    // Update message delivery status in database
    console.log('WhatsApp status update:', status);
  }

  // Format phone number to international format
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Add country code if missing (assume Turkey)
    if (digits.length === 10 && digits.startsWith('5')) {
      return `90${digits}`;
    }

    return digits;
  }

  // Get message templates (Meta only)
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    if (this.config.provider !== 'meta') {
      throw new Error('Templates only available with Meta Business API');
    }

    const url = `https://graph.facebook.com/v18.0/${this.config.businessAccountId}/message_templates`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    const data = await response.json();
    return data.data || [];
  }
}

// E-commerce specific WhatsApp features
export class WhatsAppCommerce {
  private api: WhatsAppAPI;

  constructor(config: WhatsAppConfig) {
    this.api = new WhatsAppAPI(config);
  }

  // Send order confirmation
  async sendOrderConfirmation(
    phone: string,
    orderData: {
      orderId: string;
      customerName: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      trackingUrl?: string;
    }
  ): Promise<void> {
    const itemList = orderData.items
      .map((item) => `• ${item.name} x${item.quantity} - ₺${item.price}`)
      .join('\n');

    const message = `Merhaba ${orderData.customerName}! 🛍️

Siparişiniz alındı:
${itemList}

Toplam: ₺${orderData.total}
Sipariş No: #${orderData.orderId}

${orderData.trackingUrl ? `Kargo takibi: ${orderData.trackingUrl}` : ''}

Teşekkür ederiz! 💙`;

    await this.api.sendMessage({
      to: phone,
      type: 'text',
      content: message,
    });
  }

  // Send shipping notification
  async sendShippingNotification(
    phone: string,
    data: {
      orderId: string;
      carrier: string;
      trackingNumber: string;
      trackingUrl: string;
    }
  ): Promise<void> {
    await this.api.sendMessage({
      to: phone,
      type: 'text',
      content: `🚚 Siparişiniz yola çıktı!\n\nKargo: ${data.carrier}\nTakip No: ${data.trackingNumber}\n\nTakip için: ${data.trackingUrl}`,
    });
  }

  // Send abandoned cart reminder
  async sendCartReminder(
    phone: string,
    data: {
      customerName: string;
      items: Array<{ name: string; price: number }>;
      cartUrl: string;
      discountCode?: string;
    }
  ): Promise<void> {
    const itemList = data.items.map((item) => `• ${item.name}`).join('\n');
    const discountText = data.discountCode
      ? `\n🎁 %10 indirim kodunuz: ${data.discountCode}`
      : '';

    await this.api.sendMessage({
      to: phone,
      type: 'text',
      content: `Merhaba ${data.customerName}! 👋\n\nSepetinizdeki ürünleri unuttunuz:\n${itemList}${discountText}\n\nSiparişi tamamla: ${data.cartUrl}`,
    });
  }

  // Send low stock alert to merchant
  async sendLowStockAlert(
    phone: string,
    data: {
      productName: string;
      currentStock: number;
      productUrl: string;
    }
  ): Promise<void> {
    await this.api.sendMessage({
      to: phone,
      type: 'text',
      content: `⚠️ Düşük Stok Uyarısı\n\nÜrün: ${data.productName}\nKalan Stok: ${data.currentStock}\n\nStok güncelle: ${data.productUrl}`,
    });
  }
}

export { WhatsAppAPI };
export type { WhatsAppConfig, WhatsAppMessage, WhatsAppTemplate };

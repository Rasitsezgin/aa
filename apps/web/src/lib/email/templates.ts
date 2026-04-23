// Email Template System with MJML
// Rich email templates with responsive design

interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  category: 'transactional' | 'marketing' | 'notification' | 'digest';
  mjml: string;
  html?: string;
  text?: string;
  variables: string[];
  previewData?: Record<string, string>;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailCampaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  segments: string[];
  schedule?: {
    type: 'immediate' | 'scheduled' | 'recurring';
    sendAt?: Date;
    cronExpression?: string;
    timezone?: string;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  stats: {
    recipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}

interface EmailLayout {
  id: string;
  tenantId: string;
  name: string;
  mjml: string;
  brandColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  footerText?: string;
  unsubscribeUrl?: string;
}

// Email Template Engine
export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();
  private layouts: Map<string, EmailLayout> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();

  // Create template
  createTemplate(
    tenantId: string,
    config: Omit<EmailTemplate, 'id' | 'tenantId' | 'variables' | 'version' | 'createdAt' | 'updatedAt'>
  ): EmailTemplate {
    // Extract variables from subject and MJML
    const variables = this.extractVariables(config.subject, config.mjml);

    const template: EmailTemplate = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      variables,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Compile MJML to HTML
    template.html = this.compileMJML(template.mjml);

    this.templates.set(template.id, template);
    return template;
  }

  // Update template
  updateTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): EmailTemplate {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    Object.assign(template, updates, { updatedAt: new Date() });

    // Recompile if MJML changed
    if (updates.mjml) {
      template.html = this.compileMJML(template.mjml);
      template.variables = this.extractVariables(template.subject, template.mjml);
      template.version++;
    }

    return template;
  }

  // Render template with data
  render(
    templateId: string,
    data: Record<string, string>,
    layoutId?: string
  ): {
    subject: string;
    html: string;
    text: string;
  } {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    let html = template.html || '';
    let subject = template.subject;

    // Process variables
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
      subject = subject.replace(regex, value);
    }

    // Apply layout if specified
    if (layoutId) {
      const layout = this.layouts.get(layoutId);
      if (layout) {
        html = this.applyLayout(html, layout, data);
      }
    }

    // Generate plain text version
    const text = this.htmlToText(html);

    return { subject, html, text };
  }

  // Preview template
  preview(templateId: string, layoutId?: string): {
    subject: string;
    html: string;
    text: string;
  } {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    // Generate sample data
    const sampleData: Record<string, string> = {};
    for (const variable of template.variables) {
      sampleData[variable] = template.previewData?.[variable] || `[${variable}]`;
    }

    return this.render(templateId, sampleData, layoutId);
  }

  // Create email layout
  createLayout(
    tenantId: string,
    config: Omit<EmailLayout, 'id' | 'tenantId'>
  ): EmailLayout {
    const layout: EmailLayout = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
    };

    this.layouts.set(layout.id, layout);
    return layout;
  }

  // Create campaign
  createCampaign(
    tenantId: string,
    config: Omit<EmailCampaign, 'id' | 'tenantId' | 'status' | 'stats' | 'createdAt'>
  ): EmailCampaign {
    const campaign: EmailCampaign = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      status: 'draft',
      stats: {
        recipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      createdAt: new Date(),
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  // Send campaign
  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const template = this.templates.get(campaign.templateId);
    if (!template) throw new Error('Template not found');

    campaign.status = 'sending';
    campaign.sentAt = new Date();

    // Would queue emails for sending
    console.log(`Sending campaign ${campaign.name} with template ${template.name}`);

    campaign.status = 'completed';
    campaign.completedAt = new Date();
  }

  // Get campaign analytics
  getCampaignAnalytics(campaignId: string): EmailCampaign['stats'] & {
    openRate: number;
    clickRate: number;
    bounceRate: number;
  } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const { sent, delivered, opened, clicked, bounced } = campaign.stats;

    return {
      ...campaign.stats,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
    };
  }

  // A/B Test functionality
  createABTest(
    tenantId: string,
    config: {
      name: string;
      subjectVariants: string[];
      contentVariants: string[];
      testPercentage: number; // Percentage of audience for test
      winningMetric: 'openRate' | 'clickRate';
      testDuration: number; // Hours
    }
  ): {
    testId: string;
    variants: Array<{
      id: string;
      subject: string;
      content: string;
      segment: string;
    }>;
  } {
    const variants = [];
    
    for (let i = 0; i < config.subjectVariants.length; i++) {
      for (let j = 0; j < config.contentVariants.length; j++) {
        variants.push({
          id: crypto.randomUUID(),
          subject: config.subjectVariants[i],
          content: config.contentVariants[j],
          segment: `test_${i}_${j}`,
        });
      }
    }

    return {
      testId: crypto.randomUUID(),
      variants,
    };
  }

  // List templates for tenant
  listTemplates(tenantId: string): EmailTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.tenantId === tenantId);
  }

  // List layouts for tenant
  listLayouts(tenantId: string): EmailLayout[] {
    return Array.from(this.layouts.values())
      .filter(l => l.tenantId === tenantId);
  }

  // Get template by ID
  getTemplate(templateId: string): EmailTemplate | null {
    return this.templates.get(templateId) || null;
  }

  // Private methods
  private compileMJML(mjml: string): string {
    // Simplified MJML compilation
    // In production, use mjml library
    return mjml
      .replace(/<mjml>/g, '<html>')
      .replace(/<\/mjml>/g, '</html>')
      .replace(/<mj-body>/g, '<body style="margin:0;padding:0;background:#f4f4f4;">')
      .replace(/<\/mj-body>/g, '</body>')
      .replace(/<mj-section>/g, '<div style="background:#fff;margin:0 auto;max-width:600px;">')
      .replace(/<\/mj-section>/g, '</div>')
      .replace(/<mj-column>/g, '<div style="padding:20px;">')
      .replace(/<\/mj-column>/g, '</div>')
      .replace(/<mj-text>/g, '<p style="margin:0;padding:10px 0;font-family:Arial,sans-serif;">')
      .replace(/<\/mj-text>/g, '</p>')
      .replace(/<mj-button/g, '<a style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:4px;font-family:Arial,sans-serif;"')
      .replace(/<\/mj-button>/g, '</a>')
      .replace(/href="([^"]+)"/, 'href="$1"');
  }

  private applyLayout(
    content: string,
    layout: EmailLayout,
    data: Record<string, string>
  ): string {
    let html = layout.mjml;

    // Replace content placeholder
    html = html.replace('{{content}}', content);

    // Apply brand colors
    html = html
      .replace(/{{primaryColor}}/g, layout.brandColors.primary)
      .replace(/{{secondaryColor}}/g, layout.brandColors.secondary)
      .replace(/{{backgroundColor}}/g, layout.brandColors.background)
      .replace(/{{textColor}}/g, layout.brandColors.text);

    // Replace variables
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Add logo
    if (layout.logoUrl) {
      html = html.replace('{{logo}}', `<img src="${layout.logoUrl}" alt="Logo" style="max-width:200px;" />`);
    }

    // Add footer
    if (layout.footerText) {
      html = html.replace('{{footer}}', layout.footerText);
    }

    // Add social links
    if (layout.socialLinks) {
      const socialHtml = Object.entries(layout.socialLinks)
        .map(([platform, url]) => `<a href="${url}">${platform}</a>`)
        .join(' | ');
      html = html.replace('{{socialLinks}}', socialHtml);
    }

    // Add unsubscribe
    if (layout.unsubscribeUrl) {
      html = html.replace(
        '{{unsubscribe}}',
        `<a href="${layout.unsubscribeUrl}">Unsubscribe</a>`
      );
    }

    return this.compileMJML(html);
  }

  private extractVariables(subject: string, mjml: string): string[] {
    const variables: string[] = [];
    const regex = /\{\{(\w+)\}\}/g;
    let match;

    const text = subject + mjml;
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Predefined email templates
export const DEFAULT_EMAIL_TEMPLATES: Record<string, Omit<EmailTemplate, 'id' | 'tenantId' | 'variables' | 'version' | 'createdAt' | 'updatedAt'>> = {
  orderConfirmation: {
    name: 'Order Confirmation',
    subject: 'Siparişiniz Alındı - {{orderNumber}}',
    category: 'transactional',
    mjml: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1>Siparişiniz Alındı!</h1>
          <p>Merhaba {{customerName}},</p>
          <p>{{orderNumber}} numaralı siparişiniz başarıyla alındı.</p>
          <p><strong>Sipariş Özeti:</strong></p>
          <p>Toplam: {{total}} TL</p>
        </mj-text>
        <mj-button href="{{orderUrl}}">Siparişimi Görüntüle</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    previewData: {
      customerName: 'Ahmet Yılmaz',
      orderNumber: 'ORD-12345',
      total: '1,250.00',
      orderUrl: 'https://example.com/order/12345',
    },
    isActive: true,
  },
  shippingNotification: {
    name: 'Shipping Notification',
    subject: 'Siparişiniz Yola Çıktı - {{orderNumber}}',
    category: 'transactional',
    mjml: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1>Siparişiniz Yola Çıktı!</h1>
          <p>Merhaba {{customerName}},</p>
          <p>{{orderNumber}} numaralı siparişiniz kargoya verildi.</p>
          <p><strong>Kargo Takip No:</strong> {{trackingNumber}}</p>
        </mj-text>
        <mj-button href="{{trackingUrl}}">Kargomu Takip Et</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    previewData: {
      customerName: 'Ahmet Yılmaz',
      orderNumber: 'ORD-12345',
      trackingNumber: 'ABC123456789',
      trackingUrl: 'https://kargo.com/track/ABC123456789',
    },
    isActive: true,
  },
  passwordReset: {
    name: 'Password Reset',
    subject: 'Şifre Sıfırlama Talebi',
    category: 'transactional',
    mjml: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1>Şifre Sıfırlama</h1>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        </mj-text>
        <mj-button href="{{resetUrl}}">Şifremi Sıfırla</mj-button>
        <mj-text>
          <p>Bu link 24 saat geçerlidir.</p>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    previewData: {
      resetUrl: 'https://example.com/reset-password?token=xyz123',
    },
    isActive: true,
  },
  welcomeEmail: {
    name: 'Welcome Email',
    subject: 'Hoş Geldiniz {{customerName}}!',
    category: 'transactional',
    mjml: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1>Hoş Geldiniz!</h1>
          <p>Merhaba {{customerName}},</p>
          <p>Pazaryönetimi ailesine katıldığınız için teşekkür ederiz.</p>
          <p>Hemen alışverişe başlamak için butona tıklayın:</p>
        </mj-text>
        <mj-button href="{{shopUrl}}">Alışverişe Başla</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    previewData: {
      customerName: 'Ahmet',
      shopUrl: 'https://example.com/shop',
    },
    isActive: true,
  },
  abandonedCart: {
    name: 'Abandoned Cart',
    subject: 'Sepetinizi Unuttunuz - {{items}} ürün bekliyor',
    category: 'marketing',
    mjml: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          <h1>Sepetiniz Sizi Bekliyor</h1>
          <p>Merhaba {{customerName}},</p>
          <p>Sepetinizdeki ürünleri tamamlamadınız. Stoklar tükenmeden siparişinizi tamamlayın:</p>
        </mj-text>
        <mj-button href="{{cartUrl}}">Sepetime Git</mj-button>
        <mj-text>
          <p><strong>Sepetinizdeki Ürünler:</strong></p>
          <p>{{items}}</p>
          <p>Toplam: {{total}} TL</p>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`,
    previewData: {
      customerName: 'Ahmet',
      items: 'iPhone 14 Pro, AirPods Pro',
      total: '45,999',
      cartUrl: 'https://example.com/cart',
    },
    isActive: true,
  },
};

// Export singleton
export const emailTemplateEngine = new EmailTemplateEngine();

export { EmailTemplate, EmailCampaign, EmailLayout };

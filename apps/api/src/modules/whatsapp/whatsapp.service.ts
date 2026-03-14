import { Injectable, Logger } from '@nestjs/common';

export interface WhatsappConfig {
    enabled: boolean;
    provider: 'meta' | 'twilio' | 'wati';
    apiKey: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    notifications: {
        orderConfirmation: boolean;
        shippingUpdate: boolean;
        deliveryConfirmation: boolean;
        returnUpdate: boolean;
        lowStock: boolean;
        priceChange: boolean;
    };
}

export interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    variables: string[];
    category: string;
}

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    // In-memory config store (in production, use database)
    private configs: Map<string, WhatsappConfig> = new Map();
    private messageLogs: Map<string, any[]> = new Map();

    async getConfig(tenantId: string): Promise<WhatsappConfig> {
        return this.configs.get(tenantId) || {
            enabled: false,
            provider: 'meta',
            apiKey: '',
            phoneNumberId: '',
            businessAccountId: '',
            webhookVerifyToken: '',
            notifications: {
                orderConfirmation: true,
                shippingUpdate: true,
                deliveryConfirmation: true,
                returnUpdate: true,
                lowStock: false,
                priceChange: false,
            },
        };
    }

    async updateConfig(tenantId: string, data: Partial<WhatsappConfig>): Promise<WhatsappConfig> {
        const current = await this.getConfig(tenantId);
        const updated = { ...current, ...data };
        this.configs.set(tenantId, updated);
        this.logger.log(`WhatsApp config updated for tenant ${tenantId}`);
        return updated;
    }

    async sendTestMessage(tenantId: string, phone: string, message: string) {
        const config = await this.getConfig(tenantId);
        if (!config.enabled) {
            return { success: false, error: 'WhatsApp entegrasyonu aktif değil' };
        }

        // In production, this would call WhatsApp Business API
        this.logger.log(`Test message sent to ${phone}: ${message}`);
        this.addLog(tenantId, {
            type: 'test',
            phone,
            message,
            status: 'sent',
            sentAt: new Date().toISOString(),
        });

        return { success: true, messageId: `msg_${Date.now()}` };
    }

    async sendMessage(tenantId: string, phone: string, template: string, variables: Record<string, string>) {
        const config = await this.getConfig(tenantId);
        if (!config.enabled) {
            return { success: false, error: 'WhatsApp entegrasyonu aktif değil' };
        }

        const tmpl = (await this.getTemplates(tenantId)).find(t => t.id === template);
        if (!tmpl) {
            return { success: false, error: 'Şablon bulunamadı' };
        }

        let messageBody = tmpl.content;
        Object.entries(variables).forEach(([key, value]) => {
            messageBody = messageBody.replace(`{{${key}}}`, value);
        });

        this.logger.log(`WhatsApp message sent via template "${template}" to ${phone}`);
        this.addLog(tenantId, {
            type: template,
            phone,
            message: messageBody,
            status: 'sent',
            sentAt: new Date().toISOString(),
        });

        return { success: true, messageId: `msg_${Date.now()}` };
    }

    async getTemplates(_tenantId: string): Promise<MessageTemplate[]> {
        return [
            {
                id: 'order_confirmation',
                name: 'Sipariş Onayı',
                content: 'Merhaba {{customerName}}, {{orderId}} numaralı siparişiniz onaylandı! Toplam: ₺{{totalAmount}}. Teşekkür ederiz! 🛒',
                variables: ['customerName', 'orderId', 'totalAmount'],
                category: 'Sipariş',
            },
            {
                id: 'shipping_update',
                name: 'Kargo Bilgisi',
                content: 'Merhaba {{customerName}}, siparişiniz kargoya verildi! 📦 Takip No: {{trackingNumber}} Kargo: {{shippingProvider}}',
                variables: ['customerName', 'trackingNumber', 'shippingProvider'],
                category: 'Kargo',
            },
            {
                id: 'delivery_confirmation',
                name: 'Teslimat Onayı',
                content: 'Merhaba {{customerName}}, siparişiniz teslim edildi! ✅ Memnun kaldıysanız değerlendirme bırakabilirsiniz: {{reviewLink}}',
                variables: ['customerName', 'reviewLink'],
                category: 'Teslimat',
            },
            {
                id: 'return_approved',
                name: 'İade Onayı',
                content: 'Merhaba {{customerName}}, {{returnId}} numaralı iade talebiniz onaylandı. Ürünü kargoya verebilirsiniz. İade kargo kodu: {{returnCode}}',
                variables: ['customerName', 'returnId', 'returnCode'],
                category: 'İade',
            },
            {
                id: 'low_stock_alert',
                name: 'Düşük Stok Uyarısı',
                content: '⚠️ Dikkat: {{productName}} (SKU: {{sku}}) stoku {{currentStock}} adede düştü. Yeniden sipariş vermeniz önerilir.',
                variables: ['productName', 'sku', 'currentStock'],
                category: 'Stok',
            },
            {
                id: 'campaign_notification',
                name: 'Kampanya Bilgisi',
                content: '🎉 {{campaignName}} kampanyası başladı! {{discount}} indirim fırsatını kaçırmayın. Son tarih: {{endDate}}',
                variables: ['campaignName', 'discount', 'endDate'],
                category: 'Pazarlama',
            },
        ];
    }

    async getLogs(tenantId: string, page: number, limit: number) {
        const allLogs = this.messageLogs.get(tenantId) || this.getDefaultLogs();
        const start = (page - 1) * limit;
        return {
            data: allLogs.slice(start, start + limit),
            total: allLogs.length,
            page,
        };
    }

    private addLog(tenantId: string, log: any) {
        const logs = this.messageLogs.get(tenantId) || [];
        logs.unshift({ id: `log_${Date.now()}`, ...log });
        this.messageLogs.set(tenantId, logs);
    }

    private getDefaultLogs() {
        return [
            { id: 'log_1', type: 'order_confirmation', phone: '+905551234567', message: 'Sipariş onayı gönderildi', status: 'delivered', sentAt: '2026-02-14T10:30:00Z' },
            { id: 'log_2', type: 'shipping_update', phone: '+905559876543', message: 'Kargo bilgisi gönderildi', status: 'delivered', sentAt: '2026-02-14T09:15:00Z' },
            { id: 'log_3', type: 'delivery_confirmation', phone: '+905553456789', message: 'Teslimat onayı gönderildi', status: 'read', sentAt: '2026-02-13T16:45:00Z' },
            { id: 'log_4', type: 'low_stock_alert', phone: '+905551112233', message: 'Düşük stok uyarısı gönderildi', status: 'sent', sentAt: '2026-02-13T08:00:00Z' },
            { id: 'log_5', type: 'return_approved', phone: '+905554445566', message: 'İade onayı gönderildi', status: 'failed', sentAt: '2026-02-12T14:20:00Z' },
        ];
    }
}

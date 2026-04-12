import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface WorkflowNode {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'delay' | 'loop' | 'webhook' | 'ai';
    category: string;
    label: string;
    config: Record<string, any>;
    position: { x: number; y: number };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: string;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    tags: string[];
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'low-stock-reorder',
        name: 'Düşük Stok Otomatik Bildirim',
        description: 'Stok belirli seviyenin altına düştüğünde otomatik bildirim gönderir',
        category: 'inventory',
        tags: ['stok', 'bildirim', 'otomasyon'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'inventory', label: 'Stok Seviyesi Kontrolü', config: { event: 'stock.low', threshold: 5 }, position: { x: 250, y: 50 } },
            { id: 'condition-1', type: 'condition', category: 'logic', label: 'Stok < 5?', config: { field: 'stock', operator: 'lt', value: 5 }, position: { x: 250, y: 180 } },
            { id: 'action-1', type: 'action', category: 'notification', label: 'E-posta Gönder', config: { channel: 'email', template: 'low-stock-alert' }, position: { x: 100, y: 310 } },
            { id: 'action-2', type: 'action', category: 'notification', label: 'SMS Gönder', config: { channel: 'sms', template: 'low-stock-sms' }, position: { x: 400, y: 310 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'action-1', label: 'Evet' },
            { id: 'e3', source: 'condition-1', target: 'action-2', label: 'Evet' },
        ],
    },
    {
        id: 'new-order-process',
        name: 'Yeni Sipariş İşlem Akışı',
        description: 'Yeni sipariş geldiğinde otomatik stok düşme, fatura kesme ve bildirim',
        category: 'orders',
        tags: ['sipariş', 'fatura', 'stok'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'orders', label: 'Yeni Sipariş', config: { event: 'order.created' }, position: { x: 250, y: 50 } },
            { id: 'action-1', type: 'action', category: 'inventory', label: 'Stok Düş', config: { action: 'decrease-stock' }, position: { x: 250, y: 180 } },
            { id: 'action-2', type: 'action', category: 'finance', label: 'E-Fatura Kes', config: { action: 'create-invoice' }, position: { x: 250, y: 310 } },
            { id: 'action-3', type: 'action', category: 'notification', label: 'Müşteriye Bildirim', config: { channel: 'email', template: 'order-confirmation' }, position: { x: 250, y: 440 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'action-1' },
            { id: 'e2', source: 'action-1', target: 'action-2' },
            { id: 'e3', source: 'action-2', target: 'action-3' },
        ],
    },
    {
        id: 'price-competitor-match',
        name: 'Rakip Fiyat Eşleştirme',
        description: 'Rakip fiyat değiştiğinde otomatik fiyat güncelleme',
        category: 'pricing',
        tags: ['fiyat', 'rakip', 'otomatik'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'competitor', label: 'Rakip Fiyat Değişimi', config: { event: 'competitor.price.changed' }, position: { x: 250, y: 50 } },
            { id: 'condition-1', type: 'condition', category: 'logic', label: 'Fark > %5?', config: { field: 'priceDiff', operator: 'gt', value: 5 }, position: { x: 250, y: 180 } },
            { id: 'ai-1', type: 'ai', category: 'ai', label: 'AI Fiyat Önerisi', config: { action: 'ai-price-suggestion' }, position: { x: 250, y: 310 } },
            { id: 'action-1', type: 'action', category: 'pricing', label: 'Fiyat Güncelle', config: { action: 'update-price', strategy: 'match-competitor' }, position: { x: 100, y: 440 } },
            { id: 'action-2', type: 'action', category: 'notification', label: 'Yöneticiye Bildir', config: { channel: 'push', template: 'price-update' }, position: { x: 400, y: 440 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'ai-1', label: 'Evet' },
            { id: 'e3', source: 'ai-1', target: 'action-1' },
            { id: 'e3b', source: 'ai-1', target: 'action-2' },
        ],
    },
    {
        id: 'return-auto-process',
        name: 'İade Otomatik İşleme',
        description: 'İade talebi geldiğinde otomatik değerlendirme ve işleme',
        category: 'returns',
        tags: ['iade', 'müşteri', 'otomasyon'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'returns', label: 'İade Talebi', config: { event: 'return.requested' }, position: { x: 250, y: 50 } },
            { id: 'condition-1', type: 'condition', category: 'logic', label: 'Tutar < ₺100?', config: { field: 'amount', operator: 'lt', value: 100 }, position: { x: 250, y: 180 } },
            { id: 'action-1', type: 'action', category: 'returns', label: 'Otomatik Onayla', config: { action: 'auto-approve' }, position: { x: 100, y: 310 } },
            { id: 'action-2', type: 'action', category: 'notification', label: 'Manuel İnceleme', config: { action: 'assign-reviewer' }, position: { x: 400, y: 310 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'action-1', label: 'Evet' },
            { id: 'e3', source: 'condition-1', target: 'action-2', label: 'Hayır' },
        ],
    },
    {
        id: 'review-response',
        name: 'Değerlendirme Otomatik Yanıt',
        description: 'Olumsuz değerlendirmelere AI ile otomatik yanıt taslağı oluşturur',
        category: 'reviews',
        tags: ['değerlendirme', 'AI', 'müşteri'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'reviews', label: 'Yeni Değerlendirme', config: { event: 'review.created' }, position: { x: 250, y: 50 } },
            { id: 'condition-1', type: 'condition', category: 'logic', label: 'Puan < 3?', config: { field: 'rating', operator: 'lt', value: 3 }, position: { x: 250, y: 180 } },
            { id: 'ai-1', type: 'ai', category: 'ai', label: 'AI Yanıt Oluştur', config: { action: 'generate-reply' }, position: { x: 250, y: 310 } },
            { id: 'action-1', type: 'action', category: 'notification', label: 'Onay İçin Bildir', config: { channel: 'push', template: 'review-reply-draft' }, position: { x: 250, y: 440 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2', source: 'condition-1', target: 'ai-1', label: 'Evet' },
            { id: 'e3', source: 'ai-1', target: 'action-1' },
        ],
    },
    {
        id: 'marketplace-sync',
        name: 'Çoklu Pazaryeri Senkronizasyon',
        description: 'Ürün güncellendiğinde tüm pazaryerlerine otomatik senkronize et',
        category: 'marketplace',
        tags: ['pazaryeri', 'senkronizasyon', 'ürün'],
        nodes: [
            { id: 'trigger-1', type: 'trigger', category: 'products', label: 'Ürün Güncellendi', config: { event: 'product.updated' }, position: { x: 250, y: 50 } },
            { id: 'action-1', type: 'action', category: 'marketplace', label: 'Trendyol Güncelle', config: { platform: 'trendyol', action: 'sync' }, position: { x: 50, y: 200 } },
            { id: 'action-2', type: 'action', category: 'marketplace', label: 'Hepsiburada Güncelle', config: { platform: 'hepsiburada', action: 'sync' }, position: { x: 250, y: 200 } },
            { id: 'action-3', type: 'action', category: 'marketplace', label: 'Amazon Güncelle', config: { platform: 'amazon', action: 'sync' }, position: { x: 450, y: 200 } },
            { id: 'action-4', type: 'action', category: 'notification', label: 'Sonuç Raporu', config: { channel: 'push', template: 'sync-report' }, position: { x: 250, y: 350 } },
        ],
        edges: [
            { id: 'e1', source: 'trigger-1', target: 'action-1' },
            { id: 'e2', source: 'trigger-1', target: 'action-2' },
            { id: 'e3', source: 'trigger-1', target: 'action-3' },
            { id: 'e4', source: 'action-1', target: 'action-4' },
            { id: 'e5', source: 'action-2', target: 'action-4' },
            { id: 'e6', source: 'action-3', target: 'action-4' },
        ],
    },
];

@Injectable()
export class WorkflowBuilderService {
    private readonly logger = new Logger(WorkflowBuilderService.name);

    constructor(private readonly prisma: PrismaService) { }

    async listWorkflows(tenantId: string) {
        return this.prisma.automation.findMany({
            where: { tenantId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getWorkflow(tenantId: string, id: string) {
        const workflow = await this.prisma.automation.findFirst({
            where: { id, tenantId },
        });
        if (!workflow) throw new NotFoundException('İş akışı bulunamadı');
        return workflow;
    }

    async createWorkflow(tenantId: string, data: { name: string; description?: string; nodes: any[]; edges: any[]; isActive?: boolean }) {
        return this.prisma.automation.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description || '',
                trigger: JSON.stringify(data.nodes.find(n => n.type === 'trigger')?.config || {}),
                conditions: JSON.stringify(data.nodes.filter(n => n.type === 'condition').map(n => n.config)),
                action: JSON.stringify(data.nodes.filter(n => n.type === 'action').map(n => n.config)),
                isActive: data.isActive ?? false,
                // @ts-ignore - Prisma Client in Coolify build context sometimes lacks type property
                type: 'custom',
            },
        });
    }

    async updateWorkflow(tenantId: string, id: string, data: { name?: string; description?: string; nodes?: any[]; edges?: any[]; isActive?: boolean }) {
        const existing = await this.prisma.automation.findFirst({ where: { id, tenantId } });
        if (!existing) throw new NotFoundException('İş akışı bulunamadı');

        const updateData: Record<string, any> = {};
        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.nodes && data.edges) {
            updateData.trigger = JSON.stringify(data.nodes.find((n: any) => n.type === 'trigger')?.config || {});
            updateData.conditions = JSON.stringify(data.nodes.filter((n: any) => n.type === 'condition').map((n: any) => n.config));
            updateData.actions = JSON.stringify(data.nodes.filter((n: any) => n.type === 'action').map((n: any) => n.config));
        }

        return this.prisma.automation.update({ where: { id }, data: updateData });
    }

    async deleteWorkflow(tenantId: string, id: string) {
        const existing = await this.prisma.automation.findFirst({ where: { id, tenantId } });
        if (!existing) throw new NotFoundException('İş akışı bulunamadı');
        await this.prisma.automation.delete({ where: { id } });
        return { success: true };
    }

    async executeWorkflow(tenantId: string, id: string) {
        const workflow = await this.getWorkflow(tenantId, id);
        this.logger.log(`Executing workflow: ${workflow.name} (${id})`);
        return {
            success: true,
            message: `"${workflow.name}" iş akışı tetiklendi`,
            executionId: `exec_${Date.now()}`,
        };
    }

    getTemplates() {
        return WORKFLOW_TEMPLATES;
    }

    async getExecutionLogs(tenantId: string, workflowId: string, limit: number) {
        return [];
    }
}

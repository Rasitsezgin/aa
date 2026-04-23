// Workflow Automation Engine
// Zapier-like automation rules with triggers and actions

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
}

type TriggerType = 
  | 'order.created'
  | 'order.updated'
  | 'order.cancelled'
  | 'product.created'
  | 'product.updated'
  | 'product.stock_low'
  | 'customer.created'
  | 'integration.sync_failed'
  | 'schedule.daily'
  | 'schedule.weekly'
  | 'schedule.monthly'
  | 'webhook.received';

interface WorkflowTrigger {
  type: TriggerType;
  config?: Record<string, unknown>;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value?: unknown;
}

interface WorkflowAction {
  type: string;
  config: Record<string, unknown>;
  delay?: number; // seconds
}

// Workflow engine
export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();

  // Register a workflow
  async registerWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    
    // Save to database
    await this.saveWorkflow(newWorkflow);
    
    return newWorkflow;
  }

  // Execute workflow for an event
  async executeTrigger(triggerType: TriggerType, payload: Record<string, unknown>): Promise<void> {
    // Find matching workflows
    const matchingWorkflows = Array.from(this.workflows.values()).filter(
      w => w.trigger.type === triggerType && w.status === 'active'
    );

    for (const workflow of matchingWorkflows) {
      try {
        // Check conditions
        if (await this.checkConditions(workflow.conditions, payload)) {
          // Execute actions
          await this.executeActions(workflow, payload);
          
          // Update run stats
          workflow.runCount++;
          workflow.lastRun = new Date();
        }
      } catch (error) {
        console.error(`Workflow ${workflow.id} execution failed:`, error);
      }
    }
  }

  // Check if all conditions are met
  private async checkConditions(
    conditions: WorkflowCondition[],
    payload: Record<string, unknown>
  ): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(payload, condition.field);
      
      if (!this.evaluateCondition(condition, fieldValue)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(condition: WorkflowCondition, value: unknown): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'exists':
        return value !== undefined && value !== null;
      case 'not_exists':
        return value === undefined || value === null;
      default:
        return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj as unknown);
  }

  // Execute workflow actions
  private async executeActions(
    workflow: Workflow,
    payload: Record<string, unknown>
  ): Promise<void> {
    for (const action of workflow.actions) {
      // Handle delay
      if (action.delay && action.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, action.delay! * 1000));
      }

      await this.executeAction(action, payload, workflow.tenantId);
    }
  }

  private async executeAction(
    action: WorkflowAction,
    payload: Record<string, unknown>,
    tenantId: string
  ): Promise<void> {
    const { type, config } = action;

    switch (type) {
      case 'send_email':
        await this.sendEmail(config, payload, tenantId);
        break;
      case 'send_whatsapp':
        await this.sendWhatsApp(config, payload, tenantId);
        break;
      case 'update_order_status':
        await this.updateOrderStatus(config, payload);
        break;
      case 'update_stock':
        await this.updateStock(config, payload);
        break;
      case 'create_task':
        await this.createTask(config, payload, tenantId);
        break;
      case 'webhook':
        await this.callWebhook(config, payload);
        break;
      case 'add_tag':
        await this.addTag(config, payload, tenantId);
        break;
      case 'notify_user':
        await this.notifyUser(config, payload, tenantId);
        break;
      case 'export_data':
        await this.exportData(config, payload, tenantId);
        break;
      default:
        console.warn(`Unknown action type: ${type}`);
    }
  }

  // Action implementations
  private async sendEmail(config: any, payload: any, tenantId: string): Promise<void> {
    const { template, to, subject } = config;
    
    await addJob('email.send', {
      tenantId,
      payload: {
        to: this.interpolateString(to, payload),
        subject: this.interpolateString(subject, payload),
        template,
        data: payload,
      },
    });
  }

  private async sendWhatsApp(config: any, payload: any, tenantId: string): Promise<void> {
    const { phone, message } = config;
    
    await addJob('whatsapp.send', {
      tenantId,
      payload: {
        to: this.interpolateString(phone, payload),
        message: this.interpolateString(message, payload),
      },
    });
  }

  private async updateOrderStatus(config: any, payload: any): Promise<void> {
    const { status, orderId } = config;
    
    await prisma.order.update({
      where: { id: orderId || payload.orderId },
      data: { status },
    });
  }

  private async updateStock(config: any, payload: any): Promise<void> {
    const { productId, quantity } = config;
    
    await prisma.product.update({
      where: { id: productId || payload.productId },
      data: { stock: { decrement: quantity } },
    });
  }

  private async createTask(config: any, payload: any, tenantId: string): Promise<void> {
    // Would integrate with task management system
    console.log('Creating task:', config, payload);
  }

  private async callWebhook(config: any, payload: any): Promise<void> {
    const { url, method = 'POST' } = config;
    
    await fetch(this.interpolateString(url, payload), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private async addTag(config: any, payload: any, tenantId: string): Promise<void> {
    const { entity, tag } = config;
    const entityId = payload[`${entity}Id`] || payload.id;
    
    // Implementation depends on tagging system
    console.log(`Adding tag ${tag} to ${entity} ${entityId}`);
  }

  private async notifyUser(config: any, payload: any, tenantId: string): Promise<void> {
    const { userId, message, type = 'info' } = config;
    
    // Would integrate with notification system
    console.log(`Notifying user ${userId}: ${message}`);
  }

  private async exportData(config: any, payload: any, tenantId: string): Promise<void> {
    const { format, entity, filters } = config;
    
    // Queue export job
    await addJob('export.create', {
      tenantId,
      payload: {
        format,
        entity,
        filters,
        triggeredBy: 'workflow',
      },
    });
  }

  // Helper to interpolate variables in strings
  private interpolateString(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private async saveWorkflow(workflow: Workflow): Promise<void> {
    // Implementation would save to database
    await prisma.workflow.create({
      data: {
        id: workflow.id,
        tenantId: workflow.tenantId,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        trigger: JSON.stringify(workflow.trigger),
        conditions: JSON.stringify(workflow.conditions),
        actions: JSON.stringify(workflow.actions),
        runCount: workflow.runCount,
      },
    });
  }
}

// Predefined workflow templates
export const workflowTemplates = {
  // Auto-confirm orders under certain amount
  autoConfirmSmallOrders: (maxAmount: number): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Otomatik Sipariş Onaylama',
    description: `Belirli tutarın altındaki siparişleri otomatik onayla`,
    status: 'active',
    trigger: { type: 'order.created' },
    conditions: [
      { field: 'totalAmount', operator: 'less_than', value: maxAmount },
      { field: 'status', operator: 'equals', value: 'PENDING' },
    ],
    actions: [
      { type: 'update_order_status', config: { status: 'CONFIRMED' } },
      { type: 'send_email', config: { template: 'order_confirmed', to: '{{customerEmail}}', subject: 'Siparişiniz Onaylandı' }, delay: 0 },
    ],
  }),

  // Low stock alert
  lowStockAlert: (threshold: number, notifyEmail: string): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Düşük Stok Uyarısı',
    description: `Stok ${threshold} adetin altına düştüğünde bildirim gönder`,
    status: 'active',
    trigger: { type: 'product.stock_low' },
    conditions: [
      { field: 'stock', operator: 'less_than', value: threshold },
    ],
    actions: [
      { type: 'send_email', config: { template: 'low_stock', to: notifyEmail, subject: 'Düşük Stok Uyarısı: {{productName}}' } },
      { type: 'create_task', config: { title: 'Stok yenileme: {{productName}}', priority: 'high' } },
    ],
  }),

  // Welcome new customer
  welcomeNewCustomer: (): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Yeni Müşteri Karşılama',
    description: 'Yeni müşteriye hoşgeldin e-postası gönder',
    status: 'active',
    trigger: { type: 'customer.created' },
    conditions: [],
    actions: [
      { type: 'send_email', config: { template: 'welcome', to: '{{email}}', subject: 'Hoşgeldiniz!' }, delay: 300 },
      { type: 'add_tag', config: { entity: 'customer', tag: 'new_customer' } },
    ],
  }),

  // Sync failed alert
  syncFailedAlert: (notifyEmail: string): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Senkronizasyon Hatası Bildirimi',
    description: 'Entegrasyon senkronizasyonu başarısız olduğunda bildir',
    status: 'active',
    trigger: { type: 'integration.sync_failed' },
    conditions: [],
    actions: [
      { type: 'send_email', config: { template: 'sync_failed', to: notifyEmail, subject: 'Senkronizasyon Hatası: {{platform}}' } },
      { type: 'create_task', config: { title: 'Senkronizasyon kontrolü: {{platform}}', priority: 'high' } },
    ],
  }),

  // Daily sales report
  dailySalesReport: (email: string): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Günlük Satış Raporu',
    description: 'Her gün satış raporu gönder',
    status: 'active',
    trigger: { type: 'schedule.daily', config: { hour: 9, minute: 0 } },
    conditions: [],
    actions: [
      { type: 'export_data', config: { format: 'pdf', entity: 'sales_report', filters: { period: 'yesterday' } } },
      { type: 'send_email', config: { template: 'daily_report', to: email, subject: 'Günlük Satış Raporu' }, delay: 60 },
    ],
  }),

  // Abandoned cart recovery (for future)
  abandonedCartRecovery: (): Omit<Workflow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'runCount'> => ({
    name: 'Terk Edilmiş Sepet Kurtarma',
    description: 'Terk edilmiş sepetlere hatırlatma e-postası gönder',
    status: 'draft',
    trigger: { type: 'schedule.daily' },
    conditions: [],
    actions: [
      { type: 'send_email', config: { template: 'abandoned_cart', to: '{{customerEmail}}', subject: 'Sepetinizi unuttunuz' } },
      { type: 'add_tag', config: { entity: 'customer', tag: 'abandoned_cart' } },
    ],
  }),
};

// Export singleton instance
export const workflowEngine = new WorkflowEngine();

export type { Workflow, WorkflowTrigger, WorkflowCondition, WorkflowAction };

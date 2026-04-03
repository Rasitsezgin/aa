/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config: any;
    icon?: string;
    color?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  animated?: boolean;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  triggerType: 'manual' | 'scheduled' | 'event';
  cronExpression?: string;
  lastRunAt?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  currentNodeId?: string;
  context: any;
  logs: WorkflowExecutionLog[];
}

export interface WorkflowExecutionLog {
  nodeId: string;
  timestamp: Date;
  status: 'success' | 'error' | 'skipped';
  message: string;
  data?: any;
}

@Injectable()
export class AIWorkflowBuilderService {
  private readonly logger = new Logger(AIWorkflowBuilderService.name);
  private runningExecutions: Map<string, WorkflowExecution> = new Map();

  constructor(private prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async createWorkflow(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      triggerType: 'manual' | 'scheduled' | 'event';
      cronExpression?: string;
    },
  ): Promise<AIWorkflow> {
    const workflow = await this.prisma.aIAssistantWorkflow.create({
      data: {
        tenantId,
        userId,
        name: data.name,
        description: data.description,
        nodes: data.nodes as any,
        edges: data.edges as any,
        triggerType: data.triggerType,
        cronExpression: data.cronExpression,
        isActive: false, // Requires activation after creation
      },
    });

    return this.mapWorkflowFromDb(workflow);
  }

  async updateWorkflow(
    workflowId: string,
    tenantId: string,
    updates: Partial<{
      name: string;
      description: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      isActive: boolean;
      triggerType: 'manual' | 'scheduled' | 'event';
      cronExpression: string;
    }>,
  ): Promise<AIWorkflow> {
    const workflow = await this.prisma.aIAssistantWorkflow.updateMany({
      where: { id: workflowId, tenantId },
      data: {
        ...updates,
        nodes: updates.nodes ? (updates.nodes as any) : undefined,
        edges: updates.edges ? (updates.edges as any) : undefined,
        updatedAt: new Date(),
      },
    });

    const updated = await this.prisma.aIAssistantWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!updated) {
      throw new Error('Workflow not found');
    }

    return this.mapWorkflowFromDb(updated);
  }

  async deleteWorkflow(workflowId: string, tenantId: string): Promise<void> {
    // Stop any running executions
    const execution = this.runningExecutions.get(workflowId);
    if (execution) {
      execution.status = 'failed';
      this.runningExecutions.delete(workflowId);
    }

    await this.prisma.aIAssistantWorkflow.deleteMany({
      where: { id: workflowId, tenantId },
    });
  }

  async getWorkflow(workflowId: string, tenantId: string): Promise<AIWorkflow | null> {
    const workflow = await this.prisma.aIAssistantWorkflow.findFirst({
      where: { id: workflowId, tenantId },
    });

    return workflow ? this.mapWorkflowFromDb(workflow) : null;
  }

  async getWorkflows(
    tenantId: string,
    userId?: string,
    options?: { isActive?: boolean; limit?: number },
  ): Promise<AIWorkflow[]> {
    const workflows = await this.prisma.aIAssistantWorkflow.findMany({
      where: {
        tenantId,
        ...(userId && { userId }),
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { updatedAt: 'desc' },
      take: options?.limit || 50,
    });

    return workflows.map(w => this.mapWorkflowFromDb(w));
  }

  // ==================== WORKFLOW EXECUTION ====================

  async executeWorkflow(
    workflowId: string,
    tenantId: string,
    userId: string,
    context: any = {},
  ): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId, tenantId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Create execution record
    const executionRecord = await this.prisma.aIAssistantWorkflowExecution.create({
      data: {
        workflowId,
        tenantId,
        userId,
        status: 'running',
        context: context as any,
        startedAt: new Date(),
      },
    });

    const execution: WorkflowExecution = {
      id: executionRecord.id,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      context,
      logs: [],
    };

    this.runningExecutions.set(execution.id, execution);

    // Start execution
    this.runWorkflowExecution(execution, workflow, tenantId, userId).catch(error => {
      this.logger.error(`Workflow execution failed: ${workflowId}`, error);
      execution.status = 'failed';
      execution.logs.push({
        nodeId: 'system',
        timestamp: new Date(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    });

    return execution;
  }

  private async runWorkflowExecution(
    execution: WorkflowExecution,
    workflow: AIWorkflow,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Find start node (trigger)
      const startNode = workflow.nodes.find(n => n.type === 'trigger');
      if (!startNode) {
        throw new Error('No trigger node found');
      }

      let currentNodeId: string | undefined = startNode.id;

      while (currentNodeId) {
        execution.currentNodeId = currentNodeId;
        const currentNode = workflow.nodes.find(n => n.id === currentNodeId);
        
        if (!currentNode) {
          break;
        }

        // Execute node
        const result = await this.executeNode(currentNode, execution.context, tenantId, userId);
        
        execution.logs.push({
          nodeId: currentNode.id,
          timestamp: new Date(),
          status: result.success ? 'success' : 'error',
          message: result.message,
          data: result.data,
        });

        if (!result.success) {
          execution.status = 'failed';
          break;
        }

        // Find next node
        const outgoingEdges = workflow.edges.filter(e => e.source === currentNodeId);
        
        if (outgoingEdges.length === 0) {
          // End of workflow
          break;
        } else if (outgoingEdges.length === 1) {
          currentNodeId = outgoingEdges[0].target;
        } else {
          // Multiple paths - evaluate conditions
          const matchingEdge = outgoingEdges.find(e => {
            if (!e.condition) return true;
            // Simple condition evaluation
            return this.evaluateCondition(e.condition, execution.context);
          });
          
          currentNodeId = matchingEdge?.target ?? undefined;
        }
      }

      // Update execution status
      execution.status = execution.status === 'failed' ? 'failed' : 'completed';
      execution.completedAt = new Date();

      // Save execution result
      await this.prisma.aIAssistantWorkflowExecution.update({
        where: { id: execution.id },
        data: {
          status: execution.status,
          completedAt: execution.completedAt,
          logs: execution.logs as any,
        },
      });

      // Update workflow stats
      await this.prisma.aIAssistantWorkflow.update({
        where: { id: workflow.id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          successCount: execution.status === 'completed' ? { increment: 1 } : undefined,
          failureCount: execution.status === 'failed' ? { increment: 1 } : undefined,
        },
      });

    } finally {
      this.runningExecutions.delete(execution.id);
    }
  }

  private async executeNode(
    node: WorkflowNode,
    context: any,
    tenantId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.debug(`Executing node: ${node.id} (${node.type})`);

    try {
      switch (node.type) {
        case 'trigger':
          return { success: true, message: 'Trigger activated', data: { trigger: node.data.config } };

        case 'action':
          return await this.executeActionNode(node, context, tenantId, userId);

        case 'condition':
          return await this.executeConditionNode(node, context);

        case 'delay':
          await this.executeDelayNode(node);
          return { success: true, message: `Delayed for ${node.data.config.duration}ms` };

        case 'notification':
          return await this.executeNotificationNode(node, context, tenantId, userId);

        case 'end':
          return { success: true, message: 'Workflow completed' };

        default:
          return { success: false, message: `Unknown node type: ${node.type}` };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Node execution failed',
      };
    }
  }

  private async executeActionNode(
    node: WorkflowNode,
    context: any,
    tenantId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { actionType, platform, params } = node.data.config;

    // Execute the action based on type
    switch (actionType) {
      case 'brand_sync':
        // Trigger brand sync
        return {
          success: true,
          message: `Brand sync triggered for ${platform}`,
          data: { platform, action: 'brand_sync' },
        };

      case 'category_sync':
        return {
          success: true,
          message: `Category sync triggered for ${platform}`,
          data: { platform, action: 'category_sync' },
        };

      case 'product_upload':
        return {
          success: true,
          message: `Product upload triggered for ${platform}`,
          data: { platform, action: 'product_upload', params },
        };

      case 'send_message':
        // Could integrate with messaging service
        return {
          success: true,
          message: `Message sent: ${params.message}`,
          data: { message: params.message },
        };

      default:
        return { success: false, message: `Unknown action type: ${actionType}` };
    }
  }

  private async executeConditionNode(
    node: WorkflowNode,
    context: any,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { condition, operator = 'and' } = node.data.config;
    
    // Evaluate condition
    const result = this.evaluateCondition(condition, context);

    return {
      success: true,
      message: `Condition evaluated: ${result}`,
      data: { condition, result, operator },
    };
  }

  private async executeDelayNode(node: WorkflowNode): Promise<void> {
    const { duration, unit = 'seconds' } = node.data.config;
    
    let ms = duration;
    switch (unit) {
      case 'seconds': ms = duration * 1000; break;
      case 'minutes': ms = duration * 60 * 1000; break;
      case 'hours': ms = duration * 60 * 60 * 1000; break;
    }

    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeNotificationNode(
    node: WorkflowNode,
    context: any,
    tenantId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const { channel, message, recipients } = node.data.config;

    // Could integrate with notification service
    return {
      success: true,
      message: `Notification sent via ${channel}`,
      data: { channel, message, recipients },
    };
  }

  private evaluateCondition(condition: string, context: any): boolean {
    // Simple condition evaluation
    // In production, use a proper expression evaluator
    try {
      // Replace context variables
      const evalString = condition.replace(/\$\{(\w+)\}/g, (match, key) => {
        return context[key] !== undefined ? JSON.stringify(context[key]) : 'undefined';
      });

      // For security, only allow simple comparisons
      if (!/^[\w\s\d<>=!&|()]+$/.test(evalString)) {
        return false;
      }

      // eslint-disable-next-line no-eval
      return eval(evalString);
    } catch {
      return false;
    }
  }

  // ==================== WORKFLOW PRESETS ====================

  getWorkflowTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggerType: 'manual' | 'scheduled' | 'event';
  }> {
    return [
      {
        id: 'daily-sync',
        name: 'Günlük Senkronizasyon',
        description: 'Her gün tüm pazaryerlerini eşitle ve rapor gönder',
        category: 'sync',
        triggerType: 'scheduled',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {
              label: 'Her gün 09:00',
              config: { schedule: '0 9 * * *' },
              icon: 'Clock',
              color: '#4CAF50',
            },
          },
          {
            id: 'action-1',
            type: 'action',
            position: { x: 300, y: 100 },
            data: {
              label: 'Trendyol Eşitle',
              config: { actionType: 'brand_sync', platform: 'TRENDYOL' },
              icon: 'RefreshCw',
              color: '#2196F3',
            },
          },
          {
            id: 'action-2',
            type: 'action',
            position: { x: 500, y: 100 },
            data: {
              label: 'Amazon Eşitle',
              config: { actionType: 'brand_sync', platform: 'AMAZON' },
              icon: 'RefreshCw',
              color: '#2196F3',
            },
          },
          {
            id: 'notification-1',
            type: 'notification',
            position: { x: 700, y: 100 },
            data: {
              label: 'Bildirim Gönder',
              config: { channel: 'email', message: 'Günlük eşitleme tamamlandı' },
              icon: 'Bell',
              color: '#FF9800',
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 900, y: 100 },
            data: {
              label: 'Son',
              config: {},
              icon: 'Flag',
              color: '#9E9E9E',
            },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1', animated: true },
          { id: 'e2', source: 'action-1', target: 'action-2' },
          { id: 'e3', source: 'action-2', target: 'notification-1' },
          { id: 'e4', source: 'notification-1', target: 'end-1' },
        ],
      },
      {
        id: 'stock-alert',
        name: 'Stok Uyarı Sistemi',
        description: 'Stok azaldığında otomatik bildirim ve sipariş önerisi',
        category: 'alert',
        triggerType: 'event',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {
              label: 'Stok < 10',
              config: { event: 'stock_low', threshold: 10 },
              icon: 'AlertTriangle',
              color: '#F44336',
            },
          },
          {
            id: 'condition-1',
            type: 'condition',
            position: { x: 300, y: 100 },
            data: {
              label: 'Kritik stok?',
              config: { condition: '${stock} < 5', operator: 'or' },
              icon: 'GitBranch',
              color: '#9C27B0',
            },
          },
          {
            id: 'notification-1',
            type: 'notification',
            position: { x: 500, y: 50 },
            data: {
              label: 'Kritik Uyarı',
              config: { channel: 'slack', message: 'Kritik stok seviyesi!' },
              icon: 'AlertOctagon',
              color: '#F44336',
            },
          },
          {
            id: 'notification-2',
            type: 'notification',
            position: { x: 500, y: 150 },
            data: {
              label: 'Genel Uyarı',
              config: { channel: 'email', message: 'Stok azalıyor' },
              icon: 'Bell',
              color: '#FF9800',
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 700, y: 100 },
            data: {
              label: 'Son',
              config: {},
              icon: 'Flag',
              color: '#9E9E9E',
            },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'condition-1', animated: true },
          { id: 'e2', source: 'condition-1', target: 'notification-1', label: 'Evet (< 5)' },
          { id: 'e3', source: 'condition-1', target: 'notification-2', label: 'Hayır' },
          { id: 'e4', source: 'notification-1', target: 'end-1' },
          { id: 'e5', source: 'notification-2', target: 'end-1' },
        ],
      },
    ];
  }

  // ==================== HELPER METHODS ====================

  private mapWorkflowFromDb(workflow: any): AIWorkflow {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || undefined,
      nodes: workflow.nodes as WorkflowNode[],
      edges: workflow.edges as WorkflowEdge[],
      isActive: workflow.isActive,
      triggerType: workflow.triggerType as AIWorkflow['triggerType'],
      cronExpression: workflow.cronExpression || undefined,
      lastRunAt: workflow.lastRunAt || undefined,
      runCount: workflow.runCount,
      successCount: workflow.successCount,
      failureCount: workflow.failureCount,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }

  async pauseWorkflow(workflowId: string, tenantId: string): Promise<void> {
    const execution = Array.from(this.runningExecutions.values())
      .find(e => e.workflowId === workflowId);
    
    if (execution) {
      execution.status = 'paused';
    }

    await this.prisma.aIAssistantWorkflow.updateMany({
      where: { id: workflowId, tenantId },
      data: { isActive: false },
    });
  }

  async resumeWorkflow(workflowId: string, tenantId: string): Promise<void> {
    await this.prisma.aIAssistantWorkflow.updateMany({
      where: { id: workflowId, tenantId },
      data: { isActive: true },
    });
  }

  async getExecutionHistory(
    workflowId: string,
    tenantId: string,
    limit = 20,
  ): Promise<any[]> {
    return this.prisma.aIAssistantWorkflowExecution.findMany({
      where: { workflowId, tenantId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }
}

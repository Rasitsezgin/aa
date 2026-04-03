/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface MemoryItem {
  key: string;
  value: any;
  memoryType: 'product_context' | 'platform_state' | 'user_goal' | 'error_history' | 'workflow_state';
  expiresIn?: number; // minutes
}

export interface ContextSnapshot {
  recentActions: string[];
  activePlatforms: string[];
  pendingTasks: any[];
  lastErrors: string[];
  userGoals: string[];
}

@Injectable()
export class AIContextMemoryService {
  private readonly logger = new Logger(AIContextMemoryService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== MEMORY STORAGE ====================

  async storeMemory(
    tenantId: string,
    userId: string,
    memory: MemoryItem,
  ): Promise<void> {
    const expiresAt = memory.expiresIn
      ? new Date(Date.now() + memory.expiresIn * 60000)
      : null;

    await this.prisma.aIContextMemory.upsert({
      where: {
        tenantId_userId_memoryType_key: {
          tenantId,
          userId,
          memoryType: memory.memoryType,
          key: memory.key,
        },
      },
      update: {
        value: memory.value,
        relevanceScore: 1.0,
        lastAccessedAt: new Date(),
        expiresAt,
      },
      create: {
        tenantId,
        userId,
        memoryType: memory.memoryType,
        key: memory.key,
        value: memory.value,
        expiresAt,
      },
    });

    this.logger.debug(`Memory stored: ${memory.key} for user ${userId}`);
  }

  async retrieveMemory(
    tenantId: string,
    userId: string,
    memoryType: string,
    key: string,
  ): Promise<any | null> {
    const memory = await this.prisma.aIContextMemory.findUnique({
      where: {
        tenantId_userId_memoryType_key: {
          tenantId,
          userId,
          memoryType,
          key,
        },
      },
    });

    if (!memory) return null;

    // Check expiration
    if (memory.expiresAt && new Date() > memory.expiresAt) {
      await this.prisma.aIContextMemory.delete({
        where: { id: memory.id },
      });
      return null;
    }

    // Update access time and relevance
    await this.prisma.aIContextMemory.update({
      where: { id: memory.id },
      data: {
        lastAccessedAt: new Date(),
        relevanceScore: Math.min(memory.relevanceScore * 1.1, 1.0),
      },
    });

    return memory.value;
  }

  async getMemoriesByType(
    tenantId: string,
    userId: string,
    memoryType: string,
    limit = 10,
  ): Promise<any[]> {
    const memories = await this.prisma.aIContextMemory.findMany({
      where: {
        tenantId,
        userId,
        memoryType,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [{ relevanceScore: 'desc' }, { lastAccessedAt: 'desc' }],
      take: limit,
    });

    // Decay relevance scores for retrieved memories
    for (const memory of memories) {
      await this.prisma.aIContextMemory.update({
        where: { id: memory.id },
        data: {
          relevanceScore: memory.relevanceScore * 0.95,
        },
      });
    }

    return memories.map(m => ({ key: m.key, value: m.value, relevance: m.relevanceScore }));
  }

  // ==================== CONTEXT SNAPSHOT ====================

  async buildContextSnapshot(
    tenantId: string,
    userId: string,
  ): Promise<ContextSnapshot> {
    // Get recent sync jobs
    const recentJobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get pending tasks from context memory
    const pendingTasks = await this.getMemoriesByType(
      tenantId,
      userId,
      'workflow_state',
      10,
    );

    // Get error history
    const errorHistory = await this.getMemoriesByType(
      tenantId,
      userId,
      'error_history',
      5,
    );

    // Get user goals
    const userGoals = await this.getMemoriesByType(
      tenantId,
      userId,
      'user_goal',
      5,
    );

    // Extract active platforms
    const activePlatforms: string[] = [...new Set(recentJobs.map(job => job.platform))];

    return {
      recentActions: recentJobs.map(job => `${job.type} on ${job.platform} (${job.status})`),
      activePlatforms,
      pendingTasks,
      lastErrors: errorHistory.map(e => e.value?.error || e.key),
      userGoals: userGoals.map(g => g.value?.goal || g.key),
    };
  }

  // ==================== WORKFLOW STATE TRACKING ====================

  async startWorkflow(
    tenantId: string,
    userId: string,
    workflowId: string,
    workflowType: string,
    initialData: any,
  ): Promise<void> {
    await this.storeMemory(tenantId, userId, {
      key: workflowId,
      memoryType: 'workflow_state',
      value: {
        type: workflowType,
        status: 'active',
        startedAt: new Date(),
        data: initialData,
        currentStep: 0,
        completedSteps: [],
      },
      expiresIn: 60, // 1 hour
    });
  }

  async updateWorkflowStep(
    tenantId: string,
    userId: string,
    workflowId: string,
    step: number,
    stepData: any,
  ): Promise<void> {
    const existing = await this.retrieveMemory(
      tenantId,
      userId,
      'workflow_state',
      workflowId,
    );

    if (existing) {
      existing.currentStep = step;
      existing.completedSteps.push(stepData);
      existing.lastUpdated = new Date();

      await this.storeMemory(tenantId, userId, {
        key: workflowId,
        memoryType: 'workflow_state',
        value: existing,
        expiresIn: 60,
      });
    }
  }

  async completeWorkflow(
    tenantId: string,
    userId: string,
    workflowId: string,
    result: any,
  ): Promise<void> {
    const existing = await this.retrieveMemory(
      tenantId,
      userId,
      'workflow_state',
      workflowId,
    );

    if (existing) {
      existing.status = 'completed';
      existing.result = result;
      existing.completedAt = new Date();

      // Keep for 24 hours then auto-delete
      await this.storeMemory(tenantId, userId, {
        key: workflowId,
        memoryType: 'workflow_state',
        value: existing,
        expiresIn: 1440, // 24 hours
      });
    }
  }

  // ==================== ERROR TRACKING ====================

  async recordError(
    tenantId: string,
    userId: string,
    error: Error,
    context: any,
  ): Promise<void> {
    const errorKey = `error_${Date.now()}`;
    
    await this.storeMemory(tenantId, userId, {
      key: errorKey,
      memoryType: 'error_history',
      value: {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(),
      },
      expiresIn: 10080, // 7 days
    });

    // Keep only last 10 errors
    const oldErrors = await this.prisma.aIContextMemory.findMany({
      where: {
        tenantId,
        userId,
        memoryType: 'error_history',
      },
      orderBy: { createdAt: 'desc' },
      skip: 10,
    });

    for (const oldError of oldErrors) {
      await this.prisma.aIContextMemory.delete({
        where: { id: oldError.id },
      });
    }
  }

  // ==================== GOAL TRACKING ====================

  async setUserGoal(
    tenantId: string,
    userId: string,
    goal: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
  ): Promise<void> {
    const goalKey = `goal_${Date.now()}`;
    
    await this.storeMemory(tenantId, userId, {
      key: goalKey,
      memoryType: 'user_goal',
      value: {
        goal,
        priority,
        createdAt: new Date(),
        status: 'active',
      },
      expiresIn: 10080, // 7 days
    });
  }

  async markGoalComplete(
    tenantId: string,
    userId: string,
    goalKey: string,
  ): Promise<void> {
    const existing = await this.retrieveMemory(
      tenantId,
      userId,
      'user_goal',
      goalKey,
    );

    if (existing) {
      existing.status = 'completed';
      existing.completedAt = new Date();

      await this.storeMemory(tenantId, userId, {
        key: goalKey,
        memoryType: 'user_goal',
        value: existing,
        expiresIn: 1440, // Keep for 24 hours after completion
      });
    }
  }

  // ==================== PLATFORM STATE TRACKING ====================

  async updatePlatformState(
    tenantId: string,
    userId: string,
    platform: string,
    state: any,
  ): Promise<void> {
    await this.storeMemory(tenantId, userId, {
      key: `platform_${platform}`,
      memoryType: 'platform_state',
      value: {
        ...state,
        lastUpdated: new Date(),
      },
      expiresIn: 1440, // 24 hours
    });
  }

  async getPlatformState(
    tenantId: string,
    userId: string,
    platform: string,
  ): Promise<any | null> {
    return this.retrieveMemory(
      tenantId,
      userId,
      'platform_state',
      `platform_${platform}`,
    );
  }

  // ==================== CLEANUP ====================

  async cleanupExpiredMemories(): Promise<number> {
    const result = await this.prisma.aIContextMemory.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired memories`);
    return result.count;
  }

  async cleanupLowRelevanceMemories(threshold = 0.1): Promise<number> {
    const result = await this.prisma.aIContextMemory.deleteMany({
      where: {
        relevanceScore: {
          lt: threshold,
        },
        lastAccessedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} low-relevance memories`);
    return result.count;
  }
}

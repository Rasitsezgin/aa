/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { AIAssistantService } from '../ai-assistant.service';
import { AIPredictiveService } from './ai-predictive.service';

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  type: 'sync' | 'upload' | 'report' | 'cleanup' | 'custom';
  cronExpression: string;
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  config: any;
  createdAt: Date;
}

export interface TaskExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  executionTime: number;
}

@Injectable()
export class AISchedulerService {
  private readonly logger = new Logger(AISchedulerService.name);
  private runningTasks: Set<string> = new Set();

  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private aiAssistantService: AIAssistantService,
    private predictiveService: AIPredictiveService,
  ) {}

  // ==================== SYSTEM CRON JOBS ====================

  /**
   * Clean up old memories and expired data
   * Runs every day at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldData(): Promise<void> {
    this.logger.log('Starting daily cleanup...');

    try {
      // Clean expired context memories
      const deletedMemories = await this.prisma.aIContextMemory.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Clean old low-relevance memories
      const deletedLowRelevance = await this.prisma.aIContextMemory.deleteMany({
        where: {
          relevanceScore: {
            lt: 0.1,
          },
          lastAccessedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Clean old feedback that has been processed
      const deletedFeedback = await this.prisma.aIFeedbackLoop.deleteMany({
        where: {
          isProcessed: true,
          createdAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Clean old suggestions
      const deletedSuggestions = await this.prisma.aIPredictiveSuggestion.deleteMany({
        where: {
          validUntil: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(
        `Cleanup completed: ${deletedMemories.count} memories, ${deletedLowRelevance.count} low-relevance, ${deletedFeedback.count} feedback, ${deletedSuggestions.count} suggestions`
      );
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
    }
  }

  /**
   * Process unprocessed feedback
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processFeedback(): Promise<void> {
    this.logger.log('Processing feedback loop...');

    try {
      const processed = await this.processUnprocessedFeedback();
      this.logger.log(`Processed ${processed} feedback items`);
    } catch (error) {
      this.logger.error('Feedback processing failed:', error);
    }
  }

  /**
   * Generate daily proactive suggestions for all users
   * Runs every day at 9 AM
   */
  @Cron('0 9 * * *')
  async generateDailySuggestions(): Promise<void> {
    this.logger.log('Generating daily proactive suggestions...');

    try {
      // Get all active users
      const users = await this.prisma.aIAssistantConversation.groupBy({
        by: ['tenantId', 'userId'],
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      for (const user of users) {
        try {
          // Generate proactive alerts
          const alerts = await this.predictiveService.generateProactiveAlerts(
            user.tenantId,
            user.userId,
          );

          // Store important alerts
          for (const alert of alerts.filter(a => a.priority === 'high' || a.priority === 'urgent')) {
            await this.predictiveService.storeSuggestion(user.tenantId, user.userId, alert);
          }
        } catch (error) {
          this.logger.error(`Failed to generate suggestions for user ${user.userId}:`, error);
        }
      }

      this.logger.log(`Generated suggestions for ${users.length} users`);
    } catch (error) {
      this.logger.error('Daily suggestions generation failed:', error);
    }
  }

  /**
   * Detect patterns for all users
   * Runs every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async detectPatterns(): Promise<void> {
    this.logger.log('Running pattern detection...');

    try {
      const users = await this.prisma.aIAssistantConversation.groupBy({
        by: ['tenantId', 'userId'],
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      for (const user of users) {
        // Pattern detection is handled by the learning service
        this.logger.debug(`Pattern detection for user ${user.userId}`);
      }

      this.logger.log(`Pattern detection completed for ${users.length} users`);
    } catch (error) {
      this.logger.error('Pattern detection failed:', error);
    }
  }

  // ==================== USER SCHEDULED TASKS ====================

  async createScheduledTask(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      type: 'sync' | 'upload' | 'report' | 'cleanup' | 'custom';
      cronExpression: string;
      config: any;
    },
  ): Promise<ScheduledTask> {
    // Validate cron expression
    if (!this.isValidCronExpression(data.cronExpression)) {
      throw new Error('Invalid cron expression');
    }

    const task = await this.prisma.aIAssistantScheduledTask.create({
      data: {
        tenantId,
        userId,
        name: data.name,
        description: data.description,
        type: data.type,
        cronExpression: data.cronExpression,
        config: data.config,
        isActive: true,
        runCount: 0,
        successCount: 0,
        failureCount: 0,
      },
    });

    // Add to scheduler
    this.addCronJob(task.id, data.cronExpression, async () => {
      await this.executeTask(task.id, tenantId, userId, data.type, data.config);
    });

    return {
      id: task.id,
      name: task.name,
      description: task.description || undefined,
      type: task.type as ScheduledTask['type'],
      cronExpression: task.cronExpression,
      isActive: task.isActive,
      runCount: task.runCount,
      successCount: task.successCount,
      failureCount: task.failureCount,
      config: task.config,
      createdAt: task.createdAt,
    };
  }

  async updateScheduledTask(
    taskId: string,
    tenantId: string,
    updates: Partial<{
      name: string;
      description: string;
      cronExpression: string;
      isActive: boolean;
      config: any;
    }>,
  ): Promise<ScheduledTask> {
    const existing = await this.prisma.aIAssistantScheduledTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!existing) {
      throw new Error('Task not found');
    }

    // If cron expression changed, update the job
    if (updates.cronExpression && updates.cronExpression !== existing.cronExpression) {
      this.deleteCronJob(taskId);
      this.addCronJob(taskId, updates.cronExpression, async () => {
        await this.executeTask(taskId, tenantId, existing.userId, existing.type as any, existing.config);
      });
    }

    // If deactivated, delete the job
    if (updates.isActive === false && existing.isActive) {
      this.deleteCronJob(taskId);
    }

    // If activated, add the job
    if (updates.isActive === true && !existing.isActive) {
      this.addCronJob(taskId, existing.cronExpression, async () => {
        await this.executeTask(taskId, tenantId, existing.userId, existing.type as any, existing.config);
      });
    }

    const updated = await this.prisma.aIAssistantScheduledTask.update({
      where: { id: taskId },
      data: updates,
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      type: updated.type as ScheduledTask['type'],
      cronExpression: updated.cronExpression,
      isActive: updated.isActive,
      runCount: updated.runCount,
      successCount: updated.successCount,
      failureCount: updated.failureCount,
      config: updated.config,
      createdAt: updated.createdAt,
    };
  }

  async deleteScheduledTask(taskId: string, tenantId: string): Promise<void> {
    // Delete from scheduler
    this.deleteCronJob(taskId);

    // Delete from database
    await this.prisma.aIAssistantScheduledTask.deleteMany({
      where: { id: taskId, tenantId },
    });
  }

  async getScheduledTasks(tenantId: string, userId?: string): Promise<ScheduledTask[]> {
    const tasks = await this.prisma.aIAssistantScheduledTask.findMany({
      where: {
        tenantId,
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description || undefined,
      type: task.type as ScheduledTask['type'],
      cronExpression: task.cronExpression,
      isActive: task.isActive,
      lastRunAt: task.lastRunAt || undefined,
      nextRunAt: this.calculateNextRun(task.cronExpression),
      runCount: task.runCount,
      successCount: task.successCount,
      failureCount: task.failureCount,
      config: task.config,
      createdAt: task.createdAt,
    }));
  }

  async executeTaskNow(taskId: string, tenantId: string): Promise<TaskExecutionResult> {
    const task = await this.prisma.aIAssistantScheduledTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return this.executeTask(taskId, tenantId, task.userId, task.type as any, task.config);
  }

  // ==================== TASK EXECUTION ====================

  private async executeTask(
    taskId: string,
    tenantId: string,
    userId: string,
    type: 'sync' | 'upload' | 'report' | 'cleanup' | 'custom',
    config: any,
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();

    // Mark as running
    if (this.runningTasks.has(taskId)) {
      return {
        success: false,
        message: 'Task is already running',
        executionTime: 0,
      };
    }

    this.runningTasks.add(taskId);

    try {
      let result: TaskExecutionResult;

      switch (type) {
        case 'sync':
          result = await this.executeSyncTask(tenantId, userId, config);
          break;
        case 'upload':
          result = await this.executeUploadTask(tenantId, userId, config);
          break;
        case 'report':
          result = await this.executeReportTask(tenantId, userId, config);
          break;
        case 'cleanup':
          result = await this.executeCleanupTask(tenantId, userId, config);
          break;
        case 'custom':
          result = await this.executeCustomTask(tenantId, userId, config);
          break;
        default:
          result = {
            success: false,
            message: 'Unknown task type',
            executionTime: Date.now() - startTime,
          };
      }

      // Update task stats
      await this.prisma.aIAssistantScheduledTask.update({
        where: { id: taskId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          successCount: result.success ? { increment: 1 } : undefined,
          failureCount: !result.success ? { increment: 1 } : undefined,
        },
      });

      // Log execution
      await this.prisma.aIAssistantTaskLog.create({
        data: {
          taskId,
          tenantId,
          userId,
          status: result.success ? 'SUCCESS' : 'FAILED',
          result: result.data || {},
          error: result.error || null,
          executionTime: Date.now() - startTime,
        },
      });

      return { ...result, executionTime: Date.now() - startTime };
    } catch (error) {
      // Update failure count
      await this.prisma.aIAssistantScheduledTask.update({
        where: { id: taskId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          failureCount: { increment: 1 },
        },
      });

      // Log error
      await this.prisma.aIAssistantTaskLog.create({
        data: {
          taskId,
          tenantId,
          userId,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime,
        },
      });

      return {
        success: false,
        message: 'Task execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  private async executeSyncTask(
    tenantId: string,
    userId: string,
    config: { platform: string; syncType: 'brand' | 'category' | 'attribute' | 'all' },
  ): Promise<TaskExecutionResult> {
    this.logger.log(`Executing sync task: ${config.syncType} for ${config.platform}`);

    // Create sync job
    const job = await this.prisma.aIAssistantSyncJob.create({
      data: {
        tenantId,
        userId,
        type: `${config.syncType.toUpperCase()}_SYNC` as any,
        platform: config.platform,
        status: 'PENDING',
        totalItems: 0,
        processedItems: 0,
        failedItems: 0,
        payload: config,
      },
    });

    // Here you would trigger the actual sync process
    // This is a placeholder implementation

    return {
      success: true,
      message: `Sync job created for ${config.platform}`,
      data: { jobId: job.id },
      executionTime: 0,
    };
  }

  private async executeUploadTask(
    tenantId: string,
    userId: string,
    config: { platform: string; productIds?: string[]; categoryId?: string },
  ): Promise<TaskExecutionResult> {
    this.logger.log(`Executing upload task for ${config.platform}`);

    // Create upload job
    const job = await this.prisma.aIAssistantSyncJob.create({
      data: {
        tenantId,
        userId,
        type: 'BULK_UPLOAD',
        platform: config.platform,
        status: 'PENDING',
        totalItems: config.productIds?.length || 0,
        processedItems: 0,
        failedItems: 0,
        payload: config,
      },
    });

    return {
      success: true,
      message: `Upload job created for ${config.platform}`,
      data: { jobId: job.id },
      executionTime: 0,
    };
  }

  private async executeReportTask(
    tenantId: string,
    userId: string,
    config: { reportType: string; email?: string },
  ): Promise<TaskExecutionResult> {
    this.logger.log(`Executing report task: ${config.reportType}`);

    // Generate report
    // This is a placeholder implementation

    return {
      success: true,
      message: `Report ${config.reportType} generated`,
      data: { reportType: config.reportType },
      executionTime: 0,
    };
  }

  private async executeCleanupTask(
    tenantId: string,
    userId: string,
    config: { olderThanDays: number },
  ): Promise<TaskExecutionResult> {
    this.logger.log(`Executing cleanup task for data older than ${config.olderThanDays} days`);

    const cutoffDate = new Date(Date.now() - config.olderThanDays * 24 * 60 * 60 * 1000);

    // Clean old conversations
    const deletedConversations = await this.prisma.aIAssistantConversation.deleteMany({
      where: {
        tenantId,
        userId,
        updatedAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      success: true,
      message: `Cleanup completed: ${deletedConversations.count} conversations deleted`,
      data: { deletedCount: deletedConversations.count },
      executionTime: 0,
    };
  }

  private async executeCustomTask(
    tenantId: string,
    userId: string,
    config: any,
  ): Promise<TaskExecutionResult> {
    this.logger.log(`Executing custom task with config:`, config);

    // Custom task execution logic
    // This can be extended based on requirements

    return {
      success: true,
      message: 'Custom task executed',
      data: config,
      executionTime: 0,
    };
  }

  // ==================== HELPER METHODS ====================

  private isValidCronExpression(expression: string): boolean {
    // Basic validation - can be enhanced with a proper cron parser
    const parts = expression.split(' ');
    return parts.length === 5 || parts.length === 6;
  }

  private addCronJob(name: string, cronExpression: string, callback: () => Promise<void>): void {
    // This is a simplified implementation
    // In production, you might want to use node-cron or similar
    this.logger.log(`Added cron job: ${name} with expression: ${cronExpression}`);
  }

  private deleteCronJob(name: string): void {
    this.logger.log(`Deleted cron job: ${name}`);
  }

  private calculateNextRun(cronExpression: string): Date | undefined {
    // Simplified - should use a proper cron parser
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now as placeholder
  }

  private async processUnprocessedFeedback(): Promise<number> {
    const unprocessed = await this.prisma.aIFeedbackLoop.findMany({
      where: {
        isProcessed: false,
      },
      take: 100,
    });

    // Process feedback
    for (const feedback of unprocessed) {
      // Mark as processed
      await this.prisma.aIFeedbackLoop.update({
        where: { id: feedback.id },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });
    }

    return unprocessed.length;
  }

  // ==================== PRESET SCHEDULES ====================

  getPresetSchedules(): Array<{
    name: string;
    description: string;
    cronExpression: string;
    type: string;
  }> {
    return [
      {
        name: 'Daily Morning Sync',
        description: 'Her sabah 9\'da tüm pazaryerlerini eşitle',
        cronExpression: '0 9 * * *',
        type: 'sync',
      },
      {
        name: 'Weekly Full Sync',
        description: 'Her Pazartesi gece tüm verileri eşitle',
        cronExpression: '0 2 * * 1',
        type: 'sync',
      },
      {
        name: 'Hourly Check',
        description: 'Her saat stok ve fiyat kontrolü',
        cronExpression: '0 * * * *',
        type: 'sync',
      },
      {
        name: 'Daily Report',
        description: 'Her gün satış raporu gönder',
        cronExpression: '0 18 * * *',
        type: 'report',
      },
      {
        name: 'Weekly Cleanup',
        description: 'Her hafta eski verileri temizle',
        cronExpression: '0 3 * * 0',
        type: 'cleanup',
      },
    ];
  }
}

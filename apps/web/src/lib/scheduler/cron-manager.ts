// Advanced Scheduler - Cron Job Management
// Manage and monitor background jobs

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
type JobPriority = 'low' | 'normal' | 'high' | 'critical';

interface ScheduledJob {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  cronExpression: string;
  timezone: string;
  task: {
    type: string;
    handler: string; // Function reference or code
    params?: Record<string, unknown>;
  };
  status: JobStatus;
  priority: JobPriority;
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  lastResult?: {
    success: boolean;
    output?: unknown;
    error?: string;
    duration: number;
  };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number; // seconds
    exponentialBackoff: boolean;
  };
  currentRetryCount: number;
  timeout?: number; // seconds
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

interface JobExecution {
  id: string;
  jobId: string;
  tenantId: string;
  status: JobStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  output?: unknown;
  error?: string;
  logs: string[];
  triggeredBy: 'scheduled' | 'manual' | 'retry';
}

interface JobStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  lastRunStatus: JobStatus;
  nextScheduledRun?: Date;
  uptime: number; // percentage
}

// Cron Manager
export class CronManager {
  private jobs: Map<string, ScheduledJob> = new Map();
  private executions: Map<string, JobExecution[]> = new Map();
  private runningJobs: Map<string, AbortController> = new Map();

  // Create scheduled job
  createJob(config: Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'currentRetryCount'>): ScheduledJob {
    const job: ScheduledJob = {
      ...config,
      id: crypto.randomUUID(),
      currentRetryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate next run
    job.nextRunAt = this.calculateNextRun(job.cronExpression, job.timezone);

    this.jobs.set(job.id, job);
    return job;
  }

  // Update job
  updateJob(jobId: string, updates: Partial<ScheduledJob>): ScheduledJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    Object.assign(job, updates, { updatedAt: new Date() });

    // Recalculate next run if cron changed
    if (updates.cronExpression || updates.timezone) {
      job.nextRunAt = this.calculateNextRun(job.cronExpression, job.timezone);
    }

    return job;
  }

  // Delete job
  deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
    this.executions.delete(jobId);
  }

  // Enable/disable job
  toggleJob(jobId: string): ScheduledJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.enabled = !job.enabled;
    job.updatedAt = new Date();

    if (job.enabled) {
      job.nextRunAt = this.calculateNextRun(job.cronExpression, job.timezone);
    } else {
      job.nextRunAt = undefined;
    }

    return job;
  }

  // Run job immediately
  async runNow(jobId: string, triggeredBy: 'manual' | 'retry' = 'manual'): Promise<JobExecution> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    return this.executeJob(job, triggeredBy);
  }

  // Cancel running job
  cancelJob(jobId: string): boolean {
    const controller = this.runningJobs.get(jobId);
    if (controller) {
      controller.abort();
      this.runningJobs.delete(jobId);
      
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'cancelled';
      }
      
      return true;
    }
    return false;
  }

  // Pause job (don't run on schedule)
  pauseJob(jobId: string): ScheduledJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'paused';
    job.updatedAt = new Date();
    return job;
  }

  // Resume paused job
  resumeJob(jobId: string): ScheduledJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'pending';
    job.nextRunAt = this.calculateNextRun(job.cronExpression, job.timezone);
    job.updatedAt = new Date();
    return job;
  }

  // Get job by ID
  getJob(jobId: string): ScheduledJob | null {
    return this.jobs.get(jobId) || null;
  }

  // List jobs for tenant
  listJobs(tenantId: string, options: {
    status?: JobStatus;
    enabled?: boolean;
    tag?: string;
  } = {}): ScheduledJob[] {
    let jobs = Array.from(this.jobs.values()).filter(j => j.tenantId === tenantId);

    if (options.status) {
      jobs = jobs.filter(j => j.status === options.status);
    }

    if (options.enabled !== undefined) {
      jobs = jobs.filter(j => j.enabled === options.enabled);
    }

    if (options.tag) {
      jobs = jobs.filter(j => j.tags?.includes(options.tag!));
    }

    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get job execution history
  getExecutionHistory(
    jobId: string,
    options: {
      limit?: number;
      status?: JobStatus;
    } = {}
  ): JobExecution[] {
    const executions = this.executions.get(jobId) || [];
    let filtered = [...executions];

    if (options.status) {
      filtered = filtered.filter(e => e.status === options.status);
    }

    filtered.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  // Get job statistics
  getJobStats(jobId: string): JobStats {
    const executions = this.executions.get(jobId) || [];
    const job = this.jobs.get(jobId);

    const successful = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');

    const totalDuration = successful.reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      totalRuns: executions.length,
      successfulRuns: successful.length,
      failedRuns: failed.length,
      averageDuration: successful.length > 0 ? totalDuration / successful.length : 0,
      lastRunStatus: executions[0]?.status || 'pending',
      nextScheduledRun: job?.nextRunAt,
      uptime: executions.length > 0 ? (successful.length / executions.length) * 100 : 100,
    };
  }

  // Process due jobs (called by scheduler)
  async processDueJobs(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    const now = new Date();
    const results = { processed: 0, succeeded: 0, failed: 0 };

    for (const job of this.jobs.values()) {
      if (!job.enabled || job.status === 'paused') continue;
      if (!job.nextRunAt || job.nextRunAt > now) continue;

      results.processed++;

      try {
        await this.executeJob(job, 'scheduled');
        results.succeeded++;
      } catch (error) {
        results.failed++;
      }

      // Update next run time
      job.lastRunAt = now;
      job.nextRunAt = this.calculateNextRun(job.cronExpression, job.timezone);
    }

    return results;
  }

  // Get all upcoming jobs
  getUpcomingJobs(tenantId?: string, limit: number = 50): Array<{
    job: ScheduledJob;
    scheduledAt: Date;
  }> {
    const now = new Date();
    const upcoming: Array<{ job: ScheduledJob; scheduledAt: Date }> = [];

    for (const job of this.jobs.values()) {
      if (tenantId && job.tenantId !== tenantId) continue;
      if (!job.enabled || job.status === 'paused') continue;
      if (!job.nextRunAt) continue;

      upcoming.push({ job, scheduledAt: job.nextRunAt });
    }

    upcoming.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    return upcoming.slice(0, limit);
  }

  // Validate cron expression
  validateCron(cronExpression: string): { valid: boolean; error?: string } {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5 && parts.length !== 6) {
      return { valid: false, error: 'Invalid cron format. Use: * * * * * or * * * * * *' };
    }

    // Basic validation
    for (const part of parts) {
      if (part !== '*' && !/^\d+([,-/]\d+)*$/.test(part) && !/^\*\/\d+$/.test(part)) {
        return { valid: false, error: `Invalid cron segment: ${part}` };
      }
    }

    return { valid: true };
  }

  // Get next run times
  getNextRuns(cronExpression: string, timezone: string, count: number = 5): Date[] {
    const runs: Date[] = [];
    let current = new Date();

    for (let i = 0; i < count; i++) {
      const next = this.calculateNextRun(cronExpression, timezone, current);
      if (!next) break;
      runs.push(next);
      current = new Date(next.getTime() + 60000); // Add 1 minute to find next
    }

    return runs;
  }

  // Private methods
  private async executeJob(
    job: ScheduledJob,
    triggeredBy: 'scheduled' | 'manual' | 'retry'
  ): Promise<JobExecution> {
    const execution: JobExecution = {
      id: crypto.randomUUID(),
      jobId: job.id,
      tenantId: job.tenantId,
      status: 'running',
      startedAt: new Date(),
      logs: [],
      triggeredBy,
    };

    // Store execution
    const executions = this.executions.get(job.id) || [];
    executions.unshift(execution);
    this.executions.set(job.id, executions.slice(0, 100)); // Keep last 100

    // Create abort controller
    const controller = new AbortController();
    this.runningJobs.set(job.id, controller);

    job.status = 'running';
    job.currentRetryCount = 0;

    try {
      // Set timeout
      const timeout = job.timeout ? job.timeout * 1000 : 300000; // Default 5 minutes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), timeout);
      });

      // Execute task
      const startTime = Date.now();
      
      const taskPromise = this.runTask(job.task, controller.signal, (log: string) => {
        execution.logs.push(`[${new Date().toISOString()}] ${log}`);
      });

      const result = await Promise.race([taskPromise, timeoutPromise]);

      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;
      execution.output = result;
      execution.status = 'completed';

      job.status = 'pending';
      job.lastResult = {
        success: true,
        output: result,
        duration: execution.duration,
      };

    } catch (error) {
      execution.completedAt = new Date();
      execution.error = String(error);
      execution.status = 'failed';

      job.status = 'failed';
      job.lastResult = {
        success: false,
        error: String(error),
        duration: Date.now() - execution.startedAt.getTime(),
      };

      // Retry if configured
      if (job.retryConfig && job.currentRetryCount < job.retryConfig.maxRetries) {
        job.currentRetryCount++;
        const delay = job.retryConfig.exponentialBackoff
          ? job.retryConfig.retryDelay * Math.pow(2, job.currentRetryCount - 1)
          : job.retryConfig.retryDelay;

        setTimeout(() => {
          this.executeJob(job, 'retry');
        }, delay * 1000);
      }

    } finally {
      this.runningJobs.delete(job.id);
    }

    return execution;
  }

  private async runTask(
    task: ScheduledJob['task'],
    signal: AbortSignal,
    log: (message: string) => void
  ): Promise<unknown> {
    log(`Starting task: ${task.type}`);

    // In a real implementation, this would:
    // 1. Load the task handler from a registry
    // 2. Execute it with the provided params
    // 3. Handle abort signals

    if (signal.aborted) {
      throw new Error('Job was cancelled');
    }

    // Mock task execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (signal.aborted) {
      throw new Error('Job was cancelled');
    }

    log('Task completed successfully');
    return { status: 'ok' };
  }

  private calculateNextRun(
    cronExpression: string,
    timezone: string,
    fromDate?: Date
  ): Date | undefined {
    // Simplified cron calculation
    // In production, use a library like node-cron or cron-parser
    const now = fromDate || new Date();
    const next = new Date(now);
    next.setMinutes(next.getMinutes() + 1);
    next.setSeconds(0);
    next.setMilliseconds(0);
    return next;
  }
}

// Predefined job templates
export const PREDEFINED_JOBS: Array<Omit<ScheduledJob, 'id' | 'createdAt' | 'updatedAt' | 'currentRetryCount' | 'tenantId' | 'createdBy'>> = [
  {
    name: 'Daily Sales Report',
    description: 'Generate and email daily sales report',
    cronExpression: '0 9 * * *', // 9 AM daily
    timezone: 'Europe/Istanbul',
    task: {
      type: 'report',
      handler: 'generateSalesReport',
      params: { period: 'daily' },
    },
    status: 'pending',
    priority: 'normal',
    enabled: true,
    timeout: 300,
    tags: ['report', 'daily'],
  },
  {
    name: 'Inventory Sync',
    description: 'Sync inventory with all connected marketplaces',
    cronExpression: '0 */6 * * *', // Every 6 hours
    timezone: 'Europe/Istanbul',
    task: {
      type: 'sync',
      handler: 'syncInventory',
    },
    status: 'pending',
    priority: 'high',
    enabled: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 300,
      exponentialBackoff: true,
    },
    timeout: 1800,
    tags: ['sync', 'inventory'],
  },
  {
    name: 'Order Status Update',
    description: 'Update order statuses from marketplaces',
    cronExpression: '*/15 * * * *', // Every 15 minutes
    timezone: 'Europe/Istanbul',
    task: {
      type: 'sync',
      handler: 'syncOrderStatuses',
    },
    status: 'pending',
    priority: 'critical',
    enabled: true,
    timeout: 600,
    tags: ['sync', 'orders'],
  },
  {
    name: 'Data Backup',
    description: 'Create daily database backup',
    cronExpression: '0 2 * * *', // 2 AM daily
    timezone: 'Europe/Istanbul',
    task: {
      type: 'maintenance',
      handler: 'createBackup',
    },
    status: 'pending',
    priority: 'high',
    enabled: true,
    timeout: 3600,
    tags: ['backup', 'maintenance'],
  },
  {
    name: 'Clean Old Data',
    description: 'Clean up old logs and temporary files',
    cronExpression: '0 3 * * 0', // 3 AM Sundays
    timezone: 'Europe/Istanbul',
    task: {
      type: 'maintenance',
      handler: 'cleanupOldData',
      params: { olderThanDays: 30 },
    },
    status: 'pending',
    priority: 'low',
    enabled: true,
    timeout: 1800,
    tags: ['maintenance', 'cleanup'],
  },
];

// Export singleton
export const cronManager = new CronManager();

export { ScheduledJob, JobExecution, JobStats, JobStatus };

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { createManagedRedisClient } from '../redis.config';

const redisConnection = createManagedRedisClient({
  maxRetriesPerRequest: null,
});

function requireRedisConnection(): Redis {
  if (!redisConnection) {
    throw new Error('Redis is not configured (set REDIS_URL or REDIS_HOST)');
  }
  return redisConnection;
}

// Job types
type JobType =
  | 'sync.products'
  | 'sync.orders'
  | 'sync.stock'
  | 'price.update'
  | 'image.process'
  | 'report.generate'
  | 'webhook.send'
  | 'email.send'
  | 'ai.analyze'
  | 'marketplace.import'
  | 'backup.create';

interface JobData {
  tenantId: string;
  userId?: string;
  payload: Record<string, unknown>;
  priority?: number;
  retries?: number;
}

// Queue definitions with priorities
const queues: Record<string, Queue> = {};

export function getQueue(name: JobType): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, {
      connection: requireRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }
  return queues[name];
}

// Add job to queue
export async function addJob(
  type: JobType,
  data: JobData,
  options: {
    delay?: number;
    priority?: number;
    jobId?: string;
    repeat?: {
      cron: string;
      tz?: string;
    };
  } = {},
): Promise<Job> {
  const queue = getQueue(type);

  return queue.add(type, data, {
    priority: data.priority || options.priority || 5,
    delay: options.delay,
    jobId: options.jobId,
    repeat: options.repeat,
  });
}

// Job processors
const processors: Record<JobType, (job: Job) => Promise<unknown>> = {
  'sync.products': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] Syncing products for tenant ${tenantId}`);
    // Implement product sync logic
    return { synced: (payload.productIds as string[])?.length || 0 };
  },

  'sync.orders': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] Syncing orders for tenant ${tenantId}`);
    // Implement order sync logic
    return { synced: 0 };
  },

  'sync.stock': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] Syncing stock for tenant ${tenantId}`);
    return { updated: 0 };
  },

  'price.update': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] Updating prices for tenant ${tenantId}`);
    return { updated: 0 };
  },

  'image.process': async (job) => {
    const { payload } = job.data as JobData;
    console.log(`[${job.id}] Processing image ${payload.imageUrl}`);
    // Image resize, optimize, upload to CDN
    return { processed: true };
  },

  'report.generate': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] Generating report for tenant ${tenantId}`);
    // Generate PDF/Excel report
    return { reportUrl: '' };
  },

  'webhook.send': async (job) => {
    const { payload } = job.data as JobData;
    console.log(`[${job.id}] Sending webhook to ${payload.url}`);

    const response = await fetch(payload.url as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': payload.signature as string,
      },
      body: JSON.stringify(payload.data),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return { sent: true, status: response.status };
  },

  'email.send': async (job) => {
    const { payload } = job.data as JobData;
    console.log(`[${job.id}] Sending email to ${payload.to}`);
    // Integrate with email service
    return { sent: true };
  },

  'ai.analyze': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(`[${job.id}] AI analysis for tenant ${tenantId}`);
    // AI processing
    return { analyzed: true };
  },

  'marketplace.import': async (job) => {
    const { tenantId, payload } = job.data as JobData;
    console.log(
      `[${job.id}] Importing from marketplace for tenant ${tenantId}`,
    );
    return { imported: 0 };
  },

  'backup.create': async (job) => {
    const { tenantId } = job.data as JobData;
    console.log(`[${job.id}] Creating backup for tenant ${tenantId}`);
    return { backupUrl: '' };
  },
};

// Start workers
export function startWorkers(): void {
  if (!redisConnection) {
    console.warn('[Worker] Redis not configured, background workers disabled');
    return;
  }

  Object.entries(processors).forEach(([type, processor]) => {
    const worker = new Worker(type, processor, {
      connection: redisConnection,
      concurrency: 5,
    });

    worker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err);
    });

    console.log(`[Worker] Started for queue: ${type}`);
  });
}

// Queue dashboard data
export async function getQueueMetrics(): Promise<
  Record<
    string,
    {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    }
  >
> {
  const metrics: Record<
    string,
    {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    }
  > = {};

  for (const [name, queue] of Object.entries(queues)) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    metrics[name] = { waiting, active, completed, failed, delayed };
  }

  return metrics;
}

// Cleanup old jobs
export async function cleanupQueues(): Promise<void> {
  for (const queue of Object.values(queues)) {
    await queue.clean(24 * 3600 * 1000, 1000, 'completed');
    await queue.clean(7 * 24 * 3600 * 1000, 1000, 'failed');
  }
}

export { redisConnection };
export type { JobType, JobData };

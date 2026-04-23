// Queue client for web app
// Communicates with BullMQ queue via API

interface JobOptions {
  delay?: number;
  priority?: number;
  jobId?: string;
}

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

// Add job to queue via API
export async function addJob(
  type: JobType,
  data: {
    tenantId: string;
    userId?: string;
    payload: Record<string, unknown>;
    priority?: number;
  },
  options: JobOptions = {}
): Promise<{ jobId: string; status: string }> {
  const response = await fetch('/api/queue/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      data,
      options,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add job to queue');
  }

  return response.json();
}

// Get job status
export async function getJobStatus(jobId: string): Promise<{
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  result?: Record<string, unknown>;
  failedReason?: string;
}> {
  const response = await fetch(`/api/queue/jobs/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get job status');
  }

  return response.json();
}

// Cancel job
export async function cancelJob(jobId: string): Promise<void> {
  const response = await fetch(`/api/queue/jobs/${jobId}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to cancel job');
  }
}

// Get queue metrics
export async function getQueueMetrics(): Promise<{
  queues: Record<string, {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }>;
}> {
  const response = await fetch('/api/queue/metrics');
  
  if (!response.ok) {
    throw new Error('Failed to get queue metrics');
  }

  return response.json();
}

// Convenience functions for common jobs
export const queueHelpers = {
  // Sync products to marketplace
  syncProducts: (tenantId: string, productIds: string[]) =>
    addJob('sync.products', {
      tenantId,
      payload: { productIds },
    }),

  // Update prices
  updatePrices: (tenantId: string, updates: Array<{ productId: string; newPrice: number }>) =>
    addJob('price.update', {
      tenantId,
      payload: { updates },
    }),

  // Process images
  processImages: (tenantId: string, imageUrls: string[]) =>
    addJob('image.process', {
      tenantId,
      payload: { imageUrls },
    }),

  // Generate report
  generateReport: (tenantId: string, reportType: string, format: string, filters: Record<string, unknown>) =>
    addJob('report.generate', {
      tenantId,
      payload: { reportType, format, filters },
    }),

  // Send webhook
  sendWebhook: (tenantId: string, url: string, data: Record<string, unknown>) =>
    addJob('webhook.send', {
      tenantId,
      payload: { url, data, signature: generateSignature(data) },
    }),

  // Run AI analysis
  runAIAnalysis: (tenantId: string, analysisType: string, targetIds: string[]) =>
    addJob('ai.analyze', {
      tenantId,
      payload: { analysisType, targetIds },
    }),
};

// Generate webhook signature
function generateSignature(data: Record<string, unknown>): string {
  // In production, use proper HMAC with secret key
  const json = JSON.stringify(data);
  return `sha256=${btoa(json).slice(0, 32)}`;
}

export type { JobType, JobOptions };

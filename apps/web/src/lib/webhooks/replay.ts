// Webhook Replay System
// Retry failed webhooks with exponential backoff and replay capability

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

type WebhookStatus = 'pending' | 'delivered' | 'failed' | 'retrying' | 'exhausted';
type ReplayStrategy = 'immediate' | 'exponential' | 'fixed_interval';

interface WebhookDelivery {
  id: string;
  tenantId: string;
  webhookId: string;
  eventId: string;
  payload: Record<string, unknown>;
  status: WebhookStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  lastAttemptAt?: Date;
  deliveredAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  replayCount: number;
  replayOf?: string; // Original delivery ID if this is a replay
  createdAt: Date;
  updatedAt: Date;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  strategy: ReplayStrategy;
}

interface ReplayBatch {
  ids: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelayMs: 5000, // 5 seconds
  maxDelayMs: 3600000, // 1 hour
  backoffMultiplier: 2,
  strategy: 'exponential',
};

// Webhook replay manager
export class WebhookReplayManager {
  private retryConfig: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  // Retry failed delivery
  async retryDelivery(deliveryId: string): Promise<WebhookDelivery | null> {
    const delivery = await this.getDelivery(deliveryId);
    if (!delivery) return null;

    // Check if max attempts reached
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'exhausted';
      await this.updateDelivery(delivery);
      console.log(`Delivery ${deliveryId} exhausted all retry attempts`);
      return delivery;
    }

    // Calculate next retry time
    const nextRetryAt = this.calculateNextRetry(delivery.attempts);
    
    delivery.status = 'retrying';
    delivery.attempts++;
    delivery.nextRetryAt = nextRetryAt;
    delivery.updatedAt = new Date();

    await this.updateDelivery(delivery);

    // Schedule retry job
    await addJob('webhook.retry', {
      deliveryId: delivery.id,
      scheduledFor: nextRetryAt,
    });

    return delivery;
  }

  // Replay delivery immediately
  async replayNow(deliveryId: string, newPayload?: Record<string, unknown>): Promise<WebhookDelivery | null> {
    const original = await this.getDelivery(deliveryId);
    if (!original) return null;

    // Create new delivery as replay
    const replay: WebhookDelivery = {
      ...original,
      id: crypto.randomUUID(),
      payload: newPayload || original.payload,
      status: 'pending',
      attempts: 0,
      replayCount: 0,
      replayOf: deliveryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save replay
    await this.saveDelivery(replay);

    // Queue immediate delivery
    await addJob('webhook.send', {
      deliveryId: replay.id,
      priority: 'high',
    });

    return replay;
  }

  // Batch replay multiple deliveries
  async batchReplay(
    deliveryIds: string[],
    options: {
      delayBetweenMs?: number;
      stopOnError?: boolean;
      transformPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
    } = {}
  ): Promise<ReplayBatch> {
    const batch: ReplayBatch = {
      ids: deliveryIds,
      status: 'queued',
      results: [],
    };

    batch.status = 'processing';
    batch.startedAt = new Date();

    for (let i = 0; i < deliveryIds.length; i++) {
      const id = deliveryIds[i];
      
      try {
        const original = await this.getDelivery(id);
        if (!original) {
          batch.results.push({ id, success: false, error: 'Delivery not found' });
          continue;
        }

        const payload = options.transformPayload 
          ? options.transformPayload(original.payload)
          : original.payload;

        const replay = await this.replayNow(id, payload);
        
        batch.results.push({
          id,
          success: replay !== null,
          error: replay ? undefined : 'Failed to create replay',
        });

        // Delay between replays if specified
        if (options.delayBetweenMs && i < deliveryIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, options.delayBetweenMs));
        }

        // Stop on error if specified
        if (options.stopOnError && !replay) {
          batch.status = 'failed';
          batch.completedAt = new Date();
          return batch;
        }
      } catch (error) {
        batch.results.push({ id, success: false, error: String(error) });
        
        if (options.stopOnError) {
          batch.status = 'failed';
          batch.completedAt = new Date();
          return batch;
        }
      }
    }

    batch.status = 'completed';
    batch.completedAt = new Date();
    return batch;
  }

  // Replay all failed deliveries for a webhook
  async replayAllFailed(webhookId: string): Promise<{
    total: number;
    queued: number;
    failed: number;
  }> {
    const failed = await this.getFailedDeliveries(webhookId);
    
    let queued = 0;
    let failedCount = 0;

    for (const delivery of failed) {
      try {
        const replay = await this.replayNow(delivery.id);
        if (replay) {
          queued++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }

    return {
      total: failed.length,
      queued,
      failed: failedCount,
    };
  }

  // Get replay history
  async getReplayHistory(originalDeliveryId: string): Promise<WebhookDelivery[]> {
    // Would fetch from database
    return [];
  }

  // Schedule automatic retries
  async scheduleRetries(): Promise<void> {
    const pending = await this.getPendingRetries();
    
    for (const delivery of pending) {
      if (delivery.nextRetryAt && delivery.nextRetryAt <= new Date()) {
        await addJob('webhook.retry', {
          deliveryId: delivery.id,
          priority: delivery.attempts > 3 ? 'high' : 'normal',
        });
      }
    }
  }

  // Get retry statistics
  async getRetryStats(tenantId: string, period: { from: Date; to: Date }): Promise<{
    total: number;
    delivered: number;
    failed: number;
    exhausted: number;
    averageAttempts: number;
    averageLatency: number;
  }> {
    // Would calculate from database
    return {
      total: 0,
      delivered: 0,
      failed: 0,
      exhausted: 0,
      averageAttempts: 0,
      averageLatency: 0,
    };
  }

  // Calculate next retry time based on strategy
  private calculateNextRetry(attempts: number): Date {
    const delay = this.calculateDelay(attempts);
    return new Date(Date.now() + delay);
  }

  private calculateDelay(attempts: number): number {
    const { initialDelayMs, maxDelayMs, backoffMultiplier, strategy } = this.retryConfig;

    switch (strategy) {
      case 'immediate':
        return 0;

      case 'fixed_interval':
        return initialDelayMs;

      case 'exponential':
      default:
        const delay = initialDelayMs * Math.pow(backoffMultiplier, attempts);
        return Math.min(delay, maxDelayMs);
    }
  }

  // Private helper methods
  private async getDelivery(id: string): Promise<WebhookDelivery | null> {
    // Would fetch from database
    return null;
  }

  private async updateDelivery(delivery: WebhookDelivery): Promise<void> {
    // Would update in database
    console.log(`Updated delivery ${delivery.id}: ${delivery.status}`);
  }

  private async saveDelivery(delivery: WebhookDelivery): Promise<void> {
    // Would save to database
    console.log(`Saved delivery ${delivery.id}`);
  }

  private async getFailedDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    // Would fetch from database
    return [];
  }

  private async getPendingRetries(): Promise<WebhookDelivery[]> {
    // Would fetch from database
    return [];
  }
}

// Webhook delivery simulator
export class WebhookSimulator {
  // Simulate webhook delivery for testing
  async simulate(
    webhookId: string,
    payload: Record<string, unknown>,
    options: {
      delayMs?: number;
      failRate?: number; // 0-1 probability of failure
      responseStatus?: number;
    } = {}
  ): Promise<{
    success: boolean;
    responseStatus: number;
    responseBody: string;
    latencyMs: number;
  }> {
    const start = Date.now();

    // Simulate delay
    if (options.delayMs) {
      await new Promise(resolve => setTimeout(resolve, options.delayMs));
    }

    // Simulate failure
    const shouldFail = Math.random() < (options.failRate || 0);
    
    if (shouldFail) {
      return {
        success: false,
        responseStatus: options.responseStatus || 500,
        responseBody: 'Simulated failure',
        latencyMs: Date.now() - start,
      };
    }

    return {
      success: true,
      responseStatus: 200,
      responseBody: JSON.stringify({ received: true }),
      latencyMs: Date.now() - start,
    };
  }

  // Generate test payload for event type
  generateTestPayload(eventType: string): Record<string, unknown> {
    const payloads: Record<string, Record<string, unknown>> = {
      'order.created': {
        event: 'order.created',
        orderId: 'ORD-' + Math.floor(Math.random() * 10000),
        total: 150.00,
        currency: 'TRY',
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
        },
        items: [
          { productId: 'PROD-1', quantity: 2, price: 75.00 },
        ],
      },
      'product.updated': {
        event: 'product.updated',
        productId: 'PROD-' + Math.floor(Math.random() * 10000),
        name: 'Test Product',
        price: 99.99,
        stock: 50,
      },
      'inventory.low': {
        event: 'inventory.low',
        productId: 'PROD-' + Math.floor(Math.random() * 10000),
        currentStock: 5,
        reorderPoint: 10,
      },
    };

    return payloads[eventType] || { event: eventType, test: true };
  }
}

// Export singleton
export const replayManager = new WebhookReplayManager();
export const webhookSimulator = new WebhookSimulator();

export { WebhookDelivery, RetryConfig, ReplayBatch };

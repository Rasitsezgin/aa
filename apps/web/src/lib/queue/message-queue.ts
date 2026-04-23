// Message Queue Manager
// SQS, RabbitMQ, Apache Kafka integration

import { EventEmitter } from 'events';

type QueueProvider = 'sqs' | 'rabbitmq' | 'kafka' | 'redis';
type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

interface QueueMessage {
  id: string;
  queue: string;
  tenantId: string;
  body: Record<string, unknown>;
  priority: MessagePriority;
  delay?: number; // seconds
  attributes: {
    contentType: string;
    timestamp: Date;
    source: string;
    correlationId?: string;
    messageGroupId?: string; // FIFO
  };
  retryCount: number;
  maxRetries: number;
  visibleAfter?: Date; // For delayed/scheduled messages
}

interface Queue {
  id: string;
  name: string;
  tenantId: string;
  provider: QueueProvider;
  type: 'standard' | 'fifo';
  config: {
    visibilityTimeout?: number;
    retentionPeriod?: number;
    maxMessageSize?: number;
    deliveryDelay?: number;
    deadLetterQueue?: string;
  };
  stats: {
    messagesAvailable: number;
    messagesInFlight: number;
    messagesDelayed: number;
  };
}

interface QueueConsumer {
  id: string;
  queueId: string;
  handler: (message: QueueMessage) => Promise<void>;
  options: {
    maxMessages: number;
    waitTime: number;
    batchSize: number;
  };
  status: 'running' | 'stopped' | 'error';
  processed: number;
  errors: number;
}

// Message Queue Manager
export class MessageQueueManager extends EventEmitter {
  private queues: Map<string, Queue> = new Map();
  private messages: Map<string, QueueMessage[]> = new Map();
  private consumers: Map<string, QueueConsumer> = new Map();
  private processing: Set<string> = new Set();

  // Create queue
  createQueue(config: Omit<Queue, 'id' | 'stats'>): Queue {
    const queue: Queue = {
      ...config,
      id: crypto.randomUUID(),
      stats: {
        messagesAvailable: 0,
        messagesInFlight: 0,
        messagesDelayed: 0,
      },
    };

    this.queues.set(queue.id, queue);
    this.messages.set(queue.id, []);
    this.emit('queueCreated', queue);
    return queue;
  }

  // Send message
  sendMessage(
    queueId: string,
    body: Record<string, unknown>,
    options: {
      priority?: MessagePriority;
      delay?: number;
      attributes?: Partial<QueueMessage['attributes']>;
    } = {}
  ): QueueMessage {
    const queue = this.queues.get(queueId);
    if (!queue) throw new Error('Queue not found');

    const message: QueueMessage = {
      id: crypto.randomUUID(),
      queue: queue.name,
      tenantId: queue.tenantId,
      body,
      priority: options.priority || 'normal',
      delay: options.delay,
      attributes: {
        contentType: 'application/json',
        timestamp: new Date(),
        source: 'api',
        ...options.attributes,
      },
      retryCount: 0,
      maxRetries: 3,
      visibleAfter: options.delay 
        ? new Date(Date.now() + options.delay * 1000)
        : undefined,
    };

    const queueMessages = this.messages.get(queueId) || [];
    queueMessages.push(message);
    this.messages.set(queueId, queueMessages);

    // Update stats
    if (options.delay) {
      queue.stats.messagesDelayed++;
    } else {
      queue.stats.messagesAvailable++;
    }

    this.emit('messageSent', message);
    
    // Trigger consumers
    this.processMessages(queueId);

    return message;
  }

  // Send batch
  sendBatch(queueId: string, messages: Record<string, unknown>[]): QueueMessage[] {
    return messages.map(body => this.sendMessage(queueId, body));
  }

  // Receive messages
  receiveMessages(
    queueId: string,
    options: {
      maxMessages?: number;
      waitTime?: number;
      visibilityTimeout?: number;
    } = {}
  ): QueueMessage[] {
    const queue = this.queues.get(queueId);
    if (!queue) throw new Error('Queue not found');

    const maxMessages = options.maxMessages || 10;
    const now = new Date();

    const queueMessages = this.messages.get(queueId) || [];
    
    // Filter available messages
    const available = queueMessages.filter(m => 
      !this.processing.has(m.id) &&
      (!m.visibleAfter || m.visibleAfter <= now)
    );

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    available.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const toProcess = available.slice(0, maxMessages);

    // Mark as in-flight
    for (const msg of toProcess) {
      this.processing.add(msg.id);
      queue.stats.messagesAvailable--;
      queue.stats.messagesInFlight++;

      // Set visibility timeout
      const visibilityTimeout = options.visibilityTimeout || queue.config.visibilityTimeout || 30;
      msg.visibleAfter = new Date(now.getTime() + visibilityTimeout * 1000);
    }

    return toProcess;
  }

  // Delete message (acknowledge)
  deleteMessage(queueId: string, messageId: string): void {
    const queue = this.queues.get(queueId);
    if (!queue) return;

    const messages = this.messages.get(queueId) || [];
    const index = messages.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
      messages.splice(index, 1);
      this.processing.delete(messageId);
      queue.stats.messagesInFlight--;
    }

    this.emit('messageDeleted', { queueId, messageId });
  }

  // Change message visibility (extend or return to queue)
  changeVisibility(
    queueId: string,
    messageId: string,
    visibilityTimeout: number
  ): void {
    const messages = this.messages.get(queueId) || [];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
      message.visibleAfter = new Date(Date.now() + visibilityTimeout * 1000);
      this.processing.delete(messageId);
      
      const queue = this.queues.get(queueId)!;
      queue.stats.messagesInFlight--;
      queue.stats.messagesAvailable++;
    }
  }

  // Register consumer
  registerConsumer(
    queueId: string,
    handler: (message: QueueMessage) => Promise<void>,
    options: Partial<QueueConsumer['options']> = {}
  ): QueueConsumer {
    const consumer: QueueConsumer = {
      id: crypto.randomUUID(),
      queueId,
      handler,
      options: {
        maxMessages: 10,
        waitTime: 20,
        batchSize: 1,
        ...options,
      },
      status: 'running',
      processed: 0,
      errors: 0,
    };

    this.consumers.set(consumer.id, consumer);
    this.startConsumer(consumer);
    
    return consumer;
  }

  // Get queue stats
  getStats(queueId: string): Queue['stats'] | null {
    return this.queues.get(queueId)?.stats || null;
  }

  // Purge queue
  purgeQueue(queueId: string): number {
    const messages = this.messages.get(queueId);
    if (!messages) return 0;

    const count = messages.length;
    messages.length = 0;
    
    const queue = this.queues.get(queueId);
    if (queue) {
      queue.stats.messagesAvailable = 0;
      queue.stats.messagesDelayed = 0;
    }

    this.emit('queuePurged', { queueId, count });
    return count;
  }

  // Move to dead letter queue
  moveToDLQ(queueId: string, messageId: string): void {
    const queue = this.queues.get(queueId);
    if (!queue?.config.deadLetterQueue) return;

    const messages = this.messages.get(queueId) || [];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
      // In production, move to actual DLQ
      this.emit('messageDead', { queueId, messageId, message });
      this.deleteMessage(queueId, messageId);
    }
  }

  // Private methods
  private async startConsumer(consumer: QueueConsumer): Promise<void> {
    while (consumer.status === 'running') {
      try {
        const messages = this.receiveMessages(consumer.queueId, {
          maxMessages: consumer.options.maxMessages,
          waitTime: consumer.options.waitTime,
        });

        for (const message of messages) {
          try {
            await consumer.handler(message);
            this.deleteMessage(consumer.queueId, message.id);
            consumer.processed++;
          } catch (error) {
            consumer.errors++;
            message.retryCount++;

            if (message.retryCount >= message.maxRetries) {
              this.moveToDLQ(consumer.queueId, message.id);
            } else {
              // Return to queue with exponential backoff
              const backoff = Math.pow(2, message.retryCount) * 1000;
              this.changeVisibility(consumer.queueId, message.id, backoff / 1000);
            }

            this.emit('consumerError', { consumer, message, error });
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        consumer.status = 'error';
        this.emit('consumerError', { consumer, error });
      }
    }
  }

  private async processMessages(queueId: string): Promise<void> {
    // Trigger all consumers for this queue
    for (const consumer of this.consumers.values()) {
      if (consumer.queueId === queueId && consumer.status === 'running') {
        // Consumers will pick up on next poll
      }
    }
  }
}

// Predefined queue configurations
export const QUEUE_PRESETS = {
  standard: {
    type: 'standard' as const,
    config: {
      visibilityTimeout: 30,
      retentionPeriod: 1209600, // 14 days
      maxMessageSize: 262144, // 256 KB
    },
  },
  fifo: {
    type: 'fifo' as const,
    config: {
      visibilityTimeout: 30,
      retentionPeriod: 1209600,
      maxMessageSize: 262144,
      deliveryDelay: 0,
    },
  },
  high_throughput: {
    type: 'standard' as const,
    config: {
      visibilityTimeout: 10,
      retentionPeriod: 345600, // 4 days
    },
  },
};

// Export singleton
export const messageQueueManager = new MessageQueueManager();

export { Queue, QueueMessage, QueueConsumer, QueueProvider };

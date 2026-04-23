// Redis Streams Pub/Sub
// Real-time event streaming with Redis Streams

import { EventEmitter } from 'events';

interface StreamMessage {
  id: string;
  stream: string;
  data: Record<string, string>;
  timestamp: number;
  processed: boolean;
  consumerGroup?: string;
  consumer?: string;
}

interface ConsumerGroup {
  name: string;
  stream: string;
  consumers: string[];
  pendingCount: number;
  lastDeliveredId: string;
}

interface StreamConfig {
  maxLength?: number;
  approximateMaxLength?: boolean;
  ttl?: number;
}

// Redis Streams Manager
export class RedisStreamsManager extends EventEmitter {
  private streams: Map<string, StreamMessage[]> = new Map();
  private consumerGroups: Map<string, ConsumerGroup> = new Map();

  // Add message to stream
  async addMessage(
    stream: string,
    data: Record<string, string>,
    config?: StreamConfig
  ): Promise<string> {
    const message: StreamMessage = {
      id: `${Date.now()}-0`,
      stream,
      data,
      timestamp: Date.now(),
      processed: false,
    };

    if (!this.streams.has(stream)) {
      this.streams.set(stream, []);
    }

    const streamData = this.streams.get(stream)!;
    streamData.push(message);

    // Trim if maxLength set
    if (config?.maxLength && streamData.length > config.maxLength) {
      streamData.splice(0, streamData.length - config.maxLength);
    }

    this.emit('messageAdded', message);
    return message.id;
  }

  // Read from stream
  async read(
    stream: string,
    options: {
      count?: number;
      block?: number;
      from?: string;
    } = {}
  ): Promise<StreamMessage[]> {
    const streamData = this.streams.get(stream) || [];
    
    let startIndex = 0;
    if (options.from && options.from !== '$') {
      startIndex = streamData.findIndex(m => m.id >= options.from!) || 0;
    }

    return streamData.slice(startIndex, startIndex + (options.count || 10));
  }

  // Create consumer group
  createConsumerGroup(stream: string, groupName: string, startFrom: string = '$'): ConsumerGroup {
    const group: ConsumerGroup = {
      name: groupName,
      stream,
      consumers: [],
      pendingCount: 0,
      lastDeliveredId: startFrom,
    };

    this.consumerGroups.set(`${stream}:${groupName}`, group);
    return group;
  }

  // Read as consumer group
  async readGroup(
    stream: string,
    group: string,
    consumer: string,
    options: {
      count?: number;
      block?: number;
      noAck?: boolean;
    } = {}
  ): Promise<StreamMessage[]> {
    const groupKey = `${stream}:${group}`;
    const cg = this.consumerGroups.get(groupKey);
    if (!cg) throw new Error('Consumer group not found');

    // Add consumer
    if (!cg.consumers.includes(consumer)) {
      cg.consumers.push(consumer);
    }

    const messages = await this.read(stream, { 
      count: options.count || 10,
      from: cg.lastDeliveredId,
    });

    // Mark as delivered to consumer
    for (const msg of messages) {
      msg.consumerGroup = group;
      msg.consumer = consumer;
      cg.lastDeliveredId = msg.id;
      cg.pendingCount++;
    }

    return messages;
  }

  // Acknowledge message
  async ackMessage(stream: string, group: string, messageId: string): Promise<void> {
    const messages = this.streams.get(stream) || [];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
      message.processed = true;
      
      const groupKey = `${stream}:${group}`;
      const cg = this.consumerGroups.get(groupKey);
      if (cg) {
        cg.pendingCount = Math.max(0, cg.pendingCount - 1);
      }
    }
  }

  // Claim pending messages (for failed consumers)
  async claimPending(
    stream: string,
    group: string,
    consumer: string,
    minIdleTime: number
  ): Promise<StreamMessage[]> {
    const messages = this.streams.get(stream) || [];
    const now = Date.now();
    
    return messages.filter(m => 
      !m.processed && 
      m.consumerGroup === group &&
      now - m.timestamp > minIdleTime
    );
  }

  // Get stream info
  getStreamInfo(stream: string): {
    length: number;
    firstId?: string;
    lastId?: string;
    groups: string[];
  } | null {
    const data = this.streams.get(stream);
    if (!data) return null;

    const groups = Array.from(this.consumerGroups.values())
      .filter(g => g.stream === stream)
      .map(g => g.name);

    return {
      length: data.length,
      firstId: data[0]?.id,
      lastId: data[data.length - 1]?.id,
      groups,
    };
  }

  // Delete message
  async deleteMessage(stream: string, messageId: string): Promise<boolean> {
    const messages = this.streams.get(stream);
    if (!messages) return false;

    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return false;

    messages.splice(index, 1);
    return true;
  }

  // Trim stream
  async trim(stream: string, maxLength: number, approximate: boolean = false): Promise<number> {
    const messages = this.streams.get(stream);
    if (!messages) return 0;

    const toDelete = messages.length - maxLength;
    if (toDelete > 0) {
      messages.splice(0, toDelete);
    }

    return toDelete;
  }
}

// Export singleton
export const redisStreamsManager = new RedisStreamsManager();

export { StreamMessage, ConsumerGroup };

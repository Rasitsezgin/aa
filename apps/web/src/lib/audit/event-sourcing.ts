// Event Sourcing for Complete Audit Trail
// Immutable event log for all state changes

import { prisma } from '@/lib/prisma';

type EventType = 
  | 'product.created' | 'product.updated' | 'product.deleted'
  | 'order.created' | 'order.updated' | 'order.cancelled'
  | 'inventory.adjusted' | 'inventory.transferred'
  | 'user.login' | 'user.logout' | 'user.permission.changed'
  | 'settings.changed' | 'integration.configured';

interface DomainEvent {
  id: string;
  type: EventType;
  aggregateId: string; // Entity ID (productId, orderId, etc.)
  aggregateType: string; // Product, Order, etc.
  version: number; // Sequence number within aggregate
  timestamp: Date;
  tenantId: string;
  userId?: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    correlationId?: string;
    causationId?: string;
  };
  payload: Record<string, unknown>;
  previousState?: Record<string, unknown>;
}

interface EventStream {
  aggregateId: string;
  events: DomainEvent[];
  currentVersion: number;
}

interface Snapshot {
  aggregateId: string;
  version: number;
  state: Record<string, unknown>;
  timestamp: Date;
}

// Event store
export class EventStore {
  private events: DomainEvent[] = [];
  private snapshots: Map<string, Snapshot> = new Map();
  private snapshotInterval = 100; // Create snapshot every N events

  // Append event to store
  async append(event: Omit<DomainEvent, 'id' | 'version' | 'timestamp'>): Promise<DomainEvent> {
    // Get next version for aggregate
    const version = await this.getNextVersion(event.aggregateId);

    const fullEvent: DomainEvent = {
      ...event,
      id: crypto.randomUUID(),
      version,
      timestamp: new Date(),
    };

    // Store event
    this.events.push(fullEvent);
    
    // Would persist to database
    await this.persistEvent(fullEvent);

    // Create snapshot if needed
    if (version % this.snapshotInterval === 0) {
      await this.createSnapshot(event.aggregateId);
    }

    return fullEvent;
  }

  // Get events for an aggregate
  async getEvents(
    aggregateId: string,
    options: {
      fromVersion?: number;
      toVersion?: number;
      after?: Date;
      before?: Date;
    } = {}
  ): Promise<DomainEvent[]> {
    let events = this.events.filter(e => e.aggregateId === aggregateId);

    if (options.fromVersion !== undefined) {
      events = events.filter(e => e.version >= options.fromVersion!);
    }

    if (options.toVersion !== undefined) {
      events = events.filter(e => e.version <= options.toVersion!);
    }

    if (options.after) {
      events = events.filter(e => e.timestamp > options.after!);
    }

    if (options.before) {
      events = events.filter(e => e.timestamp < options.before!);
    }

    return events.sort((a, b) => a.version - b.version);
  }

  // Get event stream for aggregate
  async getStream(aggregateId: string): Promise<EventStream> {
    const events = await this.getEvents(aggregateId);
    
    return {
      aggregateId,
      events,
      currentVersion: events.length > 0 ? events[events.length - 1].version : 0,
    };
  }

  // Replay events to rebuild state
  async replay<T>(
    aggregateId: string,
    reducer: (state: T | null, event: DomainEvent) => T,
    upToVersion?: number
  ): Promise<T | null> {
    // Get snapshot if available
    const snapshot = this.snapshots.get(aggregateId);
    
    let state: T | null = snapshot ? snapshot.state as T : null;
    let fromVersion = snapshot ? snapshot.version + 1 : 1;

    // Get events after snapshot
    const events = await this.getEvents(aggregateId, {
      fromVersion,
      toVersion: upToVersion,
    });

    // Apply events
    for (const event of events) {
      state = reducer(state, event);
    }

    return state;
  }

  // Create snapshot
  async createSnapshot(aggregateId: string): Promise<void> {
    const events = await this.getEvents(aggregateId);
    if (events.length === 0) return;

    const lastEvent = events[events.length - 1];
    
    // Build current state by replaying
    // This is simplified - actual implementation would use domain logic
    const state = this.buildStateFromEvents(events);

    const snapshot: Snapshot = {
      aggregateId,
      version: lastEvent.version,
      state,
      timestamp: new Date(),
    };

    this.snapshots.set(aggregateId, snapshot);
    await this.persistSnapshot(snapshot);
  }

  // Get audit trail for entity
  async getAuditTrail(
    aggregateId: string,
    options: {
      includePayload?: boolean;
      includeMetadata?: boolean;
    } = {}
  ): Promise<Array<{
    version: number;
    type: string;
    timestamp: Date;
    userId?: string;
    changes: Array<{ field: string; from: unknown; to: unknown }>;
    metadata?: Record<string, unknown>;
  }>> {
    const events = await this.getEvents(aggregateId);
    const trail = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const previousEvent = i > 0 ? events[i - 1] : null;

      const changes = this.calculateChanges(
        previousEvent?.payload || {},
        event.payload
      );

      trail.push({
        version: event.version,
        type: event.type,
        timestamp: event.timestamp,
        userId: event.userId,
        changes,
        ...(options.includeMetadata && { metadata: event.metadata }),
      });
    }

    return trail;
  }

  // Search events
  async search(criteria: {
    tenantId?: string;
    userId?: string;
    type?: EventType;
    aggregateType?: string;
    after?: Date;
    before?: Date;
    payloadQuery?: Record<string, unknown>;
  }): Promise<DomainEvent[]> {
    let results = [...this.events];

    if (criteria.tenantId) {
      results = results.filter(e => e.tenantId === criteria.tenantId);
    }

    if (criteria.userId) {
      results = results.filter(e => e.userId === criteria.userId);
    }

    if (criteria.type) {
      results = results.filter(e => e.type === criteria.type);
    }

    if (criteria.aggregateType) {
      results = results.filter(e => e.aggregateType === criteria.aggregateType);
    }

    if (criteria.after) {
      results = results.filter(e => e.timestamp >= criteria.after!);
    }

    if (criteria.before) {
      results = results.filter(e => e.timestamp <= criteria.before!);
    }

    if (criteria.payloadQuery) {
      results = results.filter(e => 
        this.matchesPayload(e.payload, criteria.payloadQuery!)
      );
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get statistics
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByDay: Record<string, number>;
    averagePayloadSize: number;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsByDay: Record<string, number> = {};
    let totalSize = 0;

    for (const event of this.events) {
      // By type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // By day
      const day = event.timestamp.toISOString().split('T')[0];
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;

      // Size
      totalSize += JSON.stringify(event.payload).length;
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsByDay,
      averagePayloadSize: this.events.length > 0 ? totalSize / this.events.length : 0,
    };
  }

  // Private helpers
  private async getNextVersion(aggregateId: string): Promise<number> {
    const events = this.events.filter(e => e.aggregateId === aggregateId);
    if (events.length === 0) return 1;
    return Math.max(...events.map(e => e.version)) + 1;
  }

  private async persistEvent(event: DomainEvent): Promise<void> {
    // Would persist to event store database
    console.log(`Persisted event: ${event.type} v${event.version} for ${event.aggregateId}`);
  }

  private async persistSnapshot(snapshot: Snapshot): Promise<void> {
    // Would persist snapshot
    console.log(`Created snapshot v${snapshot.version} for ${snapshot.aggregateId}`);
  }

  private buildStateFromEvents(events: DomainEvent[]): Record<string, unknown> {
    // Simplified state building
    const state: Record<string, unknown> = {};
    
    for (const event of events) {
      Object.assign(state, event.payload);
    }

    return state;
  }

  private calculateChanges(
    from: Record<string, unknown>,
    to: Record<string, unknown>
  ): Array<{ field: string; from: unknown; to: unknown }> {
    const changes: Array<{ field: string; from: unknown; to: unknown }> = [];
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);

    for (const key of allKeys) {
      const fromValue = from[key];
      const toValue = to[key];

      if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
        changes.push({
          field: key,
          from: fromValue,
          to: toValue,
        });
      }
    }

    return changes;
  }

  private matchesPayload(
    payload: Record<string, unknown>,
    query: Record<string, unknown>
  ): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (payload[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// Event projector for read models
export class EventProjector {
  private projections: Map<string, (event: DomainEvent) => void> = new Map();

  // Register projection handler
  registerProjection(name: string, handler: (event: DomainEvent) => void): void {
    this.projections.set(name, handler);
  }

  // Project events
  async project(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const [name, handler] of this.projections) {
        try {
          handler(event);
        } catch (error) {
          console.error(`Projection ${name} failed for event ${event.id}:`, error);
        }
      }
    }
  }

  // Rebuild projections from event store
  async rebuild(eventStore: EventStore, aggregateId?: string): Promise<{
    processed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;

    if (aggregateId) {
      const stream = await eventStore.getStream(aggregateId);
      await this.project(stream.events);
      processed = stream.events.length;
    } else {
      // Would get all events and process
      processed = 0;
    }

    return { processed, errors };
  }
}

// Export singleton
export const eventStore = new EventStore();
export const eventProjector = new EventProjector();

export { DomainEvent, EventStream, Snapshot, EventType };

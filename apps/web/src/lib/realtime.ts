import { cache, CACHE_KEYS } from './cache';

// Event types for real-time updates
type RealtimeEventType =
  | 'order.created'
  | 'order.updated'
  | 'stock.changed'
  | 'price.updated'
  | 'product.updated'
  | 'marketplace.sync'
  | 'ai.analysis.complete'
  | 'notification.new'
  | 'system.alert'
  | 'tenant.stats';

interface RealtimeEvent {
  type: RealtimeEventType;
  tenantId: string;
  timestamp: number;
  data: unknown;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Server-Sent Events manager
class RealtimeManager {
  private clients: Map<string, ReadableStreamDefaultController> = new Map();
  private tenantChannels: Map<string, Set<string>> = new Map();

  // Add client to channel
  subscribe(clientId: string, tenantId: string, controller: ReadableStreamDefaultController) {
    this.clients.set(clientId, controller);

    if (!this.tenantChannels.has(tenantId)) {
      this.tenantChannels.set(tenantId, new Set());
    }
    this.tenantChannels.get(tenantId)?.add(clientId);
  }

  // Remove client
  unsubscribe(clientId: string, tenantId: string) {
    this.clients.delete(clientId);
    this.tenantChannels.get(tenantId)?.delete(clientId);
  }

  // Broadcast to all clients in tenant
  broadcast(tenantId: string, event: RealtimeEvent) {
    const clientIds = this.tenantChannels.get(tenantId);
    if (!clientIds) return;

    const message = `data: ${JSON.stringify(event)}\n\n`;

    clientIds.forEach((clientId) => {
      const controller = this.clients.get(clientId);
      if (controller) {
        try {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          // Client disconnected
          this.unsubscribe(clientId, tenantId);
        }
      }
    });
  }

  // Broadcast to specific user
  broadcastToUser(userId: string, event: RealtimeEvent) {
    // Implementation would track user-specific channels
    console.log(`Broadcasting to user ${userId}:`, event);
  }
}

export const realtime = new RealtimeManager();

// Sales tracking utilities
export class SalesTracker {
  // Record new sale in real-time
  static async recordSale(tenantId: string, orderData: {
    orderId: string;
    amount: number;
    platform: string;
    products: number;
  }): Promise<void> {
    const event: RealtimeEvent = {
      type: 'order.created',
      tenantId,
      timestamp: Date.now(),
      data: orderData,
      priority: 'normal',
    };

    // Broadcast to connected clients
    realtime.broadcast(tenantId, event);

    // Update real-time stats in cache
    const statsKey = CACHE_KEYS.dashboardStats(tenantId);
    const currentStats = await cache.get<RealtimeStats>(statsKey);

    if (currentStats) {
      currentStats.todayRevenue += orderData.amount;
      currentStats.todayOrders += 1;
      currentStats.todayProducts += orderData.products;
      currentStats.lastOrderAt = Date.now();

      await cache.set(statsKey, currentStats, 60); // 1 minute TTL for real-time stats
    }
  }

  // Update stock in real-time
  static async updateStock(
    tenantId: string,
    productId: string,
    stockChange: number,
    newStock: number
  ): Promise<void> {
    const event: RealtimeEvent = {
      type: 'stock.changed',
      tenantId,
      timestamp: Date.now(),
      data: { productId, stockChange, newStock },
      priority: newStock < 10 ? 'high' : 'normal',
    };

    realtime.broadcast(tenantId, event);
  }

  // Sync completion notification
  static async syncComplete(
    tenantId: string,
    platform: string,
    syncData: {
      syncedProducts: number;
      syncedOrders: number;
      errors: number;
    }
  ): Promise<void> {
    const event: RealtimeEvent = {
      type: 'marketplace.sync',
      tenantId,
      timestamp: Date.now(),
      data: { platform, ...syncData },
      priority: syncData.errors > 0 ? 'high' : 'normal',
    };

    realtime.broadcast(tenantId, event);
  }

  // Price update notification
  static async priceUpdated(
    tenantId: string,
    productId: string,
    oldPrice: number,
    newPrice: number,
    platform: string
  ): Promise<void> {
    const event: RealtimeEvent = {
      type: 'price.updated',
      tenantId,
      timestamp: Date.now(),
      data: { productId, oldPrice, newPrice, platform },
      priority: 'normal',
    };

    realtime.broadcast(tenantId, event);
  }

  // AI analysis completion
  static async aiAnalysisComplete(
    tenantId: string,
    analysisType: string,
    results: unknown
  ): Promise<void> {
    const event: RealtimeEvent = {
      type: 'ai.analysis.complete',
      tenantId,
      timestamp: Date.now(),
      data: { analysisType, results },
      priority: 'normal',
    };

    realtime.broadcast(tenantId, event);
  }
}

// Real-time stats interface
interface RealtimeStats {
  todayRevenue: number;
  todayOrders: number;
  todayProducts: number;
  lastOrderAt: number;
  activeUsers: number;
}

// Create SSE stream for client
export function createEventStream(
  tenantId: string,
  userId: string
): ReadableStream {
  const encoder = new TextEncoder();
  let clientId: string;

  return new ReadableStream({
    start(controller) {
      clientId = `${tenantId}:${userId}:${Date.now()}`;

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`)
      );

      // Subscribe to tenant channel
      realtime.subscribe(clientId, tenantId, controller);

      // Send initial stats
      this.sendInitialStats(controller, tenantId);
    },
    cancel() {
      realtime.unsubscribe(clientId, tenantId);
    },

    async sendInitialStats(controller: ReadableStreamDefaultController, tenantId: string) {
      const stats = await cache.get<RealtimeStats>(CACHE_KEYS.dashboardStats(tenantId));
      if (stats) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'tenant.stats',
              tenantId,
              data: stats,
            })}\n\n`
          )
        );
      }
    },
  });
}

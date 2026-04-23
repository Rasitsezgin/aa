// Real-time Notifications System
// WebSocket and Server-Sent Events for live updates

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { prisma } from '@/lib/prisma';

type NotificationType = 
  | 'order.new'
  | 'order.updated'
  | 'order.shipped'
  | 'product.low_stock'
  | 'integration.error'
  | 'system.alert'
  | 'campaign.completed'
  | 'report.ready';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  tenantId: string;
  userId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
}

interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  types: Record<NotificationType, boolean>;
}

// Real-time notification manager
export class RealtimeNotificationManager {
  private io: Server | null = null;
  private redisPub: ReturnType<typeof createClient> | null = null;
  private redisSub: ReturnType<typeof createClient> | null = null;

  async initialize(httpServer: any): Promise<void> {
    // Setup Redis clients for adapter
    this.redisPub = createClient({ url: process.env.REDIS_URL });
    this.redisSub = this.redisPub.duplicate();

    await Promise.all([this.redisPub.connect(), this.redisSub.connect()]);

    // Setup Socket.IO with Redis adapter
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.io.adapter(createAdapter(this.redisPub, this.redisSub));

    // Connection handling
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join tenant room
      socket.on('join-tenant', (tenantId: string) => {
        socket.join(`tenant:${tenantId}`);
        console.log(`Socket ${socket.id} joined tenant ${tenantId}`);
      });

      // Join user room for personal notifications
      socket.on('join-user', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      // Mark notification as read
      socket.on('mark-read', async (notificationId: string) => {
        await this.markAsRead(notificationId);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('Realtime notification system initialized');
  }

  // Send notification to tenant
  async notifyTenant(
    tenantId: string,
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    };

    // Save to database
    await this.saveNotification(fullNotification);

    // Send to connected clients
    if (this.io) {
      this.io.to(`tenant:${tenantId}`).emit('notification', fullNotification);
    }

    // Send to specific user if specified
    if (notification.userId) {
      await this.notifyUser(notification.userId, fullNotification);
    }

    return fullNotification;
  }

  // Send notification to specific user
  async notifyUser(userId: string, notification: Notification): Promise<void> {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification);
    }
  }

  // Send order update to all relevant users
  async notifyOrderUpdate(
    tenantId: string,
    orderId: string,
    update: { status: string; message: string }
  ): Promise<void> {
    const notification = await this.notifyTenant(tenantId, {
      type: 'order.updated',
      title: 'Sipariş Güncellendi',
      message: `Sipariş #${orderId} durumu: ${update.status}`,
      data: { orderId, ...update },
      priority: 'medium',
      tenantId,
    });

    // Also broadcast to order channel
    if (this.io) {
      this.io.to(`order:${orderId}`).emit('order-update', {
        orderId,
        ...update,
        timestamp: new Date(),
      });
    }
  }

  // Send bulk notifications
  async notifyBulk(
    tenantId: string,
    userIds: string[],
    notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>
  ): Promise<void> {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.notifyTenant(tenantId, { ...notification, userId })
      )
    );

    console.log(`Sent ${notifications.length} bulk notifications`);
  }

  // Get unread notifications for user
  async getUnreadNotifications(userId: string, tenantId: string): Promise<Notification[]> {
    // Would fetch from database
    return [];
  }

  // Mark notification as read
  private async markAsRead(notificationId: string): Promise<void> {
    // Would update database
    console.log('Marked as read:', notificationId);
  }

  // Save notification to database
  private async saveNotification(notification: Notification): Promise<void> {
    // Would save to Notification model
    // await prisma.notification.create({ data: notification });
  }

  // Subscribe to order updates
  subscribeToOrder(orderId: string, callback: (update: any) => void): () => void {
    // This would be used on the client side
    return () => {};
  }
}

// Server-Sent Events for simpler real-time updates
export class SSEManager {
  private clients: Map<string, Response[]> = new Map();

  // Add client connection
  addClient(tenantId: string, res: Response): void {
    if (!this.clients.has(tenantId)) {
      this.clients.set(tenantId, []);
    }
    this.clients.get(tenantId)!.push(res);

    // Remove on close
    res.onclose = () => {
      this.removeClient(tenantId, res);
    };
  }

  // Remove client
  removeClient(tenantId: string, res: Response): void {
    const clients = this.clients.get(tenantId);
    if (clients) {
      const index = clients.indexOf(res);
      if (index > -1) {
        clients.splice(index, 1);
      }
    }
  }

  // Send event to all clients in tenant
  broadcast(tenantId: string, event: string, data: unknown): void {
    const clients = this.clients.get(tenantId);
    if (!clients) return;

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    clients.forEach(res => {
      try {
        // Would send to response
        // res.write(message);
      } catch (error) {
        this.removeClient(tenantId, res);
      }
    });
  }
}

// Notification templates
export const notificationTemplates: Record<NotificationType, (data: any) => { title: string; message: string }> = {
  'order.new': (data) => ({
    title: 'Yeni Sipariş',
    message: `#${data.orderNumber} nolu yeni sipariş alındı - ₺${data.totalAmount}`,
  }),
  'order.updated': (data) => ({
    title: 'Sipariş Güncellendi',
    message: `#${data.orderNumber} durumu: ${data.status}`,
  }),
  'order.shipped': (data) => ({
    title: 'Sipariş Kargoya Verildi',
    message: `#${data.orderNumber} kargoya verildi. Takip: ${data.trackingNumber}`,
  }),
  'product.low_stock': (data) => ({
    title: 'Düşük Stok Uyarısı',
    message: `${data.productName} ürününde sadece ${data.stock} adet kaldı`,
  }),
  'integration.error': (data) => ({
    title: 'Entegrasyon Hatası',
    message: `${data.platform} entegrasyonunda hata: ${data.error}`,
  }),
  'system.alert': (data) => ({
    title: 'Sistem Uyarısı',
    message: data.message,
  }),
  'campaign.completed': (data) => ({
    title: 'Kampanya Tamamlandı',
    message: `"${data.campaignName}" kampanyası sona erdi. Sonuçlar: ${data.sent} gönderim`,
  }),
  'report.ready': (data) => ({
    title: 'Rapor Hazır',
    message: `${data.reportName} raporu indirilmeye hazır`,
  }),
};

// Export singleton
export const realtimeManager = new RealtimeNotificationManager();
export const sseManager = new SSEManager();

export { Notification, NotificationType, NotificationPreferences };

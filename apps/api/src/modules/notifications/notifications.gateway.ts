import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface RealtimeNotification {
  id: string;
  type: 'order' | 'stock' | 'price' | 'review' | 'system' | 'integration' | 'campaign';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  data?: Record<string, any>;
  tenantId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://pazaryonetimi.com', 'https://*.pazaryonetimi.com'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, { socket: Socket; tenantId?: string; userId?: string }>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    const userId = client.handshake.query.userId as string;

    this.connectedClients.set(client.id, { socket: client, tenantId, userId });

    if (tenantId) {
      client.join(`tenant:${tenantId}`);
    }
    if (userId) {
      client.join(`user:${userId}`);
    }

    this.logger.log(`Client connected: ${client.id} (tenant: ${tenantId}, user: ${userId})`);
    this.logger.log(`Total connections: ${this.connectedClients.size}`);

    // Send connection confirmation
    client.emit('connected', {
      message: 'WebSocket bağlantısı kuruldu',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}. Total: ${this.connectedClients.size}`);
  }

  // ─── Subscribe to specific channels ─────────────
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    data.channels?.forEach((channel) => {
      client.join(channel);
      this.logger.debug(`Client ${client.id} subscribed to ${channel}`);
    });
    return { event: 'subscribed', data: { channels: data.channels } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    data.channels?.forEach((channel) => {
      client.leave(channel);
    });
    return { event: 'unsubscribed', data: { channels: data.channels } };
  }

  // ─── Broadcast methods (called from other services) ─────────
  
  /** Send notification to all connected clients */
  broadcastToAll(notification: RealtimeNotification) {
    this.server.emit('notification', notification);
  }

  /** Send notification to a specific tenant */
  broadcastToTenant(tenantId: string, notification: RealtimeNotification) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  /** Send notification to a specific user */
  sendToUser(userId: string, notification: RealtimeNotification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // ─── Typed event emitters ─────────────────────────

  emitNewOrder(tenantId: string, order: { id: string; platform: string; total: number; customerName: string }) {
    const notification: RealtimeNotification = {
      id: `order-${Date.now()}`,
      type: 'order',
      title: 'Yeni Sipariş!',
      message: `${order.customerName} - ${order.platform}'dan ₺${order.total.toLocaleString('tr-TR')} tutarında sipariş`,
      severity: 'success',
      timestamp: new Date().toISOString(),
      data: order,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
    this.server.to(`tenant:${tenantId}`).emit('order:new', order);
  }

  emitStockAlert(tenantId: string, product: { id: string; name: string; currentStock: number; threshold: number }) {
    const notification: RealtimeNotification = {
      id: `stock-${Date.now()}`,
      type: 'stock',
      title: 'Düşük Stok Uyarısı!',
      message: `${product.name} - Stok: ${product.currentStock} (Eşik: ${product.threshold})`,
      severity: product.currentStock === 0 ? 'error' : 'warning',
      timestamp: new Date().toISOString(),
      data: product,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
    this.server.to(`tenant:${tenantId}`).emit('stock:alert', product);
  }

  emitPriceChange(tenantId: string, data: { productName: string; oldPrice: number; newPrice: number; platform: string; competitor: string }) {
    const direction = data.newPrice > data.oldPrice ? 'arttı' : 'düştü';
    const notification: RealtimeNotification = {
      id: `price-${Date.now()}`,
      type: 'price',
      title: 'Fiyat Değişikliği',
      message: `${data.competitor} - ${data.productName}: ₺${data.oldPrice} → ₺${data.newPrice} (${direction})`,
      severity: 'info',
      timestamp: new Date().toISOString(),
      data,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
    this.server.to(`tenant:${tenantId}`).emit('price:change', data);
  }

  emitReviewAlert(tenantId: string, review: { productName: string; rating: number; comment: string; platform: string }) {
    const notification: RealtimeNotification = {
      id: `review-${Date.now()}`,
      type: 'review',
      title: review.rating >= 4 ? 'Yeni Olumlu Yorum!' : 'Olumsuz Yorum Uyarısı!',
      message: `${review.productName} - ${review.rating}⭐ ${review.platform}`,
      severity: review.rating >= 4 ? 'success' : 'warning',
      timestamp: new Date().toISOString(),
      data: review,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
    this.server.to(`tenant:${tenantId}`).emit('review:new', review);
  }

  emitIntegrationStatus(tenantId: string, integration: { platform: string; status: 'connected' | 'disconnected' | 'error'; message: string }) {
    const notification: RealtimeNotification = {
      id: `integration-${Date.now()}`,
      type: 'integration',
      title: `Entegrasyon: ${integration.platform}`,
      message: integration.message,
      severity: integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'error' : 'warning',
      timestamp: new Date().toISOString(),
      data: integration,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
  }

  emitCampaignUpdate(tenantId: string, campaign: { name: string; status: string; revenue: number }) {
    const notification: RealtimeNotification = {
      id: `campaign-${Date.now()}`,
      type: 'campaign',
      title: 'Kampanya Güncelleme',
      message: `${campaign.name} - Durum: ${campaign.status}, Gelir: ₺${campaign.revenue.toLocaleString('tr-TR')}`,
      severity: 'info',
      timestamp: new Date().toISOString(),
      data: campaign,
      tenantId,
    };
    this.broadcastToTenant(tenantId, notification);
  }

  // ─── Dashboard stats ────────────────────────────
  emitDashboardUpdate(tenantId: string, stats: Record<string, any>) {
    this.server.to(`tenant:${tenantId}`).emit('dashboard:update', stats);
  }

  getConnectionCount(): number {
    return this.connectedClients.size;
  }

  getConnectedTenants(): string[] {
    const tenants = new Set<string>();
    this.connectedClients.forEach((client) => {
      if (client.tenantId) tenants.add(client.tenantId);
    });
    return Array.from(tenants);
  }
}

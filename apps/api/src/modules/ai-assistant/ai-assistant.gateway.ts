import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ConnectedUser {
  socketId: string;
  tenantId: string;
  userId: string;
  connectedAt: Date;
}

@WebSocketGateway({
  namespace: '/ai-assistant',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class AIAssistantGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AIAssistantGateway.name);
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(private configService: ConfigService) {}

  // ==================== CONNECTION HANDLING ====================

  async handleConnection(client: Socket): Promise<void> {
    try {
      const { tenantId, userId, token } = client.handshake.query;

      if (!tenantId || !userId) {
        this.logger.warn(`Connection rejected: Missing tenantId or userId`);
        client.disconnect();
        return;
      }

      // Store connection
      this.connectedUsers.set(client.id, {
        socketId: client.id,
        tenantId: tenantId as string,
        userId: userId as string,
        connectedAt: new Date(),
      });

      // Join user-specific room
      client.join(`user:${userId}`);
      client.join(`tenant:${tenantId}`);

      this.logger.log(`Client connected: ${client.id} - User: ${userId}`);

      // Send welcome message
      client.emit('connected', {
        socketId: client.id,
        timestamp: new Date(),
        message: 'AI Assistant real-time connection established',
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.logger.log(
        `Client disconnected: ${client.id} - User: ${user.userId}`,
      );
      this.connectedUsers.delete(client.id);
    }
  }

  // ==================== INCOMING MESSAGES ====================

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      tenantId: string;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.debug(
      `Received message from ${data.userId}: ${data.content.substring(0, 50)}...`,
    );

    // Broadcast typing indicator
    client.to(`user:${data.userId}`).emit('assistant:typing', {
      conversationId: data.conversationId,
      isTyping: true,
    });

    // Acknowledge receipt
    client.emit('message:received', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('user:typing')
  handleUserTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ): void {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      client.to(`user:${user.userId}`).emit('user:typing', {
        ...data,
        userId: user.userId,
      });
    }
  }

  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`conversation:${data.conversationId}`);
    this.logger.debug(
      `Client ${client.id} joined conversation ${data.conversationId}`,
    );

    client.emit('conversation:joined', {
      conversationId: data.conversationId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(`conversation:${data.conversationId}`);
    this.logger.debug(
      `Client ${client.id} left conversation ${data.conversationId}`,
    );
  }

  // ==================== BROADCAST METHODS ====================

  /**
   * Send message to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send message to all users in a tenant
   */
  sendToTenant(tenantId: string, event: string, data: any): void {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  /**
   * Send message to specific conversation participants
   */
  sendToConversation(conversationId: string, event: string, data: any): void {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any): void {
    this.server.emit(event, data);
  }

  // ==================== AI ASSISTANT SPECIFIC EVENTS ====================

  /**
   * Notify user that AI is processing their request
   */
  notifyProcessing(
    userId: string,
    data: {
      conversationId: string;
      action: string;
      message?: string;
    },
  ): void {
    this.sendToUser(userId, 'assistant:processing', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Send AI response to user
   */
  sendAIResponse(
    userId: string,
    data: {
      conversationId: string;
      message: any;
      suggestions?: any[];
    },
  ): void {
    this.sendToUser(userId, 'assistant:response', {
      ...data,
      timestamp: new Date(),
    });

    // Also send to conversation room for multi-device sync
    if (data.conversationId) {
      this.sendToConversation(data.conversationId, 'conversation:new_message', {
        ...data,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Notify about sync job progress
   */
  notifySyncProgress(
    userId: string,
    data: {
      jobId: string;
      type: string;
      platform: string;
      progress: number;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      message?: string;
      details?: any;
    },
  ): void {
    this.sendToUser(userId, 'sync:progress', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify about completed sync job
   */
  notifySyncCompleted(
    userId: string,
    data: {
      jobId: string;
      type: string;
      platform: string;
      success: boolean;
      message: string;
      stats?: {
        total: number;
        processed: number;
        failed: number;
      };
    },
  ): void {
    this.sendToUser(userId, 'sync:completed', {
      ...data,
      timestamp: new Date(),
    });

    // Also send notification
    this.sendToUser(userId, 'notification', {
      type: data.success ? 'success' : 'error',
      title: data.success ? 'Eşitleme Tamamlandı' : 'Eşitleme Başarısız',
      message: data.message,
      data: { jobId: data.jobId, type: data.type, platform: data.platform },
      timestamp: new Date(),
    });
  }

  /**
   * Send predictive suggestion proactively
   */
  sendProactiveSuggestion(
    userId: string,
    data: {
      suggestionId: string;
      title: string;
      description: string;
      type: string;
      confidence: number;
      action?: any;
    },
  ): void {
    this.sendToUser(userId, 'assistant:suggestion', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify about errors
   */
  notifyError(
    userId: string,
    data: {
      type: string;
      message: string;
      details?: any;
      recoverable?: boolean;
    },
  ): void {
    this.sendToUser(userId, 'assistant:error', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Update conversation list in real-time
   */
  updateConversationList(
    userId: string,
    data: {
      conversations: any[];
      total: number;
    },
  ): void {
    this.sendToUser(userId, 'conversations:update', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Notify about learning insights
   */
  notifyLearningInsight(
    userId: string,
    data: {
      type: 'pattern_detected' | 'preference_learned' | 'optimization_found';
      title: string;
      description: string;
      action?: any;
    },
  ): void {
    this.sendToUser(userId, 'learning:insight', {
      ...data,
      timestamp: new Date(),
    });
  }

  // ==================== UTILITIES ====================

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get users by tenant
   */
  getUsersByTenant(tenantId: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(
      (user) => user.tenantId === tenantId,
    );
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(
      (user) => user.userId === userId,
    );
  }

  /**
   * Get socket ID for user
   */
  getSocketIdForUser(userId: string): string | undefined {
    const user = Array.from(this.connectedUsers.values()).find(
      (u) => u.userId === userId,
    );
    return user?.socketId;
  }
}

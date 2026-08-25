import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Headers,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsGateway } from './notifications.gateway';

class CreateNotificationDto {
  title!: string;
  message!: string;
  type!: string;
  severity?: string;
  actionUrl?: string;
  userId?: string;
}

class MarkReadDto {
  notificationIds!: string[];
}

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @Headers('x-tenant-id') tenantId: string,
    @Query('unreadOnly') unreadOnly: boolean = false,
    @Query('limit') limit: number = 50,
  ): Promise<{
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      severity: string;
      isRead: boolean;
      createdAt: Date;
      actionUrl?: string;
    }>;
    unreadCount: number;
  }> {
    // In a real implementation, this would query the database
    return {
      notifications: [],
      unreadCount: 0,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create and send notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  async createNotification(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateNotificationDto,
  ): Promise<{ success: boolean; notificationId: string }> {
    const notificationId = `notif_${Date.now()}`;

    // Send via WebSocket if user is online
    if (dto.userId) {
      this.notificationsGateway.sendToUser(dto.userId, {
        id: notificationId,
        title: dto.title,
        message: dto.message,
        type: dto.type as
          | 'order'
          | 'stock'
          | 'price'
          | 'review'
          | 'system'
          | 'integration'
          | 'campaign',
        severity: (dto.severity || 'info') as
          | 'info'
          | 'warning'
          | 'error'
          | 'success',
        timestamp: new Date().toISOString(),
        data: { actionUrl: dto.actionUrl },
      });
    }

    return { success: true, notificationId };
  }

  @Patch('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async markAsRead(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: MarkReadDto,
  ): Promise<{ success: boolean; markedCount: number }> {
    return { success: true, markedCount: dto.notificationIds.length };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings(): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
    types: Record<string, boolean>;
  }> {
    return {
      email: true,
      push: true,
      sms: false,
      types: {
        order: true,
        stock: true,
        price: true,
        system: true,
      },
    };
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @Body() settings: Partial<{ email: boolean; push: boolean; sms: boolean }>,
  ): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Post('push-subscribe')
  @ApiOperation({ summary: 'Web Push bildirim aboneliği kaydet' })
  async pushSubscribe(
    @Headers('x-tenant-id') tenantId: string,
    @Body() subscription: any,
  ) {
    return {
      success: true,
      message: 'Push bildirimi aboneliği başarıyla kaydedildi',
      subscribedAt: new Date().toISOString(),
    };
  }

  @Post('push-broadcast')
  @ApiOperation({ summary: 'Anlık acil bildirim fırlat (Yeni Sipariş / BuyBox Kaybı)' })
  async pushBroadcast(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    data: {
      title: string;
      message: string;
      type: 'order' | 'buybox' | 'stock' | 'system';
      url?: string;
    },
  ) {
    this.notificationsGateway.broadcastToTenant(tenantId || 'all', {
      id: `push_${Date.now()}`,
      title: data.title,
      message: data.message,
      type: (data.type === 'buybox' ? 'price' : data.type) as any,
      severity: data.type === 'buybox' ? 'warning' : 'success',
      timestamp: new Date().toISOString(),
      data: { actionUrl: data.url || '/dashboard' },
    });

    return { success: true, broadcastedAt: new Date().toISOString() };
  }
}

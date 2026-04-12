import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SubscriptionsService,
  CreateSubscriptionDto,
  ApproveSubscriptionDto,
  RejectSubscriptionDto,
  SubscriptionFilters,
  SubscriptionStatus,
  PackageType,
  PaymentStatus,
} from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Yeni abonelik oluştur
   * POST /subscriptions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    const subscription =
      await this.subscriptionsService.createSubscription(dto);
    return {
      success: true,
      message:
        dto.paymentMethod === 'credit_card'
          ? 'Aboneliğiniz başarıyla oluşturuldu ve aktif edildi!'
          : 'Abonelik talebiniz alındı. Havale onayı sonrası aktif olacaktır.',
      data: subscription,
    };
  }

  /**
   * Tüm abonelikleri listele
   * GET /subscriptions?status=pending&packageType=professional&search=ahmet&page=1&limit=20
   */
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('packageType') packageType?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: SubscriptionFilters = {
      status: status as SubscriptionStatus,
      packageType: packageType as PackageType,
      paymentStatus: paymentStatus as PaymentStatus,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    const result = await this.subscriptionsService.findAll(filters);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Onay bekleyen abonelikler
   * GET /subscriptions/pending
   */
  @Get('pending')
  async getPendingApprovals() {
    const subscriptions = await this.subscriptionsService.getPendingApprovals();
    return {
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    };
  }

  /**
   * Abonelik istatistikleri
   * GET /subscriptions/stats
   */
  @Get('stats')
  async getStats() {
    const stats = await this.subscriptionsService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Tek abonelik detayı
   * GET /subscriptions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const subscription = await this.subscriptionsService.findOne(id);
    return {
      success: true,
      data: subscription,
    };
  }

  /**
   * Aboneliği onayla
   * PUT /subscriptions/:id/approve
   */
  @Put(':id/approve')
  async approveSubscription(
    @Param('id') id: string,
    @Body() dto: ApproveSubscriptionDto,
  ) {
    // Gerçek uygulamada adminId JWT'den alınır
    const adminId = 'admin-001';
    const subscription = await this.subscriptionsService.approveSubscription(
      id,
      dto,
      adminId,
    );
    return {
      success: true,
      message: 'Abonelik başarıyla onaylandı!',
      data: subscription,
    };
  }

  /**
   * Aboneliği reddet
   * PUT /subscriptions/:id/reject
   */
  @Put(':id/reject')
  async rejectSubscription(
    @Param('id') id: string,
    @Body() dto: RejectSubscriptionDto,
  ) {
    const adminId = 'admin-001';
    const subscription = await this.subscriptionsService.rejectSubscription(
      id,
      dto,
      adminId,
    );
    return {
      success: true,
      message: 'Abonelik reddedildi.',
      data: subscription,
    };
  }

  /**
   * Aboneliği askıya al
   * PUT /subscriptions/:id/suspend
   */
  @Put(':id/suspend')
  async suspendSubscription(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const adminId = 'admin-001';
    const subscription = await this.subscriptionsService.suspendSubscription(
      id,
      reason,
      adminId,
    );
    return {
      success: true,
      message: 'Abonelik askıya alındı.',
      data: subscription,
    };
  }

  /**
   * Aboneliği iptal et
   * PUT /subscriptions/:id/cancel
   */
  @Put(':id/cancel')
  async cancelSubscription(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const adminId = 'admin-001';
    const subscription = await this.subscriptionsService.cancelSubscription(
      id,
      reason,
      adminId,
    );
    return {
      success: true,
      message: 'Abonelik iptal edildi.',
      data: subscription,
    };
  }
}

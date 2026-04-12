/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';

interface CreateAffiliateDto {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  commissionRate: number;
  paymentMethod: 'bank_transfer' | 'paypal';
  paymentDetails?: string;
}

interface AffiliateClickMetadata {
  ip?: string;
  userAgent?: string;
  referer?: string;
}

@ApiTags('Affiliate Program')
@Controller('affiliates')
export class AffiliateController {
  constructor(private affiliateService: AffiliateService) {}

  @Get()
  @ApiOperation({ summary: "Tüm affiliate'leri listele" })
  async findAll(@Query('tenantId') tenantId: string) {
    return this.affiliateService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Affiliate detayı' })
  async findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.affiliateService.findOne(id, tenantId);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Affiliate dashboard' })
  async getDashboard(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.affiliateService.getDashboard(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni affiliate oluştur' })
  async create(@Body() dto: CreateAffiliateDto) {
    return this.affiliateService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Affiliate güncelle' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CreateAffiliateDto>,
  ) {
    return this.affiliateService.update(id, data);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Affiliate durumunu güncelle' })
  async updateStatus(
    @Param('id') id: string,
    @Body()
    dto: { status: 'active' | 'inactive' | 'pending'; tenantId: string },
  ) {
    return this.affiliateService.updateStatus(id, dto.status, dto.tenantId);
  }

  @Post('track/click')
  @ApiOperation({ summary: 'Referans tıklaması kaydet' })
  async trackClick(
    @Body() dto: { code: string; metadata?: AffiliateClickMetadata },
  ) {
    return this.affiliateService.trackClick(dto.code, dto.metadata || {});
  }

  @Post('track/conversion')
  @ApiOperation({ summary: 'Satış dönüşümü kaydet' })
  async trackConversion(
    @Body()
    dto: {
      code: string;
      orderId: string;
      orderAmount: number;
      tenantId: string;
    },
  ) {
    return this.affiliateService.trackConversion(
      dto.code,
      dto.orderId,
      dto.orderAmount,
      dto.tenantId,
    );
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Komisyon ödemesi yap' })
  async payCommission(
    @Param('id') id: string,
    @Body() dto: { amount: number; tenantId: string },
  ) {
    return this.affiliateService.payCommission(id, dto.amount, dto.tenantId);
  }
}

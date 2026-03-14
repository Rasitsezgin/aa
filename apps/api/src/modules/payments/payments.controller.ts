import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  Create3DPaymentDto,
  RefundPaymentDto,
  CheckInstallmentDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Ödeme listesi */
  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.findAll(req.user?.tenantId, {
      status,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** Ödeme istatistikleri */
  @Get('stats')
  getStats(@Req() req: any) {
    return this.paymentsService.getStats(req.user?.tenantId);
  }

  /** Taksit seçenekleri sorgula */
  @Post('installments')
  checkInstallments(@Body() dto: CheckInstallmentDto) {
    return this.paymentsService.checkInstallments(dto);
  }

  /** Tek çekim ödeme oluştur */
  @Post()
  createPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user?.tenantId, dto);
  }

  /** 3D Secure ödeme başlat */
  @Post('3d')
  create3DPayment(@Req() req: any, @Body() dto: Create3DPaymentDto) {
    return this.paymentsService.create3DPayment(req.user?.tenantId, dto);
  }

  /** 3D Secure callback */
  @Post('3d/callback/:paymentId')
  handle3DCallback(@Req() req: any, @Param('paymentId') paymentId: string) {
    return this.paymentsService.handle3DCallback(req.user?.tenantId, paymentId);
  }

  /** İade işlemi */
  @Post('refund')
  refundPayment(@Req() req: any, @Body() dto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(req.user?.tenantId, dto);
  }

  /** Ödeme detayı */
  @Get(':id')
  getPaymentDetail(@Req() req: any, @Param('id') id: string) {
    return this.paymentsService.getPaymentDetail(req.user?.tenantId, id);
  }
}
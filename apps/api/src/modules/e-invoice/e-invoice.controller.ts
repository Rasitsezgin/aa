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
import { EInvoiceService } from './e-invoice.service';
import { CreateEInvoiceDto, CancelEInvoiceDto } from './dto/e-invoice.dto';

interface RequestWithUser extends Request {
  user?: {
    tenantId: string;
    [key: string]: any;
  };
}

@ApiTags('E-Invoice')
@Controller('e-invoices')
export class EInvoiceController {
  constructor(private readonly eInvoiceService: EInvoiceService) {}

  /** Fatura listesi */
  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eInvoiceService.findAll(req.user?.tenantId || '', {
      status,
      type,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** Fatura istatistikleri */
  @Get('stats')
  getStats(@Req() req: any) {
    return this.eInvoiceService.getStats(req.user?.tenantId || '');
  }

  /** E-fatura oluştur ve gönder */
  @Post()
  createInvoice(@Req() req: RequestWithUser, @Body() dto: CreateEInvoiceDto) {
    return this.eInvoiceService.createInvoice(req.user?.tenantId || '', dto);
  }

  /** Fatura detayı */
  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eInvoiceService.findOne(req.user?.tenantId || '', id);
  }

  /** Fatura GİB durumu sorgula */
  @Post(':id/status')
  checkStatus(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.eInvoiceService.checkInvoiceStatus(req.user?.tenantId || '', id);
  }

  /** Fatura iptal et */
  @Post(':id/cancel')
  cancelInvoice(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CancelEInvoiceDto) {
    return this.eInvoiceService.cancelInvoice(req.user?.tenantId || '', id, dto);
  }
}
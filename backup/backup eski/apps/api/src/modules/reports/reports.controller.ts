import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService, ReportPeriod, PlanType } from './reports.service';
import { EmailReportService } from './email-report.service';

interface SendReportDto {
  email: string;
  storeId: string;
  period: ReportPeriod;
  planType: PlanType;
}

interface ScheduleReportDto {
  email: string;
  storeId: string;
  periods: ReportPeriod[];
  planType: PlanType;
  enabled: boolean;
}

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly emailReportService: EmailReportService,
  ) {}

  /**
   * Rapor oluştur ve döndür
   * GET /reports/:storeId?period=monthly&planType=professional
   */
  @Get(':storeId')
  async getReport(
    @Param('storeId') storeId: string,
    @Query('period') period: ReportPeriod = 'monthly',
    @Query('planType') planType: PlanType = 'professional',
  ) {
    const report = await this.reportsService.generateReport(storeId, period, planType);
    return {
      success: true,
      data: report,
    };
  }

  /**
   * Kullanılabilir rapor periyotlarını döndür
   * GET /reports/periods/:planType
   */
  @Get('periods/:planType')
  getAvailablePeriods(@Param('planType') planType: PlanType) {
    const periods = this.reportsService.getAvailablePeriods(planType);
    return {
      success: true,
      data: periods.map(p => ({
        id: p,
        name: this.reportsService.getPeriodName(p),
      })),
    };
  }

  /**
   * Rapor e-postası gönder
   * POST /reports/send
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendReport(@Body() dto: SendReportDto) {
    const result = await this.emailReportService.sendReportEmail(
      dto.email,
      dto.storeId,
      dto.period,
      dto.planType,
    );

    return {
      success: result.success,
      message: result.success
        ? `${this.reportsService.getPeriodName(dto.period)} rapor ${dto.email} adresine gönderildi`
        : 'Rapor gönderilemedi',
      messageId: result.messageId,
    };
  }

  /**
   * Rapor e-postası önizlemesi (HTML)
   * GET /reports/preview/:storeId?period=monthly&planType=professional
   */
  @Get('preview/:storeId')
  async previewReport(
    @Param('storeId') storeId: string,
    @Query('period') period: ReportPeriod = 'monthly',
    @Query('planType') planType: PlanType = 'professional',
  ) {
    const report = await this.reportsService.generateReport(storeId, period, planType);
    const html = this.emailReportService.generateEmailTemplate(report);
    
    return html; // Raw HTML döndür
  }

  /**
   * Rapor programlama (zamanlama)
   * POST /reports/schedule
   */
  @Post('schedule')
  @HttpCode(HttpStatus.OK)
  async scheduleReports(@Body() dto: ScheduleReportDto) {
    // Gerçek uygulamada cron job veya task scheduler kullanılacak
    const schedules = dto.periods.map(period => ({
      period,
      periodName: this.reportsService.getPeriodName(period),
      schedule: this.getCronSchedule(period),
      enabled: dto.enabled,
    }));

    return {
      success: true,
      message: dto.enabled
        ? `${dto.periods.length} rapor zamanlaması aktif edildi`
        : 'Rapor zamanlamaları durduruldu',
      data: {
        email: dto.email,
        storeId: dto.storeId,
        planType: dto.planType,
        schedules,
      },
    };
  }

  /**
   * Tüm raporları toplu gönder (Admin için)
   * POST /reports/send-all
   */
  @Post('send-all')
  @HttpCode(HttpStatus.OK)
  async sendAllReports(@Body('period') period: ReportPeriod) {
    // Demo: Tüm aktif mağazalara rapor gönder
    const stores = [
      { id: 'store-001', email: 'magaza1@example.com', planType: 'professional' as PlanType },
      { id: 'store-002', email: 'magaza2@example.com', planType: 'enterprise' as PlanType },
      { id: 'store-003', email: 'magaza3@example.com', planType: 'professional' as PlanType },
    ];

    const results = await Promise.all(
      stores.map(store =>
        this.emailReportService.sendReportEmail(store.email, store.id, period, store.planType)
      )
    );

    const successCount = results.filter(r => r.success).length;

    return {
      success: true,
      message: `${successCount}/${stores.length} mağazaya ${this.reportsService.getPeriodName(period)} rapor gönderildi`,
      data: {
        total: stores.length,
        sent: successCount,
        failed: stores.length - successCount,
      },
    };
  }

  /**
   * Cron schedule string'i döndür
   */
  private getCronSchedule(period: ReportPeriod): string {
    switch (period) {
      case 'daily':
        return '0 8 * * *'; // Her gün 08:00
      case 'weekly':
        return '0 8 * * 1'; // Her Pazartesi 08:00
      case 'monthly':
        return '0 8 1 * *'; // Her ayın 1'i 08:00
      case 'quarterly':
        return '0 8 1 */3 *'; // Her 3 ayda bir, ayın 1'i 08:00
      case 'semi-annual':
        return '0 8 1 */6 *'; // Her 6 ayda bir, ayın 1'i 08:00
      case 'yearly':
        return '0 8 1 1 *'; // Her yılın 1 Ocak'ı 08:00
      default:
        return '0 8 1 * *';
    }
  }
}

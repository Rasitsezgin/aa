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
import { PrismaService } from '../../database/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Rapor listesi (tüm raporlar)
   * GET /reports
   */
  @Get()
  async listReports(@Query('tenantId') tenantId: string) {
    return this.getReportsList(tenantId);
  }

  /**
   * Zamanlanmış raporlar
   * GET /reports/scheduled
   */
  @Get('scheduled')
  async getScheduledReports(@Query('tenantId') tenantId: string) {
    return this.getScheduledReportsList(tenantId);
  }

  /**
   * Rapor dışa aktarma
   * GET /reports/export/:type
   */
  @Get('export/:type')
  async exportReport(
    @Param('type') type: string,
    @Query('tenantId') tenantId: string,
    @Query('format') format: string = 'csv',
  ) {
    const report = await this.prisma.report.create({
      data: {
        tenantId: tenantId || 'unknown',
        name: `${type} raporu`,
        type,
        format,
        status: 'completed',
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    return {
      success: true,
      type,
      format,
      downloadUrl: `/api/reports/download/${report.id}.${format}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Rapor oluştur
   * POST /reports/generate
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateNewReport(
    @Body()
    data: {
      type: string;
      tenantId: string;
      period?: string;
      [key: string]: any;
    },
  ) {
    const report = await this.prisma.report.create({
      data: {
        tenantId: data.tenantId,
        name: `${data.type} raporu`,
        type: data.type,
        description: data.description,
        parameters: {
          period: data.period || 'monthly',
          ...data,
        },
        status: 'generating',
      },
    });

    return {
      success: true,
      reportId: report.id,
      type: data.type,
      status: 'generating',
      estimatedTime: '15 saniye',
      message: `${data.type} raporu oluşturuluyor...`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Rapor oluştur ve döndür
   * GET /reports/:storeId?period=monthly&planType=professional
   */
  @Get(':storeId')
  async getReport(
    @Param('storeId') storeId: string,
    @Query('period') period: string = 'monthly',
    @Query('planType') planType: string = 'professional',
  ) {
    const report = await this.reportsService.generateReport(
      storeId,
      period as ReportPeriod,
      planType as PlanType,
    );
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
  getAvailablePeriods(@Param('planType') planType: string) {
    const periods = this.reportsService.getAvailablePeriods(
      planType as PlanType,
    );
    return {
      success: true,
      data: periods.map((p) => ({
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
    @Query('period') period: string = 'monthly',
    @Query('planType') planType: string = 'professional',
  ) {
    const report = await this.reportsService.generateReport(
      storeId,
      period as ReportPeriod,
      planType as PlanType,
    );
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
    const schedules = dto.periods.map((period) => ({
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
  async sendAllReports(@Body('period') period: string) {
    const scheduled = await this.prisma.scheduledReport.findMany({
      where: { isActive: true },
      select: { tenantId: true, recipients: true },
      take: 100,
    });

    const stores = scheduled.flatMap((s) => {
      const recipients = Array.isArray(s.recipients)
        ? (s.recipients as string[])
        : [];
      return recipients.map((email) => ({
        id: s.tenantId,
        email,
        planType: 'professional' as PlanType,
      }));
    });

    const results = await Promise.all(
      stores.map((store) =>
        this.emailReportService.sendReportEmail(
          store.email,
          store.id,
          period as ReportPeriod,
          store.planType,
        ),
      ),
    );

    const successCount = results.filter((r) => r.success).length;

    return {
      success: true,
      message: `${successCount}/${stores.length} mağazaya ${this.reportsService.getPeriodName(period as ReportPeriod)} rapor gönderildi`,
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

  private async getReportsList(tenantId: string) {
    const reports = await this.prisma.report.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reports.map((report) => ({
      id: report.id,
      type: report.type,
      title: report.name,
      period:
        (report.parameters as { period?: string } | null)?.period || 'monthly',
      status: report.status,
      format: report.format,
      size: report.fileSize
        ? `${(report.fileSize / (1024 * 1024)).toFixed(1)}MB`
        : null,
      createdAt: report.createdAt.toISOString(),
      downloadUrl: report.fileUrl || `/api/reports/download/${report.id}`,
    }));
  }

  private async getScheduledReportsList(tenantId: string) {
    const scheduled = await this.prisma.scheduledReport.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return scheduled.map((item) => ({
      id: item.id,
      type: item.type,
      period: item.schedule,
      nextRun: item.nextRun?.toISOString() || null,
      recipients: Array.isArray(item.recipients) ? item.recipients : [],
      format: item.format,
      isActive: item.isActive,
    }));
  }
}

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as cron from 'node-cron';
import { PrismaService } from '../../database/prisma.service';
import { MarketIntelligenceService } from '../market-intelligence/market-intelligence.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('reports') private reportsQueue: Queue,
    @InjectQueue('sync') private syncQueue: Queue,
    @InjectQueue('emails') private emailsQueue: Queue,
    private prisma: PrismaService,
    private marketIntelligenceService: MarketIntelligenceService,
  ) {}

  onModuleInit() {
    this.setupScheduledJobs();
  }

  private setupScheduledJobs() {
    // Her gün saat 09:00'da günlük rapor
    cron.schedule('0 9 * * *', async () => {
      this.logger.log('Günlük rapor görevi başlatılıyor...');
      await this.scheduleDailyReports();
    });

    // Her saat başı stok senkronizasyonu
    cron.schedule('0 * * * *', async () => {
      this.logger.log('Stok senkronizasyonu başlatılıyor...');
      await this.scheduleInventorySync();
    });

    // Her 6 saatte sipariş senkronizasyonu
    cron.schedule('0 */6 * * *', async () => {
      this.logger.log('Sipariş senkronizasyonu başlatılıyor...');
      await this.scheduleOrderSync();
    });

    // Her gün gece 02:00'de eski log temizliği
    cron.schedule('0 2 * * *', async () => {
      this.logger.log('Log temizliği başlatılıyor...');
      await this.cleanOldLogs();
    });

    // Her Pazartesi saat 08:00'de haftalık rapor
    cron.schedule('0 8 * * 1', async () => {
      this.logger.log('Haftalık rapor görevi başlatılıyor...');
      await this.scheduleWeeklyReports();
    });

    // Her gun 07:30'da rakip snapshot + alarm üretimi
    cron.schedule('30 7 * * *', async () => {
      this.logger.log('Rakip zeka snapshot gorevi baslatiliyor...');
      await this.scheduleCompetitorIntelligence();
    });

    // Her Pazartesi 07:45'te haftalik rakip ozet raporu
    cron.schedule('45 7 * * 1', async () => {
      this.logger.log('Haftalik rakip ozet raporu gorevi baslatiliyor...');
      await this.scheduleCompetitorSummaryReports();
    });

    this.logger.log('Zamanlanmış görevler aktifleştirildi');
  }

  async scheduleDailyReports() {
    const tenants = await this.prisma.tenant.findMany({
      where: { plan: { in: ['PRO', 'ENTERPRISE'] } },
      select: { id: true, name: true },
    });

    for (const tenant of tenants) {
      await this.reportsQueue.add(
        'daily-report',
        { tenantId: tenant.id, type: 'daily', period: 'yesterday' },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    }

    this.logger.log(`${tenants.length} tenant için günlük rapor planlandı`);
  }

  async scheduleWeeklyReports() {
    const tenants = await this.prisma.tenant.findMany({
      where: { plan: { in: ['PRO', 'ENTERPRISE'] } },
      select: { id: true },
    });

    for (const tenant of tenants) {
      await this.reportsQueue.add(
        'weekly-report',
        { tenantId: tenant.id, type: 'weekly', period: 'last-week' },
        { attempts: 3 },
      );
    }
  }

  async scheduleInventorySync() {
    const integrations = await this.prisma.integration.findMany({
      where: { isActive: true },
      select: { id: true, tenantId: true, platform: true },
    });

    for (const integration of integrations) {
      await this.syncQueue.add(
        'inventory-sync',
        { integrationId: integration.id, tenantId: integration.tenantId, platform: integration.platform },
        { attempts: 3, removeOnComplete: 100, removeOnFail: 50 },
      );
    }

    this.logger.log(`${integrations.length} entegrasyon için stok senkronizasyonu planlandı`);
  }

  async scheduleOrderSync() {
    const integrations = await this.prisma.integration.findMany({
      where: { isActive: true },
      select: { id: true, tenantId: true, platform: true },
    });

    for (const integration of integrations) {
      await this.syncQueue.add(
        'order-sync',
        { integrationId: integration.id, tenantId: integration.tenantId, platform: integration.platform },
        { attempts: 3 },
      );
    }
  }

  async cleanOldLogs() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const deleted = await this.prisma.activityLog.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    this.logger.log(`${deleted.count} eski log silindi`);
  }

  async scheduleCompetitorIntelligence() {
    const tenants = await this.prisma.tenant.findMany({
      where: { plan: { in: ['PRO', 'ENTERPRISE'] } },
      select: { id: true },
    });

    for (const tenant of tenants) {
      try {
        await this.marketIntelligenceService.runCompetitorSnapshot(tenant.id, { limitPerStore: 10 });
        await this.marketIntelligenceService.getCompetitorAlerts(tenant.id, 5);
      } catch (error) {
        this.logger.warn(`Rakip zeka gorevi hatasi tenant=${tenant.id}: ${(error as Error).message}`);
      }
    }

    this.logger.log(`${tenants.length} tenant icin rakip zeka gorevi tamamlandi`);
  }

  async scheduleCompetitorSummaryReports() {
    const tenants = await this.prisma.tenant.findMany({
      where: { plan: { in: ['PRO', 'ENTERPRISE'] } },
      select: { id: true },
    });

    for (const tenant of tenants) {
      try {
        await this.marketIntelligenceService.generateCompetitorSummaryReport(tenant.id, 7);
      } catch (error) {
        this.logger.warn(`Rakip ozet raporu hatasi tenant=${tenant.id}: ${(error as Error).message}`);
      }
    }

    this.logger.log(`${tenants.length} tenant icin rakip ozet raporu uretildi`);
  }

  // Manuel görev oluşturma API'leri
  async createReportJob(tenantId: string, type: string, params: any) {
    const job = await this.reportsQueue.add('custom-report', {
      tenantId,
      type,
      ...params,
    });
    return { jobId: job.id, status: 'queued' };
  }

  async createSyncJob(tenantId: string, platform: string, type: 'inventory' | 'orders' | 'products') {
    const job = await this.syncQueue.add(`${type}-sync`, {
      tenantId,
      platform,
      manual: true,
    });
    return { jobId: job.id, status: 'queued' };
  }

  async sendScheduledEmail(tenantId: string, template: string, recipients: string[], data: any) {
    const job = await this.emailsQueue.add('send-email', {
      tenantId,
      template,
      recipients,
      data,
    });
    return { jobId: job.id, status: 'queued' };
  }

  async getQueueStats() {
    const [reports, sync, emails] = await Promise.all([
      this.reportsQueue.getJobCounts(),
      this.syncQueue.getJobCounts(),
      this.emailsQueue.getJobCounts(),
    ]);

    return {
      reports: { ...reports, name: 'Raporlar' },
      sync: { ...sync, name: 'Senkronizasyon' },
      emails: { ...emails, name: 'E-postalar' },
    };
  }
}

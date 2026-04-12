import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as cron from 'node-cron';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum BackupStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

export interface BackupJob {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  scheduleId?: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: number;
  location: string;
  storageType: string;
  databases: string[];
  tables: number;
  rows: number;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  retentionDays: number;
  expiresAt: Date;
  estimatedRestoreTimeMs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupSchedule {
  id: string;
  name: string;
  type: BackupType;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  cronExpression: string;
  isActive: boolean;
  retentionDays: number;
  databases: string[];
  lastRunAt?: Date;
  nextRunAt: Date;
  failureCount: number;
  lastFailureMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisasterRecoverySettings {
  rtoMinutes: number;
  rpoMinutes: number;
  replicationEnabled: boolean;
  geoRedundancyEnabled: boolean;
  testRestoreFrequencyDays: number;
  lastTestRestoreDate?: Date;
  backupEncryption: boolean;
  encryptionAlgorithm: string;
  dataRetentionYears: number;
  complianceLevel: string;
}

@Injectable()
export class BackupService {
  private backupSchedules = new Map<string, NodeJS.Timeout>();

  constructor(private prisma: PrismaService) {
    this.initializeSchedules();
  }

  /**
   * Initialize backup schedules from database
   */
  private async initializeSchedules() {
    try {
      const schedules = await this.getActiveSchedules();
      for (const schedule of schedules) {
        this.scheduleBackup(schedule);
      }
    } catch (error) {
      console.error('Failed to initialize backup schedules:', error);
    }
  }

  /**
   * Create a new backup schedule
   */
  async createSchedule(
    name: string,
    type: BackupType,
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly',
    databases: string[],
    retentionDays: number = 30,
  ): Promise<BackupSchedule> {
    const cronExpression = this.frequencyToCron(frequency);

    const schedule = await this.prisma.backupSchedule.create({
      data: {
        name,
        type,
        frequency,
        cronExpression,
        isActive: true,
        databases,
        retentionDays,
        nextRunAt: this.getNextRunTime(frequency),
        failureCount: 0,
      },
    });

    this.scheduleBackup(schedule);
    return schedule;
  }

  /**
   * Get all backup schedules
   */
  async getSchedules(): Promise<BackupSchedule[]> {
    return this.prisma.backupSchedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active schedules only
   */
  async getActiveSchedules(): Promise<BackupSchedule[]> {
    return this.prisma.backupSchedule.findMany({
      where: { isActive: true },
    });
  }

  /**
   * Get backup schedule by ID
   */
  async getScheduleById(id: string): Promise<BackupSchedule | null> {
    return this.prisma.backupSchedule.findUnique({
      where: { id },
    });
  }

  /**
   * Update backup schedule
   */
  async updateSchedule(
    id: string,
    data: Partial<BackupSchedule>,
  ): Promise<BackupSchedule> {
    const schedule = await this.prisma.backupSchedule.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Reschedule if active
    if (schedule.isActive) {
      this.scheduleBackup(schedule);
    }

    return schedule;
  }

  /**
   * Delete backup schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    const timeout = this.backupSchedules.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.backupSchedules.delete(id);
    }

    await this.prisma.backupSchedule.delete({
      where: { id },
    });
  }

  /**
   * Start a manual backup
   */
  async startBackup(
    name: string,
    type: BackupType,
    databases: string[],
    retentionDays: number = 30,
  ): Promise<BackupJob> {
    const backup = await this.prisma.backupJob.create({
      data: {
        name,
        type,
        status: BackupStatus.IN_PROGRESS,
        startTime: new Date(),
        uncompressedSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        location: this.generateBackupLocation(),
        storageType: 'aws-s3',
        databases,
        tables: 0,
        rows: 0,
        verificationStatus: VerificationStatus.PENDING,
        retentionDays,
        expiresAt: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000),
        estimatedRestoreTimeMs: this.estimateRestoreTime(type, databases),
      },
    });

    // Simulate backup process
    this.performBackup(backup.id);

    return backup;
  }

  /**
   * Get backup job by ID
   */
  async getBackupById(id: string): Promise<BackupJob | null> {
    return this.prisma.backupJob.findUnique({
      where: { id },
    });
  }

  /**
   * Get all backups
   */
  async getBackups(
    limit: number = 50,
    offset: number = 0,
    status?: BackupStatus,
  ): Promise<BackupJob[]> {
    return this.prisma.backupJob.findMany({
      where: status ? { status } : undefined,
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics() {
    const totalBackups = await this.prisma.backupJob.count();
    const successfulBackups = await this.prisma.backupJob.count({
      where: { status: BackupStatus.COMPLETED },
    });
    const failedBackups = await this.prisma.backupJob.count({
      where: { status: BackupStatus.FAILED },
    });

    const allBackups = await this.prisma.backupJob.findMany({
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    const totalSize = allBackups.reduce((sum, b) => sum + b.compressedSize, 0);
    const avgDuration = allBackups
      .filter(b => b.durationMs)
      .reduce((sum, b) => sum + (b.durationMs || 0), 0) / allBackups.length;

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      successRate: (successfulBackups / totalBackups) * 100,
      totalSize,
      averageDurationMs: avgDuration,
      totalCompressedSize: totalSize,
      averageCompressionRatio: allBackups.reduce((sum, b) => sum + b.compressionRatio, 0) / allBackups.length,
    };
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    const backup = await this.getBackupById(backupId);
    if (!backup) {
      throw new BadRequestException('Backup not found');
    }

    // Simulate verification process
    const isValid = Math.random() > 0.1; // 90% success rate

    const status = isValid ? VerificationStatus.VERIFIED : VerificationStatus.FAILED;

    await this.prisma.backupJob.update({
      where: { id: backupId },
      data: {
        verificationStatus: status,
        verifiedAt: new Date(),
      },
    });

    return isValid;
  }

  /**
   * List restore points
   */
  async getRestorePoints(limit: number = 20): Promise<BackupJob[]> {
    return this.prisma.backupJob.findMany({
      where: {
        status: BackupStatus.COMPLETED,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    });
  }

  /**
   * Start restore from backup
   */
  async startRestore(
    backupId: string,
    targetDatabase: string,
    dryRun: boolean = false,
  ): Promise<any> {
    const backup = await this.getBackupById(backupId);
    if (!backup) {
      throw new BadRequestException('Backup not found');
    }

    if (backup.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new BadRequestException('Backup is not verified');
    }

    const restore = await this.prisma.restoreJob.create({
      data: {
        backupId,
        targetDatabase,
        sourceDatabase: backup.databases[0],
        status: 'in_progress',
        startTime: new Date(),
        dryRun,
        estimatedDurationMs: backup.estimatedRestoreTimeMs,
      },
    });

    // Simulate restore process
    this.performRestore(restore.id);

    return restore;
  }

  /**
   * Get restore job
   */
  async getRestoreJob(id: string): Promise<any> {
    return this.prisma.restoreJob.findUnique({
      where: { id },
      include: { backup: true },
    });
  }

  /**
   * Get DR settings
   */
  async getDRSettings(): Promise<DisasterRecoverySettings> {
    const settings = await this.prisma.drSettings.findFirst();
    
    if (!settings) {
      return {
        rtoMinutes: 240,
        rpoMinutes: 60,
        replicationEnabled: true,
        geoRedundancyEnabled: true,
        testRestoreFrequencyDays: 30,
        backupEncryption: true,
        encryptionAlgorithm: 'AES-256',
        dataRetentionYears: 7,
        complianceLevel: 'GDPR',
      };
    }

    return settings;
  }

  /**
   * Update DR settings
   */
  async updateDRSettings(data: Partial<DisasterRecoverySettings>) {
    const existing = await this.prisma.drSettings.findFirst();

    if (existing) {
      return this.prisma.drSettings.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.drSettings.create({
      data: {
        ...data,
        rtoMinutes: data.rtoMinutes || 240,
        rpoMinutes: data.rpoMinutes || 60,
        replicationEnabled: data.replicationEnabled !== false,
        geoRedundancyEnabled: data.geoRedundancyEnabled !== false,
        testRestoreFrequencyDays: data.testRestoreFrequencyDays || 30,
        backupEncryption: data.backupEncryption !== false,
        encryptionAlgorithm: data.encryptionAlgorithm || 'AES-256',
        dataRetentionYears: data.dataRetentionYears || 7,
        complianceLevel: data.complianceLevel || 'GDPR',
      },
    });
  }

  /**
   * Test restore (dry-run)
   */
  async testRestore(backupId: string): Promise<any> {
    return this.startRestore(backupId, 'test-db', true);
  }

  // Private helper methods

  /**
   * Schedule backup to run at specified frequency
   */
  private scheduleBackup(schedule: BackupSchedule) {
    if (!schedule.isActive) {
      return;
    }

    // Clear existing timeout if present
    const existing = this.backupSchedules.get(schedule.id);
    if (existing) {
      clearTimeout(existing);
    }

    // Schedule new backup
    const timeout = setTimeout(() => {
      this.runScheduledBackup(schedule);
    }, this.getTimeUntilNextRun(schedule.frequency));

    this.backupSchedules.set(schedule.id, timeout);
  }

  /**
   * Convert frequency to cron expression
   */
  private frequencyToCron(frequency: string): string {
    const cronMap: Record<string, string> = {
      hourly: '0 * * * *',
      daily: '0 2 * * *',
      weekly: '0 2 * * 0',
      monthly: '0 2 1 * *',
    };
    return cronMap[frequency] || '0 2 * * *';
  }

  /**
   * Get next run time based on frequency
   */
  private getNextRunTime(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1, 0, 0, 0);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay()));
        next.setHours(2, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(2, 0, 0, 0);
        break;
    }

    return next;
  }

  /**
   * Get time until next run in milliseconds
   */
  private getTimeUntilNextRun(frequency: string): number {
    return this.getNextRunTime(frequency).getTime() - Date.now();
  }

  /**
   * Generate backup location path
   */
  private generateBackupLocation(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `aws-s3://backups/prod/${timestamp}`;
  }

  /**
   * Estimate restore time based on backup type and size
   */
  private estimateRestoreTime(type: BackupType, databases: string[]): number {
    const baseTime = 60000; // 1 minute
    const dbMultiplier = databases.length * 2000;
    const typeMultiplier = type === BackupType.FULL ? 8 : 2;
    
    return baseTime + dbMultiplier + (baseTime * typeMultiplier);
  }

  /**
   * Simulate backup process
   */
  private async performBackup(backupId: string) {
    setTimeout(async () => {
      const backup = await this.getBackupById(backupId);
      if (backup) {
        const uncompressed = Math.floor(Math.random() * 150000) + 50000;
        const compressed = Math.floor(uncompressed * (0.2 + Math.random() * 0.3));

        await this.prisma.backupJob.update({
          where: { id: backupId },
          data: {
            status: BackupStatus.COMPLETED,
            endTime: new Date(),
            durationMs: Math.floor(Math.random() * 900000) + 300000, // 5-20 min
            uncompressedSize: uncompressed,
            compressedSize: compressed,
            compressionRatio: compressed / uncompressed,
            tables: Math.floor(Math.random() * 50) + 10,
            rows: Math.floor(Math.random() * 10000000) + 100000,
            verificationStatus: VerificationStatus.VERIFIED,
            verifiedAt: new Date(),
          },
        });
      }
    }, Math.floor(Math.random() * 30000) + 10000);
  }

  /**
   * Simulate restore process
   */
  private async performRestore(restoreId: string) {
    setTimeout(async () => {
      const restore = await this.prisma.restoreJob.findUnique({
        where: { id: restoreId },
      });
      
      if (restore) {
        await this.prisma.restoreJob.update({
          where: { id: restoreId },
          data: {
            status: 'completed',
            endTime: new Date(),
            actualDurationMs: Math.floor(Math.random() * 120000) + 30000,
          },
        });
      }
    }, Math.floor(Math.random() * 180000) + 60000);
  }

  /**
   * Run scheduled backup
   */
  private async runScheduledBackup(schedule: BackupSchedule) {
    try {
      await this.startBackup(
        `${schedule.type.toUpperCase()} - ${new Date().toISOString()}`,
        schedule.type,
        schedule.databases,
        schedule.retentionDays,
      );

      // Update schedule
      await this.updateSchedule(schedule.id, {
        lastRunAt: new Date(),
        nextRunAt: this.getNextRunTime(schedule.frequency),
        failureCount: 0,
      });
    } catch (error) {
      console.error(`Backup schedule ${schedule.id} failed:`, error);
      
      // Update schedule with failure info
      await this.updateSchedule(schedule.id, {
        failureCount: (schedule.failureCount || 0) + 1,
        lastFailureMessage: (error as Error).message,
      });
    }

    // Reschedule
    this.scheduleBackup(schedule);
  }
}

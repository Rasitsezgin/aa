import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BackupService,
  BackupType,
  BackupStatus,
  BackupSchedule,
} from './backup.service';

// DTOs
export class CreateBackupScheduleDto {
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  databases: string[];
  retentionDays?: number;
}

export class UpdateScheduleDto {
  name?: string;
  frequency?: string;
  isActive?: boolean;
  retentionDays?: number;
}

export class StartBackupDto {
  name: string;
  type: 'full' | 'incremental';
  databases: string[];
  retentionDays?: number;
}

export class StartRestoreDto {
  backupId: string;
  targetDatabase: string;
  dryRun?: boolean;
}

export class UpdateDRSettingsDto {
  rtoMinutes?: number;
  rpoMinutes?: number;
  replicationEnabled?: boolean;
  geoRedundancyEnabled?: boolean;
  backupEncryption?: boolean;
  encryptionAlgorithm?: string;
  dataRetentionYears?: number;
  complianceLevel?: string;
}

@ApiTags('Backup & Disaster Recovery')
@Controller('api/backup')
export class BackupController {
  constructor(private backupService: BackupService) {}

  /**
   * Create backup schedule
   */
  @Post('schedules')
  @ApiOperation({ summary: 'Create new backup schedule' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created',
  })
  async createSchedule(@Body() dto: CreateBackupScheduleDto) {
    return this.backupService.createSchedule(
      dto.name,
      dto.type as BackupType,
      dto.frequency,
      dto.databases,
      dto.retentionDays || 30,
    );
  }

  /**
   * Get all schedules
   */
  @Get('schedules')
  @ApiOperation({ summary: 'Get all backup schedules' })
  @ApiResponse({
    status: 200,
    description: 'List of schedules',
  })
  async getSchedules() {
    return this.backupService.getSchedules();
  }

  /**
   * Get schedule by ID
   */
  @Get('schedules/:id')
  @ApiOperation({ summary: 'Get backup schedule by ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule details',
  })
  async getSchedule(@Param('id') id: string) {
    const schedule = await this.backupService.getScheduleById(id);
    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }
    return schedule;
  }

  /**
   * Update schedule
   */
  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update backup schedule' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated',
  })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.backupService.updateSchedule(
      id,
      dto as Partial<BackupSchedule>,
    );
  }

  /**
   * Delete schedule
   */
  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Delete backup schedule' })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted',
  })
  async deleteSchedule(@Param('id') id: string) {
    await this.backupService.deleteSchedule(id);
    return { success: true };
  }

  /**
   * Start manual backup
   */
  @Post('create')
  @ApiOperation({ summary: 'Start manual backup immediately' })
  @ApiResponse({
    status: 200,
    description: 'Backup started',
  })
  async startBackup(@Body() dto: StartBackupDto) {
    return this.backupService.startBackup(
      dto.name,
      dto.type as BackupType,
      dto.databases,
      dto.retentionDays || 30,
    );
  }

  /**
   * Get all backups
   */
  @Get('jobs')
  @ApiOperation({ summary: 'Get all backup jobs' })
  @ApiResponse({
    status: 200,
    description: 'List of backup jobs',
  })
  async getBackups(
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
    @Query('status') status?: BackupStatus,
  ) {
    return this.backupService.getBackups(
      parseInt(limit),
      parseInt(offset),
      status,
    );
  }

  /**
   * Get backup by ID
   */
  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get backup job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Backup job details',
  })
  async getBackup(@Param('id') id: string) {
    const backup = await this.backupService.getBackupById(id);
    if (!backup) {
      throw new BadRequestException('Backup not found');
    }
    return backup;
  }

  /**
   * Get backup statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get backup statistics' })
  @ApiResponse({
    status: 200,
    description: 'Backup statistics',
  })
  async getStatistics() {
    return this.backupService.getBackupStatistics();
  }

  /**
   * Verify backup integrity
   */
  @Post('jobs/:id/verify')
  @ApiOperation({ summary: 'Verify backup integrity' })
  @ApiResponse({
    status: 200,
    description: 'Verification completed',
  })
  async verifyBackup(@Param('id') id: string) {
    const isValid = await this.backupService.verifyBackup(id);
    return { verified: isValid };
  }

  /**
   * Get restore points
   */
  @Get('restore-points')
  @ApiOperation({ summary: 'Get available restore points' })
  @ApiResponse({
    status: 200,
    description: 'List of restore points',
  })
  async getRestorePoints(@Query('limit') limit: string = '20') {
    return this.backupService.getRestorePoints(parseInt(limit));
  }

  /**
   * Start restore
   */
  @Post('restore')
  @ApiOperation({ summary: 'Start restore from backup' })
  @ApiResponse({
    status: 200,
    description: 'Restore started',
  })
  async startRestore(@Body() dto: StartRestoreDto) {
    return this.backupService.startRestore(
      dto.backupId,
      dto.targetDatabase,
      dto.dryRun || false,
    );
  }

  /**
   * Get restore job
   */
  @Get('restore/:id')
  @ApiOperation({ summary: 'Get restore job status' })
  @ApiResponse({
    status: 200,
    description: 'Restore job details',
  })
  async getRestoreJob(@Param('id') id: string) {
    const restore = await this.backupService.getRestoreJob(id);
    if (!restore) {
      throw new BadRequestException('Restore job not found');
    }
    return restore;
  }

  /**
   * Get DR settings
   */
  @Get('dr/settings')
  @ApiOperation({ summary: 'Get disaster recovery settings' })
  @ApiResponse({
    status: 200,
    description: 'DR settings',
  })
  async getDRSettings() {
    return this.backupService.getDRSettings();
  }

  /**
   * Update DR settings
   */
  @Put('dr/settings')
  @ApiOperation({ summary: 'Update disaster recovery settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated',
  })
  async updateDRSettings(@Body() dto: UpdateDRSettingsDto) {
    return this.backupService.updateDRSettings(dto);
  }

  /**
   * Test restore (dry-run)
   */
  @Post('jobs/:id/test-restore')
  @ApiOperation({ summary: 'Test restore without applying changes' })
  @ApiResponse({
    status: 200,
    description: 'Test restore started',
  })
  async testRestore(@Param('id') id: string) {
    return this.backupService.testRestore(id);
  }

  /**
   * Get backup retention policy
   */
  @Get('policy/retention')
  @ApiOperation({ summary: 'Get retention policy' })
  @ApiResponse({
    status: 200,
    description: 'Retention policy details',
    schema: {
      example: {
        dailyRetention: 7,
        weeklyRetention: 4,
        monthlyRetention: 12,
        yearlyRetention: 7,
        geoRedundancy: true,
        replicationRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
        complianceLevel: 'GDPR',
      },
    },
  })
  async getRetentionPolicy() {
    return {
      dailyRetention: 7,
      weeklyRetention: 4,
      monthlyRetention: 12,
      yearlyRetention: 7,
      geoRedundancy: true,
      replicationRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      complianceLevel: 'GDPR',
      archiveOlderThanDays: 90,
      deleteAfterYears: 7,
    };
  }

  /**
   * Get backup destinations
   */
  @Get('destinations')
  @ApiOperation({ summary: 'Get backup storage destinations' })
  @ApiResponse({
    status: 200,
    description: 'List of backup destinations',
    schema: {
      example: [
        {
          id: 'primary',
          name: 'AWS S3 (Primary)',
          type: 'aws-s3',
          region: 'us-east-1',
          capacity: 1099511627776,
          used: 107374182400,
          status: 'active',
        },
        {
          id: 'secondary',
          name: 'AWS S3 (Secondary)',
          type: 'aws-s3',
          region: 'eu-west-1',
          capacity: 1099511627776,
          used: 107374182400,
          status: 'active',
        },
      ],
    },
  })
  async getDestinations() {
    return [
      {
        id: 'primary',
        name: 'AWS S3 (Primary)',
        type: 'aws-s3',
        region: 'us-east-1',
        capacity: 1099511627776, // 1TB
        used: 107374182400, // 100GB
        status: 'active',
      },
      {
        id: 'secondary',
        name: 'AWS S3 (Secondary)',
        type: 'aws-s3',
        region: 'eu-west-1',
        capacity: 1099511627776,
        used: 107374182400,
        status: 'active',
      },
    ];
  }

  /**
   * Get recovery SLA metrics
   */
  @Get('sla/metrics')
  @ApiOperation({ summary: 'Get recovery SLA metrics' })
  @ApiResponse({
    status: 200,
    description: 'SLA metrics',
    schema: {
      example: {
        rto: 240,
        rpo: 60,
        slaCompliancePercentage: 99.8,
        recoverySuccessRate: 99.95,
        averageRecoveryTimeMinutes: 45,
        lastRecoveryTest: '2025-02-28T10:30:00Z',
      },
    },
  })
  async getSLAMetrics() {
    return {
      rto: 240, // Minutes
      rpo: 60, // Minutes
      slaCompliancePercentage: 99.8,
      recoverySuccessRate: 99.95,
      averageRecoveryTimeMinutes: 45,
      lastRecoveryTest: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextScheduledTest: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    };
  }
}

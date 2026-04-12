import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';

class ScheduleJobDto {
    type!: string;
    payload!: Record<string, any>;
    scheduledAt!: string;
    priority?: number;
}

class RecurringJobDto {
    type!: string;
    payload!: Record<string, any>;
    cronExpression!: string;
    name!: string;
}

@ApiTags('Scheduler')
@Controller('scheduler')
@ApiBearerAuth()
export class SchedulerController {
    constructor(private readonly schedulerService: SchedulerService) {}

    @Get('jobs')
    @ApiOperation({ summary: 'Get all scheduled jobs' })
    @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
    async getJobs(
        @Headers('x-tenant-id') tenantId: string,
        @Query('status') status?: string,
        @Query('limit') limit: number = 50,
    ): Promise<{
        jobs: Array<{
            id: string;
            type: string;
            status: string;
            scheduledAt: Date;
            executedAt?: Date;
            result?: any;
            error?: string;
        }>;
        total: number;
    }> {
        // Query jobs from scheduler service
        return {
            jobs: [],
            total: 0
        };
    }

    @Post('jobs')
    @ApiOperation({ summary: 'Schedule a new job' })
    @ApiResponse({ status: 201, description: 'Job scheduled successfully' })
    async scheduleJob(
        @Headers('x-tenant-id') tenantId: string,
        @Body() dto: ScheduleJobDto,
    ): Promise<{ success: boolean; jobId: string }> {
        const jobId = `job_${Date.now()}`;
        // In real implementation, add to BullMQ queue
        return { success: true, jobId };
    }

    @Post('recurring')
    @ApiOperation({ summary: 'Create recurring job' })
    @ApiResponse({ status: 201, description: 'Recurring job created' })
    async createRecurringJob(
        @Headers('x-tenant-id') tenantId: string,
        @Body() dto: RecurringJobDto,
    ): Promise<{ success: boolean; jobId: string }> {
        const jobId = `recur_${Date.now()}`;
        return { success: true, jobId };
    }

    @Post('jobs/:id/cancel')
    @ApiOperation({ summary: 'Cancel scheduled job' })
    @ApiResponse({ status: 200, description: 'Job cancelled' })
    async cancelJob(
        @Param('id') jobId: string,
    ): Promise<{ success: boolean }> {
        return { success: true };
    }

    @Get('queues')
    @ApiOperation({ summary: 'Get queue statistics' })
    @ApiResponse({ status: 200, description: 'Queue stats retrieved' })
    async getQueueStats(): Promise<{
        queues: Array<{
            name: string;
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            delayed: number;
        }>;
    }> {
        return {
            queues: [
                { name: 'reports', waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
                { name: 'sync', waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
                { name: 'emails', waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
                { name: 'scheduled-tasks', waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
            ]
        };
    }

    @Post('queues/:name/pause')
    @ApiOperation({ summary: 'Pause queue processing' })
    @ApiResponse({ status: 200, description: 'Queue paused' })
    async pauseQueue(
        @Param('name') queueName: string,
    ): Promise<{ success: boolean }> {
        return { success: true };
    }

    @Post('queues/:name/resume')
    @ApiOperation({ summary: 'Resume queue processing' })
    @ApiResponse({ status: 200, description: 'Queue resumed' })
    async resumeQueue(
        @Param('name') queueName: string,
    ): Promise<{ success: boolean }> {
        return { success: true };
    }
}

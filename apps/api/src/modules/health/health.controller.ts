import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/public.decorator';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkMemory(),
    ]);
  }

  @Public()
  @Get('ready')
  @HealthCheck()
  async ready(): Promise<HealthCheckResult> {
    return this.health.check([() => this.checkDatabase()]);
  }

  @Public()
  @Get('live')
  live(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down', error: error.message } };
    }
  }

  private async checkMemory(): Promise<HealthIndicatorResult> {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const rssMB = Math.round(used.rss / 1024 / 1024);

    return {
      memory: {
        status: heapUsedMB < 512 ? 'up' : 'down',
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${rssMB}MB`,
      },
    };
  }
}

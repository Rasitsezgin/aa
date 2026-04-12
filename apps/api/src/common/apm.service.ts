import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { PrismaService } from '../database/prisma.service';

interface MetricData {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  dbQueryCount: number;
  dbQueryTimeMs: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  tenantId?: string;
  userId?: string;
  error?: string;
}

/**
 * APM (Application Performance Monitoring) Service
 * - Request metrics collection
 * - Database query performance tracking
 * - Memory and CPU monitoring
 * - Slow query detection
 * - Alert threshold management
 */
@Injectable()
export class APMService {
  private metrics: MetricData[] = [];
  private readonly maxMetricsSize = 10000;

  constructor(private prisma: PrismaService) {}

  recordMetric(metric: MetricData): void {
    this.metrics.push(metric);

    // Sliding window - eski metrikleri sil
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize / 2);
    }

    // Slow request detection
    if (metric.responseTimeMs > 1000) {
      console.warn(
        `[SLOW REQUEST] ${metric.method} ${metric.path} took ${metric.responseTimeMs}ms`,
      );
    }

    // Error rate alert
    if (metric.statusCode >= 500) {
      this.checkErrorRate(metric.path);
    }
  }

  getMetrics(timeWindowMinutes: number = 5): {
    totalRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    topSlowEndpoints: Array<{ path: string; avgTime: number; count: number }>;
    topErrors: Array<{ path: string; statusCode: number; count: number }>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => m.timestamp >= cutoff);

    const responseTimes = recentMetrics
      .map((m) => m.responseTimeMs)
      .sort((a, b) => a - b);
    const errorCount = recentMetrics.filter((m) => m.statusCode >= 400).length;

    // Endpoint bazlı analiz
    const endpointStats = new Map<
      string,
      { times: number[]; errors: number }
    >();

    for (const m of recentMetrics) {
      const key = `${m.method} ${m.path}`;
      if (!endpointStats.has(key)) {
        endpointStats.set(key, { times: [], errors: 0 });
      }
      const stats = endpointStats.get(key)!;
      stats.times.push(m.responseTimeMs);
      if (m.statusCode >= 400) stats.errors++;
    }

    const topSlow = Array.from(endpointStats.entries())
      .map(([path, stats]) => ({
        path,
        avgTime: stats.times.reduce((a, b) => a + b, 0) / stats.times.length,
        count: stats.times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    const topErrs = Array.from(endpointStats.entries())
      .filter(([, stats]) => stats.errors > 0)
      .map(([path, stats]) => ({
        path,
        statusCode:
          recentMetrics.find(
            (m) => `${m.method} ${m.path}` === path && m.statusCode >= 400,
          )?.statusCode || 500,
        count: stats.errors,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: recentMetrics.length,
      avgResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      errorRate:
        recentMetrics.length > 0
          ? (errorCount / recentMetrics.length) * 100
          : 0,
      topSlowEndpoints: topSlow,
      topErrors: topErrs,
    };
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<
      string,
      { status: 'pass' | 'fail' | 'warn'; message: string }
    >;
  } {
    const metrics = this.getMetrics(1); // Last 1 minute

    const checks: Record<
      string,
      { status: 'pass' | 'fail' | 'warn'; message: string }
    > = {
      responseTime: {
        status:
          metrics.avgResponseTime < 200
            ? 'pass'
            : metrics.avgResponseTime < 500
              ? 'warn'
              : 'fail',
        message: `Avg: ${metrics.avgResponseTime.toFixed(0)}ms`,
      },
      errorRate: {
        status:
          metrics.errorRate < 1
            ? 'pass'
            : metrics.errorRate < 5
              ? 'warn'
              : 'fail',
        message: `${metrics.errorRate.toFixed(2)}%`,
      },
      memory: {
        status:
          this.getMemoryUsage() < 80
            ? 'pass'
            : this.getMemoryUsage() < 90
              ? 'warn'
              : 'fail',
        message: `${this.getMemoryUsage().toFixed(1)}%`,
      },
    };

    const hasFail = Object.values(checks).some((c) => c.status === 'fail');
    const hasWarn = Object.values(checks).some((c) => c.status === 'warn');

    return {
      status: hasFail ? 'unhealthy' : hasWarn ? 'degraded' : 'healthy',
      checks,
    };
  }

  async saveMetricsToDatabase(): Promise<void> {
    const batch = this.metrics.splice(0, 100); // Process in batches

    if (batch.length === 0) return;

    // Aggregate metrics by hour
    const hourlyStats = new Map<
      string,
      {
        count: number;
        totalTime: number;
        errors: number;
        path: string;
      }
    >();

    for (const m of batch) {
      const hour = m.timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      const key = `${hour}:${m.path}`;

      if (!hourlyStats.has(key)) {
        hourlyStats.set(key, {
          count: 0,
          totalTime: 0,
          errors: 0,
          path: m.path,
        });
      }

      const stats = hourlyStats.get(key)!;
      stats.count++;
      stats.totalTime += m.responseTimeMs;
      if (m.statusCode >= 400) stats.errors++;
    }

    // Save to database
    for (const [, stats] of hourlyStats) {
      // TODO: Add PerformanceMetric model to Prisma schema
      console.log('[APM METRIC]', stats);
      // await this.prisma.performanceMetric.create({...})
    }
  }

  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  private getMemoryUsage(): number {
    const used = process.memoryUsage();
    return (used.heapUsed / used.heapTotal) * 100;
  }

  private async checkErrorRate(path: string): Promise<void> {
    const recent = this.metrics.filter(
      (m) =>
        m.path === path &&
        m.statusCode >= 500 &&
        m.timestamp > new Date(Date.now() - 60000), // Last 1 minute
    );

    if (recent.length >= 5) {
      console.error(
        `[ERROR ALERT] ${path} - ${recent.length} errors in last minute`,
      );
      // TODO: Send alert to notification service
    }
  }
}

/**
 * APM Interceptor - Auto-collects request metrics
 */
@Injectable()
export class APMInterceptor implements NestInterceptor {
  private dbQueryCount = 0;
  private dbQueryTime = 0;

  constructor(private apm: APMService) {
    // Hook into Prisma queries
    this.setupPrismaHooks();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Reset counters
    this.dbQueryCount = 0;
    this.dbQueryTime = 0;

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetric(request, startTime, startMemory, 200);
        },
        error: (error) => {
          const status = error.status || 500;
          this.recordMetric(
            request,
            startTime,
            startMemory,
            status,
            error.message,
          );
        },
      }),
    );
  }

  private recordMetric(
    request: any,
    startTime: number,
    startMemory: NodeJS.MemoryUsage,
    statusCode: number,
    error?: string,
  ): void {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    this.apm.recordMetric({
      timestamp: new Date(),
      method: request.method,
      path: request.path,
      statusCode,
      responseTimeMs: endTime - startTime,
      dbQueryCount: this.dbQueryCount,
      dbQueryTimeMs: this.dbQueryTime,
      memoryUsageMB: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
      cpuUsagePercent: process.cpuUsage().user / 1000000,
      tenantId: request.headers['x-tenant-id'] || request.tenantId,
      userId: request.user?.id,
      error,
    });
  }

  private setupPrismaHooks(): void {
    // Prisma middleware to track queries
    // This would be set up in the Prisma service
  }
}

/**
 * Health Check Controller
 */
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private apm: APMService) {}

  @Get()
  getHealth() {
    return this.apm.getHealthStatus();
  }

  @Get('metrics')
  getMetrics() {
    return this.apm.getMetrics(5);
  }
}

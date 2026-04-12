import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async checkDetailed() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
    };

    const allHealthy = Object.values(checks).every(c => c.status === 'ok');

    return {
      status: allHealthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  private async checkDatabase(): Promise<{ status: string; latency?: number }> {
    // Placeholder - actual implementation would query database
    return { status: 'ok', latency: 5 };
  }

  private async checkRedis(): Promise<{ status: string; latency?: number }> {
    // Placeholder - actual implementation would ping Redis
    return { status: 'ok', latency: 2 };
  }

  private checkMemory(): { status: string; used: number; total: number } {
    const used = process.memoryUsage();
    const total = require('os').totalmem();
    
    return {
      status: used.heapUsed < total * 0.8 ? 'ok' : 'warning',
      used: Math.round(used.heapUsed / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
    };
  }
}

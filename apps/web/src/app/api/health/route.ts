import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: { status: 'ok' | 'error'; latency: number; message?: string };
    cache: { status: 'ok' | 'error'; latency: number; message?: string };
    memory: { status: 'ok' | 'warning' | 'critical'; usage: number; limit: number };
    disk: { status: 'ok' | 'warning' | 'critical'; usage?: number };
  };
  uptime: number;
}

// Global uptime tracker
const startTime = Date.now();

export async function GET() {
  const checks: HealthCheck['checks'] = {
    database: { status: 'error', latency: 0 },
    cache: { status: 'error', latency: 0 },
    memory: { status: 'ok', usage: 0, limit: 0 },
    disk: { status: 'ok' },
  };

  let overallStatus: HealthCheck['status'] = 'healthy';

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'error',
      latency: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'unhealthy';
  }

  // Cache check
  try {
    const cacheStart = Date.now();
    const testKey = `health:${Date.now()}`;
    await redis.set(testKey, 'ping', { ex: 5 });
    const value = await redis.get(testKey);
    checks.cache = {
      status: value === 'ping' ? 'ok' : 'error',
      latency: Date.now() - cacheStart,
    };
    if (checks.cache.status === 'error') {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }
  } catch (error) {
    checks.cache = {
      status: 'error',
      latency: 0,
      message: error instanceof Error ? error.message : 'Cache connection failed',
    };
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  checks.memory = {
    status: memPercent > 90 ? 'critical' : memPercent > 75 ? 'warning' : 'ok',
    usage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    limit: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
  };

  if (checks.memory.status === 'critical') {
    overallStatus = 'unhealthy';
  } else if (checks.memory.status === 'warning' && overallStatus === 'healthy') {
    overallStatus = 'degraded';
  }

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    uptime: Date.now() - startTime,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

// Readiness check - for Kubernetes/Docker
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

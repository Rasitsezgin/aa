import type { NextRequest } from 'next/server';
import { redis } from '@/lib/cache';
import {
  checkMemoryRateLimit,
  ANALYSIS_RATE_LIMIT,
} from '@/lib/analysis-memory-store';

export function getAnalyzeClientKey(request: NextRequest): string {
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey) return `apikey:${apiKey.slice(0, 12)}`;

  const session = request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__Secure-next-auth.session-token')?.value;
  if (session) return `session:${session.slice(0, 12)}`;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  return `ip:${ip}`;
}

export async function checkAnalyzeRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}> {
  const clientKey = getAnalyzeClientKey(request);
  const { requests, windowSeconds } = ANALYSIS_RATE_LIMIT;

  if (redis) {
    const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
    const redisKey = `ratelimit:analyze:${clientKey}:${windowStart}`;
    const current = await redis.incr(redisKey);
    if (current === 1) await redis.expire(redisKey, windowSeconds);
    if (current > requests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: windowSeconds,
      };
    }
    return { allowed: true, remaining: requests - current };
  }

  return checkMemoryRateLimit(
    `analyze:${clientKey}`,
    requests,
    windowSeconds,
  );
}

// Rate Limiting Middleware
// Uses Redis for distributed rate limiting

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/cache';

interface RateLimitConfig {
  requests: number; // Max requests
  window: number; // Window in seconds
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default configurations for different endpoints
const defaultConfigs: Record<string, RateLimitConfig> = {
  // API general
  api: { requests: 100, window: 60, keyPrefix: 'ratelimit:api' },
  
  // Auth endpoints - stricter
  auth: { requests: 5, window: 60, keyPrefix: 'ratelimit:auth' },
  
  // Webhook endpoints
  webhook: { requests: 1000, window: 60, keyPrefix: 'ratelimit:webhook' },
  
  // AI endpoints - expensive
  ai: { requests: 20, window: 60, keyPrefix: 'ratelimit:ai' },
  
  // Public endpoints - generous
  public: { requests: 200, window: 60, keyPrefix: 'ratelimit:public' },
  
  // Admin endpoints
  admin: { requests: 300, window: 60, keyPrefix: 'ratelimit:admin' },
};

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Check rate limit
  async check(key: string): Promise<RateLimitResult> {
    if (!redis) {
      const now = Date.now();
      return {
        allowed: true,
        limit: this.config.requests,
        remaining: this.config.requests,
        resetTime: now + this.config.window * 1000,
      };
    }

    const now = Date.now();
    const windowStart = Math.floor(now / 1000 / this.config.window) * this.config.window;
    const redisKey = `${this.config.keyPrefix}:${key}:${windowStart}`;

    // Get current count
    const current = await redis.incr(redisKey);
    
    // Set expiry on first request
    if (current === 1) {
      await redis.expire(redisKey, this.config.window);
    }

    const remaining = Math.max(0, this.config.requests - current);
    const resetTime = (windowStart + this.config.window) * 1000;

    if (current > this.config.requests) {
      return {
        allowed: false,
        limit: this.config.requests,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    return {
      allowed: true,
      limit: this.config.requests,
      remaining,
      resetTime,
    };
  }

  // Reset rate limit for a key
  async reset(key: string): Promise<void> {
    if (!redis) return;
    const pattern = `${this.config.keyPrefix}:${key}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Main rate limiting middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  type: keyof typeof defaultConfigs = 'api'
): Promise<NextResponse | null> {
  const config = defaultConfigs[type];
  const limiter = new RateLimiter(config);

  // Extract client identifier
  const clientId = getClientIdentifier(request);
  const result = await limiter.check(clientId);

  // Add rate limit headers to all responses
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  });

  if (!result.allowed) {
    headers.set('Retry-After', result.retryAfter?.toString() || '60');
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Continue request - headers will be added by the route handler
  request.headers.set('X-RateLimit-Limit', result.limit.toString());
  request.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  
  return null;
}

// Get client identifier from request
function getClientIdentifier(request: NextRequest): string {
  // Try different methods to identify client
  
  // 1. API Key
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey) {
    return `apikey:${apiKey.slice(0, 8)}`;
  }

  // 2. Bearer token
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    return `token:${token.slice(0, 8)}`;
  }

  // 3. Session/User ID from cookie
  const sessionCookie = request.cookies.get('next-auth.session-token');
  if (sessionCookie) {
    return `session:${sessionCookie.value.slice(0, 8)}`;
  }

  // 4. IP address (last resort)
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') ||
    'unknown';
  
  return `ip:${ip}`;
}

// Sliding window rate limiter (more accurate)
export async function slidingWindowRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  if (!redis) {
    return { allowed: true, remaining: limit, resetTime: now + windowSeconds * 1000 };
  }
  const windowMs = windowSeconds * 1000;
  const keyPrefix = `sliding:${key}`;

  // Clean old entries
  const cutoff = now - windowMs;
  await redis.zremrangebyscore(keyPrefix, 0, cutoff);

  // Count requests in current window
  const count = await redis.zcard(keyPrefix);

  if (count >= limit) {
    // Get oldest request to calculate reset time
    const oldest = await redis.zrange(keyPrefix, 0, 0, { withScores: true });
    const oldestTime = oldest.length > 0 ? parseInt(oldest[1]) : now;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestTime + windowMs,
    };
  }

  // Add current request
  await redis.zadd(keyPrefix, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(keyPrefix, windowSeconds);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetTime: now + windowMs,
  };
}

// Burst rate limiting (token bucket algorithm)
export async function tokenBucketRateLimit(
  key: string,
  burstSize: number,
  refillRate: number // tokens per second
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    return { allowed: true, remaining: burstSize };
  }

  const bucketKey = `bucket:${key}`;
  const lastRefillKey = `bucket:${key}:lastrefill`;
  
  const now = Date.now();
  
  // Get current bucket state
  const [tokens, lastRefill] = await Promise.all([
    redis.get<number>(bucketKey),
    redis.get<number>(lastRefillKey),
  ]);

  let currentTokens = tokens ?? burstSize;
  let lastRefillTime = lastRefill ?? now;

  // Calculate tokens to add
  const timePassed = (now - lastRefillTime) / 1000;
  const tokensToAdd = timePassed * refillRate;
  currentTokens = Math.min(burstSize, currentTokens + tokensToAdd);

  // Check if request can be processed
  if (currentTokens < 1) {
    // Save state
    await redis.set(bucketKey, currentTokens);
    await redis.set(lastRefillKey, now);
    
    return { allowed: false, remaining: 0 };
  }

  // Consume token
  currentTokens -= 1;
  
  // Save state
  await redis.set(bucketKey, currentTokens);
  await redis.set(lastRefillKey, now);

  return { allowed: true, remaining: Math.floor(currentTokens) };
}

// Export for use in API routes
export { RateLimiter, defaultConfigs };

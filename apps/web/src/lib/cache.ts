import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiters
export const ratelimit = {
  // API genel rate limiting
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1m'),
    analytics: true,
  }),

  // Auth işlemleri için daha sıkı
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1m'),
    analytics: true,
  }),

  // Webhook işlemleri
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1m'),
    analytics: true,
  }),

  // AI istekleri
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1m'),
    analytics: true,
  }),
};

// Cache TTL constants
export const CACHE_TTL = {
  // 1 minute
  SHORT: 60,
  // 5 minutes
  MEDIUM: 300,
  // 15 minutes
  STANDARD: 900,
  // 1 hour
  LONG: 3600,
  // 24 hours
  DAY: 86400,
  // 7 days
  WEEK: 604800,
} as const;

// Cache key patterns
export const CACHE_KEYS = {
  // User session
  userSession: (userId: string) => `session:${userId}`,
  userPermissions: (userId: string) => `permissions:${userId}`,

  // Tenant data
  tenantConfig: (tenantId: string) => `tenant:config:${tenantId}`,
  tenantProducts: (tenantId: string, page: number) => `tenant:${tenantId}:products:${page}`,
  tenantOrders: (tenantId: string, status: string) => `tenant:${tenantId}:orders:${status}`,

  // Product data
  product: (productId: string) => `product:${productId}`,
  productStock: (productId: string) => `product:stock:${productId}`,
  productPrice: (productId: string) => `product:price:${productId}`,

  // Analytics
  dashboardStats: (tenantId: string) => `analytics:dashboard:${tenantId}`,
  salesReport: (tenantId: string, date: string) => `analytics:sales:${tenantId}:${date}`,

  // Marketplace integrations
  marketplaceTokens: (integrationId: string) => `mp:tokens:${integrationId}`,
  marketplaceRateLimit: (platform: string) => `mp:ratelimit:${platform}`,

  // AI context
  aiContext: (userId: string) => `ai:context:${userId}`,

  // General
  featureFlags: (tenantId: string) => `flags:${tenantId}`,
};

// Cache wrapper with type safety
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get<T>(key);
      return value ?? null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set value in cache
  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.STANDARD): Promise<void> {
    try {
      await this.redis.set(key, value, { ex: ttl });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete from cache
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Delete by pattern
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Increment counter
  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Set expiry
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  // Get or set with callback (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = CACHE_TTL.STANDARD
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await callback();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Cache wrapper for API calls
  async wrapApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl: number = CACHE_TTL.SHORT
  ): Promise<T> {
    return this.getOrSet(key, apiCall, ttl);
  }

  // Invalidate tenant cache
  async invalidateTenant(tenantId: string): Promise<void> {
    await this.deletePattern(`tenant:${tenantId}:*`);
  }

  // Invalidate product cache
  async invalidateProduct(productId: string, tenantId: string): Promise<void> {
    await this.delete(CACHE_KEYS.product(productId));
    await this.delete(CACHE_KEYS.productStock(productId));
    await this.delete(CACHE_KEYS.productPrice(productId));
    // Also invalidate tenant product lists
    await this.deletePattern(`tenant:${tenantId}:products:*`);
  }

  // Publish message to channel
  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.redis.publish(channel, message);
    } catch (error) {
      console.error('Cache publish error:', error);
    }
  }

  // Subscribe to channel (for real-time updates)
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    // Note: Upstash Redis REST doesn't support pub/sub directly
    // Use WebSocket or Server-Sent Events instead
    console.warn('Redis pub/sub not supported in REST mode, use WebSocket instead');
  }
}

// Export singleton instance
export const cache = new CacheService();

// Export redis for direct access
export { redis };

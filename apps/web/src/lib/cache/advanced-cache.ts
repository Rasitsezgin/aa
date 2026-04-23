// Advanced Caching Layer
// Multi-tier caching with Redis, in-memory, and cache warming

import { Redis } from '@upstash/redis';
import { createClient } from 'redis';

interface CacheConfig {
  ttl: number; // seconds
  staleWhileRevalidate?: number; // seconds
  tags?: string[];
  priority?: 'high' | 'normal' | 'low';
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  staleAt?: number;
  tags: string[];
  etag?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  evictions: number;
  size: number;
  memoryUsage: number;
}

// Multi-tier cache: L1 (memory) -> L2 (Redis) -> L3 (persistent)
export class AdvancedCacheManager {
  private l1Cache: Map<string, CacheEntry<unknown>> = new Map(); // In-memory
  private l2Client: Redis | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    evictions: 0,
    size: 0,
    memoryUsage: 0,
  };
  private maxL1Size: number = 1000; // Max items in L1

  constructor(redisUrl?: string) {
    if (redisUrl) {
      this.l2Client = Redis.fromEnv();
    }
  }

  // Get with stale-while-revalidate pattern
  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    // Try L1 first
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry) {
      const now = Date.now();
      
      // Fresh data
      if (l1Entry.expiresAt > now) {
        this.stats.hits++;
        return l1Entry.data as T;
      }
      
      // Stale data - serve stale while revalidating
      if (l1Entry.staleAt && l1Entry.staleAt > now) {
        this.stats.staleHits++;
        // Trigger background revalidation
        this.triggerRevalidation(key, config);
        return l1Entry.data as T;
      }
      
      // Expired - remove from L1
      this.l1Cache.delete(key);
    }

    // Try L2 (Redis)
    if (this.l2Client) {
      try {
        const l2Data = await this.l2Client.get<string>(key);
        if (l2Data) {
          const entry: CacheEntry<T> = JSON.parse(l2Data);
          
          // Populate L1
          this.setL1(key, entry.data, entry.expiresAt, entry.staleAt, entry.tags);
          
          this.stats.hits++;
          return entry.data;
        }
      } catch (error) {
        console.error('L2 cache error:', error);
      }
    }

    this.stats.misses++;
    return null;
  }

  // Set with multi-tier storage
  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = { ttl: 3600 }
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + config.ttl * 1000;
    const staleAt = config.staleWhileRevalidate
      ? expiresAt + config.staleWhileRevalidate * 1000
      : undefined;
    const tags = config.tags || [];

    // Store in L1
    this.setL1(key, data, expiresAt, staleAt, tags);

    // Store in L2
    if (this.l2Client) {
      const entry: CacheEntry<T> = {
        data,
        expiresAt,
        staleAt,
        tags,
        etag: this.generateETag(data),
      };

      const pipeline = this.l2Client.pipeline();
      pipeline.set(key, JSON.stringify(entry), { ex: config.ttl });
      
      // Add to tag sets for efficient invalidation
      tags.forEach(tag => {
        pipeline.sadd(`tag:${tag}`, key);
      });
      
      await pipeline.exec();
    }
  }

  // Set in L1 with LRU eviction
  private setL1<T>(
    key: string,
    data: T,
    expiresAt: number,
    staleAt: number | undefined,
    tags: string[]
  ): void {
    // Evict if at capacity
    if (this.l1Cache.size >= this.maxL1Size) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) {
        this.l1Cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    const entry: CacheEntry<T> = {
      data,
      expiresAt,
      staleAt,
      tags,
    };

    this.l1Cache.set(key, entry);
    this.stats.size = this.l1Cache.size;
  }

  // Delete by key
  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    
    if (this.l2Client) {
      await this.l2Client.del(key);
    }
  }

  // Invalidate by tag
  async invalidateByTag(tag: string): Promise<number> {
    let count = 0;

    // Find keys by tag in L2
    if (this.l2Client) {
      const keys = await this.l2Client.smembers(`tag:${tag}`);
      
      if (keys && keys.length > 0) {
        const pipeline = this.l2Client.pipeline();
        
        keys.forEach(key => {
          pipeline.del(key);
          // Also delete from L1
          this.l1Cache.delete(key as string);
          count++;
        });
        
        // Delete tag set
        pipeline.del(`tag:${tag}`);
        
        await pipeline.exec();
      }
    }

    return count;
  }

  // Invalidate by pattern
  async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;

    // Clear L1 matching keys
    for (const key of this.l1Cache.keys()) {
      if (key.includes(pattern)) {
        this.l1Cache.delete(key);
        count++;
      }
    }

    // Clear L2 matching keys (if Redis supports pattern delete)
    if (this.l2Client) {
      // Scan and delete matching keys
      let cursor = '0';
      do {
        const result = await this.l2Client.scan(cursor, { match: `*${pattern}*`, count: 100 });
        cursor = result[0];
        const keys = result[1];
        
        if (keys && keys.length > 0) {
          await this.l2Client.del(...keys);
          count += keys.length;
        }
      } while (cursor !== '0');
    }

    return count;
  }

  // Cache warming - preload frequently accessed data
  async warmCache<T>(
    keys: string[],
    fetcher: (key: string) => Promise<T>,
    config?: CacheConfig
  ): Promise<{ warmed: number; failed: number }> {
    let warmed = 0;
    let failed = 0;

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async key => {
          try {
            const data = await fetcher(key);
            await this.set(key, data, config);
            warmed++;
          } catch (error) {
            console.error(`Failed to warm cache for ${key}:`, error);
            failed++;
          }
        })
      );
    }

    return { warmed, failed };
  }

  // Get or set (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    const cached = await this.get<T>(key, config);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, config);
    return data;
  }

  // Conditional get with ETag
  async getConditional<T>(
    key: string,
    clientETag: string
  ): Promise<{ data: T | null; etag: string | null; modified: boolean }> {
    const entry = await this.get<CacheEntry<T>>(key);
    
    if (!entry) {
      return { data: null, etag: null, modified: true };
    }

    const serverETag = entry.etag;
    const modified = serverETag !== clientETag;

    return {
      data: modified ? entry.data : null,
      etag: serverETag || null,
      modified,
    };
  }

  // Get cache statistics
  getStats(): CacheStats {
    const l1Memory = this.calculateL1Memory();
    
    return {
      ...this.stats,
      memoryUsage: l1Memory,
    };
  }

  // Reset stats
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      evictions: 0,
      size: this.l1Cache.size,
      memoryUsage: 0,
    };
  }

  // Clear all caches
  async clear(): Promise<void> {
    this.l1Cache.clear();
    this.stats.size = 0;
    
    if (this.l2Client) {
      await this.l2Client.flushall();
    }
  }

  // Generate ETag
  private generateETag(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `"${hash.toString(16)}"`;
  }

  // Trigger background revalidation
  private async triggerRevalidation<T>(key: string, config?: CacheConfig): Promise<void> {
    // This would typically trigger a background job or fetch
    console.log(`Triggering revalidation for ${key}`);
  }

  // Calculate L1 memory usage (approximate)
  private calculateL1Memory(): number {
    let bytes = 0;
    for (const [key, entry] of this.l1Cache) {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(entry).length * 2;
    }
    return bytes;
  }
}

// Cache warming scheduler
export class CacheWarmingScheduler {
  private warmingJobs: Map<string, {
    keys: string[];
    fetcher: (key: string) => Promise<unknown>;
    config?: CacheConfig;
    schedule: string; // Cron-like
    lastRun?: Date;
  }> = new Map();

  constructor(private cache: AdvancedCacheManager) {}

  // Schedule cache warming job
  schedule(
    id: string,
    keys: string[],
    fetcher: (key: string) => Promise<unknown>,
    config: CacheConfig,
    schedule: string // e.g., "0 */6 * * *" (every 6 hours)
  ): void {
    this.warmingJobs.set(id, {
      keys,
      fetcher,
      config,
      schedule,
    });

    // Start scheduler
    this.startScheduler();
  }

  // Run warming job immediately
  async runNow(id: string): Promise<{ warmed: number; failed: number }> {
    const job = this.warmingJobs.get(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    const result = await this.cache.warmCache(job.keys, job.fetcher, job.config);
    
    job.lastRun = new Date();
    this.warmingJobs.set(id, job);
    
    return result;
  }

  // Start scheduler (simplified)
  private startScheduler(): void {
    // In production, use node-cron or similar
    console.log('Cache warming scheduler started');
  }

  // Get job status
  getJobStatus(id: string): {
    id: string;
    keyCount: number;
    schedule: string;
    lastRun?: Date;
    nextRun?: Date;
  } | null {
    const job = this.warmingJobs.get(id);
    if (!job) return null;

    return {
      id,
      keyCount: job.keys.length,
      schedule: job.schedule,
      lastRun: job.lastRun,
      nextRun: this.calculateNextRun(job.schedule),
    };
  }

  private calculateNextRun(schedule: string): Date {
    // Simplified - would use cron-parser
    const next = new Date();
    next.setHours(next.getHours() + 6);
    return next;
  }
}

// Distributed cache lock for critical sections
export class DistributedLock {
  constructor(private redis: Redis) {}

  async acquire(lockKey: string, ttlSeconds: number = 30): Promise<string | null> {
    const token = crypto.randomUUID();
    const acquired = await this.redis.set(lockKey, token, { nx: true, ex: ttlSeconds });
    
    if (acquired) {
      return token;
    }
    return null;
  }

  async release(lockKey: string, token: string): Promise<boolean> {
    const current = await this.redis.get<string>(lockKey);
    
    if (current === token) {
      await this.redis.del(lockKey);
      return true;
    }
    return false;
  }

  async extend(lockKey: string, token: string, additionalSeconds: number): Promise<boolean> {
    const current = await this.redis.get<string>(lockKey);
    
    if (current === token) {
      await this.redis.expire(lockKey, additionalSeconds);
      return true;
    }
    return false;
  }
}

// Export singleton
export const cacheManager = new AdvancedCacheManager(process.env.REDIS_URL);
export const warmingScheduler = new CacheWarmingScheduler(cacheManager);

export { CacheConfig, CacheEntry, CacheStats };

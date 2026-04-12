import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheOptions {
  ttl?: number; // Saniye cinsinde
  tags?: string[]; // Cache tag'leri (invalidation için)
  compress?: boolean; // Büyük verileri sıkıştır
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsed: string;
}

/**
 * Redis Caching Service
 * Multi-layer caching with tags, compression, and analytics
 */
@Injectable()
export class CacheService {
  private redis: Redis;
  private localCache: Map<string, { value: any; expiry: number }> = new Map();
  private stats = { hits: 0, misses: 0 };

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 2, // Cache için ayrı DB
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Local cache cleanup
    setInterval(() => this.cleanupLocal(), 60000);
  }

  /**
   * Cache'ten veri al (multi-tier: local → redis)
   */
  async get<T>(key: string): Promise<T | null> {
    // Tier 1: Local cache
    const local = this.localCache.get(key);
    if (local && local.expiry > Date.now()) {
      this.stats.hits++;
      return local.value;
    }
    this.localCache.delete(key);

    // Tier 2: Redis
    try {
      const data = await this.redis.get(key);
      if (data) {
        this.stats.hits++;
        const parsed = JSON.parse(data);

        // Local cache'e de yaz (frequently accessed)
        this.localCache.set(key, {
          value: parsed,
          expiry: Date.now() + 30000, // 30 sn local cache
        });

        return parsed;
      }
    } catch (error) {
      console.error('Redis cache get error:', error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Cache'e veri yaz
   */
  async set(
    key: string,
    value: any,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.ttl || 300; // Default 5 dakika

    try {
      const serialized = JSON.stringify(value);

      // Redis'e yaz
      await this.redis.setex(key, ttl, serialized);

      // Tag ekle
      if (options.tags) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key);
        }
      }

      // Local cache'e de yaz (kısa süreli)
      this.localCache.set(key, {
        value,
        expiry: Date.now() + Math.min(ttl * 1000, 30000),
      });
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  /**
   * Cache sil
   */
  async del(key: string): Promise<void> {
    this.localCache.delete(key);
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis cache del error:', error);
    }
  }

  /**
   * Tag'e göre tüm cache'i temizle
   */
  async invalidateByTag(tag: string): Promise<number> {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length === 0) return 0;

      // Local cache'ten sil
      keys.forEach((k) => this.localCache.delete(k));

      // Redis'ten sil
      const pipeline = this.redis.pipeline();
      keys.forEach((k) => pipeline.del(k));
      pipeline.del(`tag:${tag}`);

      await pipeline.exec();
      return keys.length;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Pattern ile cache temizleme
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      keys.forEach((k) => this.localCache.delete(k));
      await this.redis.del(...keys);

      return keys.length;
    } catch (error) {
      console.error('Pattern invalidation error:', error);
      return 0;
    }
  }

  /**
   * Tenant bazlı cache key oluşturucu
   */
  createKey(tenantId: string, resource: string, identifier: string): string {
    return `cache:${tenantId}:${resource}:${identifier}`;
  }

  /**
   * Cache istatistikleri
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const info = await this.redis.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);

    const keys = await this.redis.keys('cache:*');

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      totalKeys: keys.length,
      memoryUsed: memoryMatch?.[1]?.trim() || 'unknown',
    };
  }

  /**
   * Tüm cache'i temizle
   */
  async flush(): Promise<void> {
    this.localCache.clear();
    const keys = await this.redis.keys('cache:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Decorator: Method result caching
   */
  cacheable(options: CacheOptions = {}) {
    const service = this;

    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        // Cache key oluştur
        const keyParts = [
          target.constructor.name,
          propertyKey,
          ...args.map((a) => JSON.stringify(a)),
        ];
        const cacheKey = `cache:method:${keyParts.join(':')}`;

        // Cache kontrol
        const cached = await service.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Çalıştır ve cache'e yaz
        const result = await originalMethod.apply(this, args);
        await service.set(cacheKey, result, options);

        return result;
      };

      return descriptor;
    };
  }

  private cleanupLocal(): void {
    const now = Date.now();
    for (const [key, entry] of this.localCache) {
      if (entry.expiry <= now) {
        this.localCache.delete(key);
      }
    }
  }
}

/**
 * Cache interceptor for HTTP responses
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Sadece GET isteklerini cache'le
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Cache bypass header'ı varsa cache'leme
    if (request.headers['x-bypass-cache']) {
      return next.handle();
    }

    const tenantId = request.headers['x-tenant-id'] || 'default';
    const cacheKey = this.cacheService.createKey(
      tenantId as string,
      'api',
      request.originalUrl || request.url,
    );

    // Cache kontrol
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      // Cache hit - header ekle
      request.res?.setHeader('X-Cache', 'HIT');
      return of(cached);
    }

    // Cache miss - çalıştır ve cache'e yaz
    return next.handle().pipe(
      tap(async (response) => {
        request.res?.setHeader('X-Cache', 'MISS');

        // Başarılı yanıtları cache'le (2xx status)
        const status = request.res?.statusCode || 200;
        if (status >= 200 && status < 300) {
          // URL bazlı TTL belirleme
          let ttl = 300; // 5 dakika default

          if (request.path.includes('/analytics')) ttl = 60; // 1 dk
          if (request.path.includes('/dashboard')) ttl = 120; // 2 dk
          if (request.path.includes('/products')) ttl = 600; // 10 dk
          if (request.path.includes('/marketplaces')) ttl = 1800; // 30 dk

          await this.cacheService.set(cacheKey, response, { ttl });
        }
      }),
    );
  }
}

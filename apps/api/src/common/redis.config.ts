import { Logger } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';

const logger = new Logger('Redis');

export type RedisConnectionConfig = {
  host: string;
  port: number;
  password?: string;
  username?: string;
};

export function resolveRedisConnectionConfig(): RedisConnectionConfig | null {
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: Number(url.port || '6379'),
        password: url.password || undefined,
        username: url.username || undefined,
      };
    } catch {
      logger.warn('REDIS_URL is invalid; Redis-backed features will use fallbacks');
      return null;
    }
  }

  const host = process.env.REDIS_HOST?.trim();
  if (!host) {
    return null;
  }

  return {
    host,
    port: Number(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    username: process.env.REDIS_USERNAME || undefined,
  };
}

export function createManagedRedisClient(
  extra: Partial<RedisOptions> = {},
): Redis | null {
  const config = resolveRedisConnectionConfig();
  if (!config) {
    logger.warn(
      'Redis not configured (set REDIS_URL or REDIS_HOST); using in-memory fallback where supported',
    );
    return null;
  }

  const client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    username: config.username,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
    ...extra,
  });

  let lastErrorLog = 0;
  client.on('error', (err) => {
    const now = Date.now();
    if (now - lastErrorLog > 30_000) {
      lastErrorLog = now;
      logger.warn(`Redis connection error: ${err.message}`);
    }
  });

  return client;
}

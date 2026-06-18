/** In-memory fallback when Upstash Redis is not configured (dev / single instance). */

type Entry<T> = { value: T; expiresAt: number };

const cacheStore = new Map<string, Entry<unknown>>();

export function memoryCacheGet<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value as T;
}

export function memoryCacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

const rateHits = new Map<string, { count: number; windowStart: number }>();

export function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = rateHits.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    rateHits.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (bucket.count >= maxRequests) {
    const retryAfter = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  bucket.count += 1;
  return { allowed: true, remaining: maxRequests - bucket.count };
}

export const ANALYSIS_CACHE_TTL_SEC = 15 * 60;
export const ANALYSIS_RATE_LIMIT = { requests: 10, windowSeconds: 3600 };

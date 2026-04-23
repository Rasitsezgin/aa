import { prisma } from '@/lib/prisma';
import { cache, CACHE_TTL } from './cache';
import crypto from 'crypto';

// API Key manager for rotation and security
export class ApiKeyManager {
  // Generate a new API key with rotation support
  static async createApiKey({
    tenantId,
    userId,
    name,
    scopes = ['read'],
    expiresInDays = 90,
  }: {
    tenantId: string;
    userId: string;
    name: string;
    scopes?: string[];
    expiresInDays?: number;
  }) {
    const keyId = crypto.randomUUID();
    const keySecret = `pk_${crypto.randomBytes(32).toString('hex')}`;
    const hashedSecret = crypto.createHash('sha256').update(keySecret).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const apiKey = await prisma.apiKey.create({
      data: {
        id: keyId,
        tenantId,
        userId,
        name,
        keyHash: hashedSecret,
        permissions: JSON.stringify(scopes),
        scopes: scopes,
        expiresAt,
        lastUsed: new Date(),
      },
    });

    // Cache the key metadata (not the secret!)
    await cache.set(
      `apikey:meta:${keyId}`,
      { tenantId, userId, scopes, expiresAt },
      CACHE_TTL.DAY
    );

    return {
      id: keyId,
      key: keySecret, // Only returned once!
      name: apiKey.name,
      scopes,
      expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  // Rotate API key (create new, revoke old with grace period)
  static async rotateApiKey({
    keyId,
    userId,
    gracePeriodHours = 24,
  }: {
    keyId: string;
    userId: string;
    gracePeriodHours?: number;
  }) {
    const oldKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!oldKey) {
      throw new Error('API key not found');
    }

    // Create new key
    const newKey = await this.createApiKey({
      tenantId: oldKey.tenantId,
      userId,
      name: `${oldKey.name} (Rotated)`,
      scopes: (oldKey.scopes as string[]) || ['read'],
      expiresInDays: 90,
    });

    // Schedule old key revocation
    const revokeAt = new Date();
    revokeAt.setHours(revokeAt.getHours() + gracePeriodHours);

    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        rotatedToId: newKey.id,
        revokeAt,
        status: 'rotating' as const,
      },
    });

    // Cache rotation info
    await cache.set(
      `apikey:rotation:${keyId}`,
      { newKeyId: newKey.id, revokeAt },
      gracePeriodHours * 3600
    );

    return {
      oldKey: { id: keyId, revokeAt },
      newKey,
    };
  }

  // Revoke API key immediately
  static async revokeApiKey(keyId: string, userId: string, reason?: string) {
    const key = await prisma.apiKey.update({
      where: { id: keyId, userId },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    // Invalidate cache
    await cache.delete(`apikey:meta:${keyId}`);
    await cache.deletePattern(`apikey:requests:${keyId}:*`);

    // Log revocation
    await this.logKeyEvent(keyId, 'revoked', { userId, reason });

    return key;
  }

  // Validate API key
  static async validateApiKey(keySecret: string) {
    const hashedSecret = crypto.createHash('sha256').update(keySecret).digest('hex');

    // Check cache first
    const keyId = keySecret.split('_')[1]?.slice(0, 36);
    if (keyId) {
      const cached = await cache.get<{
        tenantId: string;
        userId: string;
        scopes: string[];
        expiresAt: string;
      }>(`apikey:meta:${keyId}`);

      if (cached) {
        if (new Date(cached.expiresAt) < new Date()) {
          throw new Error('API key expired');
        }
        return cached;
      }
    }

    // Check database
    const key = await prisma.apiKey.findFirst({
      where: {
        keyHash: hashedSecret,
        status: 'active',
      },
    });

    if (!key) {
      throw new Error('Invalid API key');
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new Error('API key expired');
    }

    if (key.revokeAt && key.revokeAt < new Date()) {
      throw new Error('API key revoked');
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    // Increment usage counter
    await cache.increment(`apikey:usage:${key.id}`);

    const scopes = (key.scopes as string[]) || [];
    const result = {
      keyId: key.id,
      tenantId: key.tenantId,
      userId: key.userId,
      scopes,
    };

    // Cache for future requests
    await cache.set(`apikey:meta:${key.id}`, {
      tenantId: key.tenantId,
      userId: key.userId,
      scopes,
      expiresAt: key.expiresAt,
    }, CACHE_TTL.SHORT);

    return result;
  }

  // Check rate limit for API key
  static async checkRateLimit(keyId: string, maxRequests = 1000): Promise<boolean> {
    const key = `apikey:requests:${keyId}:${new Date().toISOString().slice(0, 10)}`;
    const current = await cache.increment(key);

    // Set expiry for daily counter
    if (current === 1) {
      await cache.expire(key, 86400); // 24 hours
    }

    return current <= maxRequests;
  }

  // Get API key usage stats
  static async getKeyStats(keyId: string, tenantId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, tenantId },
      include: {
        rotatedTo: true,
        rotatedFrom: true,
      },
    });

    if (!key) {
      throw new Error('API key not found');
    }

    // Get usage from cache
    const todayKey = `apikey:requests:${keyId}:${new Date().toISOString().slice(0, 10)}`;
    const todayUsage = (await cache.get<number>(todayKey)) || 0;

    return {
      ...key,
      usage: {
        today: todayUsage,
        lastUsedAt: key.lastUsed,
      },
    };
  }

  // List all API keys for tenant
  static async listApiKeys(tenantId: string) {
    const keys = await prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    return keys.map((key) => ({
      ...key,
      scopes: (key.scopes as string[]) || [],
    }));
  }

  // Auto-revoke expired keys (cron job)
  static async autoRevokeExpiredKeys() {
    const expired = await prisma.apiKey.findMany({
      where: {
        status: { in: ['active', 'rotating'] },
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokeAt: { lt: new Date() } },
        ],
      },
    });

    for (const key of expired) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: {
          status: 'revoked',
          revokedAt: new Date(),
          revokeReason: 'auto_expired',
        },
      });

      await cache.delete(`apikey:meta:${key.id}`);
      await this.logKeyEvent(key.id, 'auto_revoked', { reason: 'expired' });
    }

    return expired.length;
  }

  // Log key events for audit
  private static async logKeyEvent(
    keyId: string,
    event: string,
    metadata: Record<string, unknown>
  ) {
    // Store in cache for recent events
    const logKey = `apikey:events:${keyId}:${Date.now()}`;
    await cache.set(
      logKey,
      { event, metadata, timestamp: new Date() },
      604800 // 7 days
    );

    // Could also write to database audit log
    console.log(`API Key Event: ${keyId} - ${event}`, metadata);
  }
}

// Export singleton
export const apiKeyManager = new ApiKeyManager();

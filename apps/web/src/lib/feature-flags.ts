// Feature Flags / LaunchDarkly-style feature management
import { cache } from './cache';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100 for gradual rollout
  targeting?: {
    tenants?: string[]; // Specific tenant IDs
    users?: string[]; // Specific user IDs
    plans?: string[]; // Subscription plans (FREE, PRO, ENTERPRISE)
  };
  variants?: Array<{
    name: string;
    weight: number;
    payload?: Record<string, unknown>;
  }>;
  requiresPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FlagContext {
  tenantId: string;
  userId?: string;
  plan?: string;
  sessionId?: string;
}

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private cacheKey = 'feature-flags';

  // Load flags from database/cache
  async loadFlags(): Promise<void> {
    try {
      // Try cache first
      const cached = await cache.get<FeatureFlag[]>(this.cacheKey);
      if (cached) {
        cached.forEach((flag) => this.flags.set(flag.key, flag));
        return;
      }

      // Load from database (mock for now)
      const flags = await this.fetchFlagsFromDB();
      flags.forEach((flag) => this.flags.set(flag.key, flag));

      // Cache for 5 minutes
      await cache.set(this.cacheKey, flags, 300);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  }

  // Check if feature is enabled
  async isEnabled(key: string, context: FlagContext): Promise<boolean> {
    const flag = this.flags.get(key);

    if (!flag) {
      return false; // Default to disabled if flag doesn't exist
    }

    // Global kill switch
    if (!flag.enabled) {
      return false;
    }

    // Plan requirement check
    if (flag.requiresPlan && context.plan !== flag.requiresPlan) {
      return false;
    }

    // Targeting rules
    if (flag.targeting) {
      // Tenant-specific
      if (flag.targeting.tenants?.length) {
        if (!flag.targeting.tenants.includes(context.tenantId)) {
          return false;
        }
      }

      // User-specific
      if (flag.targeting.users?.length && context.userId) {
        if (!flag.targeting.users.includes(context.userId)) {
          return false;
        }
      }

      // Plan-specific
      if (flag.targeting.plans?.length && context.plan) {
        if (!flag.targeting.plans.includes(context.plan)) {
          return false;
        }
      }
    }

    // Percentage rollout
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = this.hashString(`${key}:${context.tenantId}:${context.userId || ''}`);
      const percentage = (hash % 100) + 1;
      return percentage <= flag.rolloutPercentage;
    }

    return true;
  }

  // Get variant for A/B testing
  async getVariant(
    key: string,
    context: FlagContext
  ): Promise<{ name: string; payload?: Record<string, unknown> } | null> {
    const flag = this.flags.get(key);

    if (!flag || !flag.enabled || !flag.variants?.length) {
      return null;
    }

    // Check if user qualifies first
    const enabled = await this.isEnabled(key, context);
    if (!enabled) {
      return null;
    }

    // Deterministic variant selection based on user
    const hash = this.hashString(`${key}:${context.tenantId}:${context.userId || context.sessionId || ''}`);
    const totalWeight = flag.variants.reduce((sum, v) => sum + v.weight, 0);
    let normalizedHash = (hash % totalWeight) + 1;

    for (const variant of flag.variants) {
      normalizedHash -= variant.weight;
      if (normalizedHash <= 0) {
        return { name: variant.name, payload: variant.payload };
      }
    }

    return flag.variants[0];
  }

  // Set feature flag
  async setFlag(flag: FeatureFlag): Promise<void> {
    flag.updatedAt = new Date();
    this.flags.set(flag.key, flag);

    // Persist to database
    await this.saveFlagToDB(flag);

    // Invalidate cache
    await cache.delete(this.cacheKey);
  }

  // Remove feature flag
  async removeFlag(key: string): Promise<void> {
    this.flags.delete(key);
    await this.deleteFlagFromDB(key);
    await cache.delete(this.cacheKey);
  }

  // Get all flags
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // Hash string for consistent hashing
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  // Database operations (mock implementations)
  private async fetchFlagsFromDB(): Promise<FeatureFlag[]> {
    // In production, fetch from database
    return [
      {
        key: 'new-dashboard',
        enabled: true,
        rolloutPercentage: 10,
        targeting: { plans: ['PRO', 'ENTERPRISE'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'ai-assistant',
        enabled: true,
        requiresPlan: 'ENTERPRISE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'advanced-analytics',
        enabled: true,
        targeting: { plans: ['PRO', 'ENTERPRISE'] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private async saveFlagToDB(flag: FeatureFlag): Promise<void> {
    // Implementation would save to database
    console.log('Saving flag to DB:', flag);
  }

  private async deleteFlagFromDB(key: string): Promise<void> {
    // Implementation would delete from database
    console.log('Deleting flag from DB:', key);
  }
}

// React Hook for feature flags
export function useFeatureFlag(key: string, context: FlagContext) {
  const manager = new FeatureFlagManager();

  const checkEnabled = async (): Promise<boolean> => {
    await manager.loadFlags();
    return manager.isEnabled(key, context);
  };

  const getVariant = async () => {
    await manager.loadFlags();
    return manager.getVariant(key, context);
  };

  return { checkEnabled, getVariant };
}

// Middleware for API routes
export async function featureFlagMiddleware(
  flagKey: string,
  context: FlagContext,
  handler: () => Promise<Response>
): Promise<Response> {
  const manager = new FeatureFlagManager();
  await manager.loadFlags();

  const enabled = await manager.isEnabled(flagKey, context);

  if (!enabled) {
    return new Response(
      JSON.stringify({ error: 'Feature not available', flag: flagKey }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return handler();
}

// Export singleton
export const featureFlags = new FeatureFlagManager();

export type { FeatureFlag, FlagContext };

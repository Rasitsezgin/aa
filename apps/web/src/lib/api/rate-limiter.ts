// API Rate Limiter
// Advanced rate limiting with multiple strategies

import { EventEmitter } from 'events';

type RateLimitStrategy = 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';

interface RateLimitRule {
  id: string;
  name: string;
  tenantId?: string;
  path: string | RegExp;
  methods: string[];
  strategy: RateLimitStrategy;
  limits: {
    requests: number;
    window: number; // seconds
    burst?: number;
    refillRate?: number;
  };
  identifiers: ('ip' | 'user' | 'api_key' | 'header' | 'cookie')[];
  headerName?: string;
  cookieName?: string;
  responseHeaders: boolean;
  skipSuccessful?: boolean; // Don't count 2xx responses
  skipFailed?: boolean; // Don't count 5xx responses
}

interface RateLimitState {
  identifier: string;
  ruleId: string;
  remaining: number;
  resetTime: number;
  windowStart: number;
  tokens?: number; // For token bucket
  lastRefill?: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  headers: Record<string, string>;
}

// Rate Limiter
export class RateLimiter extends EventEmitter {
  private rules: Map<string, RateLimitRule> = new Map();
  private states: Map<string, RateLimitState> = new Map();

  // Add rate limit rule
  addRule(rule: Omit<RateLimitRule, 'id'>): RateLimitRule {
    const fullRule: RateLimitRule = {
      ...rule,
      id: crypto.randomUUID(),
    };

    this.rules.set(fullRule.id, fullRule);
    return fullRule;
  }

  // Check rate limit
  check(
    ruleId: string,
    request: {
      ip: string;
      userId?: string;
      apiKey?: string;
      headers: Record<string, string>;
      cookies: Record<string, string>;
    }
  ): RateLimitResult {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error('Rule not found');

    // Build identifier
    const identifier = this.buildIdentifier(rule, request);
    const stateKey = `${ruleId}:${identifier}`;

    let state = this.states.get(stateKey);
    const now = Date.now();

    if (!state || now > state.resetTime) {
      // Initialize new window
      state = this.initializeState(rule, identifier, now);
    }

    // Apply strategy
    const result = this.applyStrategy(rule, state, now);

    // Update state
    this.states.set(stateKey, state);

    return result;
  }

  // Check with middleware pattern
  middleware(ruleIds: string[]) {
    return async (req: Request): Promise<Response | null> => {
      for (const ruleId of ruleIds) {
        const result = this.check(ruleId, {
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          headers: Object.fromEntries(req.headers.entries()),
          cookies: {}, // Parse cookies
        });

        if (!result.allowed) {
          return new Response('Rate limit exceeded', {
            status: 429,
            headers: result.headers,
          });
        }
      }
      return null; // Allow request
    };
  }

  // Get current state
  getState(ruleId: string, identifier: string): RateLimitState | null {
    return this.states.get(`${ruleId}:${identifier}`) || null;
  }

  // Reset limit for identifier
  reset(ruleId: string, identifier: string): void {
    this.states.delete(`${ruleId}:${identifier}`);
  }

  // Get stats
  getStats(ruleId: string): {
    totalIdentifiers: number;
    blockedRecently: number;
  } {
    const states = Array.from(this.states.values()).filter(s => s.ruleId === ruleId);
    const now = Date.now();

    return {
      totalIdentifiers: states.length,
      blockedRecently: states.filter(s => s.remaining === 0 && s.resetTime > now).length,
    };
  }

  // Private methods
  private buildIdentifier(
    rule: RateLimitRule,
    request: {
      ip: string;
      userId?: string;
      apiKey?: string;
      headers: Record<string, string>;
      cookies: Record<string, string>;
    }
  ): string {
    const parts: string[] = [];

    for (const id of rule.identifiers) {
      switch (id) {
        case 'ip':
          parts.push(request.ip);
          break;
        case 'user':
          if (request.userId) parts.push(`user:${request.userId}`);
          break;
        case 'api_key':
          if (request.apiKey) parts.push(`key:${request.apiKey}`);
          break;
        case 'header':
          if (rule.headerName) {
            parts.push(request.headers[rule.headerName.toLowerCase()] || '');
          }
          break;
        case 'cookie':
          if (rule.cookieName) {
            parts.push(request.cookies[rule.cookieName] || '');
          }
          break;
      }
    }

    return parts.join(':') || 'default';
  }

  private initializeState(
    rule: RateLimitRule,
    identifier: string,
    now: number
  ): RateLimitState {
    const windowMs = rule.limits.window * 1000;

    return {
      identifier,
      ruleId: rule.id!,
      remaining: rule.limits.requests,
      resetTime: now + windowMs,
      windowStart: now,
      tokens: rule.strategy === 'token_bucket' ? rule.limits.burst || rule.limits.requests : undefined,
      lastRefill: now,
    };
  }

  private applyStrategy(
    rule: RateLimitRule,
    state: RateLimitState,
    now: number
  ): RateLimitResult {
    switch (rule.strategy) {
      case 'fixed_window':
        return this.fixedWindowStrategy(rule, state);
      case 'sliding_window':
        return this.slidingWindowStrategy(rule, state);
      case 'token_bucket':
        return this.tokenBucketStrategy(rule, state, now);
      case 'leaky_bucket':
        return this.leakyBucketStrategy(rule, state);
      default:
        return this.fixedWindowStrategy(rule, state);
    }
  }

  private fixedWindowStrategy(rule: RateLimitRule, state: RateLimitState): RateLimitResult {
    const allowed = state.remaining > 0;

    if (allowed) {
      state.remaining--;
    }

    return {
      allowed,
      limit: rule.limits.requests,
      remaining: Math.max(0, state.remaining),
      resetTime: state.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((state.resetTime - Date.now()) / 1000),
      headers: {
        'X-RateLimit-Limit': String(rule.limits.requests),
        'X-RateLimit-Remaining': String(Math.max(0, state.remaining)),
        'X-RateLimit-Reset': String(Math.ceil(state.resetTime / 1000)),
      },
    };
  }

  private slidingWindowStrategy(rule: RateLimitRule, state: RateLimitState): RateLimitResult {
    // Simplified sliding window
    return this.fixedWindowStrategy(rule, state);
  }

  private tokenBucketStrategy(
    rule: RateLimitRule,
    state: RateLimitState,
    now: number
  ): RateLimitResult {
    const refillRate = rule.limits.refillRate || rule.limits.requests / rule.limits.window;
    const capacity = rule.limits.burst || rule.limits.requests;

    // Refill tokens
    const timePassed = (now - (state.lastRefill || now)) / 1000;
    state.tokens = Math.min(
      capacity,
      (state.tokens || 0) + timePassed * refillRate
    );
    state.lastRefill = now;

    const allowed = (state.tokens || 0) >= 1;

    if (allowed) {
      state.tokens = (state.tokens || 0) - 1;
    }

    return {
      allowed,
      limit: capacity,
      remaining: Math.floor(state.tokens || 0),
      resetTime: now + (1 / refillRate) * 1000,
      headers: {
        'X-RateLimit-Limit': String(capacity),
        'X-RateLimit-Remaining': String(Math.floor(state.tokens || 0)),
      },
    };
  }

  private leakyBucketStrategy(rule: RateLimitRule, state: RateLimitState): RateLimitResult {
    // Simplified leaky bucket
    return this.fixedWindowStrategy(rule, state);
  }
}

// Predefined rules
export const RATE_LIMIT_RULES = {
  api: {
    name: 'API Rate Limit',
    path: '/api',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    strategy: 'sliding_window' as const,
    limits: { requests: 1000, window: 3600 }, // 1000/hour
    identifiers: ['api_key'] as const,
    responseHeaders: true,
  },
  auth: {
    name: 'Auth Rate Limit',
    path: '/api/auth',
    methods: ['POST'],
    strategy: 'fixed_window' as const,
    limits: { requests: 5, window: 300 }, // 5 attempts per 5 min
    identifiers: ['ip'] as const,
    responseHeaders: true,
  },
  public: {
    name: 'Public API',
    path: '/api/public',
    methods: ['GET'],
    strategy: 'token_bucket' as const,
    limits: { requests: 100, window: 60, burst: 20, refillRate: 2 },
    identifiers: ['ip'] as const,
    responseHeaders: true,
  },
};

// Export singleton
export const rateLimiter = new RateLimiter();

export { RateLimitRule, RateLimitState, RateLimitResult, RateLimitStrategy };

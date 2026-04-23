// Feature Flags & A/B Testing
// Enable/disable features and run experiments

interface FeatureFlag {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'boolean' | 'percentage' | 'targeted' | 'experiment';
  enabled: boolean;
  value: boolean | number | string;
  rules?: Array<{
    type: 'user_id' | 'user_group' | 'percentage' | 'custom';
    operator?: 'equals' | 'contains' | 'starts_with' | 'in';
    value?: string | number | string[];
    result: boolean;
  }>;
  experimentConfig?: {
    variants: Array<{
      name: string;
      value: unknown;
      weight: number;
    }>;
    startDate: Date;
    endDate?: Date;
    goal?: string;
  };
  metadata?: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
  };
}

interface FeatureFlagEvaluation {
  flagId: string;
  flagName: string;
  enabled: boolean;
  value: unknown;
  variant?: string;
  reason: 'default' | 'rule_match' | 'percentage' | 'experiment' | 'forced';
  ruleIndex?: number;
}

interface ExperimentResult {
  experimentId: string;
  flagName: string;
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'stopped';
  variants: Array<{
    name: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    improvement: number;
    confidence: number;
  }>;
  winner?: string;
  recommendation: 'continue' | 'stop' | 'declare_winner';
}

// Feature Flag Manager
export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private evaluations: Map<string, FeatureFlagEvaluation[]> = new Map();

  // Create feature flag
  createFlag(config: Omit<FeatureFlag, 'id'>): FeatureFlag {
    const flag: FeatureFlag = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.flags.set(flag.id, flag);
    return flag;
  }

  // Evaluate flag for user
  evaluate(
    flagId: string,
    context: {
      userId?: string;
      userGroup?: string;
      userAttributes?: Record<string, unknown>;
    }
  ): FeatureFlagEvaluation {
    const flag = this.flags.get(flagId);
    if (!flag) {
      return {
        flagId,
        flagName: 'unknown',
        enabled: false,
        value: false,
        reason: 'default',
      };
    }

    // Check rules first
    if (flag.rules && flag.rules.length > 0) {
      for (let i = 0; i < flag.rules.length; i++) {
        const rule = flag.rules[i];
        const matches = this.evaluateRule(rule, context);
        
        if (matches) {
          return {
            flagId,
            flagName: flag.name,
            enabled: rule.result,
            value: flag.value,
            reason: 'rule_match',
            ruleIndex: i,
          };
        }
      }
    }

    // Check percentage rollout
    if (flag.type === 'percentage' && typeof flag.value === 'number') {
      const userHash = this.hashUser(context.userId || 'anonymous');
      const enabled = userHash <= flag.value;
      
      return {
        flagId,
        flagName: flag.name,
        enabled,
        value: enabled,
        reason: 'percentage',
      };
    }

    // Check experiment
    if (flag.type === 'experiment' && flag.experimentConfig) {
      return this.evaluateExperiment(flag, context);
    }

    // Default
    return {
      flagId,
      flagName: flag.name,
      enabled: flag.enabled,
      value: flag.value,
      reason: 'default',
    };
  }

  // Evaluate flag by name
  evaluateByName(
    tenantId: string,
    flagName: string,
    context: {
      userId?: string;
      userGroup?: string;
      userAttributes?: Record<string, unknown>;
    }
  ): FeatureFlagEvaluation {
    const flag = this.getFlagByName(tenantId, flagName);
    if (!flag) {
      return {
        flagId: 'not_found',
        flagName,
        enabled: false,
        value: false,
        reason: 'default',
      };
    }

    return this.evaluate(flag.id, context);
  }

  // Evaluate multiple flags
  evaluateAll(
    tenantId: string,
    flagNames: string[],
    context: {
      userId?: string;
      userGroup?: string;
      userAttributes?: Record<string, unknown>;
    }
  ): Record<string, FeatureFlagEvaluation> {
    const results: Record<string, FeatureFlagEvaluation> = {};
    
    for (const name of flagNames) {
      results[name] = this.evaluateByName(tenantId, name, context);
    }

    return results;
  }

  // Update flag
  updateFlag(flagId: string, updates: Partial<FeatureFlag>): FeatureFlag {
    const flag = this.flags.get(flagId);
    if (!flag) throw new Error('Flag not found');

    Object.assign(flag, updates, {
      metadata: {
        ...flag.metadata,
        updatedAt: new Date(),
      },
    });

    return flag;
  }

  // Toggle flag
  toggle(flagId: string): FeatureFlag {
    const flag = this.flags.get(flagId);
    if (!flag) throw new Error('Flag not found');

    flag.enabled = !flag.enabled;
    if (flag.metadata) {
      flag.metadata.updatedAt = new Date();
    }

    return flag;
  }

  // Delete flag
  deleteFlag(flagId: string): void {
    this.flags.delete(flagId);
  }

  // Get flag by name
  getFlagByName(tenantId: string, name: string): FeatureFlag | null {
    return Array.from(this.flags.values()).find(
      f => f.tenantId === tenantId && f.name === name
    ) || null;
  }

  // List flags for tenant
  listFlags(tenantId: string): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(f => f.tenantId === tenantId);
  }

  // Get experiment results
  getExperimentResults(flagId: string): ExperimentResult | null {
    const flag = this.flags.get(flagId);
    if (!flag || flag.type !== 'experiment' || !flag.experimentConfig) {
      return null;
    }

    // Would calculate from actual data
    const mockResult: ExperimentResult = {
      experimentId: flagId,
      flagName: flag.name,
      startDate: flag.experimentConfig.startDate,
      endDate: flag.experimentConfig.endDate,
      status: flag.enabled ? 'running' : 'stopped',
      variants: flag.experimentConfig.variants.map(v => ({
        name: v.name,
        participants: Math.floor(Math.random() * 1000) + 500,
        conversions: Math.floor(Math.random() * 100) + 50,
        conversionRate: 0,
        improvement: 0,
        confidence: 0,
      })),
    };

    // Calculate rates
    mockResult.variants.forEach(v => {
      v.conversionRate = (v.conversions / v.participants) * 100;
    });

    // Find control and calculate improvements
    const control = mockResult.variants[0];
    mockResult.variants.slice(1).forEach(v => {
      v.improvement = ((v.conversionRate - control.conversionRate) / control.conversionRate) * 100;
    });

    return mockResult;
  }

  // Record event for experiment
  recordEvent(
    flagId: string,
    variant: string,
    event: {
      userId: string;
      eventName: string;
      value?: number;
      metadata?: Record<string, unknown>;
    }
  ): void {
    // Would persist to analytics
    console.log(`Experiment ${flagId}, variant ${variant}: ${event.eventName}`);
  }

  // Get feature usage stats
  getStats(tenantId: string, flagName: string): {
    totalEvaluations: number;
    enabledCount: number;
    disabledCount: number;
    byUser: Record<string, number>;
  } {
    const evaluations = this.evaluations.get(`${tenantId}:${flagName}`) || [];
    
    const enabled = evaluations.filter(e => e.enabled).length;
    
    const byUser: Record<string, number> = {};
    for (const eval_ of evaluations) {
      // Would track by user
    }

    return {
      totalEvaluations: evaluations.length,
      enabledCount: enabled,
      disabledCount: evaluations.length - enabled,
      byUser,
    };
  }

  // Private methods
  private evaluateRule(
    rule: FeatureFlag['rules'][0],
    context: { userId?: string; userGroup?: string; userAttributes?: Record<string, unknown> }
  ): boolean {
    let valueToCheck: unknown;

    switch (rule.type) {
      case 'user_id':
        valueToCheck = context.userId;
        break;
      case 'user_group':
        valueToCheck = context.userGroup;
        break;
      case 'custom':
        valueToCheck = context.userAttributes?.[rule.value as string];
        break;
      case 'percentage':
        const hash = this.hashUser(context.userId || 'anonymous');
        return hash <= (rule.value as number);
      default:
        return false;
    }

    switch (rule.operator) {
      case 'equals':
        return valueToCheck === rule.value;
      case 'contains':
        return String(valueToCheck).includes(String(rule.value));
      case 'starts_with':
        return String(valueToCheck).startsWith(String(rule.value));
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(String(valueToCheck));
      default:
        return valueToCheck === rule.value;
    }
  }

  private evaluateExperiment(
    flag: FeatureFlag,
    context: { userId?: string }
  ): FeatureFlagEvaluation {
    const config = flag.experimentConfig!;
    const userHash = this.hashUser(context.userId || 'anonymous');

    // Select variant based on weight
    let cumulativeWeight = 0;
    let selectedVariant = config.variants[0];

    for (const variant of config.variants) {
      cumulativeWeight += variant.weight;
      if (userHash <= cumulativeWeight) {
        selectedVariant = variant;
        break;
      }
    }

    return {
      flagId: flag.id,
      flagName: flag.name,
      enabled: flag.enabled,
      value: selectedVariant.value,
      variant: selectedVariant.name,
      reason: 'experiment',
    };
  }

  private hashUser(userId: string): number {
    // Simple hash function (0-100)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 101;
  }
}

// A/B Test Manager
export class ABTestManager {
  constructor(private flagManager: FeatureFlagManager) {}

  createExperiment(config: {
    tenantId: string;
    name: string;
    description: string;
    variants: Array<{ name: string; value: unknown; weight: number }>;
    audience?: {
      percentage?: number;
      userGroups?: string[];
    };
    goal: string;
    duration: number; // days
  }): FeatureFlag {
    return this.flagManager.createFlag({
      tenantId: config.tenantId,
      name: config.name,
      description: config.description,
      type: 'experiment',
      enabled: true,
      value: true,
      experimentConfig: {
        variants: config.variants,
        startDate: new Date(),
        endDate: new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000),
        goal: config.goal,
      },
      rules: config.audience ? [
        ...(config.audience.percentage ? [{
          type: 'percentage' as const,
          value: config.audience.percentage,
          result: true,
        }] : []),
        ...(config.audience.userGroups ? config.audience.userGroups.map(g => ({
          type: 'user_group' as const,
          operator: 'equals' as const,
          value: g,
          result: true,
        })) : []),
      ] : undefined,
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  stopExperiment(flagId: string, winner?: string): void {
    const flag = this.flagManager['flags'].get(flagId);
    if (flag) {
      flag.enabled = false;
      
      if (winner && flag.experimentConfig) {
        const winningVariant = flag.experimentConfig.variants.find(v => v.name === winner);
        if (winningVariant) {
          // Convert to regular flag with winning value
          flag.type = 'boolean';
          flag.value = winningVariant.value as boolean;
          flag.experimentConfig = undefined;
        }
      }
    }
  }
}

// Predefined feature flags
export const DEFAULT_FEATURE_FLAGS: Array<Omit<FeatureFlag, 'id' | 'tenantId'>> = [
  {
    name: 'new_dashboard',
    description: 'Enable new dashboard UI',
    type: 'percentage',
    enabled: true,
    value: 10, // 10% rollout
  },
  {
    name: 'advanced_analytics',
    description: 'Enable advanced analytics features',
    type: 'targeted',
    enabled: false,
    value: false,
    rules: [
      {
        type: 'user_group',
        operator: 'equals',
        value: 'premium',
        result: true,
      },
    ],
  },
  {
    name: 'beta_feature',
    description: 'Beta feature for testing',
    type: 'experiment',
    enabled: true,
    value: true,
    experimentConfig: {
      variants: [
        { name: 'control', value: false, weight: 50 },
        { name: 'treatment', value: true, weight: 50 },
      ],
      startDate: new Date(),
      goal: 'user_engagement',
    },
  },
];

// Export singleton
export const featureFlagManager = new FeatureFlagManager();
export const abTestManager = new ABTestManager(featureFlagManager);

export { FeatureFlag, FeatureFlagEvaluation, ExperimentResult };

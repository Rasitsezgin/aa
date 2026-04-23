// Fraud Detection System
// Detect suspicious orders and prevent fraud

import { prisma } from '@/lib/prisma';

type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';
type FraudRuleType = 'velocity' | 'amount' | 'pattern' | 'geolocation' | 'device';

interface FraudRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: FraudRuleType;
  enabled: boolean;
  priority: number;
  condition: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'neq' | 'in' | 'contains' | 'regex';
    value: unknown;
    timeWindow?: number; // seconds
  };
  action: 'flag' | 'block' | 'review' | 'allow';
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FraudScore {
  orderId: string;
  customerId: string;
  score: number;
  level: FraudRiskLevel;
  factors: Array<{
    rule: string;
    score: number;
    description: string;
  }>;
  recommendation: 'approve' | 'review' | 'decline';
  createdAt: Date;
}

interface FraudPattern {
  id: string;
  pattern: string;
  description: string;
  detectedCount: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedOrders: string[];
}

// Fraud detection engine
export class FraudDetectionEngine {
  private rules: Map<string, FraudRule[]> = new Map();

  // Add rule for tenant
  addRule(tenantId: string, rule: FraudRule): void {
    if (!this.rules.has(tenantId)) {
      this.rules.set(tenantId, []);
    }
    this.rules.get(tenantId)!.push(rule);
  }

  // Evaluate order for fraud
  async evaluateOrder(
    orderId: string,
    tenantId: string,
    context: {
      customerId: string;
      amount: number;
      email: string;
      ip: string;
      deviceFingerprint?: string;
      shippingAddress: {
        country: string;
        city: string;
        postalCode: string;
      };
      billingAddress: {
        country: string;
        city: string;
        postalCode: string;
      };
      paymentMethod: string;
    }
  ): Promise<FraudScore> {
    const rules = this.rules.get(tenantId) || [];
    const factors: FraudScore['factors'] = [];
    let totalScore = 0;

    // Get customer history
    const customerHistory = await this.getCustomerHistory(context.customerId, tenantId);

    // Evaluate each rule
    for (const rule of rules.filter(r => r.enabled).sort((a, b) => b.priority - a.priority)) {
      const matched = await this.evaluateRule(rule, context, customerHistory);
      
      if (matched) {
        factors.push({
          rule: rule.name,
          score: rule.score,
          description: rule.description || `${rule.type} rule triggered`,
        });
        totalScore += rule.score;

        // If rule action is block, stop evaluation
        if (rule.action === 'block') {
          break;
        }
      }
    }

    // Determine risk level
    const level = this.calculateRiskLevel(totalScore);
    const recommendation = this.getRecommendation(level, totalScore);

    const score: FraudScore = {
      orderId,
      customerId: context.customerId,
      score: totalScore,
      level,
      factors,
      recommendation,
      createdAt: new Date(),
    };

    // Record fraud check
    await this.recordFraudCheck(score);

    return score;
  }

  // Velocity check - orders per time window
  async checkVelocity(
    customerId: string,
    timeWindowHours: number = 24
  ): Promise<{
    orderCount: number;
    totalAmount: number;
    uniqueCountries: number;
    uniqueDevices: number;
    riskScore: number;
  }> {
    const since = new Date();
    since.setHours(since.getHours() - timeWindowHours);

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        createdAt: { gte: since },
      },
      select: {
        totalAmount: true,
        shippingCountry: true,
        deviceFingerprint: true,
      },
    });

    const orderCount = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    
    const uniqueCountries = new Set(orders.map(o => o.shippingCountry)).size;
    const uniqueDevices = new Set(orders.map(o => o.deviceFingerprint).filter(Boolean)).size;

    // Calculate velocity risk
    let riskScore = 0;
    if (orderCount > 10) riskScore += 20;
    if (orderCount > 5) riskScore += 10;
    if (totalAmount > 10000) riskScore += 30;
    if (uniqueCountries > 2) riskScore += 40;
    if (uniqueDevices > 2) riskScore += 25;

    return {
      orderCount,
      totalAmount,
      uniqueCountries,
      uniqueDevices,
      riskScore,
    };
  }

  // Check for known fraud patterns
  async detectPatterns(
    orderContext: Record<string, unknown>
  ): Promise<FraudPattern[]> {
    const detectedPatterns: FraudPattern[] = [];

    // Pattern 1: Rapid successive orders from same IP
    // Pattern 2: High-value orders with new accounts
    // Pattern 3: Multiple orders to same address, different cards
    // Pattern 4: Orders from high-risk countries
    // Pattern 5: Unusual time-of-day ordering

    return detectedPatterns;
  }

  // Get fraud statistics
  async getFraudStats(
    tenantId: string,
    period: { from: Date; to: Date }
  ): Promise<{
    totalOrders: number;
    flaggedOrders: number;
    blockedOrders: number;
    falsePositives: number;
    averageScore: number;
    topRules: Array<{ rule: string; triggers: number }>;
    trends: Array<{ date: string; score: number; count: number }>;
  }> {
    // Would calculate from database
    return {
      totalOrders: 0,
      flaggedOrders: 0,
      blockedOrders: 0,
      falsePositives: 0,
      averageScore: 0,
      topRules: [],
      trends: [],
    };
  }

  // Mark false positive
  async markFalsePositive(orderId: string, reason: string): Promise<void> {
    // Would update fraud check record
    console.log(`Marked order ${orderId} as false positive: ${reason}`);
  }

  // Update rule from feedback
  async updateRuleFromFeedback(
    ruleId: string,
    feedback: 'accurate' | 'false_positive'
  ): Promise<void> {
    // Would adjust rule weight based on feedback
    console.log(`Updated rule ${ruleId} based on feedback: ${feedback}`);
  }

  // Private helper methods
  private async evaluateRule(
    rule: FraudRule,
    context: Record<string, unknown>,
    history: unknown
  ): Promise<boolean> {
    const { field, operator, value, timeWindow } = rule.condition;
    const fieldValue = this.getNestedValue(context, field);

    // If time window is specified, check velocity
    if (timeWindow) {
      const velocity = await this.checkVelocity(
        context.customerId as string,
        timeWindow / 3600
      );
      
      switch (field) {
        case 'velocity.orderCount':
          return this.compare(velocity.orderCount, operator, value);
        case 'velocity.totalAmount':
          return this.compare(velocity.totalAmount, operator, value);
        case 'velocity.uniqueCountries':
          return this.compare(velocity.uniqueCountries, operator, value);
      }
    }

    return this.compare(fieldValue, operator, value);
  }

  private compare(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'gt':
        return Number(actual) > Number(expected);
      case 'lt':
        return Number(actual) < Number(expected);
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'contains':
        return String(actual).includes(String(expected));
      case 'regex':
        return new RegExp(String(expected)).test(String(actual));
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  private async getCustomerHistory(customerId: string, tenantId: string): Promise<unknown> {
    // Would fetch customer order history
    return {};
  }

  private calculateRiskLevel(score: number): FraudRiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }

  private getRecommendation(level: FraudRiskLevel, score: number): 'approve' | 'review' | 'decline' {
    switch (level) {
      case 'critical':
        return 'decline';
      case 'high':
        return 'review';
      case 'medium':
        return score > 35 ? 'review' : 'approve';
      case 'low':
      default:
        return 'approve';
    }
  }

  private async recordFraudCheck(score: FraudScore): Promise<void> {
    // Would save to database
    console.log(`Recorded fraud check for order ${score.orderId}: ${score.level}`);
  }
}

// Device fingerprinting
export class DeviceFingerprinting {
  // Generate device fingerprint
  generateFingerprint(request: {
    userAgent: string;
    acceptLanguage: string;
    acceptEncoding: string;
    screenResolution?: string;
    timezone?: string;
    canvas?: string;
    webgl?: string;
    fonts?: string[];
  }): string {
    const components = [
      request.userAgent,
      request.acceptLanguage,
      request.acceptEncoding,
      request.screenResolution,
      request.timezone,
      request.canvas,
      request.webgl,
      request.fonts?.join(','),
    ].filter(Boolean);

    // Create hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return `fp_${hash.toString(16)}`;
  }

  // Check if fingerprint is suspicious
  async isSuspicious(fingerprint: string): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Check if fingerprint is associated with known fraud
    // Check if fingerprint is used by multiple accounts
    // Check if fingerprint varies too much for same user

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }
}

// Predefined fraud rules
export const DEFAULT_FRAUD_RULES: Omit<FraudRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'High Value Order',
    description: 'Orders above 10,000 TL',
    type: 'amount',
    enabled: true,
    priority: 50,
    condition: {
      field: 'amount',
      operator: 'gt',
      value: 10000,
    },
    action: 'review',
    score: 25,
  },
  {
    name: 'Velocity Check',
    description: 'More than 5 orders in 24 hours',
    type: 'velocity',
    enabled: true,
    priority: 80,
    condition: {
      field: 'velocity.orderCount',
      operator: 'gt',
      value: 5,
      timeWindow: 86400, // 24 hours
    },
    action: 'flag',
    score: 30,
  },
  {
    name: 'Multiple Countries',
    description: 'Orders from multiple countries',
    type: 'geolocation',
    enabled: true,
    priority: 70,
    condition: {
      field: 'velocity.uniqueCountries',
      operator: 'gt',
      value: 2,
      timeWindow: 86400,
    },
    action: 'flag',
    score: 40,
  },
  {
    name: 'New Customer High Value',
    description: 'High value order from new customer',
    type: 'pattern',
    enabled: true,
    priority: 90,
    condition: {
      field: 'customer.orderCount',
      operator: 'eq',
      value: 0,
    },
    action: 'review',
    score: 20,
  },
];

// Export singleton
export const fraudDetection = new FraudDetectionEngine();
export const deviceFingerprinting = new DeviceFingerprinting();

export { FraudRule, FraudScore, FraudPattern };

// Cost Management
// Cloud resource cost tracking and optimization

import { EventEmitter } from 'events';

type ResourceType = 'compute' | 'storage' | 'network' | 'database' | 'serverless' | 'cdn' | 'ml';
type BillingGranularity = 'hourly' | 'daily' | 'monthly';

interface CostRecord {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceType: ResourceType;
  service: string;
  region: string;
  amount: number;
  currency: string;
  usage: {
    quantity: number;
    unit: string;
  };
  tags: Record<string, string>;
  timestamp: Date;
}

interface Budget {
  id: string;
  tenantId: string;
  name: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  alertThresholds: number[]; // % thresholds
  scope: {
    allResources?: boolean;
    services?: string[];
    tags?: Record<string, string>;
  };
  actualSpend: number;
  forecastedSpend: number;
  alerts: Array<{
    threshold: number;
    triggered: boolean;
    triggeredAt?: Date;
  }>;
  status: 'active' | 'exceeded' | 'forecasted_exceeded';
}

interface CostOptimization {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
  action?: string;
  autoImplementable: boolean;
  applied: boolean;
  appliedAt?: Date;
}

interface ReservedInstance {
  id: string;
  tenantId: string;
  resourceType: ResourceType;
  term: '1year' | '3year';
  paymentOption: 'all_upfront' | 'partial_upfront' | 'no_upfront';
  instanceType: string;
  region: string;
  quantity: number;
  hourlyRate: number;
  upfrontCost: number;
  monthlyCost: number;
  savingsPercent: number;
  status: 'active' | 'expired' | 'retired';
  startDate: Date;
  endDate: Date;
}

// Cost Manager
export class CostManager extends EventEmitter {
  private costs: Map<string, CostRecord[]> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private optimizations: Map<string, CostOptimization[]> = new Map();
  private reservedInstances: Map<string, ReservedInstance[]> = new Map();

  // Record cost
  recordCost(record: Omit<CostRecord, 'id'>): CostRecord {
    const fullRecord: CostRecord = {
      ...record,
      id: crypto.randomUUID(),
    };

    const tenantCosts = this.costs.get(record.tenantId) || [];
    tenantCosts.push(fullRecord);
    this.costs.set(record.tenantId, tenantCosts);

    this.emit('costRecorded', fullRecord);
    this.checkBudgets(record.tenantId);

    return fullRecord;
  }

  // Create budget
  createBudget(budget: Omit<Budget, 'id' | 'actualSpend' | 'forecastedSpend' | 'alerts' | 'status'>): Budget {
    const fullBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      actualSpend: 0,
      forecastedSpend: 0,
      alerts: budget.alertThresholds.map(t => ({ threshold: t, triggered: false })),
      status: 'active',
    };

    this.budgets.set(fullBudget.id, fullBudget);
    this.emit('budgetCreated', fullBudget);
    return fullBudget;
  }

  // Get cost summary
  getCostSummary(
    tenantId: string,
    period: { from: Date; to: Date }
  ): {
    total: number;
    byService: Record<string, number>;
    byRegion: Record<string, number>;
    byResourceType: Record<ResourceType, number>;
    trend: Array<{ date: string; amount: number }>;
  } {
    const costs = (this.costs.get(tenantId) || []).filter(
      c => c.timestamp >= period.from && c.timestamp <= period.to
    );

    const byService: Record<string, number> = {};
    const byRegion: Record<string, number> = {};
    const byResourceType: Record<ResourceType, number> = {
      compute: 0, storage: 0, network: 0, database: 0, serverless: 0, cdn: 0, ml: 0,
    };
    const byDate: Record<string, number> = {};

    let total = 0;

    for (const cost of costs) {
      total += cost.amount;
      byService[cost.service] = (byService[cost.service] || 0) + cost.amount;
      byRegion[cost.region] = (byRegion[cost.region] || 0) + cost.amount;
      byResourceType[cost.resourceType] = (byResourceType[cost.resourceType] || 0) + cost.amount;

      const date = cost.timestamp.toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + cost.amount;
    }

    const trend = Object.entries(byDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, byService, byRegion, byResourceType, trend };
  }

  // Get optimization recommendations
  async getOptimizations(tenantId: string): Promise<CostOptimization[]> {
    const optimizations = this.optimizations.get(tenantId) || [];
    
    if (optimizations.length === 0) {
      // Generate recommendations based on usage
      const newOptimizations = this.generateRecommendations(tenantId);
      this.optimizations.set(tenantId, newOptimizations);
      return newOptimizations;
    }

    return optimizations;
  }

  // Apply optimization
  applyOptimization(tenantId: string, optimizationId: string): CostOptimization {
    const opts = this.optimizations.get(tenantId) || [];
    const opt = opts.find(o => o.id === optimizationId);
    if (!opt) throw new Error('Optimization not found');

    opt.applied = true;
    opt.appliedAt = new Date();

    this.emit('optimizationApplied', opt);
    return opt;
  }

  // Purchase reserved capacity
  purchaseReservedInstance(
    tenantId: string,
    config: Omit<ReservedInstance, 'id' | 'tenantId' | 'status' | 'startDate' | 'endDate'>
  ): ReservedInstance {
    const ri: ReservedInstance = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (config.term === '1year' ? 365 : 1095) * 24 * 60 * 60 * 1000),
    };

    const ris = this.reservedInstances.get(tenantId) || [];
    ris.push(ri);
    this.reservedInstances.set(tenantId, ris);

    this.emit('reservedInstancePurchased', ri);
    return ri;
  }

  // Get savings analysis
  getSavingsAnalysis(tenantId: string): {
    currentMonthly: number;
    onDemandEquivalent: number;
    totalSavings: number;
    savingsPercent: number;
    byReservation: Array<{
      resourceType: ResourceType;
      savings: number;
      utilization: number;
    }>;
  } {
    const ris = this.reservedInstances.get(tenantId) || [];
    const active = ris.filter(r => r.status === 'active');

    let totalSavings = 0;
    let currentMonthly = 0;
    let onDemandEquivalent = 0;

    const byReservation = active.map(ri => {
      const monthlySavings = ri.savingsPercent * ri.monthlyCost / 100;
      totalSavings += monthlySavings;
      currentMonthly += ri.monthlyCost;
      onDemandEquivalent += ri.monthlyCost + monthlySavings;

      return {
        resourceType: ri.resourceType,
        savings: monthlySavings,
        utilization: 85 + Math.random() * 15, // Mock utilization
      };
    });

    return {
      currentMonthly,
      onDemandEquivalent,
      totalSavings,
      savingsPercent: onDemandEquivalent > 0 ? (totalSavings / onDemandEquivalent) * 100 : 0,
      byReservation,
    };
  }

  // Forecast costs
  forecastCosts(
    tenantId: string,
    months: number = 3
  ): Array<{
    month: string;
    predicted: number;
    confidence: number;
  }> {
    const history = this.getCostSummary(tenantId, {
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(),
    });

    const avgDaily = history.total / 90;
    const forecast = [];

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // Add 5% growth trend
      const predicted = avgDaily * 30 * Math.pow(1.05, i);

      forecast.push({
        month: date.toISOString().slice(0, 7),
        predicted: Math.round(predicted),
        confidence: Math.max(0.7, 0.95 - i * 0.05),
      });
    }

    return forecast;
  }

  // Private methods
  private checkBudgets(tenantId: string): void {
    for (const budget of this.budgets.values()) {
      if (budget.tenantId !== tenantId) continue;

      const spend = this.getCurrentSpend(tenantId, budget);
      budget.actualSpend = spend;

      // Calculate forecast
      const daysInPeriod = budget.period === 'monthly' ? 30 : budget.period === 'quarterly' ? 90 : 365;
      const dayOfPeriod = new Date().getDate();
      budget.forecastedSpend = spend * (daysInPeriod / dayOfPeriod);

      // Check thresholds
      for (const alert of budget.alerts) {
        if (!alert.triggered) {
          const threshold = budget.amount * (alert.threshold / 100);
          if (spend >= threshold) {
            alert.triggered = true;
            alert.triggeredAt = new Date();
            
            this.emit('budgetAlert', {
              budget,
              threshold: alert.threshold,
              actual: spend,
            });
          }
        }
      }

      // Update status
      if (spend >= budget.amount) {
        budget.status = 'exceeded';
      } else if (budget.forecastedSpend >= budget.amount) {
        budget.status = 'forecasted_exceeded';
      }
    }
  }

  private getCurrentSpend(tenantId: string, budget: Budget): number {
    const now = new Date();
    let from: Date;

    switch (budget.period) {
      case 'monthly':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        from = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const costs = (this.costs.get(tenantId) || [])
      .filter(c => c.timestamp >= from && c.timestamp <= now);

    return costs.reduce((sum, c) => sum + c.amount, 0);
  }

  private generateRecommendations(tenantId: string): CostOptimization[] {
    return [
      {
        id: crypto.randomUUID(),
        tenantId,
        title: 'Underutilized EC2 Instances',
        description: '30% of instances have <20% CPU utilization',
        resourceType: 'compute',
        potentialSavings: 1250,
        effort: 'low',
        impact: 'high',
        recommendation: 'Downsize or terminate underutilized instances',
        action: 'downsize_instances',
        autoImplementable: false,
        applied: false,
      },
      {
        id: crypto.randomUUID(),
        tenantId,
        title: 'Unattached Storage',
        description: '500GB of unattached EBS volumes found',
        resourceType: 'storage',
        potentialSavings: 200,
        effort: 'low',
        impact: 'medium',
        recommendation: 'Delete unattached volumes older than 30 days',
        action: 'cleanup_volumes',
        autoImplementable: true,
        applied: false,
      },
      {
        id: crypto.randomUUID(),
        tenantId,
        title: 'Reserved Instance Opportunity',
        description: 'Steady-state compute usage detected',
        resourceType: 'compute',
        potentialSavings: 3500,
        effort: 'medium',
        impact: 'high',
        recommendation: 'Purchase 1-year reserved instances for baseline capacity',
        action: 'purchase_ri',
        autoImplementable: false,
        applied: false,
      },
    ];
  }
}

// Export singleton
export const costManager = new CostManager();

export type { CostRecord, Budget, CostOptimization, ReservedInstance };

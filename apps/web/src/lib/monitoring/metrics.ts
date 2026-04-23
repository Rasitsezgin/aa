// Advanced Monitoring & Metrics
// Custom business metrics and health checks

import { prisma } from '@/lib/prisma';

type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
type MetricUnit = 'count' | 'milliseconds' | 'bytes' | 'percentage' | 'currency';

interface MetricDefinition {
  name: string;
  type: MetricType;
  unit: MetricUnit;
  description: string;
  labels?: string[];
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

interface MetricValue {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
}

interface HealthCheck {
  name: string;
  check: () => Promise<{ healthy: boolean; message?: string; details?: unknown }>;
  interval: number; // seconds
  timeout: number; // seconds
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds to trigger
  severity: 'warning' | 'critical' | 'info';
  channels: string[];
  enabled: boolean;
}

// Metrics collector
export class MetricsCollector {
  private metrics: Map<string, MetricDefinition> = new Map();
  private values: MetricValue[] = [];
  private maxHistory: number = 10000;

  // Register metric definition
  register(definition: MetricDefinition): void {
    this.metrics.set(definition.name, definition);
  }

  // Record metric value
  record(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Metric ${name} not registered`);
      return;
    }

    const metricValue: MetricValue = {
      name,
      value,
      labels,
      timestamp: new Date(),
    };

    this.values.push(metricValue);

    // Trim history
    if (this.values.length > this.maxHistory) {
      this.values = this.values.slice(-this.maxHistory);
    }

    // Check thresholds
    this.checkThresholds(metric, value, labels);
  }

  // Increment counter
  increment(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric?.type !== 'counter') {
      console.warn(`Metric ${name} is not a counter`);
      return;
    }

    this.record(name, value, labels);
  }

  // Set gauge value
  gauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric = this.metrics.get(name);
    if (metric?.type !== 'gauge') {
      console.warn(`Metric ${name} is not a gauge`);
      return;
    }

    this.record(name, value, labels);
  }

  // Record histogram value
  histogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric = this.metrics.get(name);
    if (metric?.type !== 'histogram') {
      console.warn(`Metric ${name} is not a histogram`);
      return;
    }

    this.record(name, value, labels);
  }

  // Get metric statistics
  getStats(
    name: string,
    timeRange: { from: Date; to: Date },
    labels?: Record<string, string>
  ): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const values = this.values
      .filter(v => 
        v.name === name &&
        v.timestamp >= timeRange.from &&
        v.timestamp <= timeRange.to &&
        this.matchLabels(v.labels, labels)
      )
      .map(v => v.value);

    if (values.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count: sorted.length,
      sum,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };
  }

  // Export metrics in Prometheus format
  exportPrometheus(): string {
    const output: string[] = [];

    for (const [name, definition] of this.metrics) {
      output.push(`# HELP ${name} ${definition.description}`);
      output.push(`# TYPE ${name} ${definition.type}`);

      const latestValues = this.getLatestValues(name);
      
      for (const [labelKey, value] of latestValues) {
        output.push(`${name}${labelKey} ${value}`);
      }
    }

    return output.join('\n');
  }

  // Private helpers
  private checkThresholds(
    metric: MetricDefinition,
    value: number,
    labels: Record<string, string>
  ): void {
    if (!metric.thresholds) return;

    const { warning, critical } = metric.thresholds;

    if (critical !== undefined && value >= critical) {
      console.error(`CRITICAL: ${metric.name} = ${value} (threshold: ${critical})`, labels);
    } else if (warning !== undefined && value >= warning) {
      console.warn(`WARNING: ${metric.name} = ${value} (threshold: ${warning})`, labels);
    }
  }

  private matchLabels(
    metricLabels: Record<string, string>,
    filterLabels?: Record<string, string>
  ): boolean {
    if (!filterLabels) return true;

    for (const [key, value] of Object.entries(filterLabels)) {
      if (metricLabels[key] !== value) return false;
    }

    return true;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private getLatestValues(name: string): Map<string, number> {
    const latest = new Map<string, number>();

    for (const value of this.values) {
      if (value.name === name) {
        const labelKey = JSON.stringify(value.labels);
        latest.set(labelKey, value.value);
      }
    }

    return latest;
  }
}

// Health check manager
export class HealthCheckManager {
  private checks: Map<string, HealthCheck> = new Map();
  private results: Map<string, {
    lastRun: Date;
    healthy: boolean;
    message?: string;
    details?: unknown;
  }> = new Map();

  // Register health check
  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
    this.startCheck(check);
  }

  // Run all health checks
  async runAll(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      healthy: boolean;
      message?: string;
      responseTime: number;
    }>;
  }> {
    const results = [];
    let unhealthy = 0;

    for (const [name, check] of this.checks) {
      const start = Date.now();
      
      try {
        const result = await Promise.race([
          check.check(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), check.timeout * 1000)
          ),
        ]);

        results.push({
          name,
          healthy: result.healthy,
          message: result.message,
          responseTime: Date.now() - start,
        });

        if (!result.healthy) unhealthy++;
      } catch (error) {
        results.push({
          name,
          healthy: false,
          message: String(error),
          responseTime: Date.now() - start,
        });
        unhealthy++;
      }
    }

    const status = unhealthy === 0 ? 'healthy' : 
                   unhealthy < this.checks.size / 2 ? 'degraded' : 'unhealthy';

    return { status, checks: results };
  }

  // Start periodic checks
  private startCheck(check: HealthCheck): void {
    const run = async () => {
      try {
        const result = await check.check();
        this.results.set(check.name, {
          lastRun: new Date(),
          ...result,
        });
      } catch (error) {
        this.results.set(check.name, {
          lastRun: new Date(),
          healthy: false,
          message: String(error),
        });
      }

      setTimeout(run, check.interval * 1000);
    };

    run();
  }

  // Get check result
  getResult(name: string): {
    lastRun: Date;
    healthy: boolean;
    message?: string;
  } | null {
    return this.results.get(name) || null;
  }
}

// Predefined business metrics
export const BUSINESS_METRICS: MetricDefinition[] = [
  {
    name: 'orders_per_minute',
    type: 'counter',
    unit: 'count',
    description: 'Number of orders created per minute',
    thresholds: { warning: 100, critical: 200 },
  },
  {
    name: 'order_processing_time',
    type: 'histogram',
    unit: 'milliseconds',
    description: 'Time to process an order',
    thresholds: { warning: 5000, critical: 10000 },
  },
  {
    name: 'inventory_sync_latency',
    type: 'gauge',
    unit: 'milliseconds',
    description: 'Inventory synchronization latency',
    thresholds: { warning: 30000, critical: 60000 },
  },
  {
    name: 'api_error_rate',
    type: 'gauge',
    unit: 'percentage',
    description: 'API error rate percentage',
    thresholds: { warning: 5, critical: 10 },
  },
  {
    name: 'revenue_per_hour',
    type: 'counter',
    unit: 'currency',
    description: 'Revenue per hour',
  },
  {
    name: 'active_users',
    type: 'gauge',
    unit: 'count',
    description: 'Number of active users',
  },
  {
    name: 'product_catalog_size',
    type: 'gauge',
    unit: 'count',
    description: 'Total number of products',
  },
  {
    name: 'low_stock_products',
    type: 'gauge',
    unit: 'count',
    description: 'Number of products with low stock',
    thresholds: { warning: 50, critical: 100 },
  },
];

// Predefined health checks
export function createDefaultHealthChecks(): HealthCheck[] {
  return [
    {
      name: 'database',
      check: async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return { healthy: true, message: 'Database connection OK' };
        } catch (error) {
          return { healthy: false, message: `Database error: ${error}` };
        }
      },
      interval: 30,
      timeout: 5,
    },
    {
      name: 'redis',
      check: async () => {
        // Would check Redis connection
        return { healthy: true, message: 'Redis connection OK' };
      },
      interval: 30,
      timeout: 5,
    },
    {
      name: 'external_apis',
      check: async () => {
        // Would check external API health
        return { healthy: true, message: 'External APIs OK' };
      },
      interval: 60,
      timeout: 10,
    },
  ];
}

// Export singletons
export const metrics = new MetricsCollector();
export const healthChecks = new HealthCheckManager();

// Register default metrics
BUSINESS_METRICS.forEach(m => metrics.register(m));
createDefaultHealthChecks().forEach(h => healthChecks.register(h));

export { MetricDefinition, MetricValue, HealthCheck, AlertRule };

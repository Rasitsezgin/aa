// Performance Profiler
// Application performance monitoring and optimization

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
  children: PerformanceMetric[];
}

interface SlowQuery {
  query: string;
  duration: number;
  timestamp: Date;
  count: number;
  avgDuration: number;
}

interface MemorySnapshot {
  timestamp: Date;
  used: number;
  total: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface PerformanceReport {
  timestamp: Date;
  slowQueries: SlowQuery[];
  memorySnapshots: MemorySnapshot[];
  apiLatency: Array<{ endpoint: string; avg: number; p95: number; p99: number }>;
  recommendations: string[];
}

// Performance profiler
export class PerformanceProfiler {
  private activeSpans: Map<string, PerformanceMetric> = new Map();
  private completedSpans: PerformanceMetric[] = [];
  private slowQueries: SlowQuery[] = [];
  private memorySnapshots: MemorySnapshot[] = [];
  private maxHistory = 1000;

  // Start a performance span
  startSpan(name: string, metadata?: Record<string, unknown>): string {
    const id = crypto.randomUUID();
    const span: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
      children: [],
    };

    this.activeSpans.set(id, span);
    return id;
  }

  // End a performance span
  endSpan(id: string): PerformanceMetric | null {
    const span = this.activeSpans.get(id);
    if (!span) return null;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;

    this.activeSpans.delete(id);
    this.completedSpans.push(span);

    // Trim history
    if (this.completedSpans.length > this.maxHistory) {
      this.completedSpans = this.completedSpans.slice(-this.maxHistory);
    }

    // Log slow spans
    if (span.duration > 1000) {
      console.warn(`Slow operation: ${span.name} took ${span.duration.toFixed(2)}ms`);
    }

    return span;
  }

  // Profile a function execution
  async profile<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    const id = this.startSpan(name, metadata);
    
    try {
      const result = await fn();
      const span = this.endSpan(id);
      
      return {
        result,
        duration: span?.duration || 0,
      };
    } catch (error) {
      this.endSpan(id);
      throw error;
    }
  }

  // Record database query
  recordQuery(query: string, duration: number): void {
    const existing = this.slowQueries.find(q => q.query === query);
    
    if (existing) {
      existing.count++;
      existing.avgDuration = (existing.avgDuration * (existing.count - 1) + duration) / existing.count;
      
      if (duration > existing.duration) {
        existing.duration = duration;
        existing.timestamp = new Date();
      }
    } else {
      this.slowQueries.push({
        query,
        duration,
        timestamp: new Date(),
        count: 1,
        avgDuration: duration,
      });
    }

    // Sort by average duration
    this.slowQueries.sort((a, b) => b.avgDuration - a.avgDuration);
    
    // Keep top 100
    if (this.slowQueries.length > 100) {
      this.slowQueries = this.slowQueries.slice(0, 100);
    }
  }

  // Take memory snapshot
  snapshotMemory(): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      used: process.memoryUsage().rss,
      total: 0,
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
      arrayBuffers: process.memoryUsage().arrayBuffers || 0,
    };

    this.memorySnapshots.push(snapshot);

    // Keep last 100 snapshots
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots = this.memorySnapshots.slice(-100);
    }

    return snapshot;
  }

  // Get performance report
  getReport(timeRange: { from: Date; to: Date } = { from: new Date(0), to: new Date() }): PerformanceReport {
    const slowQueries = this.slowQueries.filter(q => 
      q.timestamp >= timeRange.from && q.timestamp <= timeRange.to
    );

    const memorySnapshots = this.memorySnapshots.filter(s => 
      s.timestamp >= timeRange.from && s.timestamp <= timeRange.to
    );

    const apiLatency = this.calculateAPILatency(timeRange);
    const recommendations = this.generateRecommendations(slowQueries, memorySnapshots);

    return {
      timestamp: new Date(),
      slowQueries,
      memorySnapshots,
      apiLatency,
      recommendations,
    };
  }

  // Get bottleneck analysis
  getBottlenecks(): Array<{
    name: string;
    avgDuration: number;
    maxDuration: number;
    callsPerMinute: number;
    impact: 'high' | 'medium' | 'low';
  }> {
    const grouped = new Map<string, {
      durations: number[];
      count: number;
    }>();

    for (const span of this.completedSpans) {
      const existing = grouped.get(span.name);
      if (existing) {
        existing.durations.push(span.duration || 0);
        existing.count++;
      } else {
        grouped.set(span.name, {
          durations: [span.duration || 0],
          count: 1,
        });
      }
    }

    return Array.from(grouped.entries()).map(([name, data]) => {
      const avg = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      const max = Math.max(...data.durations);
      const callsPerMinute = data.count / 60; // Assuming 1 hour window

      let impact: 'high' | 'medium' | 'low' = 'low';
      if (avg > 1000 || max > 5000) impact = 'high';
      else if (avg > 500 || max > 2000) impact = 'medium';

      return {
        name,
        avgDuration: avg,
        maxDuration: max,
        callsPerMinute,
        impact,
      };
    }).sort((a, b) => b.avgDuration - a.avgDuration);
  }

  // Reset all metrics
  reset(): void {
    this.activeSpans.clear();
    this.completedSpans = [];
    this.slowQueries = [];
    this.memorySnapshots = [];
  }

  // Private helpers
  private calculateAPILatency(timeRange: { from: Date; to: Date }): PerformanceReport['apiLatency'] {
    const apiCalls = new Map<string, number[]>();

    for (const span of this.completedSpans) {
      if (span.name.startsWith('API:')) {
        const endpoint = span.name.replace('API:', '');
        const durations = apiCalls.get(endpoint) || [];
        durations.push(span.duration || 0);
        apiCalls.set(endpoint, durations);
      }
    }

    return Array.from(apiCalls.entries()).map(([endpoint, durations]) => {
      const sorted = [...durations].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      
      return {
        endpoint,
        avg,
        p95: this.percentile(sorted, 0.95),
        p99: this.percentile(sorted, 0.99),
      };
    });
  }

  private generateRecommendations(
    slowQueries: SlowQuery[],
    memorySnapshots: MemorySnapshot[]
  ): string[] {
    const recommendations: string[] = [];

    // Query recommendations
    const verySlowQueries = slowQueries.filter(q => q.avgDuration > 1000);
    if (verySlowQueries.length > 0) {
      recommendations.push(
        `Optimize ${verySlowQueries.length} slow database queries. ` +
        `Worst: "${verySlowQueries[0].query.substring(0, 50)}..." (${verySlowQueries[0].avgDuration.toFixed(0)}ms)`
      );
    }

    // Memory recommendations
    if (memorySnapshots.length > 1) {
      const latest = memorySnapshots[memorySnapshots.length - 1];
      const first = memorySnapshots[0];
      const growth = latest.heapUsed - first.heapUsed;
      
      if (growth > 100 * 1024 * 1024) { // 100MB growth
        recommendations.push(
          `Memory usage increased by ${(growth / 1024 / 1024).toFixed(0)}MB. ` +
          'Check for memory leaks.'
        );
      }
    }

    return recommendations;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }
}

// Query optimizer suggestions
export class QueryOptimizer {
  // Analyze query and suggest optimizations
  analyze(query: string): {
    optimized: string;
    suggestions: string[];
    estimatedImprovement: number;
  } {
    const suggestions: string[] = [];
    
    // Check for SELECT *
    if (query.match(/SELECT\s+\*/i)) {
      suggestions.push('Replace SELECT * with specific columns');
    }

    // Check for missing WHERE
    if (!query.match(/WHERE/i) && query.match(/SELECT/i)) {
      suggestions.push('Add WHERE clause to limit results');
    }

    // Check for N+1 pattern
    if (query.match(/IN\s*\(\s*SELECT/i)) {
      suggestions.push('Consider using JOIN instead of subquery');
    }

    return {
      optimized: query, // Would actually optimize
      suggestions,
      estimatedImprovement: suggestions.length * 15,
    };
  }

  // Suggest indexes
  suggestIndexes(queries: string[]): Array<{
    table: string;
    columns: string[];
    reason: string;
  }> {
    const indexes: Array<{ table: string; columns: string[]; reason: string }> = [];

    for (const query of queries) {
      // Parse WHERE clauses
      const whereMatch = query.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
      if (whereMatch) {
        const columns = this.extractColumns(whereMatch[1]);
        if (columns.length > 0) {
          const table = this.extractTable(query);
          indexes.push({
            table,
            columns,
            reason: `Frequently filtered columns: ${columns.join(', ')}`,
          });
        }
      }
    }

    return indexes;
  }

  private extractColumns(whereClause: string): string[] {
    const columns: string[] = [];
    const matches = whereClause.match(/(\w+)\s*[=<>]/g);
    if (matches) {
      matches.forEach(m => {
        const col = m.replace(/\s*[=<>]/, '');
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
    }
    return columns;
  }

  private extractTable(query: string): string {
    const match = query.match(/FROM\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }
}

// Memory leak detector
export class MemoryLeakDetector {
  private snapshots: Array<{ timestamp: Date; usage: NodeJS.MemoryUsage }> = [];
  private maxSnapshots = 50;

  takeSnapshot(): void {
    this.snapshots.push({
      timestamp: new Date(),
      usage: process.memoryUsage(),
    });

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  detectLeaks(): Array<{
    type: 'heap' | 'external' | 'rss';
    growthRate: number;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }> {
    if (this.snapshots.length < 10) return [];

    const leaks = [];
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const duration = (last.timestamp.getTime() - first.timestamp.getTime()) / 1000 / 60; // minutes

    // Check heap growth
    const heapGrowth = last.usage.heapUsed - first.usage.heapUsed;
    const heapGrowthRate = heapGrowth / duration;

    if (heapGrowthRate > 10 * 1024 * 1024) { // 10MB per minute
      leaks.push({
        type: 'heap',
        growthRate: heapGrowthRate,
        severity: heapGrowthRate > 50 * 1024 * 1024 ? 'critical' : 'warning',
        message: `Heap growing at ${(heapGrowthRate / 1024 / 1024).toFixed(1)}MB/min`,
      });
    }

    return leaks;
  }
}

// Export singleton
export const profiler = new PerformanceProfiler();
export const queryOptimizer = new QueryOptimizer();
export const leakDetector = new MemoryLeakDetector();

export { PerformanceMetric, SlowQuery, MemorySnapshot, PerformanceReport };

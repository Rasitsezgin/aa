// Log Aggregator
// Centralized logging with search and analysis

import { EventEmitter } from 'events';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type LogSource = 'application' | 'system' | 'audit' | 'security' | 'access';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: LogSource;
  service: string;
  tenantId: string;
  message: string;
  context: {
    requestId?: string;
    userId?: string;
    sessionId?: string;
    traceId?: string;
    spanId?: string;
  };
  metadata: {
    host: string;
    environment: string;
    version: string;
    region: string;
  };
  fields: Record<string, unknown>;
  tags: string[];
}

interface LogStream {
  id: string;
  name: string;
  tenantId: string;
  sourceFilter?: LogSource[];
  levelFilter?: LogLevel;
  serviceFilter?: string[];
  retention: number; // days
  indexPattern: string;
  storageSize: number;
  eventCount: number;
}

interface LogQuery {
  query: string;
  filters: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in' | 'exists';
    value?: unknown;
  }>;
  timeRange: {
    from: Date;
    to: Date;
  };
  aggregation?: {
    groupBy: string;
    metric: 'count' | 'avg' | 'sum' | 'min' | 'max';
    field?: string;
  };
}

interface LogAlert {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  query: string;
  condition: {
    type: 'threshold' | 'anomaly' | 'missing';
    operator: 'gt' | 'lt' | 'eq';
    value: number;
    duration: number; // minutes
  };
  actions: Array<{
    type: 'email' | 'slack' | 'webhook' | 'pagerduty';
    target: string;
  }>;
  enabled: boolean;
  lastTriggered?: Date;
}

// Log Aggregator
export class LogAggregator extends EventEmitter {
  private logs: Map<string, LogEntry[]> = new Map();
  private streams: Map<string, LogStream> = new Map();
  private alerts: Map<string, LogAlert> = new Map();

  // Ingest log
  ingest(entry: Omit<LogEntry, 'id'>): LogEntry {
    const fullEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    const tenantLogs = this.logs.get(entry.tenantId) || [];
    tenantLogs.push(fullEntry);
    this.logs.set(entry.tenantId, tenantLogs.slice(-100000)); // Keep last 100k

    // Update stream stats
    for (const stream of this.streams.values()) {
      if (this.matchesStream(fullEntry, stream)) {
        stream.eventCount++;
        stream.storageSize += JSON.stringify(fullEntry).length;
      }
    }

    this.emit('logIngested', fullEntry);
    this.checkAlerts(fullEntry);

    return fullEntry;
  }

  // Batch ingest
  ingestBatch(entries: Omit<LogEntry, 'id'>[]): LogEntry[] {
    return entries.map(e => this.ingest(e));
  }

  // Create log stream
  createStream(stream: Omit<LogStream, 'id' | 'storageSize' | 'eventCount'>): LogStream {
    const fullStream: LogStream = {
      ...stream,
      id: crypto.randomUUID(),
      storageSize: 0,
      eventCount: 0,
    };

    this.streams.set(fullStream.id, fullStream);
    this.emit('streamCreated', fullStream);
    return fullStream;
  }

  // Search logs
  search(tenantId: string, query: LogQuery): {
    hits: LogEntry[];
    total: number;
    took: number;
    aggregations?: Record<string, unknown>;
  } {
    const startTime = Date.now();
    
    let logs = (this.logs.get(tenantId) || []).filter(log =>
      log.timestamp >= query.timeRange.from &&
      log.timestamp <= query.timeRange.to
    );

    // Apply text query
    if (query.query) {
      const terms = query.query.toLowerCase().split(' ');
      logs = logs.filter(log =>
        terms.every(term =>
          log.message.toLowerCase().includes(term) ||
          JSON.stringify(log.fields).toLowerCase().includes(term)
        )
      );
    }

    // Apply filters
    for (const filter of query.filters) {
      logs = logs.filter(log => {
        const value = this.getFieldValue(log, filter.field);
        
        switch (filter.operator) {
          case 'eq': return value === filter.value;
          case 'ne': return value !== filter.value;
          case 'gt': return value > filter.value;
          case 'lt': return value < filter.value;
          case 'contains': return String(value).includes(String(filter.value));
          case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
          case 'exists': return value !== undefined;
          default: return true;
        }
      });
    }

    // Sort by timestamp desc
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const result = {
      hits: logs.slice(0, 100),
      total: logs.length,
      took: Date.now() - startTime,
    };

    // Apply aggregations
    if (query.aggregation) {
      result.aggregations = this.calculateAggregations(logs, query.aggregation);
    }

    return result;
  }

  // Create alert
  createAlert(alert: Omit<LogAlert, 'id' | 'lastTriggered'>): LogAlert {
    const fullAlert: LogAlert = {
      ...alert,
      id: crypto.randomUUID(),
    };

    this.alerts.set(fullAlert.id, fullAlert);
    this.emit('alertCreated', fullAlert);
    return fullAlert;
  }

  // Get log patterns
  getPatterns(tenantId: string, timeRange: { from: Date; to: Date }): Array<{
    pattern: string;
    count: number;
    sample: string;
  }> {
    const logs = (this.logs.get(tenantId) || [])
      .filter(l => l.timestamp >= timeRange.from && l.timestamp <= timeRange.to);

    // Simple pattern extraction
    const patterns: Map<string, { count: number; sample: string }> = new Map();

    for (const log of logs) {
      // Extract pattern by replacing variable parts with placeholders
      const pattern = log.message
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, '<UUID>')
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '<DATE>')
        .replace(/\b\d{2}:\d{2}:\d{2}\b/g, '<TIME>')
        .replace(/\b\d+\.\d+\.\d+\.\d+\b/g, '<IP>')
        .replace(/\b\d+\b/g, '<NUM>');

      if (!patterns.has(pattern)) {
        patterns.set(pattern, { count: 0, sample: log.message });
      }
      patterns.get(pattern)!.count++;
    }

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({ pattern, count: data.count, sample: data.sample }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  // Get log statistics
  getStats(tenantId: string, timeRange: { from: Date; to: Date }): {
    total: number;
    byLevel: Record<LogLevel, number>;
    bySource: Record<LogSource, number>;
    byService: Record<string, number>;
    errorRate: number;
    trend: Array<{ time: string; count: number; errors: number }>;
  } {
    const logs = (this.logs.get(tenantId) || [])
      .filter(l => l.timestamp >= timeRange.from && l.timestamp <= timeRange.to);

    const byLevel: Record<LogLevel, number> = {
      trace: 0, debug: 0, info: 0, warn: 0, error: 0, fatal: 0,
    };
    const bySource: Record<LogSource, number> = {
      application: 0, system: 0, audit: 0, security: 0, access: 0,
    };
    const byService: Record<string, number> = {};
    const byHour: Record<string, { count: number; errors: number }> = {};

    for (const log of logs) {
      byLevel[log.level]++;
      bySource[log.source]++;
      byService[log.service] = (byService[log.service] || 0) + 1;

      const hour = log.timestamp.toISOString().slice(0, 13) + ':00';
      if (!byHour[hour]) {
        byHour[hour] = { count: 0, errors: 0 };
      }
      byHour[hour].count++;
      if (['error', 'fatal'].includes(log.level)) {
        byHour[hour].errors++;
      }
    }

    const trend = Object.entries(byHour)
      .map(([time, data]) => ({ time, count: data.count, errors: data.errors }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const errors = logs.filter(l => ['error', 'fatal'].includes(l.level)).length;

    return {
      total: logs.length,
      byLevel,
      bySource,
      byService,
      errorRate: logs.length > 0 ? errors / logs.length : 0,
      trend,
    };
  }

  // Export logs
  exportLogs(
    tenantId: string,
    query: LogQuery,
    format: 'json' | 'csv' | 'ndjson'
  ): { url: string; count: number; size: number } {
    const { hits } = this.search(tenantId, query);
    
    let content: string;
    if (format === 'json') {
      content = JSON.stringify(hits, null, 2);
    } else if (format === 'ndjson') {
      content = hits.map(h => JSON.stringify(h)).join('\n');
    } else {
      // CSV
      const headers = ['timestamp', 'level', 'source', 'service', 'message'];
      const rows = hits.map(h => [
        h.timestamp.toISOString(),
        h.level,
        h.source,
        h.service,
        JSON.stringify(h.message),
      ].join(','));
      content = [headers.join(','), ...rows].join('\n');
    }

    return {
      url: `data:text/${format};base64,${btoa(content)}`,
      count: hits.length,
      size: content.length,
    };
  }

  // List streams
  listStreams(tenantId: string): LogStream[] {
    return Array.from(this.streams.values())
      .filter(s => s.tenantId === tenantId)
      .sort((a, b) => b.eventCount - a.eventCount);
  }

  // Private methods
  private matchesStream(entry: LogEntry, stream: LogStream): boolean {
    if (stream.sourceFilter && !stream.sourceFilter.includes(entry.source)) {
      return false;
    }
    if (stream.levelFilter) {
      const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
      if (levels.indexOf(entry.level) < levels.indexOf(stream.levelFilter)) {
        return false;
      }
    }
    if (stream.serviceFilter && !stream.serviceFilter.includes(entry.service)) {
      return false;
    }
    return true;
  }

  private getFieldValue(log: LogEntry, field: string): unknown {
    const parts = field.split('.');
    let value: unknown = log;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private calculateAggregations(
    logs: LogEntry[],
    aggregation: LogQuery['aggregation']
  ): Record<string, unknown> {
    if (!aggregation) return {};

    const groups: Record<string, number[]> = {};

    for (const log of logs) {
      const key = String(this.getFieldValue(log, aggregation.groupBy) || 'unknown');
      if (!groups[key]) {
        groups[key] = [];
      }

      if (aggregation.metric === 'count') {
        groups[key].push(1);
      } else if (aggregation.field) {
        const val = Number(this.getFieldValue(log, aggregation.field)) || 0;
        groups[key].push(val);
      }
    }

    const result: Record<string, unknown> = {};

    for (const [key, values] of Object.entries(groups)) {
      switch (aggregation.metric) {
        case 'count':
          result[key] = values.length;
          break;
        case 'avg':
          result[key] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'sum':
          result[key] = values.reduce((a, b) => a + b, 0);
          break;
        case 'min':
          result[key] = Math.min(...values);
          break;
        case 'max':
          result[key] = Math.max(...values);
          break;
      }
    }

    return result;
  }

  private checkAlerts(entry: LogEntry): void {
    for (const alert of this.alerts.values()) {
      if (!alert.enabled) continue;
      if (alert.tenantId !== entry.tenantId) continue;

      // Simple query matching
      if (entry.message.includes(alert.query) || 
          alert.query === '*' ||
          (alert.query === 'error' && ['error', 'fatal'].includes(entry.level))) {
        
        // Check if should trigger
        if (!alert.lastTriggered || 
            Date.now() - alert.lastTriggered.getTime() > alert.condition.duration * 60 * 1000) {
          
          alert.lastTriggered = new Date();
          this.emit('alertTriggered', { alert, entry });
        }
      }
    }
  }
}

// Export singleton
export const logAggregator = new LogAggregator();

export type { LogEntry, LogStream, LogQuery, LogAlert, LogLevel, LogSource };

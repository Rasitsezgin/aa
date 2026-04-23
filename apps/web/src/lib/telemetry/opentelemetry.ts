// OpenTelemetry Configuration for Distributed Tracing
// Tracks requests across services and databases

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// Initialize OpenTelemetry SDK
export function initTelemetry() {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Choose exporter based on environment
  const exporter = isProd 
    ? new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      })
    : new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'pazaryonetimi-web',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    spanProcessor: new SimpleSpanProcessor(exporter),
  });

  sdk.start();
  
  console.log('[Telemetry] OpenTelemetry initialized');
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('[Telemetry] SDK shut down'))
      .catch((err) => console.error('[Telemetry] Error shutting down SDK:', err));
  });

  return sdk;
}

// Tracer instance
const tracer = trace.getTracer('pazaryonetimi-web', '1.0.0');

// Create a span for database operations
export async function traceDBOperation<T>(
  operation: string,
  table: string,
  callback: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `db.${operation}`,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        'db.system': 'postgresql',
        'db.operation': operation,
        'db.sql.table': table,
      },
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await callback();
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute('db.response_time_ms', Date.now() - startTime);
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Create a span for API calls
export async function traceAPIRequest<T>(
  method: string,
  route: string,
  callback: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `http.${method.toLowerCase()}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'http.method': method,
        'http.route': route,
        'http.scheme': 'https',
      },
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await callback();
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute('http.response_time_ms', Date.now() - startTime);
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.setAttribute('http.status_code', 500);
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Create a span for external API calls (marketplaces)
export async function traceExternalAPI<T>(
  platform: string,
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `external.${platform}.${operation}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        'peer.service': platform,
        'rpc.method': operation,
        'rpc.system': 'http',
      },
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await callback();
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute('external.response_time_ms', Date.now() - startTime);
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Create a span for cache operations
export async function traceCacheOperation<T>(
  operation: 'get' | 'set' | 'delete' | 'expire',
  key: string,
  callback: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `cache.${operation}`,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        'cache.operation': operation,
        'cache.key': key,
        'cache.system': 'redis',
      },
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await callback();
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute('cache.response_time_ms', Date.now() - startTime);
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

// Middleware for Next.js API routes
export function withTracing(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const url = new URL(req.url);
    const method = req.method || 'GET';
    
    return traceAPIRequest(method, url.pathname, async () => {
      return handler(req, ...args);
    });
  };
}

// React component tracing hook
export function useComponentTracing(componentName: string) {
  return tracer.startSpan(`react.${componentName}.render`, {
    attributes: {
      'react.component': componentName,
      'react.type': 'component',
    },
  });
}

// Performance metrics collector
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric)!.push(value);
  }

  getStats(metric: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Export tracer for manual instrumentation
export { tracer, context, trace };

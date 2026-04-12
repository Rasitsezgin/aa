import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register = new client.Registry();

  // HTTP metrics
  readonly httpRequestDuration: client.Histogram;
  readonly httpRequestTotal: client.Counter;

  // Business metrics
  readonly ordersCreated: client.Counter;
  readonly productsSync: client.Counter;
  readonly priceUpdates: client.Counter;
  readonly activeWebSockets: client.Gauge;

  constructor() {
    // Default metrics (CPU, memory, event loop, etc.)
    client.collectDefaultMetrics({ register: this.register });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.ordersCreated = new client.Counter({
      name: 'orders_created_total',
      help: 'Total orders created',
      labelNames: ['platform'],
      registers: [this.register],
    });

    this.productsSync = new client.Counter({
      name: 'products_sync_total',
      help: 'Total product sync operations',
      labelNames: ['platform', 'status'],
      registers: [this.register],
    });

    this.priceUpdates = new client.Counter({
      name: 'price_updates_total',
      help: 'Total price updates',
      labelNames: ['platform'],
      registers: [this.register],
    });

    this.activeWebSockets = new client.Gauge({
      name: 'active_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.register],
    });
  }

  onModuleInit() {
    // Metrics initialized
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}

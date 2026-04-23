// API Gateway
// Unified API management with routing, transformation, aggregation

import { EventEmitter } from 'events';

interface APIRoute {
  id: string;
  tenantId: string;
  path: string;
  method: string;
  target: {
    type: 'service' | 'serverless' | 'external';
    url: string;
    timeout?: number;
    retries?: number;
  };
  transformations: {
    request?: {
      headers?: Record<string, string>;
      queryParams?: Record<string, string>;
      body?: string; // JSONata or template
    };
    response?: {
      statusCode?: number;
      headers?: Record<string, string>;
      body?: string;
    };
  };
  caching?: {
    enabled: boolean;
    ttl: number;
    key: string;
  };
  auth?: {
    required: boolean;
    type?: 'jwt' | 'api_key' | 'oauth';
    scopes?: string[];
  };
  rateLimit?: string; // rule ID
  active: boolean;
}

interface APIGatewayRequest {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  userId?: string;
  tenantId: string;
  timestamp: Date;
}

interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
  cacheHit?: boolean;
}

interface APIAggregation {
  id: string;
  name: string;
  routes: string[];
  mergeStrategy: 'parallel' | 'sequential' | 'chain';
  responseMapping: Record<string, string>;
  errorStrategy: 'fail_fast' | 'partial' | 'ignore';
}

// API Gateway
export class APIGateway extends EventEmitter {
  private routes: Map<string, APIRoute> = new Map();
  private aggregations: Map<string, APIAggregation> = new Map();
  private cache: Map<string, { data: unknown; expires: number }> = new Map();

  // Register route
  registerRoute(route: Omit<APIRoute, 'id'>): APIRoute {
    const fullRoute: APIRoute = {
      ...route,
      id: crypto.randomUUID(),
    };

    this.routes.set(fullRoute.id, fullRoute);
    this.emit('routeRegistered', fullRoute);
    return fullRoute;
  }

  // Route request
  async route(request: APIGatewayRequest): Promise<APIGatewayResponse> {
    const startTime = Date.now();

    // Find matching route
    const route = this.findRoute(request.tenantId, request.path, request.method);
    if (!route) {
      return {
        statusCode: 404,
        headers: {},
        body: { error: 'Route not found' },
        duration: Date.now() - startTime,
      };
    }

    // Check cache
    if (route.caching?.enabled) {
      const cacheKey = this.buildCacheKey(route.caching.key, request);
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return {
          statusCode: 200,
          headers: { 'X-Cache': 'HIT' },
          body: cached.data,
          duration: Date.now() - startTime,
          cacheHit: true,
        };
      }
    }

    // Transform request
    const transformedRequest = this.transformRequest(request, route);

    // Call target
    let response: APIGatewayResponse;
    try {
      const targetResponse = await this.callTarget(transformedRequest, route);
      response = this.transformResponse(targetResponse, route);

      // Cache response
      if (route.caching?.enabled && response.statusCode === 200) {
        const cacheKey = this.buildCacheKey(route.caching.key, request);
        this.cache.set(cacheKey, {
          data: response.body,
          expires: Date.now() + route.caching.ttl * 1000,
        });
      }

    } catch (error) {
      response = {
        statusCode: 502,
        headers: {},
        body: { error: 'Bad Gateway', message: String(error) },
        duration: Date.now() - startTime,
      };
    }

    this.emit('requestRouted', { request, response, route });
    return response;
  }

  // Create aggregation endpoint
  createAggregation(config: Omit<APIAggregation, 'id'>): APIAggregation {
    const aggregation: APIAggregation = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.aggregations.set(aggregation.id, aggregation);
    return aggregation;
  }

  // Execute aggregation
  async executeAggregation(
    aggregationId: string,
    request: APIGatewayRequest
  ): Promise<APIGatewayResponse> {
    const aggregation = this.aggregations.get(aggregationId);
    if (!aggregation) {
      return {
        statusCode: 404,
        headers: {},
        body: { error: 'Aggregation not found' },
        duration: 0,
      };
    }

    const startTime = Date.now();
    const results: Record<string, unknown> = {};

    if (aggregation.mergeStrategy === 'parallel') {
      // Call all routes in parallel
      const promises = aggregation.routes.map(async routeId => {
        const route = this.routes.get(routeId);
        if (!route) return null;

        const response = await this.route({
          ...request,
          path: route.path,
          method: route.method,
        });

        return { routeId, response };
      });

      const responses = await Promise.all(promises);
      
      for (const res of responses) {
        if (res) {
          results[aggregation.responseMapping[res.routeId] || res.routeId] = res.response.body;
        }
      }

    } else if (aggregation.mergeStrategy === 'sequential') {
      // Call routes one by one
      for (const routeId of aggregation.routes) {
        const route = this.routes.get(routeId);
        if (!route) continue;

        const response = await this.route({
          ...request,
          path: route.path,
          method: route.method,
        });

        results[aggregation.responseMapping[routeId] || routeId] = response.body;

        if (response.statusCode >= 400 && aggregation.errorStrategy === 'fail_fast') {
          break;
        }
      }
    }

    return {
      statusCode: 200,
      headers: {},
      body: results,
      duration: Date.now() - startTime,
    };
  }

  // Get route by ID
  getRoute(id: string): APIRoute | null {
    return this.routes.get(id) || null;
  }

  // List routes for tenant
  listRoutes(tenantId: string): APIRoute[] {
    return Array.from(this.routes.values()).filter(r => r.tenantId === tenantId);
  }

  // Delete route
  deleteRoute(id: string): void {
    this.routes.delete(id);
  }

  // Private methods
  private findRoute(tenantId: string, path: string, method: string): APIRoute | null {
    return Array.from(this.routes.values()).find(
      r => r.tenantId === tenantId && 
           r.path === path && 
           r.method === method && 
           r.active
    ) || null;
  }

  private transformRequest(request: APIGatewayRequest, route: APIRoute): APIGatewayRequest {
    if (!route.transformations.request) return request;

    const transformed = { ...request };

    if (route.transformations.request.headers) {
      transformed.headers = { ...transformed.headers, ...route.transformations.request.headers };
    }

    return transformed;
  }

  private async callTarget(request: APIGatewayRequest, route: APIRoute): Promise<Response> {
    const url = route.target.url + request.path;
    
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    return response;
  }

  private transformResponse(response: Response, route: APIRoute): APIGatewayResponse {
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: {}, // Would parse JSON
      duration: 0,
    };
  }

  private buildCacheKey(pattern: string, request: APIGatewayRequest): string {
    return pattern
      .replace('{path}', request.path)
      .replace('{method}', request.method)
      .replace('{user}', request.userId || 'anon');
  }
}

// Export singleton
export const apiGateway = new APIGateway();

export { APIRoute, APIGatewayRequest, APIGatewayResponse, APIAggregation };

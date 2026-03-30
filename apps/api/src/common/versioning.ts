import { Controller, Get, Post, Body, Patch, Param, Delete, Version } from '@nestjs/common';

/**
 * API Versioning Strategy
 * - URL path versioning (/v1/, /v2/)
 * - Header versioning (X-API-Version)
 * - Content negotiation (Accept: application/vnd.api+json;version=2)
 * - Deprecation warnings
 */

export enum ApiVersions {
  V1 = '1',
  V2 = '2',
  V3 = '3',
}

export interface VersionedResponse<T> {
  version: string;
  data: T;
  deprecated?: boolean;
  sunsetDate?: string;
  links: {
    self: string;
    latest?: string;
    docs?: string;
  };
}

/**
 * Versioned Controller Base
 */
export function VersionedController(prefix: string, versions: string[] = ['1']) {
  return function <TFunction extends Function>(target: TFunction): TFunction {
    // Add version metadata
    Reflect.defineMetadata('api:versions', versions, target);
    return target;
  };
}

/**
 * API Version Decorator
 */
export function ApiVersion(version: string, deprecated = false, sunsetDate?: string) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey && descriptor) {
      // Method decorator
      Reflect.defineMetadata('api:version', version, descriptor.value);
      Reflect.defineMetadata('api:deprecated', deprecated, descriptor.value);
      Reflect.defineMetadata('api:sunset', sunsetDate, descriptor.value);
    } else {
      // Class decorator
      Reflect.defineMetadata('api:version', version, target);
      Reflect.defineMetadata('api:deprecated', deprecated, target);
      Reflect.defineMetadata('api:sunset', sunsetDate, target);
    }
  };
}

/**
 * Version Comparison Utilities
 */
export class VersionUtils {
  static isVersionGte(version: string, compareTo: string): boolean {
    const v1 = version.split('.').map(Number);
    const v2 = compareTo.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const n1 = v1[i] || 0;
      const n2 = v2[i] || 0;
      if (n1 > n2) return true;
      if (n1 < n2) return false;
    }
    return true;
  }

  static getLatestVersion(versions: string[]): string {
    return versions.sort((a, b) => {
      const v1 = a.split('.').map(Number);
      const v2 = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const n1 = v1[i] || 0;
        const n2 = v2[i] || 0;
        if (n1 !== n2) return n2 - n1;
      }
      return 0;
    })[0];
  }
}

/**
 * Version Migration Guide
 */
export interface MigrationGuide {
  fromVersion: string;
  toVersion: string;
  breakingChanges: Array<{
    field: string;
    change: string;
    migration: string;
  }>;
  newFeatures: string[];
  deprecations: string[];
}

export const MIGRATION_GUIDES: MigrationGuide[] = [
  {
    fromVersion: '1',
    toVersion: '2',
    breakingChanges: [
      {
        field: 'product.price',
        change: 'Changed from string to number',
        migration: 'Parse existing string values to float',
      },
      {
        field: 'order.status',
        change: 'New enum values added',
        migration: 'Update status mappings in your code',
      },
    ],
    newFeatures: [
      'Bulk operations support',
      'Webhook signatures',
      'Rate limiting headers',
    ],
    deprecations: [
      'GET /v1/orders/all - Use /v2/orders instead',
    ],
  },
];

/**
 * Example Versioned Controller
 */
@Controller({
  path: 'products',
  version: ['1', '2'],
})
export class VersionedProductsController {
  
  // Default version (neutral)
  @Get()
  findAllV1() {
    return {
      version: '1',
      products: [],
      links: { self: '/v1/products' },
    };
  }

  // Explicit V2 with new features
  @Version('2')
  @Get()
  findAllV2() {
    return {
      version: '2',
      products: [],
      meta: {
        total: 0,
        page: 1,
        perPage: 20,
      },
      links: { 
        self: '/v2/products',
        latest: '/v2/products',
        docs: 'https://docs.example.com/v2/products',
      },
      deprecated: false,
    };
  }

  // Deprecated V1 endpoint
  @ApiVersion('1', true, '2024-12-31')
  @Get(':id')
  findOneV1(@Param('id') id: string) {
    return {
      product: { id },
      warning: 'This endpoint is deprecated. Use /v2/products/:id',
    };
  }

  // Latest V2 endpoint
  @Version('2')
  @Get(':id')
  findOneV2(@Param('id') id: string) {
    return {
      version: '2',
      data: { id },
      included: [],
    };
  }
}

/**
 * Version Interceptor - Adds version headers
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const version = request.headers['x-api-version'] || '1';
    
    return next.handle().pipe(
      map(data => ({
        ...data,
        _meta: {
          apiVersion: version,
          latestVersion: '2',
          deprecationWarning: version !== '2' ? 
            'You are using an outdated API version. Please migrate to v2.' : undefined,
        },
      })),
    );
  }
}

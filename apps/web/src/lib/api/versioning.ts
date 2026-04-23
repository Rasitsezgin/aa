// API Versioning System
// Support for multiple API versions with smooth transitions

import { NextRequest, NextResponse } from 'next/server';

interface ApiVersion {
  version: string;
  status: 'stable' | 'deprecated' | 'sunset';
  releaseDate: Date;
  sunsetDate?: Date;
  changes: string[];
  breaking: boolean;
}

interface VersionedRoute {
  pattern: string;
  versions: Map<string, (req: NextRequest) => Promise<NextResponse>>;
  defaultVersion: string;
}

interface ApiChangeLog {
  version: string;
  date: Date;
  changes: Array<{
    type: 'added' | 'changed' | 'deprecated' | 'removed';
    description: string;
    endpoint?: string;
  }>;
}

// API Version Registry
export class ApiVersionRegistry {
  private versions: Map<string, ApiVersion> = new Map();
  private routes: Map<string, VersionedRoute> = new Map();
  private changelogs: Map<string, ApiChangeLog> = new Map();

  // Register API version
  registerVersion(version: ApiVersion): void {
    this.versions.set(version.version, version);
  }

  // Register route for version
  registerRoute(
    pattern: string,
    version: string,
    handler: (req: NextRequest) => Promise<NextResponse>,
    isDefault: boolean = false
  ): void {
    let route = this.routes.get(pattern);
    
    if (!route) {
      route = {
        pattern,
        versions: new Map(),
        defaultVersion: version,
      };
      this.routes.set(pattern, route);
    }

    route.versions.set(version, handler);
    
    if (isDefault) {
      route.defaultVersion = version;
    }
  }

  // Get handler for request
  getHandler(
    pattern: string,
    requestedVersion?: string
  ): {
    handler: ((req: NextRequest) => Promise<NextResponse>) | null;
    version: string;
    isDeprecated: boolean;
    sunsetDate?: Date;
  } {
    const route = this.routes.get(pattern);
    if (!route) {
      return { handler: null, version: '', isDeprecated: false };
    }

    const version = requestedVersion || route.defaultVersion;
    const handler = route.versions.get(version);
    const versionInfo = this.versions.get(version);

    if (!handler) {
      // Try to find closest version
      const availableVersions = Array.from(route.versions.keys());
      const closestVersion = this.findClosestVersion(version, availableVersions);
      
      if (closestVersion) {
        return {
          handler: route.versions.get(closestVersion)!,
          version: closestVersion,
          isDeprecated: true,
          sunsetDate: this.versions.get(closestVersion)?.sunsetDate,
        };
      }

      return { handler: null, version, isDeprecated: false };
    }

    return {
      handler,
      version,
      isDeprecated: versionInfo?.status === 'deprecated' || versionInfo?.status === 'sunset',
      sunsetDate: versionInfo?.sunsetDate,
    };
  }

  // Middleware to handle versioning
  async middleware(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Extract version from header or path
    let version = req.headers.get('x-api-version') || undefined;
    
    // Check path for version prefix (e.g., /v1/users, /v2/users)
    const versionMatch = path.match(/^\/v(\d+)\/(.+)$/);
    if (versionMatch) {
      version = versionMatch[1];
    }

    const route = this.routes.get(path);
    if (!route) {
      return NextResponse.next();
    }

    const result = this.getHandler(path, version);

    if (!result.handler) {
      return NextResponse.json(
        {
          error: 'Unsupported API version',
          requestedVersion: version,
          availableVersions: Array.from(route.versions.keys()),
        },
        { status: 400 }
      );
    }

    // Add deprecation headers if applicable
    const response = await result.handler(req);
    
    if (result.isDeprecated) {
      response.headers.set('Deprecation', 'true');
      if (result.sunsetDate) {
        response.headers.set('Sunset', result.sunsetDate.toISOString());
      }
      response.headers.set('Link', `</api/v${route.defaultVersion}${path}>; rel="successor-version"`);
    }

    // Add API version header
    response.headers.set('X-API-Version', result.version);

    return response;
  }

  // Get version compatibility matrix
  getCompatibilityMatrix(): Array<{
    version: string;
    status: string;
    compatibleWith: string[];
    deprecatedEndpoints: string[];
  }> {
    const matrix = [];
    
    for (const [version, info] of this.versions) {
      const compatibleWith = Array.from(this.versions.keys())
        .filter(v => v !== version && this.isCompatible(v, version));
      
      matrix.push({
        version,
        status: info.status,
        compatibleWith,
        deprecatedEndpoints: this.getDeprecatedEndpoints(version),
      });
    }

    return matrix;
  }

  // Check if versions are compatible
  private isCompatible(v1: string, v2: string): boolean {
    const major1 = parseInt(v1.split('.')[0]);
    const major2 = parseInt(v2.split('.')[0]);
    
    // Same major version = compatible
    return major1 === major2;
  }

  // Find closest available version
  private findClosestVersion(requested: string, available: string[]): string | null {
    if (available.length === 0) return null;
    
    const requestedNum = parseFloat(requested);
    
    return available.reduce((closest, current) => {
      const currentNum = parseFloat(current);
      const closestNum = parseFloat(closest);
      
      return Math.abs(currentNum - requestedNum) < Math.abs(closestNum - requestedNum)
        ? current
        : closest;
    });
  }

  // Get deprecated endpoints for a version
  private getDeprecatedEndpoints(version: string): string[] {
    const changelog = this.changelogs.get(version);
    if (!changelog) return [];

    return changelog.changes
      .filter(c => c.type === 'deprecated')
      .map(c => c.endpoint || '')
      .filter(Boolean);
  }

  // Add changelog entry
  addChangelog(changelog: ApiChangeLog): void {
    this.changelogs.set(changelog.version, changelog);
  }

  // Get migration guide between versions
  getMigrationGuide(fromVersion: string, toVersion: string): {
    steps: string[];
    breakingChanges: string[];
    deprecatedFeatures: string[];
    newFeatures: string[];
  } {
    const fromChangelog = this.changelogs.get(fromVersion);
    const toChangelog = this.changelogs.get(toVersion);

    return {
      steps: [
        `Update API version header to ${toVersion}`,
        'Test all integrations in staging',
        'Update deprecated endpoint calls',
        'Deploy to production',
      ],
      breakingChanges: toChangelog?.changes
        .filter(c => c.type === 'removed')
        .map(c => c.description) || [],
      deprecatedFeatures: toChangelog?.changes
        .filter(c => c.type === 'deprecated')
        .map(c => c.description) || [],
      newFeatures: toChangelog?.changes
        .filter(c => c.type === 'added')
        .map(c => c.description) || [],
    };
  }
}

// API Version Decorator for easy route registration
export function ApiVersion(
  version: string,
  options: { deprecated?: boolean; sunsetDate?: Date } = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Store version metadata
    Reflect.defineMetadata('api:version', version, target, propertyKey);
    Reflect.defineMetadata('api:deprecated', options.deprecated, target, propertyKey);
    Reflect.defineMetadata('api:sunsetDate', options.sunsetDate, target, propertyKey);
    
    return descriptor;
  };
}

// Version negotiation helper
export class VersionNegotiator {
  // Parse Accept-Version header
  static parseAcceptVersion(header: string | null): {
    version: string | null;
    quality: number;
  } {
    if (!header) return { version: null, quality: 1 };

    const parts = header.split(';');
    const version = parts[0].trim();
    const quality = parts[1]
      ? parseFloat(parts[1].replace('q=', '').trim()) || 1
      : 1;

    return { version, quality };
  }

  // Select best version based on client preference
  static selectBestVersion(
    clientPreference: string | null,
    availableVersions: string[],
    defaultVersion: string
  ): string {
    if (!clientPreference) return defaultVersion;

    // Check exact match
    if (availableVersions.includes(clientPreference)) {
      return clientPreference;
    }

    // Check major version match
    const preferredMajor = clientPreference.split('.')[0];
    const compatible = availableVersions.filter(v => 
      v.startsWith(preferredMajor + '.')
    );

    if (compatible.length > 0) {
      // Return highest compatible version
      return compatible.sort((a, b) => 
        parseFloat(b) - parseFloat(a)
      )[0];
    }

    return defaultVersion;
  }
}

// API Deprecation Notifier
export class DeprecationNotifier {
  private notifiedClients: Set<string> = new Set();

  async notifyDeprecation(
    clientId: string,
    endpoint: string,
    currentVersion: string,
    sunsetDate: Date
  ): Promise<void> {
    const key = `${clientId}:${endpoint}`;
    
    if (this.notifiedClients.has(key)) {
      return; // Already notified
    }

    // Send notification (email, webhook, etc.)
    console.log(`
      Deprecation Notice:
      Client: ${clientId}
      Endpoint: ${endpoint}
      Current Version: ${currentVersion}
      Sunset Date: ${sunsetDate.toISOString()}
    `);

    this.notifiedClients.add(key);
  }

  // Schedule periodic deprecation notifications
  scheduleDeprecationChecks(registry: ApiVersionRegistry): void {
    // Check every day for upcoming deprecations
    setInterval(() => {
      const matrix = registry.getCompatibilityMatrix();
      
      matrix.forEach(version => {
        if (version.status === 'deprecated' || version.status === 'sunset') {
          // Notify clients using deprecated versions
          console.log(`Version ${version.version} is deprecated`);
        }
      });
    }, 24 * 60 * 60 * 1000);
  }
}

// Predefined API versions
export const API_VERSIONS: ApiVersion[] = [
  {
    version: '1',
    status: 'stable',
    releaseDate: new Date('2024-01-01'),
    changes: ['Initial API release'],
    breaking: false,
  },
  {
    version: '2',
    status: 'stable',
    releaseDate: new Date('2024-06-01'),
    changes: [
      'Added pagination to list endpoints',
      'Improved error response format',
      'Added filtering capabilities',
    ],
    breaking: true,
  },
  {
    version: '3',
    status: 'deprecated',
    releaseDate: new Date('2024-09-01'),
    sunsetDate: new Date('2025-03-01'),
    changes: [
      'GraphQL support added',
      'REST endpoints reorganized',
      'New webhook format',
    ],
    breaking: true,
  },
];

// Export registry singleton
export const apiRegistry = new ApiVersionRegistry();

// Initialize versions
API_VERSIONS.forEach(version => apiRegistry.registerVersion(version));

export { ApiVersion, ApiChangeLog, VersionedRoute };

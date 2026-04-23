// Multi-Tenant Database Sharding
// Horizontal scaling with tenant isolation

import { prisma } from '@/lib/prisma';

type ShardStrategy = 'range' | 'hash' | 'list' | 'composite';

interface Shard {
  id: string;
  host: string;
  port: number;
  database: string;
  minTenantId: string;
  maxTenantId: string;
  status: 'active' | 'maintenance' | 'offline';
  weight: number; // For load balancing
  connectionPool: number;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    connections: number;
  };
}

interface TenantPlacement {
  tenantId: string;
  shardId: string;
  assignedAt: Date;
  dataSize: number; // Estimated data size in MB
  priority: 'high' | 'normal' | 'low';
}

// Shard manager
export class ShardManager {
  private shards: Map<string, Shard> = new Map();
  private placements: Map<string, TenantPlacement> = new Map();
  private strategy: ShardStrategy;

  constructor(strategy: ShardStrategy = 'hash') {
    this.strategy = strategy;
  }

  // Register a new shard
  registerShard(shard: Shard): void {
    this.shards.set(shard.id, shard);
  }

  // Assign tenant to shard
  assignTenant(tenantId: string, priority: 'high' | 'normal' | 'low' = 'normal'): TenantPlacement {
    // Check if already assigned
    const existing = this.placements.get(tenantId);
    if (existing) {
      return existing;
    }

    // Find best shard based on strategy
    const shardId = this.selectShard(tenantId);
    const shard = this.shards.get(shardId);
    
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }

    const placement: TenantPlacement = {
      tenantId,
      shardId,
      assignedAt: new Date(),
      dataSize: 0,
      priority,
    };

    this.placements.set(tenantId, placement);
    
    // Update shard metrics
    shard.metrics.connections++;

    return placement;
  }

  // Get shard for tenant
  getShardForTenant(tenantId: string): Shard | null {
    const placement = this.placements.get(tenantId);
    if (!placement) {
      return null;
    }

    return this.shards.get(placement.shardId) || null;
  }

  // Select best shard based on strategy
  private selectShard(tenantId: string): string {
    const activeShards = Array.from(this.shards.values()).filter(s => s.status === 'active');
    
    if (activeShards.length === 0) {
      throw new Error('No active shards available');
    }

    switch (this.strategy) {
      case 'hash':
        return this.hashStrategy(tenantId, activeShards);
      
      case 'range':
        return this.rangeStrategy(tenantId, activeShards);
      
      case 'list':
        return this.listStrategy(tenantId, activeShards);
      
      case 'composite':
        return this.compositeStrategy(tenantId, activeShards);
      
      default:
        return activeShards[0].id;
    }
  }

  private hashStrategy(tenantId: string, shards: Shard[]): string {
    // Simple hash-based selection
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = ((hash << 5) - hash) + tenantId.charCodeAt(i);
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % shards.length;
    return shards[index].id;
  }

  private rangeStrategy(tenantId: string, shards: Shard[]): string {
    // Find shard where tenantId falls in range
    for (const shard of shards) {
      if (tenantId >= shard.minTenantId && tenantId <= shard.maxTenantId) {
        return shard.id;
      }
    }
    
    // Fallback to least loaded
    return this.getLeastLoadedShard(shards);
  }

  private listStrategy(tenantId: string, shards: Shard[]): string {
    // Tenant-specific assignment based on predefined lists
    // Simplified: use hash as fallback
    return this.hashStrategy(tenantId, shards);
  }

  private compositeStrategy(tenantId: string, shards: Shard[]): string {
    // Combine multiple strategies
    // First: try range
    for (const shard of shards) {
      if (tenantId >= shard.minTenantId && tenantId <= shard.maxTenantId) {
        // Check if shard has capacity
        if (shard.metrics.connections < shard.connectionPool) {
          return shard.id;
        }
      }
    }
    
    // Fallback to least loaded
    return this.getLeastLoadedShard(shards);
  }

  private getLeastLoadedShard(shards: Shard[]): string {
    return shards.reduce((best, current) => {
      const bestLoad = this.calculateLoad(best);
      const currentLoad = this.calculateLoad(current);
      return currentLoad < bestLoad ? current : best;
    }).id;
  }

  private calculateLoad(shard: Shard): number {
    const cpuWeight = 0.4;
    const memoryWeight = 0.3;
    const connectionWeight = 0.3;

    const connectionRatio = shard.metrics.connections / shard.connectionPool;

    return (
      shard.metrics.cpu * cpuWeight +
      shard.metrics.memory * memoryWeight +
      connectionRatio * connectionWeight
    );
  }

  // Rebalance tenants across shards
  async rebalance(): Promise<{
    moved: number;
    failed: number;
    details: Array<{ tenantId: string; from: string; to: string }>;
  }> {
    const moved: Array<{ tenantId: string; from: string; to: string }> = [];
    let failed = 0;

    // Analyze current distribution
    const shardLoads = new Map<string, number>();
    for (const [tenantId, placement] of this.placements) {
      const current = shardLoads.get(placement.shardId) || 0;
      shardLoads.set(placement.shardId, current + placement.dataSize);
    }

    // Find overloaded and underloaded shards
    const avgLoad = Array.from(shardLoads.values()).reduce((a, b) => a + b, 0) / shardLoads.size;
    
    const overloaded = Array.from(shardLoads.entries())
      .filter(([, load]) => load > avgLoad * 1.2)
      .map(([id]) => id);
    
    const underloaded = Array.from(shardLoads.entries())
      .filter(([, load]) => load < avgLoad * 0.8)
      .map(([id]) => id);

    // Move tenants from overloaded to underloaded
    for (const shardId of overloaded) {
      const tenantsToMove = Array.from(this.placements.entries())
        .filter(([, p]) => p.shardId === shardId)
        .sort((a, b) => b[1].dataSize - a[1].dataSize) // Move largest first
        .slice(0, Math.ceil(this.placements.size * 0.1)); // Move 10%

      for (const [tenantId, placement] of tenantsToMove) {
        const targetShard = underloaded[0];
        if (!targetShard) break;

        try {
          await this.migrateTenant(tenantId, targetShard);
          moved.push({ tenantId, from: placement.shardId, to: targetShard });
        } catch (error) {
          failed++;
        }
      }
    }

    return {
      moved: moved.length,
      failed,
      details: moved,
    };
  }

  // Migrate tenant to different shard
  async migrateTenant(tenantId: string, targetShardId: string): Promise<void> {
    const placement = this.placements.get(tenantId);
    if (!placement) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const sourceShard = this.shards.get(placement.shardId);
    const targetShard = this.shards.get(targetShardId);

    if (!sourceShard || !targetShard) {
      throw new Error('Source or target shard not found');
    }

    // Execute migration
    console.log(`Migrating tenant ${tenantId} from ${placement.shardId} to ${targetShardId}`);

    // 1. Export data from source
    // 2. Import to target
    // 3. Update placement
    // 4. Verify

    placement.shardId = targetShardId;
    placement.assignedAt = new Date();
    this.placements.set(tenantId, placement);

    // Update metrics
    sourceShard.metrics.connections--;
    targetShard.metrics.connections++;
  }

  // Get shard statistics
  getShardStats(): Array<{
    shard: Shard;
    tenantCount: number;
    totalDataSize: number;
    health: 'healthy' | 'warning' | 'critical';
  }> {
    const stats = [];

    for (const [shardId, shard] of this.shards) {
      const tenants = Array.from(this.placements.values())
        .filter(p => p.shardId === shardId);
      
      const tenantCount = tenants.length;
      const totalDataSize = tenants.reduce((sum, t) => sum + t.dataSize, 0);

      // Determine health
      let health: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (shard.metrics.cpu > 80 || shard.metrics.memory > 85) {
        health = 'critical';
      } else if (shard.metrics.cpu > 60 || shard.metrics.memory > 70) {
        health = 'warning';
      }

      stats.push({
        shard,
        tenantCount,
        totalDataSize,
        health,
      });
    }

    return stats;
  }

  // Get tenant distribution
  getDistribution(): {
    totalTenants: number;
    byShard: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const byShard: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const placement of this.placements.values()) {
      byShard[placement.shardId] = (byShard[placement.shardId] || 0) + 1;
      byPriority[placement.priority] = (byPriority[placement.priority] || 0) + 1;
    }

    return {
      totalTenants: this.placements.size,
      byShard,
      byPriority,
    };
  }
}

// Cross-shard query coordinator
export class CrossShardQuery {
  constructor(private shardManager: ShardManager) {}

  // Execute query across all shards
  async queryAll<T>(
    query: (prisma: typeof prisma) => Promise<T>,
    options: {
      parallel?: boolean;
      timeout?: number;
    } = {}
  ): Promise<Map<string, T | Error>> {
    const shards = Array.from(this.shardManager['shards'].values());
    const results = new Map<string, T | Error>();

    if (options.parallel !== false) {
      // Execute in parallel
      await Promise.all(
        shards.map(async shard => {
          try {
            const result = await this.executeWithTimeout(query, options.timeout);
            results.set(shard.id, result);
          } catch (error) {
            results.set(shard.id, error as Error);
          }
        })
      );
    } else {
      // Execute sequentially
      for (const shard of shards) {
        try {
          const result = await this.executeWithTimeout(query, options.timeout);
          results.set(shard.id, result);
        } catch (error) {
          results.set(shard.id, error as Error);
        }
      }
    }

    return results;
  }

  // Aggregate results from multiple shards
  async aggregate<T>(
    aggregator: (results: (T | Error)[]) => T,
    query: (prisma: typeof prisma) => Promise<T>
  ): Promise<T> {
    const results = await this.queryAll<T>(query);
    return aggregator(Array.from(results.values()));
  }

  private async executeWithTimeout<T>(
    query: (prisma: typeof prisma) => Promise<T>,
    timeout?: number
  ): Promise<T> {
    if (!timeout) {
      return query(prisma);
    }

    return Promise.race([
      query(prisma),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      ),
    ]);
  }
}

// Shard router for incoming requests
export class ShardRouter {
  constructor(private shardManager: ShardManager) {}

  // Route request to appropriate shard
  route(tenantId: string): string {
    const placement = this.shardManager['placements'].get(tenantId);
    
    if (placement) {
      return placement.shardId;
    }

    // Assign new tenant
    const newPlacement = this.shardManager.assignTenant(tenantId);
    return newPlacement.shardId;
  }

  // Middleware for automatic routing
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const tenantId = this.extractTenantId(req);
      
      if (tenantId) {
        const shardId = this.route(tenantId);
        // Attach shard info to request
        (req as any).shardId = shardId;
      }
      
      next();
    };
  }

  private extractTenantId(req: Request): string | null {
    // Extract from header, subdomain, or JWT
    return req.headers['x-tenant-id'] as string || null;
  }
}

// Export
export const shardManager = new ShardManager('hash');
export const crossShardQuery = new CrossShardQuery(shardManager);
export const shardRouter = new ShardRouter(shardManager);

// Type imports for middleware
import { NextFunction, Response } from 'express';
export { Shard, TenantPlacement };

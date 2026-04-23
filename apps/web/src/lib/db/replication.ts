// Database Replication Manager
// Manage read replicas and failover

import { EventEmitter } from 'events';

type ReplicaStatus = 'healthy' | 'lagging' | 'unavailable' | 'recovering';
type ReplicationMode = 'async' | 'sync' | 'semi-sync';

interface ReplicaNode {
  id: string;
  name: string;
  host: string;
  port: number;
  region: string;
  status: ReplicaStatus;
  mode: ReplicationMode;
  lag: number; // milliseconds
  lastHeartbeat: Date;
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  metrics: {
    queriesPerSecond: number;
    avgQueryTime: number;
    replicationLag: number;
  };
}

interface ReplicationTopology {
  primary: ReplicaNode;
  replicas: ReplicaNode[];
  routing: {
    readPreference: 'primary' | 'secondary' | 'nearest' | 'balanced';
    writeConcern: 'primary' | 'majority' | 'all';
    retryWrites: boolean;
  };
  failover: {
    enabled: boolean;
    automatic: boolean;
    checkInterval: number;
    failoverTimeout: number;
    maxLag: number;
  };
}

interface FailoverEvent {
  timestamp: Date;
  from: string;
  to: string;
  reason: string;
  duration: number;
  manual: boolean;
}

// Replication Manager
export class ReplicationManager extends EventEmitter {
  private topologies: Map<string, ReplicationTopology> = new Map();
  private failovers: Map<string, FailoverEvent[]> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Initialize topology
  initialize(topology: Omit<ReplicationTopology, 'replicas'> & { replicas: Omit<ReplicaNode, 'status' | 'lag' | 'lastHeartbeat' | 'metrics'>[] }): ReplicationTopology {
    const fullTopology: ReplicationTopology = {
      ...topology,
      replicas: topology.replicas.map(r => ({
        ...r,
        status: 'healthy',
        lag: 0,
        lastHeartbeat: new Date(),
        connections: { active: 0, idle: 5, max: 100 },
        metrics: { queriesPerSecond: 0, avgQueryTime: 0, replicationLag: 0 },
      })),
    };

    this.topologies.set(fullTopology.primary.id, fullTopology);
    this.startHealthChecks(fullTopology.primary.id);
    
    this.emit('topologyInitialized', fullTopology);
    return fullTopology;
  }

  // Get connection for read
  getReadConnection(topologyId: string, preference?: ReplicationTopology['routing']['readPreference']): ReplicaNode {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const pref = preference || topology.routing.readPreference;

    switch (pref) {
      case 'primary':
        return topology.primary;
      case 'secondary':
        return this.selectHealthyReplica(topology.replicas) || topology.primary;
      case 'nearest':
        return this.selectNearest(topology);
      case 'balanced':
        return this.selectLeastLoaded(topology);
      default:
        return topology.primary;
    }
  }

  // Get connection for write
  getWriteConnection(topologyId: string): ReplicaNode {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');
    return topology.primary;
  }

  // Perform failover
  async failover(topologyId: string, options: { manual?: boolean; targetReplicaId?: string } = {}): Promise<FailoverEvent> {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const startTime = Date.now();
    
    // Select new primary
    let newPrimary: ReplicaNode;
    if (options.targetReplicaId) {
      newPrimary = topology.replicas.find(r => r.id === options.targetReplicaId)!;
    } else {
      newPrimary = this.selectBestReplica(topology.replicas);
    }

    if (!newPrimary) {
      throw new Error('No suitable replica for failover');
    }

    const event: FailoverEvent = {
      timestamp: new Date(),
      from: topology.primary.id,
      to: newPrimary.id,
      reason: options.manual ? 'manual' : 'primary_unavailable',
      duration: Date.now() - startTime,
      manual: options.manual || false,
    };

    // Update topology
    const oldPrimary = topology.primary;
    topology.primary = newPrimary;
    topology.replicas = topology.replicas.filter(r => r.id !== newPrimary.id);
    topology.replicas.push(oldPrimary);

    // Store event
    const events = this.failovers.get(topologyId) || [];
    events.unshift(event);
    this.failovers.set(topologyId, events.slice(0, 100));

    this.emit('failoverCompleted', event);
    return event;
  }

  // Add replica
  addReplica(topologyId: string, replica: Omit<ReplicaNode, 'status' | 'lag' | 'lastHeartbeat' | 'metrics'>): ReplicaNode {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    const fullReplica: ReplicaNode = {
      ...replica,
      status: 'recovering',
      lag: Infinity,
      lastHeartbeat: new Date(),
      connections: { active: 0, idle: 0, max: 100 },
      metrics: { queriesPerSecond: 0, avgQueryTime: 0, replicationLag: Infinity },
    };

    topology.replicas.push(fullReplica);
    this.emit('replicaAdded', { topologyId, replica: fullReplica });

    return fullReplica;
  }

  // Remove replica
  removeReplica(topologyId: string, replicaId: string): void {
    const topology = this.topologies.get(topologyId);
    if (!topology) throw new Error('Topology not found');

    topology.replicas = topology.replicas.filter(r => r.id !== replicaId);
    this.emit('replicaRemoved', { topologyId, replicaId });
  }

  // Get topology stats
  getStats(topologyId: string): {
    primary: ReplicaNode;
    replicas: ReplicaNode[];
    totalLag: number;
    healthyReplicas: number;
    recentFailovers: number;
  } | null {
    const topology = this.topologies.get(topologyId);
    if (!topology) return null;

    const healthyReplicas = topology.replicas.filter(r => r.status === 'healthy').length;
    const totalLag = topology.replicas.reduce((sum, r) => sum + r.lag, 0);

    const failovers = this.failovers.get(topologyId) || [];
    const recentFailovers = failovers.filter(
      f => f.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return {
      primary: topology.primary,
      replicas: topology.replicas,
      totalLag,
      healthyReplicas,
      recentFailovers,
    };
  }

  // Get failover history
  getFailoverHistory(topologyId: string, limit: number = 50): FailoverEvent[] {
    const events = this.failovers.get(topologyId) || [];
    return events.slice(0, limit);
  }

  // Private methods
  private startHealthChecks(topologyId: string): void {
    const interval = setInterval(() => {
      this.performHealthCheck(topologyId);
    }, 5000);

    this.healthCheckIntervals.set(topologyId, interval);
  }

  private performHealthCheck(topologyId: string): void {
    const topology = this.topologies.get(topologyId);
    if (!topology) return;

    // Check all nodes
    for (const node of [topology.primary, ...topology.replicas]) {
      // Simulate health check
      const isHealthy = Math.random() > 0.05;
      const lag = isHealthy ? Math.floor(Math.random() * 100) : Infinity;

      node.lastHeartbeat = new Date();
      node.lag = lag;
      node.metrics.replicationLag = lag;
      
      if (!isHealthy) {
        node.status = 'unavailable';
        
        // Auto-failover if enabled and primary is down
        if (node.id === topology.primary.id && topology.failover.automatic) {
          this.failover(topologyId).catch(console.error);
        }
      } else if (lag > topology.failover.maxLag) {
        node.status = 'lagging';
      } else {
        node.status = 'healthy';
      }
    }
  }

  private selectHealthyReplica(replicas: ReplicaNode[]): ReplicaNode | null {
    const healthy = replicas.filter(r => r.status === 'healthy');
    if (healthy.length === 0) return null;
    return healthy[Math.floor(Math.random() * healthy.length)];
  }

  private selectNearest(topology: ReplicationTopology): ReplicaNode {
    // Simplified - would use actual latency
    return topology.replicas[0] || topology.primary;
  }

  private selectLeastLoaded(topology: ReplicationTopology): ReplicaNode {
    const candidates = [...topology.replicas, topology.primary];
    return candidates.sort((a, b) => a.connections.active - b.connections.active)[0];
  }

  private selectBestReplica(replicas: ReplicaNode[]): ReplicaNode {
    // Select replica with lowest lag
    const candidates = replicas.filter(r => r.status !== 'unavailable');
    return candidates.sort((a, b) => a.lag - b.lag)[0] || replicas[0];
  }
}

// Export singleton
export const replicationManager = new ReplicationManager();

export { ReplicaNode, ReplicationTopology, FailoverEvent, ReplicaStatus };

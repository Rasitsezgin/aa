// Load Balancer
// Traffic distribution and health checking

import { EventEmitter } from 'events';

type LBAlgorithm = 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted_round_robin' | 'least_response_time';
type LBProtocol = 'http' | 'https' | 'tcp' | 'udp' | 'tls';
type HealthCheckProtocol = 'http' | 'tcp' | 'https';

interface LoadBalancer {
  id: string;
  tenantId: string;
  name: string;
  type: 'application' | 'network' | 'gateway';
  scheme: 'internet-facing' | 'internal';
  state: 'active' | 'provisioning' | 'active_impaired' | 'failed';
  dnsName: string;
  ipAddressType: 'ipv4' | 'dualstack';
  availabilityZones: string[];
  securityGroups: string[];
  vpcId: string;
  subnets: string[];
  listeners: Listener[];
  targetGroups: TargetGroup[];
  attributes: {
    deletionProtection: boolean;
    idleTimeout: number;
    accessLogs: boolean;
    http2: boolean;
    crossZoneLoadBalancing: boolean;
  };
  createdAt: Date;
}

interface Listener {
  id: string;
  protocol: LBProtocol;
  port: number;
  sslPolicy?: string;
  certificates?: string[];
  defaultActions: Array<{
    type: 'forward' | 'redirect' | 'fixed-response' | 'authenticate';
    targetGroupId?: string;
    config?: Record<string, unknown>;
  }>;
  rules: ListenerRule[];
}

interface ListenerRule {
  id: string;
  priority: number;
  conditions: Array<{
    field: 'path' | 'host' | 'header' | 'method' | 'query' | 'source-ip';
    values: string[];
  }>;
  actions: Listener['defaultActions'];
}

interface TargetGroup {
  id: string;
  name: string;
  protocol: LBProtocol;
  port: number;
  vpcId: string;
  targets: Target[];
  healthCheck: {
    protocol: HealthCheckProtocol;
    path: string;
    port: number | 'traffic-port';
    interval: number;
    timeout: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
    successCodes: string;
  };
  algorithm: LBAlgorithm;
  stickiness?: {
    enabled: boolean;
    duration: number;
    type: 'lb_cookie' | 'app_cookie';
    cookieName?: string;
  };
}

interface Target {
  id: string;
  targetId: string; // Instance ID, IP, or Lambda ARN
  port: number;
  availabilityZone?: string;
  state: 'initial' | 'healthy' | 'unhealthy' | 'unused' | 'draining';
  healthCheckState: 'healthy' | 'unhealthy' | 'unknown';
  weight: number;
  requestCount: number;
  connectionCount: number;
  healthySince?: Date;
  lastHealthCheck?: Date;
}

// Load Balancer Manager
export class LoadBalancerManager extends EventEmitter {
  private loadBalancers: Map<string, LoadBalancer> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Create load balancer
  createLoadBalancer(
    config: Omit<LoadBalancer, 'id' | 'state' | 'dnsName' | 'createdAt'>
  ): LoadBalancer {
    const lb: LoadBalancer = {
      ...config,
      id: crypto.randomUUID(),
      state: 'provisioning',
      dnsName: `${config.name}-${Date.now()}.elb.pazaryonetimi.com`,
      createdAt: new Date(),
    };

    this.loadBalancers.set(lb.id, lb);

    // Simulate provisioning
    setTimeout(() => {
      lb.state = 'active';
      this.emit('loadBalancerActive', lb);
      this.startHealthChecks(lb.id);
    }, 2000);

    this.emit('loadBalancerCreated', lb);
    return lb;
  }

  // Create target group
  createTargetGroup(lbId: string, config: Omit<TargetGroup, 'id' | 'targets'>): TargetGroup {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) throw new Error('Load balancer not found');

    const tg: TargetGroup = {
      ...config,
      id: crypto.randomUUID(),
      targets: [],
    };

    lb.targetGroups.push(tg);
    this.emit('targetGroupCreated', { lbId, targetGroup: tg });
    return tg;
  }

  // Register targets
  registerTargets(
    lbId: string,
    tgId: string,
    targets: Array<Omit<Target, 'id' | 'state' | 'healthCheckState' | 'requestCount' | 'connectionCount'>>
  ): Target[] {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) throw new Error('Load balancer not found');

    const tg = lb.targetGroups.find(t => t.id === tgId);
    if (!tg) throw new Error('Target group not found');

    const newTargets: Target[] = targets.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      state: 'initial',
      healthCheckState: 'unknown',
      requestCount: 0,
      connectionCount: 0,
    }));

    tg.targets.push(...newTargets);
    this.emit('targetsRegistered', { lbId, tgId, targets: newTargets });

    return newTargets;
  }

  // Deregister target
  deregisterTarget(lbId: string, tgId: string, targetId: string): void {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) return;

    const tg = lb.targetGroups.find(t => t.id === tgId);
    if (!tg) return;

    const target = tg.targets.find(t => t.id === targetId);
    if (target) {
      target.state = 'draining';
      
      // Remove after draining period
      setTimeout(() => {
        tg.targets = tg.targets.filter(t => t.id !== targetId);
        this.emit('targetDeregistered', { lbId, tgId, targetId });
      }, 300000); // 5 minute drain
    }
  }

  // Create listener
  createListener(
    lbId: string,
    config: Omit<Listener, 'id' | 'rules'>
  ): Listener {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) throw new Error('Load balancer not found');

    const listener: Listener = {
      ...config,
      id: crypto.randomUUID(),
      rules: [],
    };

    lb.listeners.push(listener);
    this.emit('listenerCreated', { lbId, listener });
    return listener;
  }

  // Add listener rule
  addListenerRule(
    lbId: string,
    listenerId: string,
    config: Omit<ListenerRule, 'id'>
  ): ListenerRule {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) throw new Error('Load balancer not found');

    const listener = lb.listeners.find(l => l.id === listenerId);
    if (!listener) throw new Error('Listener not found');

    const rule: ListenerRule = {
      ...config,
      id: crypto.randomUUID(),
    };

    listener.rules.push(rule);
    listener.rules.sort((a, b) => a.priority - b.priority);

    this.emit('ruleAdded', { lbId, listenerId, rule });
    return rule;
  }

  // Get target stats
  getTargetStats(lbId: string, tgId: string): {
    total: number;
    healthy: number;
    unhealthy: number;
    requestCount: number;
    connectionCount: number;
  } | null {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) return null;

    const tg = lb.targetGroups.find(t => t.id === tgId);
    if (!tg) return null;

    return {
      total: tg.targets.length,
      healthy: tg.targets.filter(t => t.healthCheckState === 'healthy').length,
      unhealthy: tg.targets.filter(t => t.healthCheckState === 'unhealthy').length,
      requestCount: tg.targets.reduce((sum, t) => sum + t.requestCount, 0),
      connectionCount: tg.targets.reduce((sum, t) => sum + t.connectionCount, 0),
    };
  }

  // Get load balancer stats
  getLoadBalancerStats(lbId: string): {
    requestCount: number;
    latency: { avg: number; p50: number; p99: number };
    errorRate: number;
    activeConnections: number;
    newConnections: number;
  } | null {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) return null;

    // Aggregate from all target groups
    let requestCount = 0;
    for (const tg of lb.targetGroups) {
      requestCount += tg.targets.reduce((sum, t) => sum + t.requestCount, 0);
    }

    return {
      requestCount,
      latency: { avg: 45, p50: 30, p99: 150 },
      errorRate: 0.01,
      activeConnections: 1250,
      newConnections: 45,
    };
  }

  // List load balancers
  listLoadBalancers(tenantId: string): LoadBalancer[] {
    return Array.from(this.loadBalancers.values())
      .filter(lb => lb.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Delete load balancer
  deleteLoadBalancer(lbId: string): void {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) return;

    // Stop health checks
    const interval = this.healthCheckIntervals.get(lbId);
    if (interval) {
      clearInterval(interval);
    }

    this.loadBalancers.delete(lbId);
    this.emit('loadBalancerDeleted', lb);
  }

  // Private methods
  private startHealthChecks(lbId: string): void {
    const interval = setInterval(() => {
      this.performHealthChecks(lbId);
    }, 10000);

    this.healthCheckIntervals.set(lbId, interval);
  }

  private performHealthChecks(lbId: string): void {
    const lb = this.loadBalancers.get(lbId);
    if (!lb) return;

    for (const tg of lb.targetGroups) {
      for (const target of tg.targets) {
        if (target.state === 'draining') continue;

        // Simulate health check
        const isHealthy = Math.random() > 0.1;
        target.lastHealthCheck = new Date();

        if (isHealthy) {
          target.healthCheckState = 'healthy';
          target.state = 'healthy';
          if (!target.healthySince) {
            target.healthySince = new Date();
          }
        } else {
          target.healthCheckState = 'unhealthy';
          target.state = 'unhealthy';
          target.healthySince = undefined;

          this.emit('targetUnhealthy', { lbId, tgId: tg.id, target });
        }
      }
    }
  }
}

// Export singleton
export const loadBalancerManager = new LoadBalancerManager();

export type { LoadBalancer, TargetGroup, Target, Listener, LBAlgorithm };

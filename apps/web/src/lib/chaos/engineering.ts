// Chaos Engineering
// Fault injection and resilience testing

import { EventEmitter } from 'events';

type ExperimentType = 'latency' | 'failure' | 'cpu' | 'memory' | 'network' | 'disk' | 'kill';
type ExperimentScope = 'service' | 'host' | 'az' | 'region';
type ExperimentStatus = 'pending' | 'running' | 'paused' | 'completed' | 'aborted' | 'failed';

interface ChaosExperiment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ExperimentType;
  scope: ExperimentScope;
  target: {
    service?: string;
    hosts?: string[];
    az?: string;
    region?: string;
    percentage?: number; // % of targets to affect
  };
  attack: {
    duration: number; // seconds
    delay?: number; // latency injection in ms
    cpuLoad?: number; // 0-100
    memoryFill?: number; // MB
    errorRate?: number; // 0-1
    exceptionType?: string;
  };
  monitoring: {
    steadyStateMetric: string;
    tolerance: number;
    autoStop: boolean;
  };
  schedule?: {
    startTime?: Date;
    recurrence?: 'once' | 'hourly' | 'daily' | 'weekly';
  };
  status: ExperimentStatus;
  result?: ExperimentResult;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdBy: string;
}

interface ExperimentResult {
  status: 'passed' | 'failed' | 'inconclusive';
  targetsAffected: number;
  targetsResisted: number;
  metricsBefore: Record<string, number>;
  metricsDuring: Record<string, number>;
  metricsAfter: Record<string, number>;
  findings: string[];
  recommendations: string[];
}

interface BlastRadius {
  services: string[];
  users: number;
  transactions: number;
  dataVolume: number;
}

// Chaos Engineering Manager
export class ChaosEngineering extends EventEmitter {
  private experiments: Map<string, ChaosExperiment> = new Map();
  private activeAttacks: Map<string, NodeJS.Timeout> = new Map();

  // Create experiment
  createExperiment(
    experiment: Omit<ChaosExperiment, 'id' | 'status' | 'createdAt'>
  ): ChaosExperiment {
    const fullExperiment: ChaosExperiment = {
      ...experiment,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    this.experiments.set(fullExperiment.id, fullExperiment);
    this.emit('experimentCreated', fullExperiment);
    return fullExperiment;
  }

  // Start experiment
  async startExperiment(experimentId: string): Promise<ChaosExperiment> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    experiment.status = 'running';
    experiment.startedAt = new Date();

    // Calculate blast radius
    const blastRadius = this.calculateBlastRadius(experiment);
    
    this.emit('experimentStarted', { experiment, blastRadius });

    // Execute attack based on type
    await this.executeAttack(experiment);

    return experiment;
  }

  // Stop experiment
  stopExperiment(experimentId: string, reason?: string): ChaosExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    experiment.status = 'aborted';
    experiment.endedAt = new Date();

    // Clear any active attacks
    const attack = this.activeAttacks.get(experimentId);
    if (attack) {
      clearTimeout(attack);
      this.activeAttacks.delete(experimentId);
    }

    this.emit('experimentStopped', { experiment, reason });
    return experiment;
  }

  // Pause experiment
  pauseExperiment(experimentId: string): ChaosExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      throw new Error('Experiment not running');
    }

    experiment.status = 'paused';
    this.emit('experimentPaused', experiment);
    return experiment;
  }

  // Resume experiment
  resumeExperiment(experimentId: string): ChaosExperiment {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'paused') {
      throw new Error('Experiment not paused');
    }

    experiment.status = 'running';
    this.emit('experimentResumed', experiment);
    return experiment;
  }

  // Get experiment status
  getExperiment(experimentId: string): ChaosExperiment | null {
    return this.experiments.get(experimentId) || null;
  }

  // List experiments
  listExperiments(tenantId: string): ChaosExperiment[] {
    return Array.from(this.experiments.values())
      .filter(e => e.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get experiment history
  getHistory(tenantId: string): {
    total: number;
    passed: number;
    failed: number;
    aborted: number;
    byType: Record<ExperimentType, number>;
  } {
    const experiments = this.listExperiments(tenantId);
    const completed = experiments.filter(e => e.result);

    const byType: Record<ExperimentType, number> = {
      latency: 0, failure: 0, cpu: 0, memory: 0, network: 0, disk: 0, kill: 0,
    };

    for (const exp of experiments) {
      byType[exp.type]++;
    }

    return {
      total: experiments.length,
      passed: completed.filter(e => e.result?.status === 'passed').length,
      failed: completed.filter(e => e.result?.status === 'failed').length,
      aborted: experiments.filter(e => e.status === 'aborted').length,
      byType,
    };
  }

  // Get safety score
  getSafetyScore(tenantId: string): {
    score: number;
    components: {
      faultTolerance: number;
      recoveryTime: number;
      monitoring: number;
      automation: number;
    };
    recommendations: string[];
  } {
    const experiments = this.listExperiments(tenantId);
    const completed = experiments.filter(e => e.result);
    
    const passed = completed.filter(e => e.result?.status === 'passed').length;
    const totalCompleted = completed.length;

    const faultTolerance = totalCompleted > 0 ? (passed / totalCompleted) * 100 : 50;

    return {
      score: Math.round(faultTolerance),
      components: {
        faultTolerance,
        recoveryTime: 85,
        monitoring: 90,
        automation: 70,
      },
      recommendations: this.generateRecommendations(faultTolerance),
    };
  }

  // Private methods
  private calculateBlastRadius(experiment: ChaosExperiment): BlastRadius {
    // Simulate blast radius calculation
    return {
      services: experiment.target.service ? [experiment.target.service] : ['api', 'web', 'db'],
      users: Math.floor(Math.random() * 10000),
      transactions: Math.floor(Math.random() * 100000),
      dataVolume: Math.floor(Math.random() * 1000),
    };
  }

  private async executeAttack(experiment: ChaosExperiment): Promise<void> {
    const { type, attack } = experiment;

    switch (type) {
      case 'latency':
        await this.injectLatency(experiment);
        break;
      case 'failure':
        await this.injectFailures(experiment);
        break;
      case 'cpu':
        await this.stressCPU(experiment);
        break;
      case 'memory':
        await this.stressMemory(experiment);
        break;
      case 'kill':
        await this.killProcess(experiment);
        break;
      default:
        console.log(`Attack type ${type} not implemented`);
    }

    // Schedule end
    const timeout = setTimeout(() => {
      this.completeExperiment(experiment);
    }, attack.duration * 1000);

    this.activeAttacks.set(experiment.id, timeout);
  }

  private async injectLatency(experiment: ChaosExperiment): Promise<void> {
    console.log(`Injecting ${experiment.attack.delay}ms latency for ${experiment.attack.duration}s`);
    // In production: Use network traffic control, proxy delays
  }

  private async injectFailures(experiment: ChaosExperiment): Promise<void> {
    console.log(`Injecting ${experiment.attack.errorRate * 100}% error rate`);
    // In production: Use service mesh fault injection, middleware
  }

  private async stressCPU(experiment: ChaosExperiment): Promise<void> {
    console.log(`Stressing CPU to ${experiment.attack.cpuLoad}%`);
    // In production: Use stress-ng, CPU workers
  }

  private async stressMemory(experiment: ChaosExperiment): Promise<void> {
    console.log(`Filling ${experiment.attack.memoryFill}MB memory`);
    // In production: Allocate memory blocks
  }

  private async killProcess(experiment: ChaosExperiment): Promise<void> {
    console.log(`Killing process: ${experiment.target.service}`);
    // In production: Send SIGTERM, orchestrator handles restart
  }

  private completeExperiment(experiment: ChaosExperiment): void {
    experiment.status = 'completed';
    experiment.endedAt = new Date();

    // Generate result
    experiment.result = {
      status: Math.random() > 0.3 ? 'passed' : 'failed',
      targetsAffected: Math.floor(Math.random() * 5),
      targetsResisted: Math.floor(Math.random() * 10),
      metricsBefore: { cpu: 30, memory: 50, latency: 100 },
      metricsDuring: { cpu: 80, memory: 70, latency: 500 },
      metricsAfter: { cpu: 35, memory: 52, latency: 110 },
      findings: [
        'System recovered within SLA',
        'Auto-scaling triggered as expected',
        'Circuit breakers prevented cascade failure',
      ],
      recommendations: [
        'Consider increasing timeout thresholds',
        'Add more aggressive retry policies',
      ],
    };

    this.emit('experimentCompleted', experiment);
  }

  private generateRecommendations(faultTolerance: number): string[] {
    const recommendations: string[] = [];

    if (faultTolerance < 50) {
      recommendations.push('Implement circuit breakers for critical services');
      recommendations.push('Add health checks and auto-restart policies');
    }

    if (faultTolerance < 70) {
      recommendations.push('Increase test coverage for failure scenarios');
      recommendations.push('Implement graceful degradation patterns');
    }

    if (faultTolerance < 90) {
      recommendations.push('Run chaos experiments more frequently');
      recommendations.push('Add distributed tracing for better diagnostics');
    }

    return recommendations;
  }
}

// Predefined experiment templates
export const CHAOS_TEMPLATES = {
  api_latency: {
    name: 'API Latency Injection',
    type: 'latency' as const,
    scope: 'service' as const,
    attack: { duration: 300, delay: 1000 },
    monitoring: { steadyStateMetric: 'p99_latency', tolerance: 2000, autoStop: true },
  },
  database_failure: {
    name: 'Database Connection Failure',
    type: 'failure' as const,
    scope: 'service' as const,
    attack: { duration: 180, errorRate: 0.5, exceptionType: 'ConnectionTimeout' },
    monitoring: { steadyStateMetric: 'error_rate', tolerance: 0.05, autoStop: true },
  },
  memory_pressure: {
    name: 'Memory Pressure Test',
    type: 'memory' as const,
    scope: 'host' as const,
    attack: { duration: 600, memoryFill: 1024 },
    monitoring: { steadyStateMetric: 'memory_usage', tolerance: 90, autoStop: true },
  },
  service_kill: {
    name: 'Random Service Kill',
    type: 'kill' as const,
    scope: 'service' as const,
    attack: { duration: 60 },
    monitoring: { steadyStateMetric: 'availability', tolerance: 99.9, autoStop: true },
  },
};

// Export singleton
export const chaosEngineering = new ChaosEngineering();

export { ChaosExperiment, ExperimentResult, ExperimentType };

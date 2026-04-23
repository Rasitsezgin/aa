// Serverless Functions Manager
// Manage and deploy serverless functions for custom logic

import { EventEmitter } from 'events';

type FunctionRuntime = 'node18' | 'node20' | 'python3.9' | 'python3.11' | 'deno';
type FunctionStatus = 'draft' | 'building' | 'ready' | 'deployed' | 'failed' | 'disabled';
type TriggerType = 'http' | 'schedule' | 'event' | 'webhook' | 'queue';

interface ServerlessFunction {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  runtime: FunctionRuntime;
  entryPoint: string;
  code: string;
  status: FunctionStatus;
  version: string;
  environment: Record<string, string>;
  memory: number; // MB
  timeout: number; // seconds
  triggers: Array<{
    type: TriggerType;
    config: Record<string, unknown>;
    enabled: boolean;
  }>;
  deployment?: {
    url?: string;
    status: 'idle' | 'building' | 'deployed' | 'failed';
    lastDeployedAt?: Date;
    buildLogs: string[];
    error?: string;
  };
  stats: {
    invocations: number;
    errors: number;
    averageDuration: number;
    lastInvocationAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface FunctionExecution {
  id: string;
  functionId: string;
  tenantId: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  logs: string[];
  memoryUsed?: number;
  triggeredBy: 'http' | 'schedule' | 'event' | 'manual';
  requestId?: string;
}

interface FunctionTemplate {
  id: string;
  name: string;
  description: string;
  runtime: FunctionRuntime;
  code: string;
  triggers: TriggerType[];
  exampleInput?: Record<string, unknown>;
}

// Serverless Functions Manager
export class ServerlessFunctionsManager extends EventEmitter {
  private functions: Map<string, ServerlessFunction> = new Map();
  private executions: Map<string, FunctionExecution[]> = new Map();
  private templates: Map<string, FunctionTemplate> = new Map();

  constructor() {
    super();
    this.registerDefaultTemplates();
  }

  // Create function
  createFunction(config: Omit<ServerlessFunction, 'id' | 'status' | 'version' | 'deployment' | 'stats' | 'createdAt' | 'updatedAt'>): ServerlessFunction {
    const fn: ServerlessFunction = {
      ...config,
      id: crypto.randomUUID(),
      status: 'draft',
      version: '1.0.0',
      deployment: {
        status: 'idle',
        buildLogs: [],
      },
      stats: {
        invocations: 0,
        errors: 0,
        averageDuration: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.functions.set(fn.id, fn);
    this.emit('functionCreated', fn);
    return fn;
  }

  // Create from template
  createFromTemplate(
    tenantId: string,
    templateId: string,
    name: string,
    createdBy: string
  ): ServerlessFunction {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    return this.createFunction({
      tenantId,
      name,
      runtime: template.runtime,
      entryPoint: 'handler',
      code: template.code,
      environment: {},
      memory: 256,
      timeout: 30,
      triggers: template.triggers.map(type => ({
        type,
        config: {},
        enabled: true,
      })),
      createdBy,
    });
  }

  // Deploy function
  async deploy(functionId: string): Promise<ServerlessFunction> {
    const fn = this.functions.get(functionId);
    if (!fn) throw new Error('Function not found');

    fn.status = 'building';
    fn.deployment!.status = 'building';
    fn.deployment!.buildLogs = [];

    this.emit('deploymentStarted', fn);

    try {
      // Step 1: Validate code
      this.logBuild(fn, 'Validating code...');
      await this.validateCode(fn);

      // Step 2: Build
      this.logBuild(fn, 'Building function...');
      await this.buildFunction(fn);

      // Step 3: Deploy
      this.logBuild(fn, 'Deploying to infrastructure...');
      const deployment = await this.deployToInfrastructure(fn);

      fn.deployment!.url = deployment.url;
      fn.deployment!.status = 'deployed';
      fn.deployment!.lastDeployedAt = new Date();
      fn.status = 'deployed';
      fn.version = this.incrementVersion(fn.version);

      this.logBuild(fn, 'Deployment successful!');
      this.emit('deploymentCompleted', fn);

    } catch (error) {
      fn.status = 'failed';
      fn.deployment!.status = 'failed';
      fn.deployment!.error = String(error);
      this.logBuild(fn, `Error: ${error}`);
      this.emit('deploymentFailed', { fn, error });
      throw error;
    }

    fn.updatedAt = new Date();
    return fn;
  }

  // Invoke function
  async invoke(
    functionId: string,
    input: Record<string, unknown>,
    options: {
      triggeredBy?: FunctionExecution['triggeredBy'];
      requestId?: string;
    } = {}
  ): Promise<FunctionExecution> {
    const fn = this.functions.get(functionId);
    if (!fn) throw new Error('Function not found');

    if (fn.status !== 'deployed') {
      throw new Error('Function is not deployed');
    }

    const execution: FunctionExecution = {
      id: crypto.randomUUID(),
      functionId,
      tenantId: fn.tenantId,
      status: 'running',
      startedAt: new Date(),
      input,
      logs: [],
      triggeredBy: options.triggeredBy || 'manual',
      requestId: options.requestId,
    };

    // Store execution
    const executions = this.executions.get(functionId) || [];
    executions.unshift(execution);
    this.executions.set(functionId, executions.slice(0, 1000));

    // Execute with timeout
    const timeoutMs = fn.timeout * 1000;
    
    try {
      const result = await Promise.race([
        this.executeFunction(fn, execution),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function timeout')), timeoutMs)
        ),
      ]);

      execution.status = 'completed';
      execution.output = result;

    } catch (error) {
      execution.status = error instanceof Error && error.message === 'Function timeout' 
        ? 'timeout' 
        : 'failed';
      execution.error = String(error);
    }

    execution.completedAt = new Date();
    execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();

    // Update stats
    fn.stats.invocations++;
    if (execution.status === 'failed' || execution.status === 'timeout') {
      fn.stats.errors++;
    }
    fn.stats.averageDuration = 
      (fn.stats.averageDuration * (fn.stats.invocations - 1) + (execution.duration || 0)) / 
      fn.stats.invocations;
    fn.stats.lastInvocationAt = new Date();

    this.emit('executionCompleted', execution);
    return execution;
  }

  // HTTP trigger handler
  async handleHTTPRequest(
    functionId: string,
    request: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body: unknown;
      query: Record<string, string>;
    }
  ): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }> {
    const input = {
      httpMethod: request.method,
      path: request.path,
      headers: request.headers,
      body: request.body,
      queryStringParameters: request.query,
    };

    const execution = await this.invoke(functionId, input, { triggeredBy: 'http' });

    if (execution.status === 'failed' || execution.status === 'timeout') {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: execution.error }),
      };
    }

    const output = execution.output as { 
      statusCode?: number; 
      headers?: Record<string, string>; 
      body?: string;
    } || {};

    return {
      statusCode: output.statusCode || 200,
      headers: output.headers || { 'Content-Type': 'application/json' },
      body: output.body || JSON.stringify(execution.output),
    };
  }

  // Schedule trigger
  async handleScheduledEvent(functionId: string, schedule: string): Promise<void> {
    await this.invoke(functionId, { schedule }, { triggeredBy: 'schedule' });
  }

  // Event trigger
  async handleEvent(functionId: string, event: { type: string; data: unknown }): Promise<void> {
    await this.invoke(functionId, { event }, { triggeredBy: 'event' });
  }

  // Update function code
  updateCode(functionId: string, code: string): ServerlessFunction {
    const fn = this.functions.get(functionId);
    if (!fn) throw new Error('Function not found');

    fn.code = code;
    fn.status = 'draft';
    fn.updatedAt = new Date();

    return fn;
  }

  // Update function config
  updateConfig(
    functionId: string,
    config: Partial<Pick<ServerlessFunction, 'environment' | 'memory' | 'timeout' | 'triggers'>>
  ): ServerlessFunction {
    const fn = this.functions.get(functionId);
    if (!fn) throw new Error('Function not found');

    Object.assign(fn, config);
    fn.updatedAt = new Date();

    return fn;
  }

  // Delete function
  deleteFunction(functionId: string): void {
    this.functions.delete(functionId);
    this.executions.delete(functionId);
  }

  // Get function
  getFunction(functionId: string): ServerlessFunction | null {
    return this.functions.get(functionId) || null;
  }

  // List functions for tenant
  listFunctions(tenantId: string, options: {
    status?: FunctionStatus;
    runtime?: FunctionRuntime;
  } = {}): ServerlessFunction[] {
    let fns = Array.from(this.functions.values()).filter(fn => fn.tenantId === tenantId);

    if (options.status) {
      fns = fns.filter(fn => fn.status === options.status);
    }

    if (options.runtime) {
      fns = fns.filter(fn => fn.runtime === options.runtime);
    }

    return fns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get execution history
  getExecutionHistory(
    functionId: string,
    options: {
      limit?: number;
      status?: FunctionExecution['status'];
    } = {}
  ): FunctionExecution[] {
    const executions = this.executions.get(functionId) || [];
    let filtered = [...executions];

    if (options.status) {
      filtered = filtered.filter(e => e.status === options.status);
    }

    return filtered.slice(0, options.limit || 100);
  }

  // Get function stats
  getStats(functionId: string): ServerlessFunction['stats'] & {
    errorRate: number;
    last24h: {
      invocations: number;
      errors: number;
    };
  } | null {
    const fn = this.functions.get(functionId);
    if (!fn) return null;

    const executions = this.executions.get(functionId) || [];
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentExecutions = executions.filter(e => e.startedAt >= last24h);

    return {
      ...fn.stats,
      errorRate: fn.stats.invocations > 0 ? (fn.stats.errors / fn.stats.invocations) * 100 : 0,
      last24h: {
        invocations: recentExecutions.length,
        errors: recentExecutions.filter(e => e.status === 'failed').length,
      },
    };
  }

  // Get logs
  getLogs(functionId: string, executionId?: string): string[] {
    if (executionId) {
      const executions = this.executions.get(functionId) || [];
      const execution = executions.find(e => e.id === executionId);
      return execution?.logs || [];
    }

    const fn = this.functions.get(functionId);
    return fn?.deployment?.buildLogs || [];
  }

  // List templates
  listTemplates(): FunctionTemplate[] {
    return Array.from(this.templates.values());
  }

  // Private methods
  private async validateCode(fn: ServerlessFunction): Promise<void> {
    // In production:
    // - Syntax check
    // - Lint
    // - Security scan
    // - Dependency check

    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic syntax check for JavaScript
    if (fn.runtime.startsWith('node')) {
      try {
        new Function(fn.code);
      } catch (error) {
        throw new Error(`Syntax error: ${error}`);
      }
    }
  }

  private async buildFunction(fn: ServerlessFunction): Promise<void> {
    // In production:
    // - Install dependencies
    // - Transpile TypeScript
    // - Bundle
    // - Optimize

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async deployToInfrastructure(fn: ServerlessFunction): Promise<{ url: string }> {
    // In production:
    // - Upload to serverless platform (AWS Lambda, Cloudflare Workers, Vercel, etc.)
    // - Configure triggers
    // - Set up routing

    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      url: `/api/v1/functions/${fn.id}/invoke`,
    };
  }

  private async executeFunction(
    fn: ServerlessFunction,
    execution: FunctionExecution
  ): Promise<unknown> {
    // In production:
    // - Run in isolated sandbox
    // - Set up context with environment variables
    // - Capture logs
    // - Handle return value

    execution.logs.push(`[${new Date().toISOString()}] Function started`);
    execution.logs.push(`[${new Date().toISOString()}] Memory: ${fn.memory}MB`);

    // Mock execution
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate console.log capture
    execution.logs.push(`[${new Date().toISOString()}] Processing input...`);

    // Mock output based on function name
    let output: unknown;
    
    if (fn.name.includes('webhook')) {
      output = { received: true, processed: 1 };
    } else if (fn.name.includes('notification')) {
      output = { sent: 5, failed: 0 };
    } else if (fn.name.includes('report')) {
      output = { generated: true, url: 'https://example.com/report.pdf' };
    } else {
      output = { success: true, data: execution.input };
    }

    execution.logs.push(`[${new Date().toISOString()}] Function completed`);
    execution.memoryUsed = Math.floor(Math.random() * fn.memory);

    return output;
  }

  private logBuild(fn: ServerlessFunction, message: string): void {
    const timestamp = new Date().toISOString();
    fn.deployment!.buildLogs.push(`[${timestamp}] ${message}`);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2]++;
    if (parts[2] > 99) {
      parts[2] = 0;
      parts[1]++;
    }
    if (parts[1] > 99) {
      parts[1] = 0;
      parts[0]++;
    }
    return parts.join('.');
  }

  private registerDefaultTemplates(): void {
    this.templates.set('webhook-handler', {
      id: 'webhook-handler',
      name: 'Webhook Handler',
      description: 'Process incoming webhooks from external services',
      runtime: 'node20',
      code: `exports.handler = async (event) => {
  const { body, headers } = event;
  
  // Verify webhook signature
  const signature = headers['x-webhook-signature'];
  
  // Process payload
  const payload = JSON.parse(body);
  
  // Your logic here
  console.log('Received webhook:', payload);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};`,
      triggers: ['http'],
      exampleInput: {
        httpMethod: 'POST',
        headers: { 'x-webhook-signature': 'sha256=...' },
        body: '{"event": "order.created"}',
      },
    });

    this.templates.set('scheduled-task', {
      id: 'scheduled-task',
      name: 'Scheduled Task',
      description: 'Run periodic background jobs',
      runtime: 'node20',
      code: `exports.handler = async (event) => {
  const { schedule } = event;
  
  console.log('Running scheduled task:', schedule);
  
  // Your periodic logic here
  // e.g., cleanup, report generation, data sync
  
  return { success: true, processed: 100 };
};`,
      triggers: ['schedule'],
    });

    this.templates.set('data-transform', {
      id: 'data-transform',
      name: 'Data Transformer',
      description: 'Transform data on import/export',
      runtime: 'node20',
      code: `exports.handler = async (event) => {
  const { records } = event;
  
  const transformed = records.map(record => {
    // Transform logic
    return {
      ...record,
      formattedDate: new Date(record.date).toISOString(),
      calculatedValue: record.price * record.quantity
    };
  });
  
  return { transformed };
};`,
      triggers: ['event'],
    });

    this.templates.set('notification-sender', {
      id: 'notification-sender',
      name: 'Notification Sender',
      description: 'Send notifications via email, SMS, or push',
      runtime: 'node20',
      code: `exports.handler = async (event) => {
  const { userId, message, channels } = event;
  
  const results = {};
  
  for (const channel of channels) {
    switch(channel) {
      case 'email':
        results.email = await sendEmail(userId, message);
        break;
      case 'sms':
        results.sms = await sendSMS(userId, message);
        break;
      case 'push':
        results.push = await sendPush(userId, message);
        break;
    }
  }
  
  return results;
};`,
      triggers: ['event', 'http'],
    });
  }
}

// Export singleton
export const serverlessFunctionsManager = new ServerlessFunctionsManager();

export { ServerlessFunction, FunctionExecution, FunctionTemplate, TriggerType };

// GraphQL Schema Builder
// Build and manage GraphQL APIs

import { EventEmitter } from 'events';

type GraphQLType = 'String' | 'Int' | 'Float' | 'Boolean' | 'ID' | 'Object' | 'Enum' | 'Interface' | 'Union';

interface GraphQLField {
  name: string;
  type: string;
  required?: boolean;
  list?: boolean;
  args?: Array<{
    name: string;
    type: string;
    required?: boolean;
    defaultValue?: unknown;
  }>;
  resolver?: string;
  description?: string;
}

interface GraphQLTypeDef {
  name: string;
  kind: GraphQLType;
  fields?: GraphQLField[];
  values?: string[]; // For enum
  interfaces?: string[]; // For object types
  description?: string;
}

interface GraphQLSchema {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  types: GraphQLTypeDef[];
  queries: GraphQLField[];
  mutations: GraphQLField[];
  subscriptions: GraphQLField[];
  directives: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface QueryExecution {
  id: string;
  schemaId: string;
  query: string;
  variables?: Record<string, unknown>;
  operation?: string;
  result?: unknown;
  errors?: string[];
  duration: number;
  complexity: number;
  timestamp: Date;
}

// GraphQL Manager
export class GraphQLManager extends EventEmitter {
  private schemas: Map<string, GraphQLSchema> = new Map();
  private executions: Map<string, QueryExecution[]> = new Map();

  // Create schema
  createSchema(config: Omit<GraphQLSchema, 'id' | 'createdAt' | 'updatedAt'>): GraphQLSchema {
    const schema: GraphQLSchema = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.schemas.set(schema.id, schema);
    this.emit('schemaCreated', schema);
    return schema;
  }

  // Add type to schema
  addType(schemaId: string, type: GraphQLTypeDef): GraphQLTypeDef {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error('Schema not found');

    schema.types.push(type);
    schema.updatedAt = new Date();
    return type;
  }

  // Add query
  addQuery(schemaId: string, query: GraphQLField): GraphQLField {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error('Schema not found');

    schema.queries.push(query);
    schema.updatedAt = new Date();
    return query;
  }

  // Add mutation
  addMutation(schemaId: string, mutation: GraphQLField): GraphQLField {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error('Schema not found');

    schema.mutations.push(mutation);
    schema.updatedAt = new Date();
    return mutation;
  }

  // Generate SDL
  generateSDL(schemaId: string): string {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error('Schema not found');

    let sdl = '';

    // Types
    for (const type of schema.types) {
      sdl += this.generateTypeSDL(type);
    }

    // Queries
    if (schema.queries.length > 0) {
      sdl += '\ntype Query {\n';
      for (const q of schema.queries) {
        sdl += `  ${this.generateFieldSDL(q)}\n`;
      }
      sdl += '}\n';
    }

    // Mutations
    if (schema.mutations.length > 0) {
      sdl += '\ntype Mutation {\n';
      for (const m of schema.mutations) {
        sdl += `  ${this.generateFieldSDL(m)}\n`;
      }
      sdl += '}\n';
    }

    return sdl;
  }

  // Execute query
  async execute(
    schemaId: string,
    query: string,
    options: {
      variables?: Record<string, unknown>;
      operation?: string;
      context?: Record<string, unknown>;
    } = {}
  ): Promise<{
    data?: unknown;
    errors?: string[];
    extensions?: {
      duration: number;
      complexity: number;
    };
  }> {
    const startTime = Date.now();
    const complexity = this.calculateComplexity(query);

    const execution: QueryExecution = {
      id: crypto.randomUUID(),
      schemaId,
      query,
      variables: options.variables,
      operation: options.operation,
      duration: 0,
      complexity,
      timestamp: new Date(),
    };

    try {
      // Mock execution
      const result = await this.resolveQuery(schemaId, query, options.variables);
      execution.result = result;
      execution.duration = Date.now() - startTime;

      // Store execution
      const executions = this.executions.get(schemaId) || [];
      executions.push(execution);
      this.executions.set(schemaId, executions.slice(-1000));

      this.emit('queryExecuted', execution);

      return {
        data: result,
        extensions: {
          duration: execution.duration,
          complexity,
        },
      };

    } catch (error) {
      execution.errors = [String(error)];
      execution.duration = Date.now() - startTime;

      return {
        errors: execution.errors,
        extensions: {
          duration: execution.duration,
          complexity,
        },
      };
    }
  }

  // Get query complexity score
  calculateComplexity(query: string): number {
    // Simple complexity estimation
    let score = 0;
    
    // Count fields
    const fields = (query.match(/\w+(?=\s*\{)/g) || []).length;
    score += fields * 1;

    // Count nested levels
    const depth = (query.match(/\{/g) || []).length;
    score += depth * 2;

    // Count arguments
    const args = (query.match(/\([^)]*\)/g) || []).length;
    score += args * 0.5;

    return Math.min(score, 100);
  }

  // Introspection
  introspect(schemaId: string): Record<string, unknown> {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error('Schema not found');

    return {
      types: schema.types,
      queries: schema.queries.map(q => ({ name: q.name, type: q.type })),
      mutations: schema.mutations.map(m => ({ name: m.name, type: m.type })),
    };
  }

  // Get schemas for tenant
  getSchemas(tenantId: string): GraphQLSchema[] {
    return Array.from(this.schemas.values())
      .filter(s => s.tenantId === tenantId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get query history
  getQueryHistory(schemaId: string, limit: number = 100): QueryExecution[] {
    const executions = this.executions.get(schemaId) || [];
    return executions.slice(0, limit);
  }

  // Private methods
  private generateTypeSDL(type: GraphQLTypeDef): string {
    let sdl = '';

    if (type.kind === 'Enum') {
      sdl += `\nenum ${type.name} {\n`;
      for (const val of type.values || []) {
        sdl += `  ${val}\n`;
      }
      sdl += '}\n';
    } else if (type.kind === 'Object') {
      sdl += `\ntype ${type.name}`;
      if (type.interfaces?.length) {
        sdl += ` implements ${type.interfaces.join(' & ')}`;
      }
      sdl += ' {\n';
      for (const field of type.fields || []) {
        sdl += `  ${this.generateFieldSDL(field)}\n`;
      }
      sdl += '}\n';
    }

    return sdl;
  }

  private generateFieldSDL(field: GraphQLField): string {
    let sdl = field.name;

    // Args
    if (field.args?.length) {
      const args = field.args.map(a => {
        let arg = `${a.name}: ${a.type}`;
        if (a.required) arg += '!';
        return arg;
      }).join(', ');
      sdl += `(${args})`;
    }

    // Type
    sdl += ': ';
    if (field.list) sdl += '[';
    sdl += field.type;
    if (field.list) sdl += ']';
    if (field.required) sdl += '!';

    return sdl;
  }

  private async resolveQuery(
    schemaId: string,
    query: string,
    variables?: Record<string, unknown>
  ): Promise<unknown> {
    // Mock resolver
    return { status: 'ok', query, variables };
  }
}

// Predefined e-commerce schema
export const ECOMMERCE_SCHEMA = {
  types: [
    {
      name: 'Product',
      kind: 'Object' as const,
      fields: [
        { name: 'id', type: 'ID', required: true },
        { name: 'name', type: 'String', required: true },
        { name: 'price', type: 'Float', required: true },
        { name: 'stock', type: 'Int' },
        { name: 'category', type: 'Category' },
      ],
    },
    {
      name: 'Category',
      kind: 'Object' as const,
      fields: [
        { name: 'id', type: 'ID', required: true },
        { name: 'name', type: 'String', required: true },
        { name: 'products', type: 'Product', list: true },
      ],
    },
    {
      name: 'Order',
      kind: 'Object' as const,
      fields: [
        { name: 'id', type: 'ID', required: true },
        { name: 'customer', type: 'Customer', required: true },
        { name: 'items', type: 'OrderItem', list: true, required: true },
        { name: 'total', type: 'Float', required: true },
        { name: 'status', type: 'OrderStatus', required: true },
      ],
    },
    {
      name: 'OrderItem',
      kind: 'Object' as const,
      fields: [
        { name: 'product', type: 'Product', required: true },
        { name: 'quantity', type: 'Int', required: true },
        { name: 'price', type: 'Float', required: true },
      ],
    },
    {
      name: 'Customer',
      kind: 'Object' as const,
      fields: [
        { name: 'id', type: 'ID', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'name', type: 'String' },
        { name: 'orders', type: 'Order', list: true },
      ],
    },
    {
      name: 'OrderStatus',
      kind: 'Enum' as const,
      values: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    },
  ],
  queries: [
    {
      name: 'products',
      type: 'Product',
      list: true,
      args: [
        { name: 'limit', type: 'Int', defaultValue: 10 },
        { name: 'offset', type: 'Int', defaultValue: 0 },
        { name: 'categoryId', type: 'ID' },
      ],
    },
    {
      name: 'product',
      type: 'Product',
      args: [
        { name: 'id', type: 'ID', required: true },
      ],
    },
    {
      name: 'orders',
      type: 'Order',
      list: true,
      args: [
        { name: 'status', type: 'OrderStatus' },
        { name: 'from', type: 'String' },
        { name: 'to', type: 'String' },
      ],
    },
    {
      name: 'customer',
      type: 'Customer',
      args: [
        { name: 'id', type: 'ID', required: true },
      ],
    },
  ],
  mutations: [
    {
      name: 'createOrder',
      type: 'Order',
      required: true,
      args: [
        { name: 'input', type: 'CreateOrderInput', required: true },
      ],
    },
    {
      name: 'updateOrderStatus',
      type: 'Order',
      args: [
        { name: 'id', type: 'ID', required: true },
        { name: 'status', type: 'OrderStatus', required: true },
      ],
    },
  ],
};

// Export singleton
export const graphQLManager = new GraphQLManager();

export { GraphQLSchema, GraphQLTypeDef, GraphQLField, QueryExecution };

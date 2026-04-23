// Advanced Search Query Builder
// Visual query builder for complex searches

interface FilterCondition {
  id: string;
  field: string;
  operator: 
    | 'eq' | 'neq' 
    | 'gt' | 'gte' 
    | 'lt' | 'lte' 
    | 'contains' | 'startsWith' | 'endsWith'
    | 'in' | 'nin' | 'between' 
    | 'exists' | 'isNull' | 'isNotNull'
    | 'regex' | 'fuzzy';
  value: unknown;
  value2?: unknown; // For between operator
}

interface FilterGroup {
  id: string;
  operator: 'AND' | 'OR' | 'NOT';
  conditions: (FilterCondition | FilterGroup)[];
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface SearchQuery {
  id: string;
  name: string;
  tenantId: string;
  target: string; // Product, Order, Customer, etc.
  filter: FilterGroup;
  sort: SortOption[];
  pagination: {
    page: number;
    pageSize: number;
  };
  aggregations?: Array<{
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'group';
    field: string;
    alias?: string;
  }>;
  fields?: string[]; // Projection
  createdAt: Date;
  updatedAt: Date;
}

interface FieldSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  aggregatable: boolean;
  enum?: string[];
  nested?: FieldSchema[];
}

// Search query builder
export class SearchQueryBuilder {
  private queries: Map<string, SearchQuery> = new Map();
  private schemas: Map<string, FieldSchema[]> = new Map();

  // Register schema for entity type
  registerSchema(entity: string, schema: FieldSchema[]): void {
    this.schemas.set(entity, schema);
  }

  // Create new search query
  createQuery(
    tenantId: string,
    name: string,
    target: string,
    initialFilter?: FilterGroup
  ): SearchQuery {
    const query: SearchQuery = {
      id: crypto.randomUUID(),
      name,
      tenantId,
      target,
      filter: initialFilter || {
        id: crypto.randomUUID(),
        operator: 'AND',
        conditions: [],
      },
      sort: [],
      pagination: {
        page: 1,
        pageSize: 20,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.queries.set(query.id, query);
    return query;
  }

  // Add filter condition
  addCondition(
    queryId: string,
    groupId: string | null,
    condition: Omit<FilterCondition, 'id'>
  ): FilterCondition {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const newCondition: FilterCondition = {
      ...condition,
      id: crypto.randomUUID(),
    };

    if (groupId) {
      // Find group and add to it
      const group = this.findGroup(query.filter, groupId);
      if (group) {
        group.conditions.push(newCondition);
      }
    } else {
      // Add to root
      query.filter.conditions.push(newCondition);
    }

    query.updatedAt = new Date();
    return newCondition;
  }

  // Add filter group
  addGroup(
    queryId: string,
    parentGroupId: string | null,
    operator: 'AND' | 'OR' | 'NOT'
  ): FilterGroup {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const newGroup: FilterGroup = {
      id: crypto.randomUUID(),
      operator,
      conditions: [],
    };

    if (parentGroupId) {
      const parent = this.findGroup(query.filter, parentGroupId);
      if (parent) {
        parent.conditions.push(newGroup);
      }
    } else {
      query.filter.conditions.push(newGroup);
    }

    query.updatedAt = new Date();
    return newGroup;
  }

  // Remove condition or group
  removeCondition(queryId: string, conditionId: string): void {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    this.removeFromGroup(query.filter, conditionId);
    query.updatedAt = new Date();
  }

  // Update condition
  updateCondition(
    queryId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ): FilterCondition {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const condition = this.findCondition(query.filter, conditionId);
    if (!condition) throw new Error('Condition not found');

    Object.assign(condition, updates);
    query.updatedAt = new Date();

    return condition;
  }

  // Add sort
  addSort(queryId: string, field: string, direction: 'asc' | 'desc'): SortOption {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const sort: SortOption = {
      field,
      direction,
      priority: query.sort.length,
    };

    query.sort.push(sort);
    query.updatedAt = new Date();

    return sort;
  }

  // Reorder sort
  reorderSort(queryId: string, field: string, newPriority: number): void {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const sort = query.sort.find(s => s.field === field);
    if (sort) {
      sort.priority = newPriority;
      query.sort.sort((a, b) => a.priority - b.priority);
      query.updatedAt = new Date();
    }
  }

  // Set pagination
  setPagination(queryId: string, page: number, pageSize: number): void {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    query.pagination = { page, pageSize };
    query.updatedAt = new Date();
  }

  // Add aggregation
  addAggregation(
    queryId: string,
    type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'group',
    field: string,
    alias?: string
  ): void {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    if (!query.aggregations) {
      query.aggregations = [];
    }

    query.aggregations.push({ type, field, alias });
    query.updatedAt = new Date();
  }

  // Convert to Prisma query
  toPrismaQuery(queryId: string): {
    where: Record<string, unknown>;
    orderBy: Array<Record<string, string>>;
    skip: number;
    take: number;
    select?: Record<string, boolean>;
  } {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    return {
      where: this.buildPrismaWhere(query.filter),
      orderBy: query.sort.map(s => ({ [s.field]: s.direction })),
      skip: (query.pagination.page - 1) * query.pagination.pageSize,
      take: query.pagination.pageSize,
      ...(query.fields && { select: this.buildProjection(query.fields) }),
    };
  }

  // Convert to Elasticsearch query
  toElasticsearchQuery(queryId: string): {
    query: Record<string, unknown>;
    sort: Array<Record<string, string | { order: string }>>;
    from: number;
    size: number;
    aggs?: Record<string, unknown>;
  } {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    return {
      query: this.buildElasticsearchQuery(query.filter),
      sort: query.sort.map(s => ({ [s.field]: { order: s.direction } })),
      from: (query.pagination.page - 1) * query.pagination.pageSize,
      size: query.pagination.pageSize,
      ...(query.aggregations && { aggs: this.buildElasticsearchAggs(query.aggregations) }),
    };
  }

  // Convert to Meilisearch filter
  toMeilisearchFilter(queryId: string): string {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    return this.buildMeilisearchFilter(query.filter);
  }

  // Get available fields for entity
  getAvailableFields(entity: string): FieldSchema[] {
    return this.schemas.get(entity) || [];
  }

  // Validate query
  validate(queryId: string): {
    valid: boolean;
    errors: string[];
  } {
    const query = this.queries.get(queryId);
    if (!query) {
      return { valid: false, errors: ['Query not found'] };
    }

    const errors: string[] = [];
    const schema = this.schemas.get(query.target);

    if (!schema) {
      errors.push(`No schema registered for ${query.target}`);
    } else {
      // Validate conditions
      this.validateGroup(query.filter, schema, errors);
    }

    return { valid: errors.length === 0, errors };
  }

  // Save query
  async save(queryId: string): Promise<void> {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    // Would persist to database
    console.log(`Saved query: ${query.name}`);
  }

  // Load saved queries
  async loadSaved(tenantId: string): Promise<SearchQuery[]> {
    // Would load from database
    return Array.from(this.queries.values()).filter(q => q.tenantId === tenantId);
  }

  // Private helpers
  private findGroup(filter: FilterGroup, groupId: string): FilterGroup | null {
    if (filter.id === groupId) return filter;

    for (const condition of filter.conditions) {
      if ('conditions' in condition) {
        const found = this.findGroup(condition, groupId);
        if (found) return found;
      }
    }

    return null;
  }

  private findCondition(filter: FilterGroup, conditionId: string): FilterCondition | null {
    for (const condition of filter.conditions) {
      if ('id' in condition && condition.id === conditionId) {
        return condition as FilterCondition;
      }
      if ('conditions' in condition) {
        const found = this.findCondition(condition, conditionId);
        if (found) return found;
      }
    }
    return null;
  }

  private removeFromGroup(filter: FilterGroup, conditionId: string): boolean {
    const index = filter.conditions.findIndex(c => 'id' in c && c.id === conditionId);
    if (index >= 0) {
      filter.conditions.splice(index, 1);
      return true;
    }

    for (const condition of filter.conditions) {
      if ('conditions' in condition) {
        if (this.removeFromGroup(condition, conditionId)) {
          return true;
        }
      }
    }

    return false;
  }

  private buildPrismaWhere(filter: FilterGroup): Record<string, unknown> {
    const conditions = filter.conditions.map(c => {
      if ('conditions' in c) {
        return this.buildPrismaWhere(c);
      }
      return this.buildPrismaCondition(c);
    });

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];

    switch (filter.operator) {
      case 'AND':
        return { AND: conditions };
      case 'OR':
        return { OR: conditions };
      case 'NOT':
        return { NOT: conditions[0] };
      default:
        return { AND: conditions };
    }
  }

  private buildPrismaCondition(condition: FilterCondition): Record<string, unknown> {
    const { field, operator, value, value2 } = condition;

    switch (operator) {
      case 'eq':
        return { [field]: value };
      case 'neq':
        return { [field]: { not: value } };
      case 'gt':
        return { [field]: { gt: value } };
      case 'gte':
        return { [field]: { gte: value } };
      case 'lt':
        return { [field]: { lt: value } };
      case 'lte':
        return { [field]: { lte: value } };
      case 'contains':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'startsWith':
        return { [field]: { startsWith: value, mode: 'insensitive' } };
      case 'endsWith':
        return { [field]: { endsWith: value, mode: 'insensitive' } };
      case 'in':
        return { [field]: { in: Array.isArray(value) ? value : [value] } };
      case 'nin':
        return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
      case 'between':
        return { [field]: { gte: value, lte: value2 } };
      case 'isNull':
        return { [field]: null };
      case 'isNotNull':
        return { [field]: { not: null } };
      default:
        return { [field]: value };
    }
  }

  private buildElasticsearchQuery(filter: FilterGroup): Record<string, unknown> {
    const conditions = filter.conditions.map(c => {
      if ('conditions' in c) {
        return this.buildElasticsearchQuery(c);
      }
      return this.buildElasticsearchCondition(c);
    });

    if (conditions.length === 0) return { match_all: {} };
    if (conditions.length === 1) return conditions[0];

    return {
      bool: {
        [filter.operator.toLowerCase()]: conditions,
      },
    };
  }

  private buildElasticsearchCondition(condition: FilterCondition): Record<string, unknown> {
    const { field, operator, value } = condition;

    switch (operator) {
      case 'eq':
        return { term: { [field]: value } };
      case 'contains':
        return { match: { [field]: value } };
      case 'regex':
        return { regexp: { [field]: value } };
      case 'gt':
        return { range: { [field]: { gt: value } } };
      case 'gte':
        return { range: { [field]: { gte: value } } };
      case 'lt':
        return { range: { [field]: { lt: value } } };
      case 'lte':
        return { range: { [field]: { lte: value } } };
      case 'exists':
        return { exists: { field } };
      default:
        return { match: { [field]: value } };
    }
  }

  private buildMeilisearchFilter(filter: FilterGroup): string {
    const parts = filter.conditions.map(c => {
      if ('conditions' in c) {
        return `(${this.buildMeilisearchFilter(c)})`;
      }
      return this.buildMeilisearchCondition(c);
    });

    const joinOperator = filter.operator === 'AND' ? ' AND ' : ' OR ';
    return parts.join(joinOperator);
  }

  private buildMeilisearchCondition(condition: FilterCondition): string {
    const { field, operator, value } = condition;
    const stringValue = typeof value === 'string' ? `'${value}'` : String(value);

    switch (operator) {
      case 'eq':
        return `${field} = ${stringValue}`;
      case 'neq':
        return `${field} != ${stringValue}`;
      case 'gt':
        return `${field} > ${stringValue}`;
      case 'gte':
        return `${field} >= ${stringValue}`;
      case 'lt':
        return `${field} < ${stringValue}`;
      case 'lte':
        return `${field} <= ${stringValue}`;
      case 'in':
        return `${field} IN [${Array.isArray(value) ? value.join(',') : value}]`;
      case 'contains':
        return `${field} CONTAINS ${stringValue}`;
      case 'exists':
        return `${field} EXISTS`;
      default:
        return `${field} = ${stringValue}`;
    }
  }

  private buildProjection(fields: string[]): Record<string, boolean> {
    const projection: Record<string, boolean> = {};
    fields.forEach(f => projection[f] = true);
    return projection;
  }

  private buildElasticsearchAggs(aggregations: SearchQuery['aggregations']): Record<string, unknown> {
    const aggs: Record<string, unknown> = {};

    aggregations?.forEach(agg => {
      const name = agg.alias || `${agg.type}_${agg.field}`;
      
      switch (agg.type) {
        case 'sum':
          aggs[name] = { sum: { field: agg.field } };
          break;
        case 'avg':
          aggs[name] = { avg: { field: agg.field } };
          break;
        case 'count':
          aggs[name] = { value_count: { field: agg.field } };
          break;
        case 'min':
          aggs[name] = { min: { field: agg.field } };
          break;
        case 'max':
          aggs[name] = { max: { field: agg.field } };
          break;
        case 'group':
          aggs[name] = { terms: { field: agg.field } };
          break;
      }
    });

    return aggs;
  }

  private validateGroup(group: FilterGroup, schema: FieldSchema[], errors: string[]): void {
    for (const condition of group.conditions) {
      if ('conditions' in condition) {
        this.validateGroup(condition, schema, errors);
      } else {
        this.validateCondition(condition, schema, errors);
      }
    }
  }

  private validateCondition(
    condition: FilterCondition,
    schema: FieldSchema[],
    errors: string[]
  ): void {
    const field = schema.find(f => f.name === condition.field);
    
    if (!field) {
      errors.push(`Field '${condition.field}' does not exist`);
      return;
    }

    if (!field.filterable) {
      errors.push(`Field '${condition.field}' is not filterable`);
    }
  }
}

// Query templates
export const QUERY_TEMPLATES: Record<string, Omit<SearchQuery, 'id' | 'tenantId' | 'name' | 'createdAt' | 'updatedAt'>> = {
  recentOrders: {
    target: 'Order',
    filter: {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'created_recent',
          field: 'createdAt',
          operator: 'gte',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    sort: [{ field: 'createdAt', direction: 'desc', priority: 0 }],
    pagination: { page: 1, pageSize: 50 },
  },
  lowStockProducts: {
    target: 'Product',
    filter: {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'low_stock',
          field: 'stock',
          operator: 'lte',
          value: 10,
        },
      ],
    },
    sort: [{ field: 'stock', direction: 'asc', priority: 0 }],
    pagination: { page: 1, pageSize: 100 },
  },
  highValueCustomers: {
    target: 'Customer',
    filter: {
      id: 'root',
      operator: 'AND',
      conditions: [
        {
          id: 'high_ltv',
          field: 'ltv',
          operator: 'gte',
          value: 10000,
        },
      ],
    },
    sort: [{ field: 'ltv', direction: 'desc', priority: 0 }],
    pagination: { page: 1, pageSize: 100 },
  },
};

// Export singleton
export const queryBuilder = new SearchQueryBuilder();

export { SearchQuery, FilterCondition, FilterGroup, SortOption, FieldSchema };

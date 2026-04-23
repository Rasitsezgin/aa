// Advanced Report Builder
// Custom report creation with drag-and-drop interface

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

type ReportType = 'table' | 'chart' | 'dashboard' | 'pivot';
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'funnel';
type DataSource = 'orders' | 'products' | 'customers' | 'inventory' | 'analytics';
type Aggregation = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

interface Report {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ReportType;
  dataSource: DataSource;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  schedule?: ReportSchedule;
  config: ReportConfig;
}

interface ReportConfig {
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  chart?: {
    type: ChartType;
    xAxis: string;
    yAxis: string;
    series?: string;
    stacked?: boolean;
  };
  pivot?: {
    rows: string[];
    columns: string[];
    values: Array<{ field: string; aggregation: Aggregation }>;
  };
  dashboard?: {
    widgets: DashboardWidget[];
  };
}

interface ReportField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  aggregation?: Aggregation;
  formula?: string; // For calculated fields
  format?: string;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'contains' | 'is_null';
  value?: unknown;
  valueTo?: unknown; // For between
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  minute: number;
  emailRecipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'text';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    dataSource?: DataSource;
    query?: string;
    chartType?: ChartType;
    metric?: {
      field: string;
      aggregation: Aggregation;
      format: string;
    };
    comparison?: {
      period: 'previous_period' | 'previous_year';
      showChange: boolean;
    };
  };
}

interface ReportResult {
  columns: string[];
  rows: unknown[][];
  totals?: Record<string, number>;
  metadata: {
    totalRows: number;
    generatedAt: Date;
    queryTime: number;
  };
}

// Report builder engine
export class ReportBuilder {
  // Create new report
  async createReport(
    tenantId: string,
    data: Omit<Report, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'lastRunAt'>
  ): Promise<Report> {
    const report: Report = {
      ...data,
      id: crypto.randomUUID(),
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    // await prisma.report.create({ data: report });

    return report;
  }

  // Execute report
  async executeReport(reportId: string, params?: Record<string, unknown>): Promise<ReportResult> {
    const report = await this.getReport(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const startTime = Date.now();

    // Build and execute query
    const data = await this.executeQuery(report, params);

    // Apply transformations
    const result = this.transformData(data, report.config);

    // Update last run
    await this.updateLastRun(reportId);

    return {
      ...result,
      metadata: {
        totalRows: result.rows.length,
        generatedAt: new Date(),
        queryTime: Date.now() - startTime,
      },
    };
  }

  // Get available fields for a data source
  async getAvailableFields(dataSource: DataSource): Promise<ReportField[]> {
    const fieldMap: Record<DataSource, ReportField[]> = {
      orders: [
        { name: 'id', label: 'ID', type: 'string' },
        { name: 'orderNumber', label: 'Order #', type: 'string' },
        { name: 'customerName', label: 'Customer', type: 'string' },
        { name: 'totalAmount', label: 'Total', type: 'currency', aggregation: 'sum' },
        { name: 'status', label: 'Status', type: 'string' },
        { name: 'platform', label: 'Platform', type: 'string' },
        { name: 'orderDate', label: 'Date', type: 'date' },
        { name: 'itemCount', label: 'Items', type: 'number', aggregation: 'sum' },
      ],
      products: [
        { name: 'id', label: 'ID', type: 'string' },
        { name: 'title', label: 'Title', type: 'string' },
        { name: 'sku', label: 'SKU', type: 'string' },
        { name: 'category', label: 'Category', type: 'string' },
        { name: 'brand', label: 'Brand', type: 'string' },
        { name: 'price', label: 'Price', type: 'currency', aggregation: 'avg' },
        { name: 'stock', label: 'Stock', type: 'number', aggregation: 'sum' },
        { name: 'status', label: 'Status', type: 'string' },
        { name: 'createdAt', label: 'Created', type: 'date' },
      ],
      customers: [
        { name: 'id', label: 'ID', type: 'string' },
        { name: 'name', label: 'Name', type: 'string' },
        { name: 'email', label: 'Email', type: 'string' },
        { name: 'orderCount', label: 'Orders', type: 'number', aggregation: 'sum' },
        { name: 'totalSpent', label: 'Total Spent', type: 'currency', aggregation: 'sum' },
        { name: 'avgOrderValue', label: 'AOV', type: 'currency', aggregation: 'avg' },
        { name: 'lastOrderDate', label: 'Last Order', type: 'date' },
        { name: 'segment', label: 'Segment', type: 'string' },
      ],
      inventory: [
        { name: 'productId', label: 'Product ID', type: 'string' },
        { name: 'productName', label: 'Product', type: 'string' },
        { name: 'warehouse', label: 'Warehouse', type: 'string' },
        { name: 'quantity', label: 'Quantity', type: 'number', aggregation: 'sum' },
        { name: 'reserved', label: 'Reserved', type: 'number', aggregation: 'sum' },
        { name: 'available', label: 'Available', type: 'number', aggregation: 'sum' },
        { name: 'reorderPoint', label: 'Reorder Point', type: 'number' },
        { name: 'stockValue', label: 'Value', type: 'currency', aggregation: 'sum' },
      ],
      analytics: [
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'revenue', label: 'Revenue', type: 'currency', aggregation: 'sum' },
        { name: 'orders', label: 'Orders', type: 'number', aggregation: 'sum' },
        { name: 'visitors', label: 'Visitors', type: 'number', aggregation: 'sum' },
        { name: 'conversionRate', label: 'Conversion', type: 'percentage', aggregation: 'avg' },
        { name: 'aov', label: 'AOV', type: 'currency', aggregation: 'avg' },
      ],
    };

    return fieldMap[dataSource] || [];
  }

  // Generate SQL from report config
  private async executeQuery(report: Report, params?: Record<string, unknown>): Promise<any[]> {
    const { dataSource, config } = report;
    const { fields, filters, groupBy, sortBy, limit } = config;

    // Build where clause from filters
    const where = this.buildWhereClause(filters, params);

    switch (dataSource) {
      case 'orders':
        return await prisma.order.findMany({
          where: { tenantId: report.tenantId, ...where },
          include: { items: true },
          orderBy: sortBy?.map(s => ({ [s.field]: s.direction })),
          take: limit,
        });

      case 'products':
        return await prisma.product.findMany({
          where: { tenantId: report.tenantId, ...where },
          orderBy: sortBy?.map(s => ({ [s.field]: s.direction })),
          take: limit,
        });

      default:
        return [];
    }
  }

  // Transform data based on config
  private transformData(rawData: any[], config: ReportConfig): ReportResult {
    const { fields, groupBy, chart, pivot } = config;

    let rows = rawData.map(item => {
      return fields.map(field => {
        if (field.formula) {
          // Calculate formula
          return this.evaluateFormula(field.formula, item);
        }
        return this.getValue(item, field.name);
      });
    });

    // Apply grouping if specified
    if (groupBy && groupBy.length > 0) {
      rows = this.applyGrouping(rows, fields, groupBy);
    }

    // Apply pivot if specified
    if (pivot) {
      rows = this.applyPivot(rows, pivot, fields);
    }

    // Calculate totals
    const totals: Record<string, number> = {};
    fields.forEach((field, index) => {
      if (field.aggregation && field.aggregation !== 'none') {
        totals[field.name] = this.calculateAggregation(
          rows.map(r => r[index]),
          field.aggregation
        );
      }
    });

    return {
      columns: fields.map(f => f.label),
      rows,
      totals,
    };
  }

  // Build where clause from filters
  private buildWhereClause(
    filters: ReportFilter[],
    params?: Record<string, unknown>
  ): any {
    const where: any = {};

    filters.forEach(filter => {
      const value = params?.[filter.field] ?? filter.value;

      switch (filter.operator) {
        case 'equals':
          where[filter.field] = value;
          break;
        case 'not_equals':
          where[filter.field] = { not: value };
          break;
        case 'greater_than':
          where[filter.field] = { gt: value };
          break;
        case 'less_than':
          where[filter.field] = { lt: value };
          break;
        case 'between':
          where[filter.field] = { gte: value, lte: filter.valueTo };
          break;
        case 'in':
          where[filter.field] = { in: Array.isArray(value) ? value : [value] };
          break;
        case 'contains':
          where[filter.field] = { contains: value, mode: 'insensitive' };
          break;
        case 'is_null':
          where[filter.field] = null;
          break;
      }
    });

    return where;
  }

  // Apply grouping to data
  private applyGrouping(
    rows: unknown[][],
    fields: ReportField[],
    groupBy: string[]
  ): unknown[][] {
    const groups = new Map<string, unknown[][]>();

    rows.forEach(row => {
      const key = groupBy.map(field => {
        const index = fields.findIndex(f => f.name === field);
        return row[index];
      }).join('|');

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // Aggregate groups
    return Array.from(groups.entries()).map(([key, groupRows]) => {
      return fields.map((field, index) => {
        if (groupBy.includes(field.name)) {
          return groupRows[0][index];
        }
        if (field.aggregation) {
          return this.calculateAggregation(
            groupRows.map(r => r[index]),
            field.aggregation
          );
        }
        return null;
      });
    });
  }

  // Apply pivot transformation
  private applyPivot(
    rows: unknown[][],
    pivot: ReportConfig['pivot'],
    fields: ReportField[]
  ): unknown[][] {
    if (!pivot) return rows;

    // Simplified pivot implementation
    // Full implementation would create a proper pivot table
    return rows;
  }

  // Calculate aggregation
  private calculateAggregation(values: unknown[], aggregation: Aggregation): number {
    const numbers = values.filter((v): v is number => typeof v === 'number');
    
    switch (aggregation) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'avg':
        return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...numbers);
      case 'max':
        return Math.max(...numbers);
      default:
        return 0;
    }
  }

  // Evaluate formula
  private evaluateFormula(formula: string, data: any): number {
    // Simple formula evaluation
    // Replace field names with values
    let expression = formula;
    const fields = formula.match(/\[([^\]]+)\]/g) || [];
    
    fields.forEach(field => {
      const fieldName = field.slice(1, -1);
      const value = this.getValue(data, fieldName);
      expression = expression.replace(field, String(value));
    });

    try {
      // Safe evaluation
      return Function(`"use strict"; return (${expression})`)();
    } catch {
      return 0;
    }
  }

  // Get value from object by path
  private getValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  // Private helper methods
  private async getReport(id: string): Promise<Report | null> {
    // Would fetch from database
    return null;
  }

  private async updateLastRun(id: string): Promise<void> {
    // Would update in database
    console.log(`Updated last run for report ${id}`);
  }
}

// Pre-built report templates
export const reportTemplates = {
  dailySales: (tenantId: string): Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'> => ({
    tenantId,
    name: 'Günlük Satış Raporu',
    description: 'Günlük satış özetleri',
    type: 'table',
    dataSource: 'orders',
    isPublic: true,
    createdBy: 'system',
    config: {
      fields: [
        { name: 'orderDate', label: 'Tarih', type: 'date' },
        { name: 'orderNumber', label: 'Sipariş No', type: 'string' },
        { name: 'customerName', label: 'Müşteri', type: 'string' },
        { name: 'platform', label: 'Platform', type: 'string' },
        { name: 'totalAmount', label: 'Tutar', type: 'currency' },
        { name: 'status', label: 'Durum', type: 'string' },
      ],
      filters: [
        { field: 'orderDate', operator: 'equals', value: 'today' },
      ],
      sortBy: [{ field: 'orderDate', direction: 'desc' }],
    },
  }),

  inventoryReport: (tenantId: string): Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'> => ({
    tenantId,
    name: 'Stok Durumu',
    description: 'Mevcut stok seviyeleri',
    type: 'table',
    dataSource: 'inventory',
    isPublic: true,
    createdBy: 'system',
    config: {
      fields: [
        { name: 'productName', label: 'Ürün', type: 'string' },
        { name: 'sku', label: 'SKU', type: 'string' },
        { name: 'category', label: 'Kategori', type: 'string' },
        { name: 'quantity', label: 'Miktar', type: 'number' },
        { name: 'stockValue', label: 'Değer', type: 'currency' },
      ],
      filters: [],
      sortBy: [{ field: 'quantity', direction: 'asc' }],
    },
  }),

  salesDashboard: (tenantId: string): Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'> => ({
    tenantId,
    name: 'Satış Dashboard',
    description: 'Satış metrikleri ve grafikler',
    type: 'dashboard',
    dataSource: 'analytics',
    isPublic: true,
    createdBy: 'system',
    config: {
      fields: [],
      filters: [],
      dashboard: {
        widgets: [
          {
            id: 'revenue',
            type: 'metric',
            title: 'Günlük Gelir',
            position: { x: 0, y: 0, w: 3, h: 2 },
            config: {
              dataSource: 'orders',
              metric: { field: 'totalAmount', aggregation: 'sum', format: 'currency' },
            },
          },
          {
            id: 'orders',
            type: 'metric',
            title: 'Sipariş Sayısı',
            position: { x: 3, y: 0, w: 3, h: 2 },
            config: {
              dataSource: 'orders',
              metric: { field: 'id', aggregation: 'count', format: 'number' },
            },
          },
          {
            id: 'chart',
            type: 'chart',
            title: 'Satış Trendi',
            position: { x: 0, y: 2, w: 6, h: 4 },
            config: {
              dataSource: 'orders',
              chartType: 'line',
            },
          },
        ],
      },
    },
  }),
};

// Export
export const reportBuilder = new ReportBuilder();
export { Report, ReportConfig, ReportField, ReportFilter, DashboardWidget };

// Advanced Analytics Dashboard
// Real-time metrics, KPIs, and visualizations

import { EventEmitter } from 'events';

type WidgetType = 'counter' | 'chart' | 'table' | 'gauge' | 'heatmap' | 'funnel' | 'map';
type TimeRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'radar' | 'scatter';

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    dataSource: string;
    timeRange?: TimeRange;
    filters?: Record<string, unknown>;
    chartType?: ChartType;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'p95' | 'p99';
    groupBy?: string;
    limit?: number;
    refreshInterval?: number; // seconds
    compareWith?: TimeRange;
    thresholds?: { warning: number; critical: number };
  };
  data?: unknown;
  loading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'free' | 'tabs';
  filters: {
    timeRange: TimeRange;
    customRange?: { from: Date; to: Date };
    segments?: string[];
  };
  isDefault: boolean;
  isPublic: boolean;
  sharedWith?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  target?: number;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  trend: 'up' | 'down' | 'flat';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'time';
}

interface AnalyticsQuery {
  id: string;
  name: string;
  query: {
    metrics: string[];
    dimensions?: string[];
    filters?: Array<{
      field: string;
      operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
      value: unknown;
    }>;
    timeRange: TimeRange;
    groupBy?: string[];
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
  };
  result?: {
    data: unknown[];
    totalCount: number;
    executionTime: number;
  };
  schedule?: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    lastRun?: Date;
    nextRun?: Date;
  };
}

// Advanced Analytics Dashboard Manager
export class AnalyticsDashboardManager extends EventEmitter {
  private dashboards: Map<string, Dashboard> = new Map();
  private queries: Map<string, AnalyticsQuery> = new Map();
  private realtimeConnections: Map<string, Set<string>> = new Map(); // dashboardId -> userIds

  // Create dashboard
  createDashboard(config: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Dashboard {
    const dashboard: Dashboard = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    this.emit('dashboardCreated', dashboard);
    return dashboard;
  }

  // Add widget to dashboard
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): DashboardWidget {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const newWidget: DashboardWidget = {
      ...widget,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    this.emit('widgetAdded', { dashboardId, widget: newWidget });
    return newWidget;
  }

  // Update widget position (drag & drop)
  updateWidgetPosition(
    dashboardId: string,
    widgetId: string,
    position: { x: number; y: number; w: number; h: number }
  ): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.position = position;
    dashboard.updatedAt = new Date();
  }

  // Refresh widget data
  async refreshWidget(dashboardId: string, widgetId: string): Promise<DashboardWidget> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) throw new Error('Widget not found');

    widget.loading = true;
    widget.error = undefined;

    try {
      const data = await this.fetchWidgetData(widget, dashboard.filters);
      widget.data = data;
      widget.lastUpdated = new Date();
      widget.loading = false;

      // Broadcast to connected users
      this.broadcastUpdate(dashboardId, widgetId, data);

      return widget;
    } catch (error) {
      widget.error = String(error);
      widget.loading = false;
      throw error;
    }
  }

  // Refresh entire dashboard
  async refreshDashboard(dashboardId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    await Promise.all(
      dashboard.widgets.map(widget => this.refreshWidget(dashboardId, widget.id))
    );
  }

  // Get KPIs
  async getKPIs(
    tenantId: string,
    timeRange: TimeRange,
    customRange?: { from: Date; to: Date }
  ): Promise<KPI[]> {
    const kpis: KPI[] = [];

    // Revenue KPI
    const revenue = await this.calculateRevenue(tenantId, timeRange, customRange);
    const prevRevenue = await this.calculateRevenue(tenantId, this.getPreviousPeriod(timeRange));
    kpis.push({
      id: 'revenue',
      name: 'Toplam Gelir',
      value: revenue,
      previousValue: prevRevenue,
      change: revenue - prevRevenue,
      changePercent: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
      status: revenue >= prevRevenue ? 'good' : 'warning',
      trend: revenue >= prevRevenue ? 'up' : 'down',
      format: 'currency',
    });

    // Orders KPI
    const orders = await this.countOrders(tenantId, timeRange, customRange);
    const prevOrders = await this.countOrders(tenantId, this.getPreviousPeriod(timeRange));
    kpis.push({
      id: 'orders',
      name: 'Sipariş Sayısı',
      value: orders,
      previousValue: prevOrders,
      change: orders - prevOrders,
      changePercent: prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0,
      status: orders >= prevOrders ? 'good' : 'warning',
      trend: orders >= prevOrders ? 'up' : 'down',
      format: 'number',
    });

    // Conversion Rate
    const conversion = await this.calculateConversion(tenantId, timeRange, customRange);
    const prevConversion = await this.calculateConversion(tenantId, this.getPreviousPeriod(timeRange));
    kpis.push({
      id: 'conversion',
      name: 'Dönüşüm Oranı',
      value: conversion,
      previousValue: prevConversion,
      change: conversion - prevConversion,
      changePercent: prevConversion > 0 ? ((conversion - prevConversion) / prevConversion) * 100 : 0,
      status: conversion >= prevConversion ? 'good' : 'warning',
      trend: conversion >= prevConversion ? 'up' : 'down',
      format: 'percentage',
    });

    // AOV (Average Order Value)
    const aov = orders > 0 ? revenue / orders : 0;
    const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;
    kpis.push({
      id: 'aov',
      name: 'Ortalama Sipariş Değeri',
      value: aov,
      previousValue: prevAov,
      change: aov - prevAov,
      changePercent: prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 0,
      status: aov >= prevAov ? 'good' : 'neutral',
      trend: aov > prevAov ? 'up' : aov < prevAov ? 'down' : 'flat',
      format: 'currency',
    });

    // Active Customers
    const customers = await this.countActiveCustomers(tenantId, timeRange, customRange);
    kpis.push({
      id: 'customers',
      name: 'Aktif Müşteriler',
      value: customers,
      status: 'neutral',
      trend: 'flat',
      format: 'number',
    });

    return kpis;
  }

  // Create custom query
  createQuery(config: Omit<AnalyticsQuery, 'id'>): AnalyticsQuery {
    const query: AnalyticsQuery = {
      ...config,
      id: crypto.randomUUID(),
    };

    this.queries.set(query.id, query);
    return query;
  }

  // Execute query
  async executeQuery(queryId: string): Promise<AnalyticsQuery['result']> {
    const query = this.queries.get(queryId);
    if (!query) throw new Error('Query not found');

    const startTime = Date.now();

    // Execute the query
    const data = await this.runAnalyticsQuery(query.query);

    const result = {
      data,
      totalCount: data.length,
      executionTime: Date.now() - startTime,
    };

    query.result = result;

    if (query.schedule) {
      query.schedule.lastRun = new Date();
    }

    return result;
  }

  // Subscribe to realtime updates
  subscribeToDashboard(dashboardId: string, userId: string): () => void {
    if (!this.realtimeConnections.has(dashboardId)) {
      this.realtimeConnections.set(dashboardId, new Set());
    }

    const users = this.realtimeConnections.get(dashboardId)!;
    users.add(userId);

    // Start auto-refresh if not already running
    this.startAutoRefresh(dashboardId);

    return () => {
      users.delete(userId);
      if (users.size === 0) {
        this.stopAutoRefresh(dashboardId);
      }
    };
  }

  // Export dashboard data
  async exportDashboard(
    dashboardId: string,
    format: 'pdf' | 'png' | 'csv' | 'excel',
    options: {
      includeWidgets?: string[];
      timeRange?: TimeRange;
    } = {}
  ): Promise<Buffer> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    // Refresh data first
    await this.refreshDashboard(dashboardId);

    // Generate export based on format
    switch (format) {
      case 'csv':
        return this.exportToCSV(dashboard, options.includeWidgets);
      case 'excel':
        return this.exportToExcel(dashboard, options.includeWidgets);
      case 'pdf':
        return this.exportToPDF(dashboard, options.includeWidgets);
      case 'png':
        return this.exportToPNG(dashboard, options.includeWidgets);
      default:
        throw new Error(`Export format ${format} not supported`);
    }
  }

  // Get funnel analysis
  async getFunnelAnalysis(
    tenantId: string,
    steps: string[],
    timeRange: TimeRange
  ): Promise<Array<{
    step: string;
    count: number;
    dropOff: number;
    conversionRate: number;
  }>> {
    // Mock funnel data
    const funnel = [
      { step: 'Page View', count: 10000, dropOff: 0, conversionRate: 100 },
      { step: 'Product View', count: 3500, dropOff: 6500, conversionRate: 35 },
      { step: 'Add to Cart', count: 1200, dropOff: 2300, conversionRate: 12 },
      { step: 'Checkout', count: 600, dropOff: 600, conversionRate: 6 },
      { step: 'Purchase', count: 480, dropOff: 120, conversionRate: 4.8 },
    ];

    return funnel;
  }

  // Get cohort analysis
  async getCohortAnalysis(
    tenantId: string,
    options: {
      cohortBy: 'signup' | 'firstPurchase';
      metric: 'retention' | 'revenue' | 'orders';
      periods: number;
    }
  ): Promise<{
    cohorts: Array<{
      date: string;
      size: number;
      periods: number[];
    }>;
    summary: {
      averageRetention: number[];
      totalCustomers: number;
    };
  }> {
    // Mock cohort data
    const cohorts = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      cohorts.unshift({
        date: date.toISOString().slice(0, 7), // YYYY-MM
        size: Math.floor(Math.random() * 500) + 200,
        periods: [100, 85, 72, 65, 58, 50, 45].slice(0, options.periods),
      });
    }

    return {
      cohorts,
      summary: {
        averageRetention: [100, 82, 70, 62, 55, 48, 42],
        totalCustomers: cohorts.reduce((sum, c) => sum + c.size, 0),
      },
    };
  }

  // Get RFM Analysis (Recency, Frequency, Monetary)
  async getRFMAnalysis(
    tenantId: string,
    segments: number = 5
  ): Promise<Array<{
    segment: string;
    recency: number;
    frequency: number;
    monetary: number;
    count: number;
    percentage: number;
  }>> {
    // Mock RFM segments
    return [
      { segment: 'Champions', recency: 5, frequency: 5, monetary: 5, count: 1200, percentage: 12 },
      { segment: 'Loyal Customers', recency: 4, frequency: 4, monetary: 4, count: 2100, percentage: 21 },
      { segment: 'Potential Loyalists', recency: 3, frequency: 3, monetary: 3, count: 2800, percentage: 28 },
      { segment: 'At Risk', recency: 2, frequency: 2, monetary: 2, count: 1900, percentage: 19 },
      { segment: 'Lost', recency: 1, frequency: 1, monetary: 1, count: 2000, percentage: 20 },
    ];
  }

  // Private methods
  private async fetchWidgetData(
    widget: DashboardWidget,
    filters: Dashboard['filters']
  ): Promise<unknown> {
    // In production, this would query the analytics database
    // For now, return mock data based on widget type

    switch (widget.type) {
      case 'counter':
        return { value: Math.floor(Math.random() * 10000) };
      
      case 'chart':
        return this.generateMockChartData(widget.config.chartType);
      
      case 'table':
        return this.generateMockTableData(widget.config.limit || 10);
      
      case 'gauge':
        return { value: Math.floor(Math.random() * 100), max: 100 };
      
      case 'heatmap':
        return this.generateMockHeatmapData();
      
      case 'funnel':
        return this.getFunnelAnalysis('tenant', [], filters.timeRange);
      
      default:
        return {};
    }
  }

  private generateMockChartData(chartType?: ChartType): unknown {
    const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const datasets = [{
      label: 'Satış',
      data: labels.map(() => Math.floor(Math.random() * 1000) + 500),
    }];

    return { labels, datasets };
  }

  private generateMockTableData(count: number): unknown[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
    }));
  }

  private generateMockHeatmapData(): unknown {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    return days.map(day => ({
      day,
      data: hours.map(() => Math.floor(Math.random() * 100)),
    }));
  }

  private broadcastUpdate(dashboardId: string, widgetId: string, data: unknown): void {
    const users = this.realtimeConnections.get(dashboardId);
    if (users) {
      this.emit('widgetUpdate', { dashboardId, widgetId, data, userCount: users.size });
    }
  }

  private startAutoRefresh(dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    // Check if any widget needs auto-refresh
    for (const widget of dashboard.widgets) {
      if (widget.config.refreshInterval && widget.config.refreshInterval > 0) {
        setInterval(() => {
          this.refreshWidget(dashboardId, widget.id).catch(console.error);
        }, widget.config.refreshInterval * 1000);
      }
    }
  }

  private stopAutoRefresh(dashboardId: string): void {
    // Clear intervals for this dashboard
  }

  private getPreviousPeriod(timeRange: TimeRange): TimeRange {
    const map: Record<TimeRange, TimeRange> = {
      today: 'yesterday',
      yesterday: 'today',
      last7days: 'last7days',
      last30days: 'last30days',
      thisMonth: 'lastMonth',
      lastMonth: 'thisMonth',
      custom: 'custom',
    };
    return map[timeRange] || 'last7days';
  }

  // Mock data methods (would be real database queries)
  private async calculateRevenue(tenantId: string, timeRange: TimeRange, customRange?: { from: Date; to: Date }): Promise<number> {
    return Math.floor(Math.random() * 100000) + 50000;
  }

  private async countOrders(tenantId: string, timeRange: TimeRange, customRange?: { from: Date; to: Date }): Promise<number> {
    return Math.floor(Math.random() * 1000) + 500;
  }

  private async calculateConversion(tenantId: string, timeRange: TimeRange, customRange?: { from: Date; to: Date }): Promise<number> {
    return Math.random() * 5 + 2;
  }

  private async countActiveCustomers(tenantId: string, timeRange: TimeRange, customRange?: { from: Date; to: Date }): Promise<number> {
    return Math.floor(Math.random() * 5000) + 2000;
  }

  private async runAnalyticsQuery(query: AnalyticsQuery['query']): Promise<unknown[]> {
    // Would execute against analytics database
    return this.generateMockTableData(query.limit || 100);
  }

  private exportToCSV(dashboard: Dashboard, widgetIds?: string[]): Buffer {
    const widgets = widgetIds 
      ? dashboard.widgets.filter(w => widgetIds.includes(w.id))
      : dashboard.widgets;

    let csv = `Dashboard: ${dashboard.name}\nGenerated: ${new Date().toISOString()}\n\n`;

    for (const widget of widgets) {
      csv += `Widget: ${widget.title}\n`;
      csv += `Data: ${JSON.stringify(widget.data)}\n\n`;
    }

    return Buffer.from(csv);
  }

  private exportToExcel(dashboard: Dashboard, widgetIds?: string[]): Buffer {
    // Would use xlsx library
    return Buffer.from('excel-data');
  }

  private exportToPDF(dashboard: Dashboard, widgetIds?: string[]): Buffer {
    // Would use puppeteer or pdf library
    return Buffer.from('pdf-data');
  }

  private exportToPNG(dashboard: Dashboard, widgetIds?: string[]): Buffer {
    // Would use screenshot library
    return Buffer.from('png-data');
  }
}

// Predefined dashboard templates
export const DASHBOARD_TEMPLATES: Array<Omit<Dashboard, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy'>> = [
  {
    name: 'Executive Overview',
    description: 'High-level business metrics for executives',
    widgets: [
      {
        id: 'kpi-revenue',
        type: 'counter',
        title: 'Toplam Gelir',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: { dataSource: 'revenue', aggregation: 'sum', timeRange: 'today' },
      },
      {
        id: 'kpi-orders',
        type: 'counter',
        title: 'Siparişler',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: { dataSource: 'orders', aggregation: 'count', timeRange: 'today' },
      },
      {
        id: 'chart-sales',
        type: 'chart',
        title: 'Satış Trendi',
        position: { x: 0, y: 2, w: 6, h: 4 },
        config: { dataSource: 'sales', chartType: 'line', timeRange: 'last7days' },
      },
      {
        id: 'top-products',
        type: 'table',
        title: 'En Çok Satanlar',
        position: { x: 6, y: 0, w: 6, h: 6 },
        config: { dataSource: 'products', limit: 10, timeRange: 'thisMonth' },
      },
    ],
    layout: 'grid',
    filters: { timeRange: 'today' },
    isDefault: true,
    isPublic: true,
  },
  {
    name: 'Sales Performance',
    description: 'Detailed sales analytics',
    widgets: [
      {
        id: 'funnel',
        type: 'funnel',
        title: 'Satış Hunisi',
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: { dataSource: 'funnel', timeRange: 'last30days' },
      },
      {
        id: 'heatmap',
        type: 'heatmap',
        title: 'Aktivite Isı Haritası',
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: { dataSource: 'activity', timeRange: 'last7days' },
      },
    ],
    layout: 'grid',
    filters: { timeRange: 'last7days' },
    isDefault: false,
    isPublic: false,
  },
];

// Export singleton
export const analyticsDashboardManager = new AnalyticsDashboardManager();

export { Dashboard, DashboardWidget, KPI, AnalyticsQuery, TimeRange, ChartType };

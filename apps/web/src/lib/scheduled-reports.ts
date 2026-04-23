// Scheduled Reports Service
// Generates PDF/Excel reports and sends them via email

import { addJob } from '@/lib/queue';
import { prisma } from '@/lib/prisma';

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportType = 
  | 'sales_summary'
  | 'inventory_status'
  | 'order_details'
  | 'financial_summary'
  | 'product_performance'
  | 'customer_analysis'
  | 'marketplace_comparison';

interface ScheduledReport {
  id: string;
  tenantId: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    hour: number;
    minute: number;
    timezone: string;
  };
  filters: {
    dateRange: 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'custom';
    startDate?: string;
    endDate?: string;
    platforms?: string[];
    categories?: string[];
  };
  recipients: string[];
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
}

// Create a new scheduled report
export async function createScheduledReport(
  data: Omit<ScheduledReport, 'id' | 'lastRunAt' | 'nextRunAt' | 'createdAt'>
): Promise<ScheduledReport> {
  const report = await prisma.scheduledReport.create({
    data: {
      ...data,
      schedule: JSON.stringify(data.schedule),
      filters: JSON.stringify(data.filters),
      nextRunAt: calculateNextRun(data.schedule),
    },
  });

  // Schedule the job
  await scheduleReportJob(report);

  return {
    ...report,
    schedule: JSON.parse(report.schedule as string),
    filters: JSON.parse(report.filters as string),
  };
}

// Calculate next run date based on schedule
function calculateNextRun(schedule: ScheduledReport['schedule']): Date {
  const now = new Date();
  const next = new Date();
  next.setHours(schedule.hour, schedule.minute, 0, 0);

  if (schedule.frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (schedule.frequency === 'weekly') {
    const dayOfWeek = schedule.dayOfWeek || 1; // Monday default
    next.setDate(next.getDate() + ((7 + dayOfWeek - next.getDay()) % 7));
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else if (schedule.frequency === 'monthly') {
    const dayOfMonth = schedule.dayOfMonth || 1;
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}

// Schedule report generation job
async function scheduleReportJob(report: ScheduledReport): Promise<void> {
  const cron = scheduleToCron(report.schedule);
  
  await addJob(
    'report.generate',
    {
      tenantId: report.tenantId,
      userId: report.createdBy,
      payload: {
        reportId: report.id,
        type: report.type,
        format: report.format,
        filters: report.filters,
        recipients: report.recipients,
      },
    },
    {
      jobId: `scheduled-report-${report.id}`,
      repeat: { cron },
    }
  );
}

// Convert schedule to cron expression
function scheduleToCron(schedule: ScheduledReport['schedule']): string {
  const minute = schedule.minute;
  const hour = schedule.hour;

  if (schedule.frequency === 'daily') {
    return `${minute} ${hour} * * *`;
  } else if (schedule.frequency === 'weekly') {
    const day = schedule.dayOfWeek || 1;
    return `${minute} ${hour} * * ${day}`;
  } else if (schedule.frequency === 'monthly') {
    const day = schedule.dayOfMonth || 1;
    return `${minute} ${hour} ${day} * *`;
  }

  return `${minute} ${hour} * * *`; // Default daily
}

// Generate report data
export async function generateReportData(
  tenantId: string,
  type: ReportType,
  filters: ScheduledReport['filters']
): Promise<Record<string, unknown>> {
  const dateRange = getDateRange(filters);

  switch (type) {
    case 'sales_summary':
      return generateSalesSummary(tenantId, dateRange);
    case 'inventory_status':
      return generateInventoryStatus(tenantId);
    case 'order_details':
      return generateOrderDetails(tenantId, dateRange, filters.platforms);
    case 'financial_summary':
      return generateFinancialSummary(tenantId, dateRange);
    case 'product_performance':
      return generateProductPerformance(tenantId, dateRange);
    case 'customer_analysis':
      return generateCustomerAnalysis(tenantId, dateRange);
    case 'marketplace_comparison':
      return generateMarketplaceComparison(tenantId, dateRange);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

// Generate sales summary
async function generateSalesSummary(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<Record<string, unknown>> {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    include: {
      items: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const platformBreakdown = orders.reduce((acc, o) => {
    acc[o.platform] = (acc[o.platform] || 0) + Number(o.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  const dailySales = orders.reduce((acc, o) => {
    const date = o.orderDate.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + Number(o.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dateRange,
    },
    platformBreakdown,
    dailySales,
    topProducts: [], // TODO: Calculate from order items
  };
}

// Generate inventory status
async function generateInventoryStatus(tenantId: string): Promise<Record<string, unknown>> {
  const products = await prisma.product.findMany({
    where: { tenantId },
    include: { variants: true },
  });

  const lowStock = products.filter(p => p.stock < 10);
  const outOfStock = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);

  return {
    summary: {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      inventoryValue: totalValue,
    },
    lowStockItems: lowStock.map(p => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      currentStock: p.stock,
    })),
    categoryBreakdown: {}, // TODO: Group by category
  };
}

// Generate order details
async function generateOrderDetails(
  tenantId: string,
  dateRange: { start: Date; end: Date },
  platforms?: string[]
): Promise<Record<string, unknown>> {
  const where: Record<string, unknown> = {
    tenantId,
    orderDate: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };

  if (platforms?.length) {
    where.platform = { in: platforms };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { orderDate: 'desc' },
  });

  return {
    orderCount: orders.length,
    orders: orders.map(o => ({
      id: o.id,
      platform: o.platform,
      status: o.status,
      totalAmount: o.totalAmount,
      customerName: o.customerName,
      orderDate: o.orderDate,
      itemCount: o.items.length,
    })),
    statusBreakdown: orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// Generate financial summary
async function generateFinancialSummary(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<Record<string, unknown>> {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const taxAmount = orders.reduce((sum, o) => sum + Number(o.taxAmount), 0);
  const commission = orders.reduce((sum, o) => sum + Number(o.commissionAmount), 0);
  const shipping = orders.reduce((sum, o) => sum + Number(o.shippingCost), 0);

  return {
    revenue,
    taxAmount,
    commission,
    shipping,
    netRevenue: revenue - commission - shipping,
    orderCount: orders.length,
  };
}

// Generate product performance
async function generateProductPerformance(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<Record<string, unknown>> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        tenantId,
        orderDate: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    },
    include: { order: true },
  });

  const productStats = orderItems.reduce((acc, item) => {
    const sku = item.sku;
    if (!acc[sku]) {
      acc[sku] = { quantity: 0, revenue: 0, orders: 0 };
    }
    acc[sku].quantity += item.quantity;
    acc[sku].revenue += Number(item.unitPrice) * item.quantity;
    acc[sku].orders += 1;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number; orders: number }>);

  const sorted = Object.entries(productStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 50);

  return {
    topProducts: sorted.map(([sku, stats]) => ({ sku, ...stats })),
    totalRevenue: orderItems.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0),
    totalQuantity: orderItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

// Generate customer analysis
async function generateCustomerAnalysis(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<Record<string, unknown>> {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const customerStats = orders.reduce((acc, o) => {
    const email = o.customerEmail || 'unknown';
    if (!acc[email]) {
      acc[email] = { orders: 0, totalSpent: 0, name: o.customerName };
    }
    acc[email].orders += 1;
    acc[email].totalSpent += Number(o.totalAmount);
    return acc;
  }, {} as Record<string, { orders: number; totalSpent: number; name: string | null }>);

  const customers = Object.entries(customerStats);
  const totalCustomers = customers.length;
  const avgOrderValue = orders.length > 0
    ? orders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / orders.length
    : 0;

  return {
    totalCustomers,
    totalOrders: orders.length,
    avgOrderValue,
    topCustomers: customers
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 20)
      .map(([email, stats]) => ({ email, ...stats })),
  };
}

// Generate marketplace comparison
async function generateMarketplaceComparison(
  tenantId: string,
  dateRange: { start: Date; end: Date }
): Promise<Record<string, unknown>> {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const platformStats = orders.reduce((acc, o) => {
    const platform = o.platform;
    if (!acc[platform]) {
      acc[platform] = { orders: 0, revenue: 0, commission: 0 };
    }
    acc[platform].orders += 1;
    acc[platform].revenue += Number(o.totalAmount);
    acc[platform].commission += Number(o.commissionAmount);
    return acc;
  }, {} as Record<string, { orders: number; revenue: number; commission: number }>);

  return {
    platforms: Object.entries(platformStats).map(([platform, stats]) => ({
      platform,
      ...stats,
      netRevenue: stats.revenue - stats.commission,
      avgCommissionRate: stats.revenue > 0 ? (stats.commission / stats.revenue) * 100 : 0,
    })),
    totalRevenue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
  };
}

// Get date range from filter
function getDateRange(filters: ScheduledReport['filters']): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (filters.dateRange) {
    case 'last7days':
      start.setDate(end.getDate() - 7);
      break;
    case 'last30days':
      start.setDate(end.getDate() - 30);
      break;
    case 'last90days':
      start.setDate(end.getDate() - 90);
      break;
    case 'thisMonth':
      start.setDate(1);
      break;
    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setDate(0);
      break;
    case 'custom':
      if (filters.startDate) start.setTime(Date.parse(filters.startDate));
      if (filters.endDate) end.setTime(Date.parse(filters.endDate));
      break;
    default:
      start.setDate(end.getDate() - 30);
  }

  return { start, end };
}

// Export report to Excel/PDF
export async function exportReport(
  data: Record<string, unknown>,
  format: ReportFormat
): Promise<Buffer> {
  if (format === 'excel') {
    // Use xlsx library
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet([data.summary as Record<string, unknown>]);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  if (format === 'csv') {
    // Simple CSV export
    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));
    
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    return XLSX.utils.sheet_to_csv(ws);
  }

  // PDF would require a PDF library like puppeteer or pdfkit
  throw new Error('PDF export not yet implemented');
}

export type { ScheduledReport };

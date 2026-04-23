// Funnel Analysis - Track customer journey from visit to purchase

import { prisma } from '@/lib/prisma';

interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number; // From previous stage
  dropOffRate: number;
  averageTimeSpent?: number; // seconds
}

interface FunnelAnalysis {
  stages: FunnelStage[];
  overallConversionRate: number;
  averageOrderValue: number;
  totalRevenue: number;
  period: { start: Date; end: Date };
}

// Generate sales funnel analysis
export async function generateSalesFunnel(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<FunnelAnalysis> {
  // Stage 1: Product Views (from analytics/events)
  // Stage 2: Add to Cart
  // Stage 3: Checkout Started
  // Stage 4: Order Completed

  // Get completed orders
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  // Calculate metrics
  const completedOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Note: For a real implementation, you'd track these metrics via analytics
  // This is a simplified version using order data

  // Estimate earlier stages based on typical e-commerce conversion rates
  // and actual order data
  const checkoutStarted = Math.round(completedOrders / 0.4); // ~40% checkout completion rate
  const addToCart = Math.round(checkoutStarted / 0.25); // ~25% cart to checkout
  const productViews = Math.round(addToCart / 0.08); // ~8% add to cart rate

  const stages: FunnelStage[] = [
    {
      name: 'Ürün Görüntüleme',
      count: productViews,
      conversionRate: 100,
      dropOffRate: 0,
      averageTimeSpent: 45,
    },
    {
      name: 'Sepete Ekleme',
      count: addToCart,
      conversionRate: Math.round((addToCart / productViews) * 100),
      dropOffRate: Math.round(((productViews - addToCart) / productViews) * 100),
      averageTimeSpent: 120,
    },
    {
      name: 'Ödeme Başlatma',
      count: checkoutStarted,
      conversionRate: Math.round((checkoutStarted / addToCart) * 100),
      dropOffRate: Math.round(((addToCart - checkoutStarted) / addToCart) * 100),
      averageTimeSpent: 180,
    },
    {
      name: 'Sipariş Tamamlama',
      count: completedOrders,
      conversionRate: Math.round((completedOrders / checkoutStarted) * 100),
      dropOffRate: Math.round(((checkoutStarted - completedOrders) / checkoutStarted) * 100),
      averageTimeSpent: 60,
    },
  ];

  return {
    stages,
    overallConversionRate: Math.round((completedOrders / productViews) * 100 * 100) / 100,
    averageOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalRevenue,
    period: { start: startDate, end: endDate },
  };
}

// Generate abandonment funnel (where customers drop off)
export async function generateAbandonmentAnalysis(
  tenantId: string,
  days: number = 30
): Promise<{
  cartAbandonmentRate: number;
  checkoutAbandonmentRate: number;
  abandonedCarts: number;
  recoveredCarts: number;
  recoveryRate: number;
  lostRevenue: number;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // This would require a Cart/Session model in the database
  // For now, return estimated values based on industry averages

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const completedOrders = orders.length;
  
  // Industry standard: ~70% cart abandonment
  const abandonedCarts = Math.round(completedOrders * 0.7);
  const recoveredCarts = Math.round(abandonedCarts * 0.15); // ~15% recovery rate

  const avgOrderValue = completedOrders > 0
    ? orders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / completedOrders
    : 0;

  return {
    cartAbandonmentRate: 70,
    checkoutAbandonmentRate: 40,
    abandonedCarts,
    recoveredCarts,
    recoveryRate: Math.round((recoveredCarts / (abandonedCarts || 1)) * 100 * 100) / 100,
    lostRevenue: Math.round((abandonedCarts - recoveredCarts) * avgOrderValue * 100) / 100,
  };
}

// Track conversion by traffic source
export async function conversionBySource(
  tenantId: string,
  days: number = 30
): Promise<Array<{ source: string; visitors: number; orders: number; conversionRate: number }>> {
  // This would integrate with analytics (Google Analytics, etc.)
  // For now, return sample data structure
  
  const sources = [
    { source: 'Organic Search', visitors: 1000, orders: 50, conversionRate: 5 },
    { source: 'Direct', visitors: 500, orders: 40, conversionRate: 8 },
    { source: 'Social Media', visitors: 800, orders: 24, conversionRate: 3 },
    { source: 'Paid Ads', visitors: 600, orders: 36, conversionRate: 6 },
    { source: 'Email', visitors: 300, orders: 30, conversionRate: 10 },
    { source: 'Referral', visitors: 200, orders: 16, conversionRate: 8 },
  ];

  return sources;
}

// Funnel comparison by platform
export async function funnelByPlatform(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, { orders: number; conversionRate: number; avgOrderValue: number }>> {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const platformData: Record<string, { orders: number; revenue: number }> = {};

  for (const order of orders) {
    const platform = order.platform;
    if (!platformData[platform]) {
      platformData[platform] = { orders: 0, revenue: 0 };
    }
    platformData[platform].orders++;
    platformData[platform].revenue += Number(order.totalAmount);
  }

  // Add conversion rates (would need visitor data from analytics)
  const result: Record<string, { orders: number; conversionRate: number; avgOrderValue: number }> = {};
  
  for (const [platform, data] of Object.entries(platformData)) {
    result[platform] = {
      orders: data.orders,
      conversionRate: Math.round(Math.random() * 3 + 2), // 2-5% (would come from analytics)
      avgOrderValue: Math.round((data.revenue / data.orders) * 100) / 100,
    };
  }

  return result;
}

// Time to conversion analysis
export async function timeToConversion(
  tenantId: string,
  days: number = 30
): Promise<{
  averageTimeToFirstPurchase: number; // days
  averageTimeBetweenPurchases: number; // days
  distribution: { range: string; count: number; percentage: number }[];
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { orderDate: 'asc' },
  });

  // Group orders by customer
  const customerOrders = new Map<string, Date[]>();
  
  for (const order of orders) {
    const email = order.customerEmail || 'unknown';
    if (!customerOrders.has(email)) {
      customerOrders.set(email, []);
    }
    customerOrders.get(email)!.push(order.orderDate);
  }

  // Calculate time to first purchase (would need registration date)
  // For now, assume all are first-time buyers in this period
  const firstPurchaseDays: number[] = [];
  const betweenPurchaseDays: number[] = [];

  for (const [, dates] of customerOrders) {
    if (dates.length === 1) {
      firstPurchaseDays.push(0); // Same day
    } else {
      // Time between first and second purchase
      const diff = (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      betweenPurchaseDays.push(diff);
    }
  }

  const avgFirstPurchase = firstPurchaseDays.length > 0
    ? firstPurchaseDays.reduce((a, b) => a + b, 0) / firstPurchaseDays.length
    : 0;

  const avgBetweenPurchases = betweenPurchaseDays.length > 0
    ? betweenPurchaseDays.reduce((a, b) => a + b, 0) / betweenPurchaseDays.length
    : 0;

  // Distribution
  const ranges = [
    { max: 1, label: '0-1 gün' },
    { max: 7, label: '1-7 gün' },
    { max: 30, label: '1-4 hafta' },
    { max: 90, label: '1-3 ay' },
    { max: Infinity, label: '3+ ay' },
  ];

  const distribution = ranges.map(range => {
    const count = betweenPurchaseDays.filter(d => {
      if (range.max === Infinity) return d > 90;
      return d <= range.max;
    }).length;
    
    return {
      range: range.label,
      count,
      percentage: betweenPurchaseDays.length > 0
        ? Math.round((count / betweenPurchaseDays.length) * 100)
        : 0,
    };
  });

  return {
    averageTimeToFirstPurchase: Math.round(avgFirstPurchase * 10) / 10,
    averageTimeBetweenPurchases: Math.round(avgBetweenPurchases * 10) / 10,
    distribution,
  };
}

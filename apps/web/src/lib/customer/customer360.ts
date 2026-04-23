// Customer 360° View
// Comprehensive customer profile with behavior analysis

import { prisma } from '@/lib/prisma';

interface Customer360Profile {
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
    tags: string[];
  };
  
  // Purchase behavior
  purchaseHistory: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    firstOrderDate: Date;
    lastOrderDate: Date;
    preferredPlatform: string;
    preferredPaymentMethod: string;
  };
  
  // Order statistics
  orders: {
    list: Array<{
      id: string;
      orderNumber: string;
      date: Date;
      total: number;
      status: string;
      platform: string;
      items: number;
    }>;
    byStatus: Record<string, number>;
    byPlatform: Record<string, number>;
    monthlyTrend: Array<{ month: string; count: number; revenue: number }>;
  };
  
  // Product preferences
  productPreferences: {
    topCategories: Array<{ category: string; count: number }>;
    topBrands: Array<{ brand: string; count: number }>;
    priceRange: { min: number; max: number; average: number };
    frequentlyBought: Array<{
      productId: string;
      name: string;
      purchaseCount: number;
    }>;
  };
  
  // Engagement
  engagement: {
    lastLogin?: Date;
    totalLogins: number;
    emailOpenRate: number;
    clickRate: number;
    supportTickets: number;
    reviewCount: number;
  };
  
  // Calculated metrics
  metrics: {
    customerLifetimeValue: number;
    churnRisk: 'low' | 'medium' | 'high';
    customerSegment: 'vip' | 'loyal' | 'regular' | 'at_risk' | 'new';
    nextPurchaseProbability: number;
    daysSinceLastOrder: number;
  };
  
  // Recommendations
  recommendations: {
    products: string[]; // Product IDs
    actions: string[]; // Suggested actions
  };
}

// Build customer 360 profile
export async function buildCustomer360(
  customerId: string,
  tenantId: string
): Promise<Customer360Profile | null> {
  // Get customer basic info
  const customer = await prisma.order.findFirst({
    where: { customerId, tenantId },
    select: {
      customerId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
    },
  });

  if (!customer) return null;

  // Get all orders
  const orders = await prisma.order.findMany({
    where: {
      customerId,
      tenantId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              category: true,
              brand: true,
            },
          },
        },
      },
    },
    orderBy: { orderDate: 'desc' },
  });

  if (orders.length === 0) return null;

  // Calculate purchase history
  const purchaseHistory = calculatePurchaseHistory(orders);
  
  // Calculate product preferences
  const productPreferences = calculateProductPreferences(orders);
  
  // Calculate engagement metrics
  const engagement = await calculateEngagement(customerId, tenantId);
  
  // Calculate customer metrics
  const metrics = calculateMetrics(orders, purchaseHistory);
  
  // Generate recommendations
  const recommendations = await generateRecommendations(
    customerId,
    productPreferences,
    tenantId
  );

  return {
    customer: {
      id: customerId,
      name: customer.customerName || 'Unknown',
      email: customer.customerEmail || '',
      phone: customer.customerPhone || undefined,
      createdAt: orders[orders.length - 1]?.orderDate || new Date(),
      tags: [], // Would come from CRM
    },
    purchaseHistory,
    orders: {
      list: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.orderDate,
        total: o.totalAmount,
        status: o.status,
        platform: o.platform,
        items: o.items.length,
      })),
      byStatus: countBy(orders, 'status'),
      byPlatform: countBy(orders, 'platform'),
      monthlyTrend: calculateMonthlyTrend(orders),
    },
    productPreferences,
    engagement,
    metrics,
    recommendations,
  };
}

function calculatePurchaseHistory(orders: any[]) {
  const sorted = orders.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Platform preference
  const platformCounts = countBy(orders, 'platform');
  const preferredPlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  
  return {
    totalOrders: orders.length,
    totalSpent,
    averageOrderValue: totalSpent / orders.length,
    firstOrderDate: sorted[0].orderDate,
    lastOrderDate: sorted[sorted.length - 1].orderDate,
    preferredPlatform,
    preferredPaymentMethod: 'credit_card', // Would come from payment data
  };
}

function calculateProductPreferences(orders: any[]) {
  const allItems = orders.flatMap(o => o.items);
  
  // Category preferences
  const categoryCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const productCounts: Record<string, { name: string; count: number }> = {};
  
  allItems.forEach(item => {
    const category = item.product?.category || 'Unknown';
    const brand = item.product?.brand || 'Unknown';
    
    categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
    brandCounts[brand] = (brandCounts[brand] || 0) + item.quantity;
    
    if (!productCounts[item.productId]) {
      productCounts[item.productId] = { name: item.productName, count: 0 };
    }
    productCounts[item.productId].count += item.quantity;
  });
  
  const prices = allItems.map(i => i.unitPrice);
  
  return {
    topCategories: Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topBrands: Object.entries(brandCounts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
    },
    frequentlyBought: Object.entries(productCounts)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 10),
  };
}

async function calculateEngagement(customerId: string, tenantId: string): Promise<any> {
  // In production, this would integrate with:
  // - Login history
  // - Email campaign analytics
  // - Support ticket system
  // - Review system
  
  return {
    lastLogin: undefined,
    totalLogins: 0,
    emailOpenRate: 0,
    clickRate: 0,
    supportTickets: 0,
    reviewCount: 0,
  };
}

function calculateMetrics(
  orders: any[],
  purchaseHistory: any
): Customer360Profile['metrics'] {
  const now = new Date();
  const daysSinceLastOrder = Math.floor(
    (now.getTime() - purchaseHistory.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate CLV (simplified)
  const clv = purchaseHistory.averageOrderValue * 
    (purchaseHistory.totalOrders * 1.5); // Predict future purchases
  
  // Churn risk
  let churnRisk: 'low' | 'medium' | 'high' = 'low';
  if (daysSinceLastOrder > 90) churnRisk = 'high';
  else if (daysSinceLastOrder > 30) churnRisk = 'medium';
  
  // Customer segment
  let customerSegment: Customer360Profile['metrics']['customerSegment'] = 'regular';
  if (purchaseHistory.totalSpent > 50000) customerSegment = 'vip';
  else if (purchaseHistory.totalSpent > 10000) customerSegment = 'loyal';
  else if (daysSinceLastOrder > 60) customerSegment = 'at_risk';
  else if (purchaseHistory.totalOrders === 1) customerSegment = 'new';
  
  // Next purchase probability (simplified model)
  let nextPurchaseProbability = 0.5;
  if (daysSinceLastOrder < 7) nextPurchaseProbability = 0.8;
  else if (daysSinceLastOrder < 30) nextPurchaseProbability = 0.6;
  else if (daysSinceLastOrder > 90) nextPurchaseProbability = 0.2;
  
  return {
    customerLifetimeValue: clv,
    churnRisk,
    customerSegment,
    nextPurchaseProbability,
    daysSinceLastOrder,
  };
}

async function generateRecommendations(
  customerId: string,
  preferences: any,
  tenantId: string
): Promise<Customer360Profile['recommendations']> {
  const products: string[] = [];
  const actions: string[] = [];
  
  // Product recommendations based on categories
  for (const category of preferences.topCategories.slice(0, 3)) {
    const similarProducts = await prisma.product.findMany({
      where: {
        tenantId,
        category: category.category,
        status: 'active',
      },
      take: 3,
      select: { id: true },
    });
    products.push(...similarProducts.map(p => p.id));
  }
  
  // Action recommendations
  actions.push('Send personalized discount email');
  actions.push('Recommend complementary products');
  
  return { products, actions };
}

// Helper function
function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateMonthlyTrend(orders: any[]) {
  const monthly: Record<string, { count: number; revenue: number }> = {};
  
  orders.forEach(order => {
    const month = order.orderDate.toISOString().slice(0, 7); // YYYY-MM
    if (!monthly[month]) {
      monthly[month] = { count: 0, revenue: 0 };
    }
    monthly[month].count++;
    monthly[month].revenue += order.totalAmount;
  });
  
  return Object.entries(monthly)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Customer segmentation for all customers
export async function segmentCustomers(
  tenantId: string
): Promise<Record<string, string[]>> {
  const orders = await prisma.order.findMany({
    where: { tenantId },
    select: {
      customerId: true,
      totalAmount: true,
      orderDate: true,
    },
  });
  
  const customerStats: Record<string, { totalSpent: number; lastOrder: Date; count: number }> = {};
  
  orders.forEach(order => {
    if (!customerStats[order.customerId]) {
      customerStats[order.customerId] = { totalSpent: 0, lastOrder: order.orderDate, count: 0 };
    }
    customerStats[order.customerId].totalSpent += order.totalAmount;
    customerStats[order.customerId].lastOrder = order.orderDate;
    customerStats[order.customerId].count++;
  });
  
  const now = new Date();
  const segments: Record<string, string[]> = {
    vip: [],
    loyal: [],
    regular: [],
    at_risk: [],
    new: [],
  };
  
  Object.entries(customerStats).forEach(([customerId, stats]) => {
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - stats.lastOrder.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (stats.totalSpent > 50000) segments.vip.push(customerId);
    else if (stats.totalSpent > 10000) segments.loyal.push(customerId);
    else if (daysSinceLastOrder > 60) segments.at_risk.push(customerId);
    else if (stats.count === 1) segments.new.push(customerId);
    else segments.regular.push(customerId);
  });
  
  return segments;
}

export type { Customer360Profile };

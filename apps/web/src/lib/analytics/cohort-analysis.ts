// Cohort Analysis for Customer Retention
// Tracks how different customer groups behave over time

import { prisma } from '@/lib/prisma';

interface CohortGroup {
  cohortMonth: string; // YYYY-MM
  customerCount: number;
  retention: number[]; // Percentage retained at each month
  revenue: number[];   // Revenue at each month
}

interface CohortAnalysis {
  cohorts: CohortGroup[];
  averageRetention: number[];
  averageLTV: number;
}

// Generate cohort analysis
export async function generateCohortAnalysis(
  tenantId: string,
  months: number = 12
): Promise<CohortAnalysis> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get all orders in date range
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

  // Group customers by their first order month (cohort)
  const customerCohorts = new Map<string, Set<string>>(); // month -> customerEmails
  const customerFirstOrder = new Map<string, Date>();
  const customerOrders = new Map<string, Array<typeof orders[0]>>();

  for (const order of orders) {
    const customerEmail = order.customerEmail || 'unknown';
    
    if (!customerFirstOrder.has(customerEmail)) {
      customerFirstOrder.set(customerEmail, order.orderDate);
      
      const cohortMonth = formatMonth(order.orderDate);
      if (!customerCohorts.has(cohortMonth)) {
        customerCohorts.set(cohortMonth, new Set());
      }
      customerCohorts.get(cohortMonth)!.add(customerEmail);
    }

    if (!customerOrders.has(customerEmail)) {
      customerOrders.set(customerEmail, []);
    }
    customerOrders.get(customerEmail)!.push(order);
  }

  // Calculate retention for each cohort
  const cohorts: CohortGroup[] = [];
  const sortedMonths = Array.from(customerCohorts.keys()).sort();

  for (const cohortMonth of sortedMonths) {
    const customers = customerCohorts.get(cohortMonth)!;
    const customerCount = customers.size;
    
    const retention: number[] = [];
    const revenue: number[] = [];

    // For each month after cohort start, calculate retention
    const cohortStart = parseMonth(cohortMonth);
    
    for (let i = 0; i < months; i++) {
      const targetMonth = new Date(cohortStart);
      targetMonth.setMonth(targetMonth.getMonth() + i);
      
      const targetMonthStr = formatMonth(targetMonth);
      
      // Count customers who made a purchase in this month
      let retainedCount = 0;
      let monthRevenue = 0;
      
      for (const customerEmail of customers) {
        const customerOrderList = customerOrders.get(customerEmail) || [];
        const hasOrderInMonth = customerOrderList.some(o => {
          const orderMonth = formatMonth(o.orderDate);
          return orderMonth === targetMonthStr;
        });
        
        if (hasOrderInMonth) {
          retainedCount++;
          monthRevenue += customerOrderList
            .filter(o => formatMonth(o.orderDate) === targetMonthStr)
            .reduce((sum, o) => sum + Number(o.totalAmount), 0);
        }
      }

      retention.push(Math.round((retainedCount / customerCount) * 100));
      revenue.push(monthRevenue);
    }

    cohorts.push({
      cohortMonth,
      customerCount,
      retention,
      revenue,
    });
  }

  // Calculate averages
  const averageRetention: number[] = [];
  for (let i = 0; i < months; i++) {
    const sum = cohorts.reduce((acc, c) => acc + (c.retention[i] || 0), 0);
    averageRetention.push(Math.round(sum / cohorts.length));
  }

  // Calculate average LTV
  const averageLTV = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.revenue.reduce((a, b) => a + b, 0), 0) / 
      cohorts.reduce((sum, c) => sum + c.customerCount, 0)
    : 0;

  return {
    cohorts,
    averageRetention,
    averageLTV,
  };
}

// Helper functions
function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseMonth(monthStr: string): Date {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

// Calculate customer lifetime value (LTV)
export async function calculateLTV(
  tenantId: string,
  months: number = 24
): Promise<{
  averageLTV: number;
  medianLTV: number;
  ltvByCohort: Record<string, number>;
  ltvDistribution: { range: string; count: number }[];
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate LTV per customer
  const customerLTV = new Map<string, { total: number; firstOrder: Date }>();

  for (const order of orders) {
    const email = order.customerEmail || 'unknown';
    
    if (!customerLTV.has(email)) {
      customerLTV.set(email, { total: 0, firstOrder: order.orderDate });
    }
    
    const current = customerLTV.get(email)!;
    current.total += Number(order.totalAmount);
  }

  const ltvs = Array.from(customerLTV.values()).map(c => c.total);
  
  // Calculate statistics
  const averageLTV = ltvs.length > 0 ? ltvs.reduce((a, b) => a + b, 0) / ltvs.length : 0;
  const sortedLTV = [...ltvs].sort((a, b) => a - b);
  const medianLTV = sortedLTV.length > 0 
    ? sortedLTV[Math.floor(sortedLTV.length / 2)] 
    : 0;

  // LTV by cohort (first order month)
  const ltvByCohort: Record<string, number> = {};
  for (const [email, data] of customerLTV) {
    const cohort = formatMonth(data.firstOrder);
    ltvByCohort[cohort] = (ltvByCohort[cohort] || 0) + data.total;
  }

  // LTV distribution
  const ranges = [
    { max: 100, label: '0-100₺' },
    { max: 500, label: '100-500₺' },
    { max: 1000, label: '500-1000₺' },
    { max: 5000, label: '1000-5000₺' },
    { max: Infinity, label: '5000₺+' },
  ];

  const ltvDistribution = ranges.map(range => ({
    range: range.label,
    count: ltvs.filter(v => {
      if (range.max === Infinity) return v > 5000;
      return v <= range.max && (ranges[ranges.indexOf(range) - 1]?.max || 0) < v;
    }).length,
  }));

  return {
    averageLTV,
    medianLTV,
    ltvByCohort,
    ltvDistribution,
  };
}

// Predict future LTV using simple linear regression
export function predictLTV(
  historicalLTV: number[],
  monthsToPredict: number = 6
): number[] {
  if (historicalLTV.length < 2) return [];

  // Simple linear regression
  const n = historicalLTV.length;
  const sumX = historicalLTV.reduce((sum, _, i) => sum + i, 0);
  const sumY = historicalLTV.reduce((sum, v) => sum + v, 0);
  const sumXY = historicalLTV.reduce((sum, v, i) => sum + i * v, 0);
  const sumX2 = historicalLTV.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict future values
  const predictions: number[] = [];
  for (let i = 0; i < monthsToPredict; i++) {
    const x = n + i;
    predictions.push(Math.max(0, slope * x + intercept));
  }

  return predictions;
}

// Calculate churn rate
export async function calculateChurnRate(
  tenantId: string,
  months: number = 6
): Promise<{
  monthlyChurn: { month: string; rate: number; customersLost: number; totalCustomers: number }[];
  averageChurnRate: number;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

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

  // Track active customers per month
  const monthlyCustomers = new Map<string, Set<string>>();
  const customerLastOrder = new Map<string, string>(); // customer -> last order month

  for (const order of orders) {
    const month = formatMonth(order.orderDate);
    const email = order.customerEmail || 'unknown';

    if (!monthlyCustomers.has(month)) {
      monthlyCustomers.set(month, new Set());
    }
    monthlyCustomers.get(month)!.add(email);
    customerLastOrder.set(email, month);
  }

  // Calculate churn for each month
  const monthlyChurn: { month: string; rate: number; customersLost: number; totalCustomers: number }[] = [];
  const sortedMonths = Array.from(monthlyCustomers.keys()).sort();

  for (let i = 1; i < sortedMonths.length; i++) {
    const prevMonth = sortedMonths[i - 1];
    const currentMonth = sortedMonths[i];

    const prevCustomers = monthlyCustomers.get(prevMonth)!;
    const currentCustomers = monthlyCustomers.get(currentMonth)!;

    // Customers who were active last month but not this month
    let churned = 0;
    for (const customer of prevCustomers) {
      // Check if they ordered in current month
      if (!currentCustomers.has(customer)) {
        // Check if they ordered in any future month (not really churned, just skipped)
        let willReturn = false;
        for (let j = i + 1; j < sortedMonths.length; j++) {
          if (monthlyCustomers.get(sortedMonths[j])?.has(customer)) {
            willReturn = true;
            break;
          }
        }
        if (!willReturn) {
          churned++;
        }
      }
    }

    const rate = prevCustomers.size > 0 ? (churned / prevCustomers.size) * 100 : 0;

    monthlyChurn.push({
      month: currentMonth,
      rate: Math.round(rate * 100) / 100,
      customersLost: churned,
      totalCustomers: prevCustomers.size,
    });
  }

  const averageChurnRate = monthlyChurn.length > 0
    ? monthlyChurn.reduce((sum, m) => sum + m.rate, 0) / monthlyChurn.length
    : 0;

  return {
    monthlyChurn,
    averageChurnRate: Math.round(averageChurnRate * 100) / 100,
  };
}

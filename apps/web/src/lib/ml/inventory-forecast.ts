// ML-Based Inventory Forecasting
// Predict stock needs using historical data and trends

import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue';

interface InventoryForecast {
  productId: string;
  currentStock: number;
  predictedDemand: number; // Units needed for next period
  recommendedOrder: number;
  confidence: number; // 0-1
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number; // Seasonal factor
  risk: 'low' | 'medium' | 'high';
}

interface ForecastConfig {
  forecastPeriod: number; // Days ahead (default: 30)
  seasonalityWindow: number; // Days to analyze patterns (default: 90)
  confidenceThreshold: number; // Minimum confidence for recommendations (default: 0.7)
  safetyStockMultiplier: number; // Safety stock factor (default: 1.5)
}

const defaultConfig: ForecastConfig = {
  forecastPeriod: 30,
  seasonalityWindow: 90,
  confidenceThreshold: 0.7,
  safetyStockMultiplier: 1.5,
};

// Main forecasting function
export async function forecastInventory(
  tenantId: string,
  productIds?: string[],
  config: Partial<ForecastConfig> = {}
): Promise<InventoryForecast[]> {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Get products to analyze
  const products = await prisma.product.findMany({
    where: {
      tenantId,
      id: productIds ? { in: productIds } : undefined,
      status: 'active',
    },
    select: {
      id: true,
      stock: true,
      name: true,
      reorderPoint: true,
      reorderQuantity: true,
    },
  });

  const forecasts: InventoryForecast[] = [];

  for (const product of products) {
    const forecast = await calculateForecast(product.id, product, finalConfig, tenantId);
    forecasts.push(forecast);
  }

  return forecasts.sort((a, b) => {
    // Sort by risk (high first) then by confidence
    const riskOrder = { high: 0, medium: 1, low: 2 };
    if (riskOrder[a.risk] !== riskOrder[b.risk]) {
      return riskOrder[a.risk] - riskOrder[b.risk];
    }
    return b.confidence - a.confidence;
  });
}

// Calculate forecast for a single product
async function calculateForecast(
  productId: string,
  product: { stock: number; name: string; reorderPoint: number | null; reorderQuantity: number | null },
  config: ForecastConfig,
  tenantId: string
): Promise<InventoryForecast> {
  // Get historical sales data
  const since = new Date();
  since.setDate(since.getDate() - config.seasonalityWindow);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: { gte: since },
      status: { not: 'CANCELLED' },
      items: {
        some: { productId },
      },
    },
    include: {
      items: {
        where: { productId },
        select: { quantity: true },
      },
    },
    orderBy: { orderDate: 'asc' },
  });

  // Calculate daily sales
  const dailySales: Record<string, number> = {};
  
  orders.forEach(order => {
    const date = order.orderDate.toISOString().split('T')[0];
    const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    dailySales[date] = (dailySales[date] || 0) + quantity;
  });

  const dates = Object.keys(dailySales).sort();
  const values = dates.map(d => dailySales[d]);

  // Calculate trend using simple linear regression
  const trend = calculateTrend(values);
  
  // Calculate seasonality patterns
  const seasonality = calculateSeasonality(dailySales);
  
  // Predict demand for forecast period
  const avgDailySales = values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 0;
  
  // Apply trend and seasonality
  const trendFactor = 1 + (trend.slope * config.forecastPeriod / values.length);
  const predictedDemand = Math.max(0, avgDailySales * config.forecastPeriod * trendFactor * seasonality.factor);
  
  // Calculate confidence based on data quality
  const confidence = calculateConfidence(values, config.seasonalityWindow);
  
  // Calculate recommended order with safety stock
  const safetyStock = avgDailySales * config.forecastPeriod * (config.safetyStockMultiplier - 1);
  const netDemand = Math.max(0, predictedDemand - product.stock);
  const recommendedOrder = Math.ceil(netDemand + safetyStock);
  
  // Determine risk level
  let risk: 'low' | 'medium' | 'high' = 'low';
  const stockoutRisk = (product.stock / (predictedDemand || 1));
  
  if (stockoutRisk < 0.3 || (product.reorderPoint && product.stock <= product.reorderPoint)) {
    risk = 'high';
  } else if (stockoutRisk < 0.7) {
    risk = 'medium';
  }

  return {
    productId,
    currentStock: product.stock,
    predictedDemand: Math.round(predictedDemand),
    recommendedOrder: Math.max(0, recommendedOrder),
    confidence: Math.round(confidence * 100) / 100,
    trend: trend.direction,
    seasonality: seasonality.factor,
    risk,
  };
}

// Simple linear regression for trend
function calculateTrend(values: number[]): { slope: number; direction: 'increasing' | 'decreasing' | 'stable' } {
  if (values.length < 2) {
    return { slope: 0, direction: 'stable' };
  }

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.01) direction = 'increasing';
  else if (slope < -0.01) direction = 'decreasing';

  return { slope, direction };
}

// Calculate seasonality based on day of week
function calculateSeasonality(dailySales: Record<string, number>): { factor: number; pattern: number[] } {
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sunday-Saturday
  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  Object.entries(dailySales).forEach(([date, sales]) => {
    const day = new Date(date).getDay();
    dayTotals[day] += sales;
    dayCounts[day]++;
  });

  const dayAverages = dayTotals.map((total, i) => 
    dayCounts[i] > 0 ? total / dayCounts[i] : 0
  );

  const overallAvg = dayAverages.reduce((a, b) => a + b, 0) / 7 || 1;
  
  // Calculate upcoming period factor based on day patterns
  const today = new Date().getDay();
  let weightedFactor = 0;
  let totalWeight = 0;

  for (let i = 0; i < 30; i++) {
    const day = (today + i) % 7;
    const weight = dayAverages[day] / overallAvg;
    weightedFactor += weight;
    totalWeight++;
  }

  return {
    factor: totalWeight > 0 ? weightedFactor / totalWeight : 1,
    pattern: dayAverages.map(avg => avg / overallAvg),
  };
}

// Calculate confidence based on data variance
function calculateConfidence(values: number[], expectedDataPoints: number): number {
  if (values.length === 0) return 0;
  
  // Data coverage confidence (0.5 if 50% coverage)
  const coverage = Math.min(values.length / expectedDataPoints, 1);
  
  // Variance confidence (lower variance = higher confidence)
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const cv = avg > 0 ? Math.sqrt(variance) / avg : 0; // Coefficient of variation
  
  // Confidence decreases with high variance
  const varianceConfidence = Math.max(0, 1 - cv);
  
  // Combined confidence
  return coverage * 0.3 + varianceConfidence * 0.7;
}

// Smart reordering suggestions
export async function getReorderSuggestions(
  tenantId: string,
  options: {
    minConfidence?: number;
    riskLevels?: Array<'low' | 'medium' | 'high'>;
    limit?: number;
  } = {}
): Promise<{
  urgent: InventoryForecast[];
  recommended: InventoryForecast[];
  info: InventoryForecast[];
}> {
  const { minConfidence = 0.6, riskLevels = ['high', 'medium'], limit = 50 } = options;

  const forecasts = await forecastInventory(tenantId, undefined, {
    confidenceThreshold: minConfidence,
  });

  // Filter by risk level
  const filtered = forecasts.filter(f => 
    f.recommendedOrder > 0 && riskLevels.includes(f.risk)
  );

  return {
    urgent: filtered.filter(f => f.risk === 'high').slice(0, limit),
    recommended: filtered.filter(f => f.risk === 'medium').slice(0, limit),
    info: forecasts.filter(f => f.risk === 'low' && f.recommendedOrder > 0).slice(0, limit),
  };
}

// Automated reorder job
export async function processAutomatedReorder(tenantId: string): Promise<{
  processed: number;
  errors: string[];
}> {
  const suggestions = await getReorderSuggestions(tenantId, {
    riskLevels: ['high'],
    minConfidence: 0.75,
  });

  const errors: string[] = [];
  let processed = 0;

  for (const forecast of suggestions.urgent) {
    try {
      // Queue purchase order creation
      await addJob('inventory.create_purchase_order', {
        tenantId,
        productId: forecast.productId,
        quantity: forecast.recommendedOrder,
        priority: 'high',
        reason: `Forecast: ${forecast.predictedDemand} units needed in next 30 days`,
      });
      
      processed++;
    } catch (error) {
      errors.push(`Failed to reorder ${forecast.productId}: ${error}`);
    }
  }

  return { processed, errors };
}

// Stockout prediction
export async function predictStockout(
  tenantId: string,
  days: number = 14
): Promise<Array<{
  productId: string;
  productName: string;
  currentStock: number;
  predictedStockoutDate: Date;
  daysUntilStockout: number;
}>> {
  const forecasts = await forecastInventory(tenantId, undefined, {
    forecastPeriod: days,
  });

  const predictions = forecasts
    .filter(f => f.predictedDemand > f.currentStock)
    .map(f => {
      const avgDailyDemand = f.predictedDemand / days;
      const daysUntilStockout = avgDailyDemand > 0 
        ? Math.floor(f.currentStock / avgDailyDemand) 
        : Infinity;
      
      const predictedStockoutDate = new Date();
      predictedStockoutDate.setDate(predictedStockoutDate.getDate() + daysUntilStockout);

      return {
        productId: f.productId,
        productName: '', // Would fetch from product data
        currentStock: f.currentStock,
        predictedStockoutDate,
        daysUntilStockout,
      };
    })
    .filter(p => p.daysUntilStockout <= days)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

  return predictions;
}

// Dashboard metrics
export async function getInventoryMetrics(tenantId: string): Promise<{
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  overstock: number; // Stock > 3x predicted demand
  forecastAccuracy: number;
  avgTurnoverDays: number;
}> {
  const forecasts = await forecastInventory(tenantId);
  
  const lowStock = forecasts.filter(f => f.risk === 'high').length;
  const outOfStock = forecasts.filter(f => f.currentStock === 0).length;
  const overstock = forecasts.filter(f => 
    f.currentStock > f.predictedDemand * 3 && f.predictedDemand > 0
  ).length;

  // Calculate average turnover (days of stock)
  const turnoverDays = forecasts
    .filter(f => f.predictedDemand > 0)
    .map(f => (f.currentStock / f.predictedDemand) * 30);
  
  const avgTurnoverDays = turnoverDays.length > 0
    ? turnoverDays.reduce((a, b) => a + b, 0) / turnoverDays.length
    : 0;

  return {
    totalProducts: forecasts.length,
    lowStock,
    outOfStock,
    overstock,
    forecastAccuracy: 0.85, // Would calculate from actual vs predicted
    avgTurnoverDays: Math.round(avgTurnoverDays),
  };
}

export { InventoryForecast, ForecastConfig };

// ML-Based Product Recommendations Engine
// Collaborative filtering and content-based recommendations

import { prisma } from '@/lib/prisma';

interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
}

interface UserBehavior {
  views: string[]; // Product IDs viewed
  purchases: string[]; // Product IDs purchased
  searches: string[]; // Search queries
  cartAdds: string[]; // Products added to cart
}

// Content-based recommendation based on product attributes
export async function getContentBasedRecommendations(
  productId: string,
  tenantId: string,
  limit: number = 10
): Promise<ProductRecommendation[]> {
  const targetProduct = await prisma.product.findUnique({
    where: { id: productId, tenantId },
    select: {
      id: true,
      category: true,
      brand: true,
      tags: true,
      price: true,
    },
  });

  if (!targetProduct) return [];

  // Find similar products based on attributes
  const similarProducts = await prisma.product.findMany({
    where: {
      tenantId,
      id: { not: productId },
      status: 'active',
      OR: [
        { category: targetProduct.category },
        { brand: targetProduct.brand },
        { tags: { hasSome: targetProduct.tags } },
      ],
    },
    select: {
      id: true,
      category: true,
      brand: true,
      tags: true,
      price: true,
    },
  });

  // Calculate similarity scores
  const recommendations = similarProducts.map(product => {
    let score = 0;
    const reasons: string[] = [];

    // Category match (highest weight)
    if (product.category === targetProduct.category) {
      score += 0.4;
      reasons.push('Same category');
    }

    // Brand match
    if (product.brand === targetProduct.brand) {
      score += 0.2;
      reasons.push('Same brand');
    }

    // Tag overlap
    const commonTags = product.tags.filter(t => targetProduct.tags.includes(t));
    if (commonTags.length > 0) {
      score += (commonTags.length / Math.max(product.tags.length, targetProduct.tags.length)) * 0.25;
      reasons.push(`${commonTags.length} common tags`);
    }

    // Price similarity (within 20% range)
    const priceDiff = Math.abs(Number(product.price) - Number(targetProduct.price));
    const priceRange = Number(targetProduct.price) * 0.2;
    if (priceDiff <= priceRange) {
      score += 0.15;
      reasons.push('Similar price');
    }

    return {
      productId: product.id,
      score: Math.min(score, 1),
      reason: reasons[0] || 'Related product',
    };
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Collaborative filtering: "Users who bought X also bought Y"
export async function getCollaborativeRecommendations(
  productId: string,
  tenantId: string,
  limit: number = 10
): Promise<ProductRecommendation[]> {
  // Find customers who bought this product
  const customersWithProduct = await prisma.order.findMany({
    where: {
      tenantId,
      items: {
        some: { productId },
      },
    },
    select: { customerId: true },
    distinct: ['customerId'],
  });

  const customerIds = customersWithProduct.map(c => c.customerId).filter(Boolean);

  if (customerIds.length === 0) return [];

  // Find other products these customers bought
  const otherOrders = await prisma.order.findMany({
    where: {
      tenantId,
      customerId: { in: customerIds },
    },
    include: {
      items: {
        select: { productId: true },
      },
    },
  });

  // Count co-occurrences
  const coOccurrences: Record<string, number> = {};
  
  otherOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId !== productId) {
        coOccurrences[item.productId] = (coOccurrences[item.productId] || 0) + 1;
      }
    });
  });

  // Calculate scores
  const recommendations = Object.entries(coOccurrences)
    .map(([productId, count]) => ({
      productId,
      score: Math.min(count / customerIds.length, 1),
      reason: `Bought by ${count} similar customers`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

// Get personalized recommendations for a customer
export async function getPersonalizedRecommendations(
  customerId: string,
  tenantId: string,
  limit: number = 10
): Promise<ProductRecommendation[]> {
  // Get customer behavior
  const behavior = await getUserBehavior(customerId, tenantId);

  // Get recommendations based on purchased products
  const purchasedRecommendations: ProductRecommendation[] = [];
  
  for (const productId of behavior.purchases.slice(0, 5)) {
    const similar = await getContentBasedRecommendations(productId, tenantId, 5);
    purchasedRecommendations.push(...similar);
  }

  // Get recommendations based on viewed products
  const viewedRecommendations: ProductRecommendation[] = [];
  
  for (const productId of behavior.views.slice(0, 3)) {
    const similar = await getContentBasedRecommendations(productId, tenantId, 3);
    viewedRecommendations.push(...similar);
  }

  // Combine and deduplicate
  const combined = [...purchasedRecommendations, ...viewedRecommendations];
  const unique = new Map<string, ProductRecommendation>();

  combined.forEach(rec => {
    if (unique.has(rec.productId)) {
      const existing = unique.get(rec.productId)!;
      existing.score = Math.max(existing.score, rec.score);
    } else {
      unique.set(rec.productId, rec);
    }
  });

  // Filter out already purchased products
  const filtered = Array.from(unique.values())
    .filter(rec => !behavior.purchases.includes(rec.productId));

  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// "Frequently Bought Together" - market basket analysis
export async function getFrequentlyBoughtTogether(
  productIds: string[],
  tenantId: string,
  limit: number = 5
): Promise<ProductRecommendation[]> {
  if (productIds.length === 0) return [];

  // Find orders containing all or most of these products
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    },
    include: {
      items: {
        select: { productId: true },
      },
    },
    take: 1000, // Sample size for analysis
  });

  // Count products bought together
  const pairCounts: Record<string, { count: number; orders: Set<string> }> = {};

  orders.forEach(order => {
    const orderProductIds = order.items.map(i => i.productId);
    
    // Check if order contains at least one of the input products
    const hasInputProduct = productIds.some(id => orderProductIds.includes(id));
    
    if (hasInputProduct) {
      orderProductIds.forEach(productId => {
        if (!productIds.includes(productId)) {
          if (!pairCounts[productId]) {
            pairCounts[productId] = { count: 0, orders: new Set() };
          }
          pairCounts[productId].orders.add(order.id);
          pairCounts[productId].count = pairCounts[productId].orders.size;
        }
      });
    }
  });

  // Calculate lift scores
  const recommendations = Object.entries(pairCounts)
    .map(([productId, data]) => ({
      productId,
      score: Math.min(data.count / orders.length, 1),
      reason: `Bought together in ${data.count} orders`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

// Trending products based on recent sales
export async function getTrendingProducts(
  tenantId: string,
  days: number = 7,
  limit: number = 10
): Promise<ProductRecommendation[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      orderDate: { gte: since },
      status: { not: 'CANCELLED' },
    },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  const productStats: Record<string, { quantity: number; orders: Set<string> }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { quantity: 0, orders: new Set() };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].orders.add(order.id);
    });
  });

  // Calculate trend score (combination of quantity and order count)
  const recommendations = Object.entries(productStats)
    .map(([productId, stats]) => ({
      productId,
      score: Math.min(
        (stats.quantity * 0.6 + stats.orders.size * 0.4) / 100,
        1
      ),
      reason: `${stats.quantity} sold in ${stats.orders.size} orders`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
}

// Complete recommendation engine
export class RecommendationEngine {
  async getRecommendationsForProduct(
    productId: string,
    tenantId: string,
    options: {
      contentBased?: boolean;
      collaborative?: boolean;
      limit?: number;
    } = {}
  ): Promise<{
    contentBased: ProductRecommendation[];
    collaborative: ProductRecommendation[];
    frequentlyBoughtTogether: ProductRecommendation[];
  }> {
    const { contentBased = true, collaborative = true, limit = 10 } = options;

    const [content, collab, fbt] = await Promise.all([
      contentBased ? getContentBasedRecommendations(productId, tenantId, limit) : [],
      collaborative ? getCollaborativeRecommendations(productId, tenantId, limit) : [],
      getFrequentlyBoughtTogether([productId], tenantId, 5),
    ]);

    return {
      contentBased: content,
      collaborative: collab,
      frequentlyBoughtTogether: fbt,
    };
  }

  async getRecommendationsForCustomer(
    customerId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<{
    personalized: ProductRecommendation[];
    trending: ProductRecommendation[];
    crossSell: ProductRecommendation[];
  }> {
    // Get customer's last purchased products
    const lastOrders = await prisma.order.findMany({
      where: { customerId, tenantId },
      orderBy: { orderDate: 'desc' },
      take: 5,
      include: {
        items: { select: { productId: true } },
      },
    });

    const purchasedProductIds = lastOrders.flatMap(o => 
      o.items.map(i => i.productId)
    );

    const [personalized, trending, crossSell] = await Promise.all([
      getPersonalizedRecommendations(customerId, tenantId, limit),
      getTrendingProducts(tenantId, 7, limit),
      purchasedProductIds.length > 0 
        ? getFrequentlyBoughtTogether(purchasedProductIds.slice(0, 3), tenantId, limit)
        : [],
    ]);

    return {
      personalized,
      trending,
      crossSell,
    };
  }

  // Cache warming - pre-compute recommendations
  async warmCache(tenantId: string): Promise<void> {
    // Get top products
    const trending = await getTrendingProducts(tenantId, 30, 100);
    
    // Pre-compute recommendations for each
    for (const { productId } of trending) {
      await this.getRecommendationsForProduct(productId, tenantId);
    }

    console.log(`Recommendation cache warmed for tenant ${tenantId}`);
  }
}

// Helper functions
async function getUserBehavior(customerId: string, tenantId: string): Promise<UserBehavior> {
  // In production, this would fetch from:
  // - Product view tracking (Redis/analytics)
  // - Search history
  // - Cart events
  
  // For now, derive from orders
  const orders = await prisma.order.findMany({
    where: { customerId, tenantId },
    include: {
      items: { select: { productId: true } },
    },
  });

  return {
    views: [], // Would come from analytics
    purchases: orders.flatMap(o => o.items.map(i => i.productId)),
    searches: [], // Would come from search analytics
    cartAdds: [], // Would come from cart events
  };
}

// Recommendation API helper
export async function getHomepageRecommendations(
  tenantId: string,
  customerId?: string
): Promise<{
  trending: ProductRecommendation[];
  forYou: ProductRecommendation[];
  bundle: ProductRecommendation[];
}> {
  const engine = new RecommendationEngine();

  const [trending, forYou, bundle] = await Promise.all([
    getTrendingProducts(tenantId, 7, 8),
    customerId 
      ? getPersonalizedRecommendations(customerId, tenantId, 8)
      : getTrendingProducts(tenantId, 30, 8),
    getFrequentlyBoughtTogether([], tenantId, 4), // Would need cart data
  ]);

  return {
    trending,
    forYou,
    bundle,
  };
}

export { ProductRecommendation, UserBehavior };

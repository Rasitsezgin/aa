// Product Bundle Manager
// Create and manage product bundles with special pricing

import { prisma } from '@/lib/prisma';

type BundleType = 'fixed' | 'percentage' | 'buy_x_get_y' | 'mix_match';
type BundleStatus = 'draft' | 'active' | 'paused' | 'expired';

interface ProductBundle {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sku: string;
  type: BundleType;
  status: BundleStatus;
  products: BundleItem[];
  pricing: BundlePricing;
  startDate?: Date;
  endDate?: Date;
  customerGroups?: string[];
  platforms?: string[];
  usageLimit?: number;
  usageCount: number;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  isMain: boolean; // Main product that bundle is built around
  isOptional: boolean;
  sortOrder: number;
  product?: {
    id: string;
    title: string;
    sku: string;
    price: number;
    image?: string;
  };
}

interface BundlePricing {
  type: 'fixed' | 'percentage_off' | 'final_price';
  value: number;
  // Calculated fields
  originalTotal: number;
  finalPrice: number;
  savings: number;
  savingsPercentage: number;
}

interface BundleValidation {
  isValid: boolean;
  missingItems?: string[];
  insufficientStock?: Array<{ productId: string; available: number; required: number }>;
  errors: string[];
}

// Bundle manager
export class BundleManager {
  // Create a new bundle
  async createBundle(
    tenantId: string,
    data: Omit<ProductBundle, 'id' | 'tenantId' | 'usageCount' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductBundle> {
    // Validate products exist
    const productIds = data.products.map(p => p.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, price: true, title: true, sku: true, stock: true },
    });

    if (existingProducts.length !== productIds.length) {
      const foundIds = new Set(existingProducts.map(p => p.id));
      const missing = productIds.filter(id => !foundIds.has(id));
      throw new Error(`Products not found: ${missing.join(', ')}`);
    }

    // Calculate pricing
    const originalTotal = existingProducts.reduce((sum, p) => {
      const item = data.products.find(i => i.productId === p.id);
      return sum + (Number(p.price) * (item?.quantity || 1));
    }, 0);

    const finalPrice = this.calculateFinalPrice(originalTotal, data.pricing);

    const bundle: ProductBundle = {
      ...data,
      id: crypto.randomUUID(),
      tenantId,
      usageCount: 0,
      pricing: {
        ...data.pricing,
        originalTotal,
        finalPrice,
        savings: originalTotal - finalPrice,
        savingsPercentage: ((originalTotal - finalPrice) / originalTotal) * 100,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Would save to database
    return bundle;
  }

  // Update bundle
  async updateBundle(
    bundleId: string,
    data: Partial<Omit<ProductBundle, 'id' | 'tenantId'>>
  ): Promise<ProductBundle> {
    const bundle = await this.getBundle(bundleId);
    if (!bundle) {
      throw new Error('Bundle not found');
    }

    // Recalculate pricing if products or pricing changed
    if (data.products || data.pricing) {
      const products = data.products || bundle.products;
      const pricing = data.pricing || bundle.pricing;

      const productData = await prisma.product.findMany({
        where: { id: { in: products.map(p => p.productId) } },
        select: { id: true, price: true },
      });

      const originalTotal = productData.reduce((sum, p) => {
        const item = products.find(i => i.productId === p.id);
        return sum + (Number(p.price) * (item?.quantity || 1));
      }, 0);

      const finalPrice = this.calculateFinalPrice(originalTotal, pricing);

      bundle.pricing = {
        ...pricing,
        originalTotal,
        finalPrice,
        savings: originalTotal - finalPrice,
        savingsPercentage: ((originalTotal - finalPrice) / originalTotal) * 100,
      };
    }

    Object.assign(bundle, data, { updatedAt: new Date() });

    // Would update in database
    return bundle;
  }

  // Get available bundles for customer
  async getAvailableBundles(
    tenantId: string,
    context?: {
      customerGroup?: string;
      platform?: string;
      productId?: string;
    }
  ): Promise<ProductBundle[]> {
    const now = new Date();

    // Would fetch from database with filters:
    // - status = 'active'
    // - startDate <= now <= endDate
    // - usageCount < usageLimit (if set)
    // - customerGroups matches (if set)
    // - platforms matches (if set)
    // - products contains productId (if set)

    return [];
  }

  // Validate bundle for purchase
  async validateBundle(
    bundleId: string,
    selectedItems?: Array<{ productId: string; quantity: number }>
  ): Promise<BundleValidation> {
    const bundle = await this.getBundle(bundleId);
    if (!bundle) {
      return { isValid: false, errors: ['Bundle not found'] };
    }

    const errors: string[] = [];
    const missingItems: string[] = [];
    const insufficientStock: Array<{ productId: string; available: number; required: number }> = [];

    // Check each required item
    for (const item of bundle.products) {
      if (item.isOptional) continue;

      const selected = selectedItems?.find(s => s.productId === item.productId);
      const quantity = selected?.quantity || item.quantity;

      // Check product exists and has stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true, status: true },
      });

      if (!product || product.status !== 'active') {
        missingItems.push(item.productId);
        continue;
      }

      if (product.stock < quantity) {
        insufficientStock.push({
          productId: item.productId,
          available: product.stock,
          required: quantity,
        });
      }
    }

    // Check usage limit
    if (bundle.usageLimit && bundle.usageCount >= bundle.usageLimit) {
      errors.push('Bundle usage limit reached');
    }

    // Check date validity
    const now = new Date();
    if (bundle.startDate && now < bundle.startDate) {
      errors.push('Bundle not yet available');
    }
    if (bundle.endDate && now > bundle.endDate) {
      errors.push('Bundle has expired');
    }

    return {
      isValid: missingItems.length === 0 && insufficientStock.length === 0 && errors.length === 0,
      missingItems: missingItems.length > 0 ? missingItems : undefined,
      insufficientStock: insufficientStock.length > 0 ? insufficientStock : undefined,
      errors,
    };
  }

  // Process bundle order
  async processBundleOrder(
    bundleId: string,
    orderId: string,
    items: Array<{ productId: string; quantity: number }>
  ): Promise<{
    success: boolean;
    totalPrice: number;
    discount: number;
    errors?: string[];
  }> {
    const validation = await this.validateBundle(bundleId, items);
    if (!validation.isValid) {
      return {
        success: false,
        totalPrice: 0,
        discount: 0,
        errors: [
          ...validation.errors,
          ...(validation.missingItems?.map(id => `Product not found: ${id}`) || []),
          ...(validation.insufficientStock?.map(s => 
            `Insufficient stock for ${s.productId}: ${s.available} available, ${s.required} required`
          ) || []),
        ],
      };
    }

    const bundle = await this.getBundle(bundleId);
    if (!bundle) {
      return { success: false, totalPrice: 0, discount: 0, errors: ['Bundle not found'] };
    }

    // Reserve stock for bundle items
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Increment usage count
    await this.incrementUsage(bundleId);

    return {
      success: true,
      totalPrice: bundle.pricing.finalPrice,
      discount: bundle.pricing.savings,
    };
  }

  // Get bundle recommendations for a product
  async getBundleRecommendations(productId: string, tenantId: string): Promise<ProductBundle[]> {
    // Find bundles containing this product
    const bundles = await this.getAvailableBundles(tenantId, { productId });

    // Sort by savings percentage
    return bundles.sort((a, b) => b.pricing.savingsPercentage - a.pricing.savingsPercentage);
  }

  // Create common bundle templates
  async createTemplate(
    tenantId: string,
    template: 'starter_kit' | 'accessory_pack' | 'buy_2_get_1' | 'combo_deal'
  ): Promise<ProductBundle> {
    const templates: Record<string, Omit<ProductBundle, 'id' | 'tenantId' | 'usageCount' | 'createdAt' | 'updatedAt' | 'pricing'>> = {
      starter_kit: {
        name: 'Başlangıç Paketi',
        description: 'Yeni başlayanlar için özel paket',
        sku: 'BUNDLE-STARTER',
        type: 'percentage',
        status: 'draft',
        products: [],
        pricing: { type: 'percentage_off', value: 15, originalTotal: 0, finalPrice: 0, savings: 0, savingsPercentage: 0 },
        isFeatured: true,
        sortOrder: 1,
      },
      buy_2_get_1: {
        name: '2 Al 1 Öde',
        description: '2 ürün alana 1 ürün hediye',
        sku: 'BUNDLE-B2G1',
        type: 'buy_x_get_y',
        status: 'draft',
        products: [],
        pricing: { type: 'percentage_off', value: 33.33, originalTotal: 0, finalPrice: 0, savings: 0, savingsPercentage: 0 },
        isFeatured: true,
        sortOrder: 2,
      },
    };

    const data = templates[template];
    if (!data) {
      throw new Error('Template not found');
    }

    return this.createBundle(tenantId, { ...data, pricing: data.pricing });
  }

  // Get bundle analytics
  async getBundleAnalytics(tenantId: string, period: { from: Date; to: Date }): Promise<{
    totalBundles: number;
    activeBundles: number;
    totalSales: number;
    revenue: number;
    topBundles: Array<{
      bundleId: string;
      bundleName: string;
      sales: number;
      revenue: number;
    }>;
  }> {
    // Would fetch from database
    return {
      totalBundles: 0,
      activeBundles: 0,
      totalSales: 0,
      revenue: 0,
      topBundles: [],
    };
  }

  // Private helper methods
  private calculateFinalPrice(originalTotal: number, pricing: BundlePricing): number {
    switch (pricing.type) {
      case 'fixed':
        return pricing.value;
      case 'percentage_off':
        return originalTotal * (1 - pricing.value / 100);
      case 'final_price':
        return pricing.value;
      default:
        return originalTotal;
    }
  }

  private async getBundle(id: string): Promise<ProductBundle | null> {
    // Would fetch from database
    return null;
  }

  private async incrementUsage(bundleId: string): Promise<void> {
    // Would update in database
    console.log(`Incremented usage for bundle ${bundleId}`);
  }
}

// Bundle suggestion engine
export class BundleSuggestionEngine {
  // Suggest bundles based on cart contents
  async suggestBundlesForCart(
    cartItems: Array<{ productId: string; quantity: number }>,
    tenantId: string
  ): Promise<Array<{
    bundle: ProductBundle;
    matchingProducts: string[];
    additionalProductsNeeded: string[];
    potentialSavings: number;
  }>> {
    const cartProductIds = new Set(cartItems.map(i => i.productId));

    // Get all active bundles
    const bundles = await new BundleManager().getAvailableBundles(tenantId);

    const suggestions = bundles.map(bundle => {
      const bundleProductIds = new Set(bundle.products.map(p => p.productId));
      
      // Find matching products in cart
      const matchingProducts = Array.from(cartProductIds).filter(id => 
        bundleProductIds.has(id)
      );

      // Find additional products needed to complete bundle
      const additionalProductsNeeded = bundle.products
        .filter(p => !cartProductIds.has(p.productId) && !p.isOptional)
        .map(p => p.productId);

      // Calculate potential savings if customer completes the bundle
      const potentialSavings = matchingProducts.length > 0 ? bundle.pricing.savings : 0;

      return {
        bundle,
        matchingProducts,
        additionalProductsNeeded,
        potentialSavings,
      };
    });

    // Sort by potential savings
    return suggestions
      .filter(s => s.matchingProducts.length > 0)
      .sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  // Suggest bundles based on order history
  async suggestBundlesBasedOnHistory(
    customerId: string,
    tenantId: string
  ): Promise<ProductBundle[]> {
    // Get customer's purchase history
    const orders = await prisma.order.findMany({
      where: { customerId, tenantId },
      include: { items: true },
      orderBy: { orderDate: 'desc' },
      take: 10,
    });

    const purchasedProductIds = new Set(
      orders.flatMap(o => o.items.map(i => i.productId))
    );

    // Find bundles with products customer hasn't bought
    const allBundles = await new BundleManager().getAvailableBundles(tenantId);

    return allBundles.filter(bundle => 
      // Bundle should have at least one product customer hasn't bought
      bundle.products.some(p => !purchasedProductIds.has(p.productId))
    );
  }
}

// Export
export const bundleManager = new BundleManager();
export const bundleSuggestions = new BundleSuggestionEngine();
export { ProductBundle, BundleItem, BundlePricing, BundleValidation };

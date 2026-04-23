// Dynamic Pricing Engine
// Rule-based pricing with discounts, bundles, and time-based pricing

import { prisma } from '@/lib/prisma';

type PricingRuleType = 'percentage_discount' | 'fixed_discount' | 'fixed_price' | 'buy_x_get_y' | 'volume_discount';
type ConditionOperator = 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';

interface PricingRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: PricingRuleType;
  priority: number; // Higher = evaluated first
  conditions: PricingCondition[];
  actions: PricingAction[];
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  appliesTo: {
    products?: string[];
    categories?: string[];
    brands?: string[];
    platforms?: string[];
    all?: boolean;
  };
}

interface PricingCondition {
  field: string; // e.g., 'order.total', 'customer.segment', 'product.category'
  operator: ConditionOperator;
  value: unknown;
}

interface PricingAction {
  type: 'discount' | 'fixed_price' | 'bundle';
  value: number;
  applyTo: 'item' | 'order' | 'shipping';
}

interface Bundle {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  items: Array<{
    productId: string;
    quantity: number;
    optional?: boolean;
  }>;
  pricing: {
    type: 'fixed' | 'percentage_off';
    value: number; // Fixed price or discount percentage
  };
  isActive: boolean;
}

// Dynamic pricing engine
export class DynamicPricingEngine {
  // Calculate price for a product
  async calculatePrice(
    productId: string,
    tenantId: string,
    context: {
      quantity?: number;
      customerId?: string;
      platform?: string;
      orderTotal?: number;
      date?: Date;
    }
  ): Promise<{
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    appliedRules: string[];
  }> {
    // Get product base price
    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId },
      select: { price: true, category: true, brand: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const basePrice = Number(product.price);
    let finalPrice = basePrice;
    let appliedRules: string[] = [];

    // Get active pricing rules
    const rules = await this.getActiveRules(tenantId, context.date);

    // Sort by priority
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    // Evaluate each rule
    for (const rule of sortedRules) {
      // Check if rule applies to this product
      if (!this.ruleAppliesToProduct(rule, productId, product)) {
        continue;
      }

      // Check conditions
      if (!this.evaluateConditions(rule.conditions, context)) {
        continue;
      }

      // Check usage limit
      if (rule.usageLimit && rule.usageCount >= rule.usageLimit) {
        continue;
      }

      // Apply rule
      const newPrice = this.applyRule(finalPrice, rule, context.quantity || 1);
      
      if (newPrice !== finalPrice) {
        finalPrice = newPrice;
        appliedRules.push(rule.name);
        
        // Increment usage count
        await this.incrementRuleUsage(rule.id);
      }
    }

    const discountAmount = basePrice - finalPrice;
    const discountPercentage = (discountAmount / basePrice) * 100;

    return {
      originalPrice: basePrice,
      finalPrice: Math.max(0, finalPrice),
      discountAmount: Math.max(0, discountAmount),
      discountPercentage: Math.max(0, discountPercentage),
      appliedRules,
    };
  }

  // Calculate bundle price
  async calculateBundlePrice(
    bundleId: string,
    items: Array<{ productId: string; quantity: number }>,
    tenantId: string
  ): Promise<{
    originalTotal: number;
    bundleTotal: number;
    savings: number;
    isValid: boolean;
    missingItems?: string[];
  }> {
    const bundle = await this.getBundle(bundleId, tenantId);
    if (!bundle) {
      throw new Error('Bundle not found');
    }

    // Validate bundle items
    const { isValid, missingItems } = this.validateBundleItems(bundle, items);

    if (!isValid) {
      return {
        originalTotal: 0,
        bundleTotal: 0,
        savings: 0,
        isValid: false,
        missingItems,
      };
    }

    // Calculate original total
    let originalTotal = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true },
      });
      if (product) {
        originalTotal += Number(product.price) * item.quantity;
      }
    }

    // Apply bundle pricing
    let bundleTotal: number;
    if (bundle.pricing.type === 'fixed') {
      bundleTotal = bundle.pricing.value;
    } else {
      bundleTotal = originalTotal * (1 - bundle.pricing.value / 100);
    }

    return {
      originalTotal,
      bundleTotal,
      savings: originalTotal - bundleTotal,
      isValid: true,
    };
  }

  // Volume discount tiers
  calculateVolumeDiscount(
    quantity: number,
    tiers: Array<{ minQty: number; discount: number }>
  ): number {
    // Sort tiers by minQty descending
    const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
    
    // Find applicable tier
    const tier = sorted.find(t => quantity >= t.minQty);
    
    return tier?.discount || 0;
  }

  // Create flash sale
  async createFlashSale(
    tenantId: string,
    data: {
      name: string;
      products: string[];
      discountPercent: number;
      startDate: Date;
      endDate: Date;
      maxQuantity?: number;
    }
  ): Promise<PricingRule> {
    const rule: Omit<PricingRule, 'id' | 'tenantId' | 'usageCount'> = {
      name: data.name,
      description: `Flash sale: ${data.discountPercent}% off`,
      type: 'percentage_discount',
      priority: 100, // High priority
      conditions: [
        {
          field: 'date',
          operator: 'greater_than',
          value: data.startDate,
        },
        {
          field: 'date',
          operator: 'less_than',
          value: data.endDate,
        },
      ],
      actions: [
        {
          type: 'discount',
          value: data.discountPercent,
          applyTo: 'item',
        },
      ],
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      usageLimit: data.maxQuantity,
      appliesTo: {
        products: data.products,
      },
    };

    // Would save to database
    return { ...rule, id: crypto.randomUUID(), tenantId, usageCount: 0 };
  }

  // Compare prices across platforms
  async comparePlatformPrices(
    productId: string,
    platforms: string[]
  ): Promise<Array<{
    platform: string;
    price: number;
    fees: number;
    netRevenue: number;
    suggestedPrice: number;
  }>> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, costPrice: true },
    });

    if (!product) return [];

    const basePrice = Number(product.price);
    const costPrice = Number(product.costPrice || 0);

    // Platform fee structures (simplified)
    const platformFees: Record<string, number> = {
      'Trendyol': 0.12, // 12%
      'Hepsiburada': 0.15, // 15%
      'Amazon': 0.15, // 15%
      'N11': 0.10, // 10%
      'Çiçek Sepeti': 0.18, // 18%
    };

    return platforms.map(platform => {
      const fee = platformFees[platform] || 0.15;
      const feeAmount = basePrice * fee;
      const netRevenue = basePrice - feeAmount;
      
      // Suggested price for target margin
      const targetMargin = 0.30; // 30%
      const suggestedPrice = costPrice / (1 - targetMargin - fee);

      return {
        platform,
        price: basePrice,
        fees: feeAmount,
        netRevenue,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      };
    });
  }

  // Private helper methods
  private async getActiveRules(
    tenantId: string,
    date?: Date
  ): Promise<PricingRule[]> {
    const now = date || new Date();

    // Would fetch from database
    // Filter: isActive = true, startDate <= now, endDate >= now (or null)
    return [];
  }

  private ruleAppliesToProduct(
    rule: PricingRule,
    productId: string,
    product: { category: string | null; brand: string | null }
  ): boolean {
    if (rule.appliesTo.all) return true;

    if (rule.appliesTo.products?.includes(productId)) return true;
    if (rule.appliesTo.categories?.includes(product.category || '')) return true;
    if (rule.appliesTo.brands?.includes(product.brand || '')) return true;

    return false;
  }

  private evaluateConditions(
    conditions: PricingCondition[],
    context: Record<string, unknown>
  ): boolean {
    return conditions.every(cond => {
      const value = this.getContextValue(cond.field, context);
      
      switch (cond.operator) {
        case 'equals':
          return value === cond.value;
        case 'greater_than':
          return Number(value) > Number(cond.value);
        case 'less_than':
          return Number(value) < Number(cond.value);
        case 'contains':
          return String(value).includes(String(cond.value));
        case 'in':
          return Array.isArray(cond.value) && cond.value.includes(value);
        default:
          return false;
      }
    });
  }

  private getContextValue(field: string, context: Record<string, unknown>): unknown {
    const parts = field.split('.');
    let value: unknown = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private applyRule(price: number, rule: PricingRule, quantity: number): number {
    let newPrice = price;

    for (const action of rule.actions) {
      switch (action.type) {
        case 'discount':
          if (rule.type === 'percentage_discount') {
            newPrice *= (1 - action.value / 100);
          } else if (rule.type === 'fixed_discount') {
            newPrice -= action.value;
          } else if (rule.type === 'volume_discount') {
            const discount = this.calculateVolumeDiscount(quantity, [
              { minQty: action.value, discount: action.value },
            ]);
            newPrice *= (1 - discount / 100);
          }
          break;

        case 'fixed_price':
          newPrice = action.value;
          break;

        case 'bundle':
          // Bundle pricing handled separately
          break;
      }
    }

    return Math.max(0, newPrice);
  }

  private async incrementRuleUsage(ruleId: string): Promise<void> {
    // Would update in database
    console.log(`Incremented usage for rule ${ruleId}`);
  }

  private async getBundle(id: string, tenantId: string): Promise<Bundle | null> {
    // Would fetch from database
    return null;
  }

  private validateBundleItems(
    bundle: Bundle,
    items: Array<{ productId: string; quantity: number }>
  ): { isValid: boolean; missingItems?: string[] } {
    const missing: string[] = [];

    for (const bundleItem of bundle.items) {
      if (bundleItem.optional) continue;

      const provided = items.find(i => i.productId === bundleItem.productId);
      if (!provided || provided.quantity < bundleItem.quantity) {
        missing.push(bundleItem.productId);
      }
    }

    return {
      isValid: missing.length === 0,
      missingItems: missing.length > 0 ? missing : undefined,
    };
  }
}

// Price list management
export class PriceListManager {
  async createPriceList(
    tenantId: string,
    data: {
      name: string;
      currency: string;
      adjustments: Array<{
        type: 'fixed' | 'percentage';
        value: number;
        appliesTo: 'all' | 'category' | 'product';
        targetId?: string;
      }>;
      customerGroups?: string[];
    }
  ): Promise<any> {
    // Would create price list
    return { id: crypto.randomUUID(), ...data, tenantId };
  }

  async applyPriceList(
    priceListId: string,
    products: Array<{ id: string; price: number }>
  ): Promise<Array<{ id: string; originalPrice: number; listPrice: number }>> {
    // Would apply price list adjustments
    return products.map(p => ({
      id: p.id,
      originalPrice: p.price,
      listPrice: p.price,
    }));
  }
}

// Export
export const pricingEngine = new DynamicPricingEngine();
export const priceListManager = new PriceListManager();
export { PricingRule, Bundle, PricingCondition };

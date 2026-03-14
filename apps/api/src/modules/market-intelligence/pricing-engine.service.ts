import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Platform, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface PricingContext {
    productId: string;
    tenantId: string;
    currentPrice: number;
    costPrice: number;
    stock: number;
    category: string | null;
    platform?: Platform;
    competitorPrices: number[];
    competitorAvg: number;
    competitorMin: number;
    competitorMax: number;
    competitorInStockPrices: number[];
}

export interface PricingResult {
    suggestedPrice: number;
    currentPrice: number;
    costPrice: number;
    margin: number;
    appliedRules: Array<{ id: string; name: string; type: string; effect: number }>;
    competitorSummary: {
        avg: number;
        min: number;
        max: number;
        count: number;
    };
    confidence: number;
    reasoning: string[];
}

interface RuleAction {
    type: 'percentage' | 'fixed' | 'undercut' | 'match' | 'margin_floor' | 'margin_target';
    value: number;
    reference?: 'competitor_avg' | 'competitor_min' | 'competitor_max' | 'cost_price';
}

interface RuleConditions {
    minPrice?: number;
    maxPrice?: number;
    minMargin?: number;
    maxMargin?: number;
    minStock?: number;
    maxStock?: number;
    categories?: string[];
    platforms?: string[];
    minCompetitorCount?: number;
}

@Injectable()
export class PricingEngineService {
    private readonly logger = new Logger(PricingEngineService.name);

    constructor(private prisma: PrismaService) {}

    async calculateOptimalPrice(
        productId: string,
        competitorProductId: string,
        rules: { minPrice?: number; maxPrice?: number; strategy?: string },
    ): Promise<PricingResult | null> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, tenantId: true, price: true, costPrice: true, stock: true, category: true },
        });
        if (!product) return null;

        const tenantId = product.tenantId;
        const ctx = await this.buildContext(product);

        // If a specific competitor product was requested, ensure its price is included
        if (competitorProductId) {
            const cp = await this.prisma.competitorProduct.findUnique({
                where: { id: competitorProductId },
                select: { price: true, stock: true },
            });
            if (cp) {
                const cpPrice = Number(cp.price);
                if (cpPrice > 0 && !ctx.competitorPrices.includes(cpPrice)) {
                    ctx.competitorPrices.push(cpPrice);
                    this.recalcAggregates(ctx);
                }
            }
        }

        // Load active pricing rules from DB, sorted by priority
        const dbRules = await this.prisma.pricingRule.findMany({
            where: { tenantId, isActive: true },
            orderBy: { priority: 'desc' },
        });

        const reasoning: string[] = [];
        const appliedRules: PricingResult['appliedRules'] = [];
        let targetPrice = ctx.currentPrice;

        if (dbRules.length > 0) {
            // Apply DB rules in priority order
            for (const rule of dbRules) {
                const conditions = (rule.conditions || {}) as unknown as RuleConditions;
                const action = (rule.action || {}) as unknown as RuleAction;

                if (!this.matchesConditions(ctx, conditions)) continue;

                const prevPrice = targetPrice;
                targetPrice = this.applyAction(targetPrice, ctx, action);

                const effect = +(targetPrice - prevPrice).toFixed(2);
                appliedRules.push({ id: rule.id, name: rule.name, type: rule.type, effect });
                reasoning.push(`Kural "${rule.name}" (${rule.type}): ${effect >= 0 ? '+' : ''}${effect} TRY`);

                // Update applied stats (fire and forget)
                this.prisma.pricingRule.update({
                    where: { id: rule.id },
                    data: { appliedCount: { increment: 1 }, lastApplied: new Date() },
                }).catch(() => {});
            }
        } else {
            // Fallback: built-in competitive pricing strategy
            const result = this.builtInCompetitiveStrategy(ctx);
            targetPrice = result.price;
            reasoning.push(...result.reasoning);
        }

        // Enforce inline min/max overrides
        if (rules.minPrice && targetPrice < rules.minPrice) {
            reasoning.push(`Min fiyat korumasi: ${targetPrice.toFixed(2)} → ${rules.minPrice}`);
            targetPrice = rules.minPrice;
        }
        if (rules.maxPrice && targetPrice > rules.maxPrice) {
            reasoning.push(`Max fiyat siniri: ${targetPrice.toFixed(2)} → ${rules.maxPrice}`);
            targetPrice = rules.maxPrice;
        }

        // Final safety: never go below cost
        const costFloor = ctx.costPrice * 1.03; // 3% minimum margin
        if (ctx.costPrice > 0 && targetPrice < costFloor) {
            reasoning.push(`Maliyet koruma: fiyat ${targetPrice.toFixed(2)} olarak maliyetin altina dusuyordu, ${costFloor.toFixed(2)} olarak ayarlandi`);
            targetPrice = costFloor;
        }

        targetPrice = +targetPrice.toFixed(2);
        const margin = ctx.costPrice > 0 ? +((1 - ctx.costPrice / targetPrice) * 100).toFixed(2) : 0;
        const confidence = this.calculateConfidence(ctx, appliedRules.length);

        return {
            suggestedPrice: targetPrice,
            currentPrice: ctx.currentPrice,
            costPrice: ctx.costPrice,
            margin,
            appliedRules,
            competitorSummary: {
                avg: +ctx.competitorAvg.toFixed(2),
                min: +ctx.competitorMin.toFixed(2),
                max: +ctx.competitorMax.toFixed(2),
                count: ctx.competitorPrices.length,
            },
            confidence,
            reasoning,
        };
    }

    // ==================== RULE CRUD ====================

    async getRules(tenantId: string) {
        return this.prisma.pricingRule.findMany({
            where: { tenantId },
            orderBy: { priority: 'desc' },
        });
    }

    async createRule(tenantId: string, data: Record<string, unknown>) {
        return this.prisma.pricingRule.create({
            data: {
                tenantId,
                name: String(data.name || 'Yeni Kural'),
                description: data.description ? String(data.description) : null,
                type: String(data.type || 'competitor'),
                conditions: (data.conditions || {}) as Prisma.InputJsonValue,
                action: (data.action || { type: 'undercut', value: 1 }) as Prisma.InputJsonValue,
                platforms: data.platforms ? (data.platforms as Prisma.InputJsonValue) : undefined,
                categories: data.categories ? (data.categories as Prisma.InputJsonValue) : undefined,
                isActive: data.isActive !== false,
                priority: typeof data.priority === 'number' ? data.priority : 0,
            },
        });
    }

    async updateRule(ruleId: string, tenantId: string, data: Record<string, unknown>) {
        const rule = await this.prisma.pricingRule.findFirst({ where: { id: ruleId, tenantId } });
        if (!rule) throw new NotFoundException('Kural bulunamadi');

        return this.prisma.pricingRule.update({
            where: { id: ruleId },
            data: {
                name: data.name !== undefined ? String(data.name) : undefined,
                description: data.description !== undefined ? String(data.description) : undefined,
                type: data.type !== undefined ? String(data.type) : undefined,
                conditions: data.conditions !== undefined ? (data.conditions as Prisma.InputJsonValue) : undefined,
                action: data.action !== undefined ? (data.action as Prisma.InputJsonValue) : undefined,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
                priority: typeof data.priority === 'number' ? data.priority : undefined,
            },
        });
    }

    async deleteRule(ruleId: string, tenantId: string) {
        const rule = await this.prisma.pricingRule.findFirst({ where: { id: ruleId, tenantId } });
        if (!rule) throw new NotFoundException('Kural bulunamadi');
        await this.prisma.pricingRule.delete({ where: { id: ruleId } });
        return { success: true };
    }

    async bulkReprice(tenantId: string, productIds?: string[]) {
        const where: Prisma.ProductWhereInput = { tenantId };
        if (productIds?.length) where.id = { in: productIds };

        const products = await this.prisma.product.findMany({
            where,
            select: { id: true, price: true, costPrice: true, stock: true, category: true, tenantId: true },
            take: 500,
        });

        const results: Array<{ productId: string; oldPrice: number; newPrice: number; applied: boolean }> = [];

        for (const product of products) {
            const ctx = await this.buildContext(product);
            if (ctx.competitorPrices.length === 0) {
                results.push({ productId: product.id, oldPrice: ctx.currentPrice, newPrice: ctx.currentPrice, applied: false });
                continue;
            }

            const optimal = await this.calculateOptimalPrice(product.id, '', {});
            if (!optimal || optimal.suggestedPrice === ctx.currentPrice) {
                results.push({ productId: product.id, oldPrice: ctx.currentPrice, newPrice: ctx.currentPrice, applied: false });
                continue;
            }

            await this.prisma.product.update({ where: { id: product.id }, data: { price: optimal.suggestedPrice } });
            await this.prisma.priceHistory.create({
                data: { tenantId, productId: product.id, price: optimal.suggestedPrice, platform: Platform.OTHER },
            });

            results.push({ productId: product.id, oldPrice: ctx.currentPrice, newPrice: optimal.suggestedPrice, applied: true });
        }

        const appliedCount = results.filter((r) => r.applied).length;
        await this.prisma.activityLog.create({
            data: {
                tenantId,
                action: 'pricing.bulk_reprice',
                resource: 'product',
                details: { total: results.length, applied: appliedCount } as Prisma.InputJsonValue,
            },
        });

        return { total: results.length, applied: appliedCount, results };
    }

    // ==================== PRIVATE HELPERS ====================

    private async buildContext(product: {
        id: string;
        tenantId: string;
        price: Prisma.Decimal | number;
        costPrice?: Prisma.Decimal | number | null;
        stock: number;
        category?: string | null;
    }): Promise<PricingContext> {
        const competitorProducts = await this.prisma.competitorProduct.findMany({
            where: { productId: product.id, competitor: { tenantId: product.tenantId, isActive: true } },
            select: { price: true, stock: true },
        });

        const allPrices = competitorProducts.map((c) => Number(c.price)).filter((n) => Number.isFinite(n) && n > 0);
        const inStockPrices = competitorProducts
            .filter((c) => (c.stock ?? 0) > 0)
            .map((c) => Number(c.price))
            .filter((n) => Number.isFinite(n) && n > 0);

        return {
            productId: product.id,
            tenantId: product.tenantId,
            currentPrice: Number(product.price),
            costPrice: Number(product.costPrice ?? 0),
            stock: product.stock,
            category: product.category ?? null,
            competitorPrices: allPrices,
            competitorAvg: allPrices.length ? allPrices.reduce((s, p) => s + p, 0) / allPrices.length : 0,
            competitorMin: allPrices.length ? Math.min(...allPrices) : 0,
            competitorMax: allPrices.length ? Math.max(...allPrices) : 0,
            competitorInStockPrices: inStockPrices,
        };
    }

    private recalcAggregates(ctx: PricingContext) {
        ctx.competitorAvg = ctx.competitorPrices.reduce((s, p) => s + p, 0) / ctx.competitorPrices.length;
        ctx.competitorMin = Math.min(...ctx.competitorPrices);
        ctx.competitorMax = Math.max(...ctx.competitorPrices);
    }

    private matchesConditions(ctx: PricingContext, cond: RuleConditions): boolean {
        if (cond.minStock !== undefined && ctx.stock < cond.minStock) return false;
        if (cond.maxStock !== undefined && ctx.stock > cond.maxStock) return false;
        if (cond.minCompetitorCount !== undefined && ctx.competitorPrices.length < cond.minCompetitorCount) return false;
        if (cond.categories?.length && ctx.category && !cond.categories.includes(ctx.category)) return false;

        if (cond.minMargin !== undefined || cond.maxMargin !== undefined) {
            const margin = ctx.costPrice > 0 ? ((ctx.currentPrice - ctx.costPrice) / ctx.currentPrice) * 100 : 100;
            if (cond.minMargin !== undefined && margin < cond.minMargin) return false;
            if (cond.maxMargin !== undefined && margin > cond.maxMargin) return false;
        }

        return true;
    }

    private applyAction(price: number, ctx: PricingContext, action: RuleAction): number {
        const ref = this.resolveReference(ctx, action.reference);

        switch (action.type) {
            case 'percentage':
                // action.value = -5 means 5% cheaper than reference
                return ref > 0 ? ref * (1 + action.value / 100) : price;

            case 'fixed':
                // action.value = -10 means 10 TRY below reference
                return ref > 0 ? ref + action.value : price;

            case 'undercut':
                // action.value = 1 means 1% below competitor min
                return ctx.competitorMin > 0 ? ctx.competitorMin * (1 - action.value / 100) : price;

            case 'match':
                // Match reference price exactly
                return ref > 0 ? ref : price;

            case 'margin_floor':
                // Ensure minimum margin: action.value = 15 means 15% minimum
                if (ctx.costPrice > 0) {
                    const floorPrice = ctx.costPrice / (1 - action.value / 100);
                    return Math.max(price, floorPrice);
                }
                return price;

            case 'margin_target':
                // Set price to achieve target margin
                if (ctx.costPrice > 0) {
                    return ctx.costPrice / (1 - action.value / 100);
                }
                return price;

            default:
                return price;
        }
    }

    private resolveReference(ctx: PricingContext, ref?: string): number {
        switch (ref) {
            case 'competitor_avg': return ctx.competitorAvg;
            case 'competitor_min': return ctx.competitorMin;
            case 'competitor_max': return ctx.competitorMax;
            case 'cost_price': return ctx.costPrice;
            default: return ctx.competitorAvg;
        }
    }

    private builtInCompetitiveStrategy(ctx: PricingContext): { price: number; reasoning: string[] } {
        const reasoning: string[] = [];

        if (ctx.competitorPrices.length === 0) {
            reasoning.push('Rakip verisi yok, mevcut fiyat korunuyor');
            return { price: ctx.currentPrice, reasoning };
        }

        // Strategy: be 2% below competitor average but above min competitor * 0.995
        let candidate = ctx.competitorAvg * 0.98;
        reasoning.push(`Rakip ortalama (${ctx.competitorAvg.toFixed(2)}) uzerine %2 alt: ${candidate.toFixed(2)}`);

        if (ctx.competitorMin > 0) {
            const minFloor = ctx.competitorMin * 0.995;
            if (candidate < minFloor) {
                candidate = minFloor;
                reasoning.push(`Rakip min (${ctx.competitorMin.toFixed(2)}) alti koruma: ${candidate.toFixed(2)}`);
            }
        }

        if (ctx.costPrice > 0) {
            const costFloor = ctx.costPrice * 1.15;
            if (candidate < costFloor) {
                candidate = costFloor;
                reasoning.push(`Maliyet ustu guvenli marj (%15): ${candidate.toFixed(2)}`);
            }
        }

        return { price: candidate, reasoning };
    }

    private calculateConfidence(ctx: PricingContext, ruleCount: number): number {
        let score = 30;
        score += Math.min(30, ctx.competitorPrices.length * 6);
        score += ctx.costPrice > 0 ? 20 : 0;
        score += ruleCount > 0 ? 20 : 0;
        return Math.min(100, Math.max(25, score));
    }
}

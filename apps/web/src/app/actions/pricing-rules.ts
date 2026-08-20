"use server";

import { prisma } from "@/lib/prisma";

export async function getPricingRules(tenantId: string) {
    try {
        const rules = await prisma.pricingRule.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        
        // Map to UI expectations
        return rules.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description || "",
            active: r.isActive,
            products: r.appliedCount || 0
        }));
    } catch (error) {
        console.error("Error fetching pricing rules:", error);
        return [];
    }
}

export async function togglePricingRule(tenantId: string, ruleId: string, isActive: boolean) {
    try {
        await prisma.pricingRule.update({
            where: { id: ruleId, tenantId },
            data: { isActive }
        });
        return { success: true };
    } catch (error) {
        console.error("Error toggling pricing rule:", error);
        return { success: false };
    }
}

export async function createPricingRule(tenantId: string, data: { name: string, description: string, isActive: boolean }) {
    try {
        const rule = await prisma.pricingRule.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                type: 'dynamic', // default type
                isActive: data.isActive
            }
        });
        return { success: true, rule };
    } catch (error) {
        console.error("Error creating pricing rule:", error);
        return { success: false };
    }
}

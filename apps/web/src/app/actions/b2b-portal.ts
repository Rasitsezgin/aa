"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Seed missing default dealer groups
async function ensureDefaultGroups(tenantId: string) {
    const groups = await prisma.subDealerGroup.findMany({ where: { tenantId } });
    if (groups.length === 0) {
        await prisma.subDealerGroup.createMany({
            data: [
                { tenantId, name: 'Standart', discountRate: 5 },
                { tenantId, name: 'Gold Bayi', discountRate: 15 },
                { tenantId, name: 'Platin', discountRate: 20 },
            ]
        });
    }
}

export async function getSubDealers(tenantId: string) {
    try {
        await ensureDefaultGroups(tenantId);

        const dealers = await prisma.subDealer.findMany({
            where: { tenantId },
            include: { group: true },
            orderBy: { createdAt: 'desc' }
        });

        const groups = await prisma.subDealerGroup.findMany({
            where: { tenantId },
        });

        const mappedDealers = dealers.map(dealer => ({
            id: dealer.id,
            name: dealer.companyName,
            email: dealer.email,
            group: dealer.group?.name || 'Grupsuz',
            discount: dealer.group?.discountRate || 0,
            orders: dealer.totalOrders,
            total: dealer.totalVolume.toString() + ' TL'
        }));

        return { dealers: mappedDealers, groups };
    } catch (error) {
        console.error("Error fetching dealers:", error);
        return { dealers: [], groups: [] };
    }
}

export async function createSubDealer(tenantId: string, companyName: string, email: string, groupId: string) {
    try {
        // Create B2B dealer
        const dealer = await prisma.subDealer.create({
            data: {
                tenantId,
                companyName,
                email,
                groupId,
                password: Math.random().toString(36).slice(-8), // Generate temp password for dealer
            }
        });
        
        revalidatePath('/dashboard/b2b-portal');
        return { success: true, dealer };
    } catch (error) {
        console.error("Error creating sub-dealer:", error);
        return { success: false, error: "Bayi eklenemedi." };
    }
}

export async function deleteSubDealer(id: string) {
    try {
        await prisma.subDealer.delete({ where: { id } });
        revalidatePath('/dashboard/b2b-portal');
        return { success: true };
    } catch (error) {
        console.error("Error deleting sub-dealer:", error);
        return { success: false, error: "Silme işlemi başarısız oldu." };
    }
}

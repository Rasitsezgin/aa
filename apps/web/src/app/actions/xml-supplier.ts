"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Get all XML suppliers for a tenant
export async function getXmlSuppliers(tenantId: string) {
    try {
        const suppliers = await prisma.xmlSupplier.findMany({
            where: { tenantId },
            include: {
                rules: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return suppliers.map(sup => ({
            id: sup.id,
            name: sup.name,
            url: sup.url,
            status: sup.status,
            products: sup.productsCount,
            lastSync: sup.lastSyncAt ? sup.lastSyncAt.toLocaleString('tr-TR') : 'Hiç Senkronize Edilmedi',
            markup: sup.rules?.[0]?.markupPercent || 0,
            fixedFee: sup.rules?.[0]?.fixedFee || 0
        }));
    } catch (error) {
        console.error("Error fetching XML suppliers:", error);
        return [];
    }
}

// 2. Create a new XML supplier and its initial rule
export async function createXmlSupplier(
    tenantId: string, 
    name: string, 
    url: string, 
    markupPercent: number, 
    fixedFee: number
) {
    try {
        const supplier = await prisma.xmlSupplier.create({
            data: {
                tenantId,
                name,
                url,
                status: 'parsing', // Initial status before real parsing
                rules: {
                    create: {
                        markupPercent,
                        fixedFee,
                        autoSync: true,
                        syncInterval: 240
                    }
                }
            }
        });
        
        revalidatePath('/dashboard/xml-supplier');
        return { success: true, supplier };
    } catch (error) {
        console.error("Error creating XML supplier:", error);
        return { success: false, error: "Tedarikçi eklenemedi." };
    }
}

// 3. Delete an XML supplier
export async function deleteXmlSupplier(id: string) {
    try {
        await prisma.xmlSupplier.delete({
            where: { id }
        });
        
        revalidatePath('/dashboard/xml-supplier');
        return { success: true };
    } catch (error) {
        console.error("Error deleting XML supplier:", error);
        return { success: false, error: "Silme işlemi başarısız oldu." };
    }
}

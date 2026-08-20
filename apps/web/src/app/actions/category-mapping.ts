"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInternalCategories(tenantId: string) {
    try {
        const products = await prisma.product.findMany({
            where: { tenantId, category: { not: null } },
            select: { category: true },
            distinct: ['category']
        });
        
        const categories = products.map(p => ({ id: p.category as string, name: p.category as string }));
        
        // Eğer hiç kategori yoksa boş dönmemesi için sahte bir kaç kategori ekleyelim (Kullanıcının hiç ürünü yoksa görebilmesi için)
        if (categories.length === 0) {
            return [
                { id: "Erkek Giyim", name: "Erkek Giyim" },
                { id: "Kadın Giyim", name: "Kadın Giyim" },
                { id: "Elektronik", name: "Elektronik" },
                { id: "Ev & Yaşam", name: "Ev & Yaşam" },
            ];
        }
        
        return categories;
    } catch (error) {
        console.error("Kategoriler alınırken hata:", error);
        return [];
    }
}

export async function getMarketplaceCategories(platform: string) {
    try {
        const cats = await prisma.marketplaceCategory.findMany({
            where: { platform, isLeaf: true },
            select: { categoryId: true, name: true, parent: { select: { name: true } } },
            take: 100
        });
        
        if (cats.length === 0) {
            return [
                { id: "t1", name: "Giyim > Erkek" },
                { id: "t2", name: "Giyim > Kadın" },
                { id: "t3", name: "Elektronik > Bilgisayar" },
                { id: "t4", name: "Ev Dekorasyon > Mobilya" },
            ];
        }
        
        return cats.map(c => ({
            id: c.categoryId,
            name: c.parent ? `${c.parent.name} > ${c.name}` : c.name
        }));
    } catch (error) {
        console.error("Pazaryeri kategorileri alınırken hata:", error);
        return [];
    }
}

export async function getCategoryMappings(tenantId: string, platform: string) {
    try {
        const mappings = await prisma.categoryMapping.findMany({
            where: { tenantId, platform }
        });
        
        const result: Record<string, string> = {};
        for (const m of mappings) {
            result[m.internalCategory] = m.marketplaceCategoryId;
        }
        return result;
    } catch (error) {
        console.error("Eşleştirmeler alınırken hata:", error);
        return {};
    }
}

export async function saveCategoryMappings(tenantId: string, platform: string, mappings: Record<string, string>) {
    try {
        const operations = [];
        for (const [internalCategory, marketplaceCategoryId] of Object.entries(mappings)) {
            if (!marketplaceCategoryId) continue;
            operations.push(
                prisma.categoryMapping.upsert({
                    where: {
                        tenantId_platform_internalCategory: {
                            tenantId, platform, internalCategory
                        }
                    },
                    update: { marketplaceCategoryId },
                    create: {
                        tenantId, platform, internalCategory, marketplaceCategoryId
                    }
                })
            );
        }
        
        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }
        
        revalidatePath('/dashboard/products/category-mapping');
        return { success: true };
    } catch (error) {
        console.error("Eşleştirmeler kaydedilirken hata:", error);
        return { success: false, error: "Kayıt işlemi başarısız oldu." };
    }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Havuzları (Pools) ve pin stoklarını getir
export async function getVaultPools(tenantId: string) {
    try {
        const pools = await prisma.digitalVaultPool.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: {
                        pins: { where: { status: 'available' } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Prisma nesnesini düzleştirip client'a yollayın (React render edebilsin diye)
        return pools.map(pool => ({
            id: pool.id,
            name: pool.name,
            category: pool.category || 'Genel',
            stock: pool._count.pins,
            status: pool.isActive ? 'active' : 'inactive',
            autoDelivery: pool.delivery === 'Mail' || pool.delivery === 'Both',
            smsDelivery: pool.delivery === 'SMS' || pool.delivery === 'Both',
        }));
    } catch (error) {
        console.error("Error fetching vault pools:", error);
        return [];
    }
}

// 2. Yeni bir Dijital Şifre Havuzu oluştur
export async function createVaultPool(tenantId: string, name: string, category: string, delivery: string) {
    try {
        const pool = await prisma.digitalVaultPool.create({
            data: {
                tenantId,
                name,
                category,
                delivery,
            }
        });
        
        revalidatePath('/dashboard/digital-vault');
        return { success: true, pool };
    } catch (error) {
        console.error("Error creating vault pool:", error);
        return { success: false, error: "Havuz oluşturulamadı." };
    }
}

// 3. Toplu Pin Yüklemesi (.txt gibi)
export async function addPinsToPool(poolId: string, codes: string[]) {
    try {
        if (!codes || codes.length === 0) return { success: false, error: "Boş kod dizisi." };

        // Şifreleri bulk (toplu) kaydet
        const data = codes.map(code => ({
            poolId,
            code, // Gerçek ortamda burası AES-256 ile şifrelenmelidir (Encryption)
            status: 'available'
        }));

        const result = await prisma.digitalPin.createMany({
            data,
            skipDuplicates: true,
        });

        revalidatePath('/dashboard/digital-vault');
        return { success: true, count: result.count };
    } catch (error) {
        console.error("Error adding pins to pool:", error);
        return { success: false, error: "Şifreler eklenemedi." };
    }
}

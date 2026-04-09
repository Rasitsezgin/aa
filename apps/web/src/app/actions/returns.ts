"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReturns(tenantId: string) {
    try {
        const returns = await prisma.return.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        // The UI needs: id, order(id), sku(not mapped easily here, we'll mock or get first item), status, date, marketplace, reason
        return returns.map(ret => ({
            id: ret.id,
            trackingNumber: ret.trackingNumber || ret.id.split('-')[0],
            orderId: ret.orderId,
            status: ret.status,
            date: ret.createdAt.toLocaleString('tr-TR'),
            marketplace: ret.platform,
            reason: ret.reasonDetail || ret.reason
        }));
    } catch (error) {
        console.error("Error fetching returns:", error);
        return [];
    }
}

export async function processReturnScan(tenantId: string, barcode: string) {
    try {
        // Attempt to find a return via trackingNumber or id
        const returnReq = await prisma.return.findFirst({
            where: {
                tenantId,
                OR: [
                    { trackingNumber: barcode },
                    { id: barcode },
                    { orderId: barcode }
                ]
            }
        });

        if (!returnReq) {
            return { success: false, error: "not_found" };
        }

        if (returnReq.status === 'COMPLETED' || returnReq.status === 'REFUNDED') {
            return { success: false, error: "already_processed" };
        }

        // Mark as completed/restocked
        const updated = await prisma.return.update({
            where: { id: returnReq.id },
            data: { status: 'COMPLETED', resolvedDate: new Date() }
        });

        // Usually you'd increment InventoryLog here to restore stock
        
        revalidatePath('/dashboard/returns');
        return { success: true, returnData: updated };
    } catch (error) {
        console.error("Error processing return:", error);
        return { success: false, error: "db_error" };
    }
}

"use server";

import { prisma } from "@/lib/prisma";

export async function getWarehouses(tenantId: string) {
    try {
        const warehouses = await prisma.warehouse.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        
        // UI expects: id, name, city, products, capacity, value, status, lat, lng
        return warehouses.map(w => ({
            id: w.id,
            name: w.name,
            city: w.city || 'Belirtilmedi',
            products: w.productCount || 0,
            capacity: w.capacity || 0,
            value: w.totalValue || 0,
            status: w.status,
            lat: w.latitude || 41.0,
            lng: w.longitude || 29.0
        }));
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        return [];
    }
}

export async function createWarehouse(tenantId: string, data: any) {
    try {
        const warehouse = await prisma.warehouse.create({
            data: {
                tenantId,
                name: data.name,
                city: data.city,
                latitude: data.lat,
                longitude: data.lng,
                capacity: data.capacity,
                status: data.status || 'active'
            }
        });
        return { success: true, warehouse };
    } catch (error) {
        console.error("Error creating warehouse:", error);
        return { success: false };
    }
}

export async function getInventoryDetails(tenantId: string) {
    try {
        const [lowStock, movements] = await Promise.all([
            prisma.warehouseStock.findMany({
                where: { 
                    warehouse: { tenantId },
                    quantity: { lt: 20 } // Threshold for low stock
                },
                include: { warehouse: true },
                take: 5,
                orderBy: { quantity: 'asc' }
            }),
            prisma.warehouseTransfer.findMany({
                where: { tenantId },
                include: { fromWarehouse: true, toWarehouse: true },
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            lowStockItems: lowStock.map(item => ({
                id: item.id,
                name: `Product ${item.productId}`, // We don't have product details in this query but can use ID or mock the name slightly
                warehouse: item.warehouse.name,
                current: item.quantity,
                min: 20
            })),
            stockMovements: movements.map(m => ({
                id: m.id,
                from: m.fromWarehouse.name,
                to: m.toWarehouse.name,
                product: `Product ${m.productId}`,
                qty: m.quantity,
                date: m.createdAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                type: m.status === 'completed' ? 'transfer' : 'incoming'
            }))
        };
    } catch (error) {
        console.error("Error fetching inventory details:", error);
        return { lowStockItems: [], stockMovements: [] };
    }
}

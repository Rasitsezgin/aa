import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pazaryonetimi/database";
import { auth } from "@/auth";

export async function POST() {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;

        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all active integrations for this tenant
        const integrations = await prisma.integration.findMany({
            where: {
                tenantId,
                isActive: true
            }
        });

        if (integrations.length === 0) {
            return NextResponse.json({
                success: true,
                message: "Senkronize edilecek aktif bir pazaryeri bağlantısı bulunamadı.",
                syncedCount: 0
            });
        }

        let totalSynced = 0;
        const results = [];

        for (const integration of integrations) {
            try {
                if (integration.platform === 'TRENDYOL') {
                    const extra = integration.apiExtra as any;
                    const supplierId = extra?.supplierId || extra?.merchantId;

                    if (!supplierId || !integration.apiKey || !integration.apiSecret) {
                        results.push({ platform: 'TRENDYOL', status: 'error', error: 'Eksik API bilgileri' });
                        continue;
                    }

                    const trendyolAuth = Buffer.from(`${integration.apiKey}:${integration.apiSecret}`).toString("base64");

                    // Fetch recent orders from Trendyol
                    const startDate = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

                    const response = await fetch(`https://api.trendyol.com/sapigw/suppliers/${supplierId}/orders?startDate=${startDate}&size=50`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Basic ${trendyolAuth}`,
                            "User-Agent": "PazarYonetimi/1.0",
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const orders = data.content || [];

                        for (const order of orders) {
                            // Upsert each order
                            const existingOrder = await prisma.order.findFirst({
                                where: {
                                    tenantId,
                                    marketplaceOrderId: order.orderNumber.toString(),
                                    platform: 'TRENDYOL'
                                }
                            });

                            if (!existingOrder) {
                                // Create new order
                                await prisma.order.create({
                                    data: {
                                        tenantId,
                                        platform: 'TRENDYOL',
                                        marketplaceOrderId: order.orderNumber.toString(),
                                        customerName: `${order.shipmentAddress.firstName} ${order.shipmentAddress.lastName}`,
                                        customerEmail: order.customerEmail || '',
                                        shippingAddress: order.shipmentAddress.fullAddress || '',
                                        billingAddress: order.invoiceAddress.fullAddress || '',
                                        totalAmount: order.totalPrice || 0,
                                        taxAmount: 0,
                                        status: 'CONFIRMED', // simplifying mapping for demo
                                        paymentStatus: 'PAID',
                                        orderDate: new Date(order.orderDate),
                                    }
                                });
                            }
                        }

                        totalSynced += orders.length;
                        results.push({ platform: 'TRENDYOL', status: 'success', count: orders.length });
                    } else {
                        results.push({ platform: 'TRENDYOL', status: 'error', error: `HTTP ${response.status}` });
                    }
                } else if (integration.platform === 'HEPSIBURADA') {
                    results.push({ platform: 'HEPSIBURADA', status: 'skipped', error: 'Order sync endpoint mevcut degil' });
                }
            } catch (err: any) {
                console.error(`Order Sync error for ${integration.platform}:`, err);
                results.push({ platform: integration.platform, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `${totalSynced} sipariş başarıyla senkronize edildi.`,
            syncedCount: totalSynced,
            results
        });

    } catch (error) {
        console.error("Error syncing orders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

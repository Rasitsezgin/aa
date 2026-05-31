export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;

        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Current 30-day period
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Previous 30-day period
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const orders = await prisma.order.findMany({
            where: {
                tenantId,
                orderDate: {
                    gte: thirtyDaysAgo
                }
            }
        });

        const previousOrders = await prisma.order.findMany({
            where: {
                tenantId,
                orderDate: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo,
                }
            }
        });

        // 1) Total Revenue
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

        // 2) Total Orders
        const totalOrders = orders.length;
        const previousTotalOrders = previousOrders.length;

        const currentCustomers = new Set(orders.map(o => o.customerEmail).filter(Boolean)).size;
        const previousCustomers = new Set(previousOrders.map(o => o.customerEmail).filter(Boolean)).size;

        const calcChange = (current: number, previous: number) => {
            if (previous <= 0) return current > 0 ? 100 : 0;
            return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        // 3) Calculate daily revenue arrays for charts
        const dailyRevenue: Record<string, number> = {};
        const dailyOrders: Record<string, number> = {};

        // Initialize last 7 days to 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
            dailyRevenue[dateStr] = 0;
            dailyOrders[dateStr] = 0;
        }

        orders.forEach(order => {
            const dateStr = order.orderDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
            if (dailyRevenue[dateStr] !== undefined) {
                dailyRevenue[dateStr] += Number(order.totalAmount);
                dailyOrders[dateStr] += 1;
            }
        });

        return NextResponse.json({
            summary: {
                totalRevenue: { value: totalRevenue, change: calcChange(totalRevenue, previousRevenue) },
                totalOrders: { value: totalOrders, change: calcChange(totalOrders, previousTotalOrders) },
                activeCustomers: { value: currentCustomers, change: calcChange(currentCustomers, previousCustomers) },
                conversionRate: { value: null, change: null },
            },
            charts: {
                revenue: {
                    labels: Object.keys(dailyRevenue),
                    data: Object.values(dailyRevenue)
                },
                orders: {
                    labels: Object.keys(dailyOrders),
                    data: Object.values(dailyOrders)
                }
            }
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

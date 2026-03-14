import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pazaryonetimi/database";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;

        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get recent orders from Prisma to calculate basic metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await prisma.order.findMany({
            where: {
                tenantId,
                orderDate: {
                    gte: thirtyDaysAgo
                }
            }
        });

        // 1) Total Revenue
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

        // 2) Total Orders
        const totalOrders = orders.length;

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
                totalRevenue: { value: totalRevenue, change: 15 }, // mock generic change for now
                totalOrders: { value: totalOrders, change: 8 },
                activeCustomers: { value: new Set(orders.map(o => o.customerEmail)).size || 0, change: 5 },
                conversionRate: { value: 3.2, change: 0.5 }, // Simulated
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

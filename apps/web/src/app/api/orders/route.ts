import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;

        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 50;
        const status = searchParams.get('status');
        const platform = searchParams.get('platform');

        const whereClause: any = { tenantId };

        if (status) {
            whereClause.status = status;
        }

        if (platform) {
            whereClause.platform = platform;
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            take: limit,
            orderBy: { orderDate: 'desc' }
        });

        // Map Prisma DB structure to expected Frontend structure
        const mappedOrders = orders.map(o => ({
            id: o.id,
            orderId: o.marketplaceOrderId,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            totalAmount: Number(o.totalAmount),
            currency: o.currency,
            status: o.status,
            paymentStatus: o.paymentStatus,
            platform: o.platform,
            createdAt: o.orderDate,
        }));

        return NextResponse.json(mappedOrders);

    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

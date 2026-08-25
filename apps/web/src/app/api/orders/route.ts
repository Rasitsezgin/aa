export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        let tenantId = (session?.user as any)?.tenantId as string;

        if (!tenantId && session?.user?.id) {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { tenantId: true }
            });
            if (dbUser?.tenantId) {
                tenantId = dbUser.tenantId;
            }
        }

        if (!tenantId) {
            const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
            tenantId = firstTenant?.id || 'demo-tenant';
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
            orderBy: { orderDate: 'desc' },
            include: { items: true }
        });

        if (orders.length === 0) {
            const sampleOrders = [
                {
                    id: "ord_101",
                    orderId: "TY-938472910",
                    marketplaceOrderId: "TY-938472910",
                    customerName: "Ahmet Yılmaz",
                    customerEmail: "ahmet.yilmaz@gmail.com",
                    customerPhone: "+90 532 450 12 34",
                    shippingAddress: "Barbaros Mah. Ihlamur Sk. No:14 D:5 Kadıköy / İstanbul",
                    totalAmount: 1450,
                    currency: "TRY",
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    platform: "TRENDYOL",
                    orderDate: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                    items: [
                        { id: "item_1", title: "Bosch Silecek Takımı Aerotwin 650/450mm", quantity: 1, unitPrice: 1450 }
                    ]
                },
                {
                    id: "ord_102",
                    orderId: "HB-583920194",
                    marketplaceOrderId: "HB-583920194",
                    customerName: "Zeynep Kaya",
                    customerEmail: "zeynep.kaya@hotmail.com",
                    customerPhone: "+90 544 320 88 90",
                    shippingAddress: "Çankaya Mah. Atatürk Bulv. No:88 Çankaya / Ankara",
                    totalAmount: 890,
                    currency: "TRY",
                    status: "SHIPPED",
                    paymentStatus: "PAID",
                    platform: "HEPSIBURADA",
                    orderDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                    items: [
                        { id: "item_2", title: "Castrol Edge 5W-30 LL Motor Yağı 4L", quantity: 1, unitPrice: 890 }
                    ]
                },
                {
                    id: "ord_103",
                    orderId: "AMZ-403-91823",
                    marketplaceOrderId: "AMZ-403-91823",
                    customerName: "Mehmet Demir",
                    customerEmail: "m.demir@outlook.com",
                    customerPhone: "+90 535 670 41 22",
                    shippingAddress: "Alsancak Mah. Kıbrıs Şehitleri Cad. No:45 Konak / İzmir",
                    totalAmount: 2150,
                    currency: "TRY",
                    status: "DELIVERED",
                    paymentStatus: "PAID",
                    platform: "AMAZON",
                    orderDate: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
                    items: [
                        { id: "item_3", title: "Baseus Araç İçi Hızlı Şarj Cihazı 65W Metal", quantity: 2, unitPrice: 1075 }
                    ]
                },
                {
                    id: "ord_104",
                    orderId: "N11-82740192",
                    marketplaceOrderId: "N11-82740192",
                    customerName: "Ayşe Çelik",
                    customerEmail: "ayse.celik@gmail.com",
                    customerPhone: "+90 507 890 12 33",
                    shippingAddress: "Fatih Mah. İstiklal Cad. No:12 Nilüfer / Bursa",
                    totalAmount: 640,
                    currency: "TRY",
                    status: "PENDING",
                    paymentStatus: "PAID",
                    platform: "N11",
                    orderDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    items: [
                        { id: "item_4", title: "Philips H7 X-tremeVision Pro150 Ampul Takımı", quantity: 1, unitPrice: 640 }
                    ]
                },
                {
                    id: "ord_105",
                    orderId: "PZ-1029384",
                    marketplaceOrderId: "PZ-1029384",
                    customerName: "Can Emre Şen",
                    customerEmail: "can.sen@yahoo.com",
                    customerPhone: "+90 555 123 45 67",
                    shippingAddress: "Muratpaşa Mah. Lara Cad. No:20 Muratpaşa / Antalya",
                    totalAmount: 1200,
                    currency: "TRY",
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    platform: "PAZARAMA",
                    orderDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                    items: [
                        { id: "item_5", title: "Michelin Programlanabilir Dijital Lastik Basınç Ölçer", quantity: 1, unitPrice: 1200 }
                    ]
                },
                {
                    id: "ord_106",
                    orderId: "CS-7729102",
                    marketplaceOrderId: "CS-7729102",
                    customerName: "Elif Öztürk",
                    customerEmail: "elif.ozturk@gmail.com",
                    customerPhone: "+90 533 777 88 99",
                    shippingAddress: "Karşıyaka Mah. Bostanlı Sk. No:5 Karşıyaka / İzmir",
                    totalAmount: 450,
                    currency: "TRY",
                    status: "SHIPPED",
                    paymentStatus: "PAID",
                    platform: "CICEKSEPETI",
                    orderDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
                    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
                    items: [
                        { id: "item_6", title: "Meguiar's Ultimate Hızlı Cila Sprey 473ml", quantity: 1, unitPrice: 450 }
                    ]
                }
            ];

            let filtered = sampleOrders;
            if (status && status !== 'Tümü') {
                filtered = filtered.filter(o => o.status === status);
            }
            if (platform && platform !== 'Tümü') {
                filtered = filtered.filter(o => o.platform === platform);
            }

            return NextResponse.json(filtered);
        }

        // Map Prisma DB structure to expected Frontend structure
        const mappedOrders = orders.map(o => ({
            id: o.id,
            orderId: o.marketplaceOrderId,
            marketplaceOrderId: o.marketplaceOrderId,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            shippingAddress: o.shippingAddress,
            totalAmount: Number(o.totalAmount),
            currency: o.currency,
            status: o.status,
            paymentStatus: o.paymentStatus,
            platform: o.platform,
            orderDate: o.orderDate,
            createdAt: o.orderDate,
            items: (o as any).items || []
        }));

        return NextResponse.json(mappedOrders);

    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

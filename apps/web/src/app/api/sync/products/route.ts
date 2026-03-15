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
                    // Fetch real products from Trendyol
                    const response = await fetch(`https://api.trendyol.com/sapigw/suppliers/${supplierId}/v2/products?size=50`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Basic ${trendyolAuth}`,
                            "User-Agent": "PazarYonetimi/1.0",
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const products = data.content || [];

                        for (const product of products) {
                            // Upsert each product into our local database
                            const localProduct = await prisma.product.findFirst({
                                where: {
                                    tenantId,
                                    sku: product.stockCode || product.barcode
                                }
                            });

                            if (localProduct) {
                                // Update existing
                                await prisma.product.update({
                                    where: { id: localProduct.id },
                                    data: {
                                        title: product.title,
                                        price: product.salePrice || product.listPrice || 0,
                                        stock: product.quantity || 0,
                                        brand: product.brand,
                                        barcode: product.barcode,
                                        category: product.categoryName,
                                        updatedAt: new Date()
                                    }
                                });
                            } else {
                                // Create new
                                await prisma.product.create({
                                    data: {
                                        tenantId,
                                        title: product.title || 'İsimsiz Ürün',
                                        sku: product.stockCode || product.barcode || `TY-${Date.now()}`,
                                        barcode: product.barcode,
                                        price: product.salePrice || product.listPrice || 0,
                                        stock: product.quantity || 0,
                                        brand: product.brand,
                                        category: product.categoryName,
                                        status: product.approved ? 'active' : 'draft',
                                    }
                                });
                            }
                        }

                        totalSynced += products.length;
                        results.push({ platform: 'TRENDYOL', status: 'success', count: products.length });

                        // Update integration lastSync timestamp using the 'updatedAt' field implicitly
                        await prisma.integration.update({
                            where: { id: integration.id },
                            data: { isActive: true }
                        });
                    } else {
                        results.push({ platform: 'TRENDYOL', status: 'error', error: `HTTP ${response.status}` });
                    }
                } else if (integration.platform === 'HEPSIBURADA') {
                    results.push({ platform: 'HEPSIBURADA', status: 'skipped', error: 'Product sync endpoint mevcut degil' });
                } else {
                    results.push({ platform: integration.platform, status: 'skipped', error: 'Unimplemented platform sync' });
                }
            } catch (err: any) {
                console.error(`Sync error for ${integration.platform}:`, err);
                results.push({ platform: integration.platform, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            message: `${totalSynced} ürün başarıyla senkronize edildi.`,
            syncedCount: totalSynced,
            results
        });

    } catch (error) {
        console.error("Error syncing products:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

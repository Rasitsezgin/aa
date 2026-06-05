export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyMarketplaceApi } from "@/lib/marketplace-api-proxy";

export async function POST() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string })?.tenantId;
    const accessToken = (session?.user as { accessToken?: string })?.accessToken;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ok, status, data } = await proxyMarketplaceApi(
      "/marketplace/sync-all-orders",
      {
        method: "POST",
        tenantId,
        accessToken,
        body: { tenantId },
      },
    );

    if (!ok) {
      return NextResponse.json(data ?? { error: "Sync failed" }, { status });
    }

    const results = Array.isArray(data) ? data : [];
    const syncedCount = results.reduce((sum: number, item: any) => {
      return sum + (item?.created ?? 0);
    }, 0);

    return NextResponse.json({
      success: true,
      message: `${syncedCount} yeni sipariş senkronize edildi.`,
      syncedCount,
      results: data,
    });
  } catch (error) {
    console.error("Error syncing orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const CATEGORY_MAP: Record<string, string> = {
  TRENDYOL: 'MARKETPLACE',
  HEPSIBURADA: 'MARKETPLACE',
  AMAZON: 'MARKETPLACE',
  N11: 'MARKETPLACE',
  SHOPIFY: 'ECOMMERCE',
  WOOCOMMERCE: 'ECOMMERCE',
};

/** GET — tenant bağlantıları (BFF fallback + API proxy) */
export async function GET() {
  try {
    const session = await auth();
    const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await prisma.integration.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        platform: true,
        isActive: true,
        apiExtra: true,
        updatedAt: true,
      },
    });

    const connections = rows.map((row) => {
      const extra = (row.apiExtra as { marketplaceId?: string } | null) ?? {};
      const providerId = extra.marketplaceId ?? row.platform.toLowerCase();
      return {
        id: row.id,
        tenantId,
        providerId,
        providerName: providerId,
        category: CATEGORY_MAP[row.platform] ?? 'MARKETPLACE',
        platform: row.platform,
        isActive: row.isActive,
        status: row.isActive ? 'connected' : 'disconnected',
        lastSyncAt: row.updatedAt.toISOString(),
        hasAdapter: ['trendyol', 'hepsiburada', 'n11', 'shopify', 'yurtici-kargo', 'parasut'].includes(providerId),
      };
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error('integrations-hub connections error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

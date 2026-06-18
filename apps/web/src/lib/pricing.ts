import { prisma } from "@/lib/prisma";
import {
    DEFAULT_PRICING_CATALOG,
    mergePricingCatalog,
    type PricingCatalog,
} from '@/config/pricing-catalog';

const PRICING_SETTINGS_KEY = 'public_pricing_catalog_v1';
let hasLoggedPricingReadFailure = false;

export async function getPricingCatalog(): Promise<PricingCatalog> {
    try {
        if (!prisma.systemSettings) {
            console.error('[PRICING] prisma.systemSettings is undefined. Prisma client may not be initialized correctly.');
            return DEFAULT_PRICING_CATALOG;
        }

        const setting = await prisma.systemSettings.findUnique({
            where: { key: PRICING_SETTINGS_KEY },
        });

        return mergePricingCatalog(setting?.value ?? null);
    } catch (error) {
        const errAny = error as Record<string, unknown>;
        // P2021: Table does not exist
        if (errAny?.code === 'P2021') {
            if (!hasLoggedPricingReadFailure) {
                hasLoggedPricingReadFailure = true;
                console.warn('[PRICING] SystemSettings tablosu mevcut degil, varsayilan katalog yukleniyor.');
            }
        } else {
            const errorMessage = typeof errAny?.message === 'string' ? errAny.message : '';
            const isDbConnectivityIssue =
                errAny?.code === 'ECONNREFUSED' ||
                errAny?.code === 'ETIMEDOUT' ||
                errAny?.code === 'P1001' ||
                errAny?.code === 'P1002' ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('ETIMEDOUT') ||
                errorMessage.includes("Can't reach database server") ||
                errorMessage.includes('require is not a function');

            if (isDbConnectivityIssue) {
                if (!hasLoggedPricingReadFailure) {
                    hasLoggedPricingReadFailure = true;
                    console.warn('[PRICING] Veritabani baglantisi yok, varsayilan katalog kullaniliyor.');
                }
            } else {
                console.error('[PRICING] Ayarlar okunamadi (Detayli Hata):', {
                    message: errAny?.message || error,
                    code: errAny?.code,
                    meta: errAny?.meta,
                });
            }
        }
        return DEFAULT_PRICING_CATALOG;
    }
}

'use server';

import { prisma } from '@pazaryonetimi/database';
import { revalidatePath } from 'next/cache';
import {
    DEFAULT_PRICING_CATALOG,
    mergePricingCatalog,
    type PricingCatalog,
    type PricingPlanId,
} from '@/config/pricing-catalog';

const PRICING_SETTINGS_KEY = 'public_pricing_catalog_v1';

export interface PricingActionState {
    success: boolean;
    message: string;
}

function parseNumberOrNull(value: FormDataEntryValue | null): number | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim().replace(/\./g, '').replace(',', '.');
    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }

    return Math.round(parsed);
}

function getString(value: FormDataEntryValue | null, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export async function getPricingCatalog(): Promise<PricingCatalog> {
    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: PRICING_SETTINGS_KEY },
        });

        return mergePricingCatalog(setting?.value ?? null);
    } catch (error) {
        const errAny = error as Record<string, unknown>;
        if (errAny?.code !== 'P2021') {
            console.error('[PRICING] Ayarlar okunamadi:', error);
        }
        return DEFAULT_PRICING_CATALOG;
    }
}

export async function updatePricingCatalog(
    _prevState: unknown,
    formData: FormData,
): Promise<PricingActionState> {
    try {
        const getPlan = (id: PricingPlanId) => {
            const defaults = DEFAULT_PRICING_CATALOG.plans.find((plan) => plan.id === id)!;

            return {
                id,
                name: getString(formData.get(`${id}_name`), defaults.name),
                monthly: id === 'enterprise'
                    ? null
                    : (parseNumberOrNull(formData.get(`${id}_monthly`)) ?? defaults.monthly),
                yearly: id === 'enterprise'
                    ? null
                    : (parseNumberOrNull(formData.get(`${id}_yearly`)) ?? defaults.yearly),
                signupDescription: getString(formData.get(`${id}_signupDescription`), defaults.signupDescription),
                enterpriseLabel: id === 'enterprise'
                    ? getString(formData.get('enterprise_label'), defaults.enterpriseLabel ?? 'Ozel')
                    : undefined,
            };
        };

        const payload: PricingCatalog = {
            badge: getString(formData.get('badge'), DEFAULT_PRICING_CATALOG.badge),
            title: getString(formData.get('title'), DEFAULT_PRICING_CATALOG.title),
            subtitle: getString(formData.get('subtitle'), DEFAULT_PRICING_CATALOG.subtitle),
            monthlyLabel: getString(formData.get('monthlyLabel'), DEFAULT_PRICING_CATALOG.monthlyLabel),
            yearlyLabel: getString(formData.get('yearlyLabel'), DEFAULT_PRICING_CATALOG.yearlyLabel),
            yearlyDiscountLabel: getString(formData.get('yearlyDiscountLabel'), DEFAULT_PRICING_CATALOG.yearlyDiscountLabel),
            plans: [getPlan('starter'), getPlan('professional'), getPlan('enterprise')],
        };
        const jsonPayload = JSON.parse(JSON.stringify(payload));

        await prisma.systemSettings.upsert({
            where: { key: PRICING_SETTINGS_KEY },
            update: {
                value: jsonPayload,
                isPublic: true,
                category: 'pricing',
            },
            create: {
                key: PRICING_SETTINGS_KEY,
                value: jsonPayload,
                category: 'pricing',
                description: 'Landing ve signup icin merkezi fiyat katalogu',
                isPublic: true,
            },
        });

        revalidatePath('/');
        revalidatePath('/pricing');
        revalidatePath('/signup');
        revalidatePath('/admin/pricing');

        return { success: true, message: 'Fiyat katalogu guncellendi.' };
    } catch (error) {
        const errAny = error as Record<string, unknown>;
        if (errAny?.code !== 'P2021') {
            console.error('[PRICING] Ayarlar kaydedilemedi:', error);
        }
        return { success: false, message: 'Fiyat katalogu kaydedilemedi.' };
    }
}

export type PricingPlanId = 'starter' | 'professional' | 'enterprise';

export interface PricingCatalogPlan {
    id: PricingPlanId;
    name: string;
    monthly: number | null;
    yearly: number | null;
    signupDescription: string;
    enterpriseLabel?: string;
}

export interface PricingCatalog {
    badge: string;
    title: string;
    subtitle: string;
    monthlyLabel: string;
    yearlyLabel: string;
    yearlyDiscountLabel: string;
    plans: PricingCatalogPlan[];
}

export const DEFAULT_PRICING_CATALOG: PricingCatalog = {
    badge: 'Seffaf Fiyatlandirma',
    title: 'Basit, Seffaf Fiyatlandirma.',
    subtitle: 'Gizli ucret yok. Kredi karti gerekmez. Isletmeniz buyudukce paketinizi yukseltin.',
    monthlyLabel: 'Aylik',
    yearlyLabel: 'Yillik',
    yearlyDiscountLabel: '%20 Indirim',
    plans: [
        {
            id: 'starter',
            name: 'Baslangic',
            monthly: 499,
            yearly: 399,
            signupDescription: '500 SKU\'ya kadar',
        },
        {
            id: 'professional',
            name: 'Profesyonel',
            monthly: 1299,
            yearly: 999,
            signupDescription: '2000 SKU\'ya kadar',
        },
        {
            id: 'enterprise',
            name: 'Kurumsal',
            monthly: null,
            yearly: null,
            signupDescription: 'Sinirsiz SKU',
            enterpriseLabel: 'Ozel',
        },
    ],
};

export function formatTryAmount(value: number): string {
    return new Intl.NumberFormat('tr-TR').format(value);
}

export function mergePricingCatalog(input: unknown): PricingCatalog {
    if (!input || typeof input !== 'object') {
        return DEFAULT_PRICING_CATALOG;
    }

    const source = input as Partial<PricingCatalog>;
    const mergedPlans = DEFAULT_PRICING_CATALOG.plans.map((defaultPlan) => {
        const incomingPlan = source.plans?.find((plan) => plan.id === defaultPlan.id);
        if (!incomingPlan) {
            return defaultPlan;
        }

        return {
            ...defaultPlan,
            ...incomingPlan,
            monthly: incomingPlan.monthly ?? defaultPlan.monthly,
            yearly: incomingPlan.yearly ?? defaultPlan.yearly,
            enterpriseLabel: incomingPlan.enterpriseLabel ?? defaultPlan.enterpriseLabel,
            signupDescription: incomingPlan.signupDescription ?? defaultPlan.signupDescription,
        };
    });

    return {
        ...DEFAULT_PRICING_CATALOG,
        ...source,
        plans: mergedPlans,
    };
}

export function mapCatalogToHomepagePricing(catalog: PricingCatalog) {
    const starter = catalog.plans.find((plan) => plan.id === 'starter') ?? DEFAULT_PRICING_CATALOG.plans[0];
    const professional = catalog.plans.find((plan) => plan.id === 'professional') ?? DEFAULT_PRICING_CATALOG.plans[1];

    return {
        badge: catalog.badge,
        title: catalog.title,
        subtitle: catalog.subtitle,
        plans: [
            {
                id: 'starter',
                name: starter.name,
                priceMonthly: starter.monthly !== null ? formatTryAmount(starter.monthly) : '0',
                priceAnnual: starter.yearly !== null ? formatTryAmount(starter.yearly) : '0',
                description: 'Yeni baslayanlar ve kucuk hacimli magazalar icin ideal.',
                features: ['1 Pazaryeri Entegrasyonu', '100 Urun Limiti', 'Temel Analitik', 'E-posta Destegi']
            },
            {
                id: 'pro',
                name: professional.name,
                priceMonthly: professional.monthly !== null ? formatTryAmount(professional.monthly) : '0',
                priceAnnual: professional.yearly !== null ? formatTryAmount(professional.yearly) : '0',
                description: 'Buyuyen isletmeler ve power-seller\'lar icin tam donanim.',
                features: ['Sinirsiz Pazaryeri', 'Sinirsiz Urun', 'Gemini AI SEO Motoru', '7/24 Oncelikli Destek', 'Rakip Fiyat Analizi']
            }
        ]
    };
}

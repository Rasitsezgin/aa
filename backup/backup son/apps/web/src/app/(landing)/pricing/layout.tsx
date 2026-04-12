import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';
import { getPricingCatalog } from '@/actions/pricing-settings';
import { formatTryAmount } from '@/config/pricing-catalog';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const base = pageMetadata['/pricing'];

    try {
        const catalog = await getPricingCatalog();
        const starter = catalog.plans.find((plan) => plan.id === 'starter');
        const professional = catalog.plans.find((plan) => plan.id === 'professional');
        const enterprise = catalog.plans.find((plan) => plan.id === 'enterprise');

        const starterLabel = starter?.monthly !== null && starter?.monthly !== undefined
            ? `Starter ₺${formatTryAmount(starter.monthly)}/ay`
            : null;
        const professionalLabel = professional?.monthly !== null && professional?.monthly !== undefined
            ? `Pro ₺${formatTryAmount(professional.monthly)}/ay`
            : null;
        const enterpriseLabel = enterprise?.enterpriseLabel
            ? `Enterprise ${enterprise.enterpriseLabel}`
            : null;

        const pieces = [starterLabel, professionalLabel, enterpriseLabel].filter(Boolean).join(', ');

        return {
            ...base,
            description: pieces
                ? `Pazaryonetimi fiyatlandırma planları. ${pieces}. Yıllık planda indirim avantajı.`
                : base.description,
        };
    } catch {
        return base;
    }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}

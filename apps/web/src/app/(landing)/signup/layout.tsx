import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';
import { getPricingCatalog } from '@/lib/pricing';
import { formatTryAmount } from '@/config/pricing-catalog';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const base = pageMetadata['/signup'];

    try {
        const catalog = await getPricingCatalog();
        const starter = catalog.plans.find((plan) => plan.id === 'starter');
        const professional = catalog.plans.find((plan) => plan.id === 'professional');
        const enterprise = catalog.plans.find((plan) => plan.id === 'enterprise');

        const starterLabel = starter?.monthly !== null && starter?.monthly !== undefined
            ? `${starter.name} ₺${formatTryAmount(starter.monthly)}/ay`
            : null;
        const professionalLabel = professional?.monthly !== null && professional?.monthly !== undefined
            ? `${professional.name} ₺${formatTryAmount(professional.monthly)}/ay`
            : null;
        const enterpriseLabel = enterprise?.enterpriseLabel
            ? `${enterprise.name} ${enterprise.enterpriseLabel}`
            : null;

        const pieces = [starterLabel, professionalLabel, enterpriseLabel].filter(Boolean).join(', ');

        return {
            ...base,
            description: pieces
                ? `Pazaryonetimi'ne hemen kaydolun. 14 gün ücretsiz deneme ile başlayın. Güncel planlar: ${pieces}.`
                : base.description,
        };
    } catch {
        return base;
    }
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}

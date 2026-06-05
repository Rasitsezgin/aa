import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IntegrationDocPage from '@/components/docs/IntegrationDocPage';
import {
    getIntegrationByDocSlug,
    integrationDocSlugs,
} from '@/components/landing/integrations-data';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return integrationDocSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = getIntegrationByDocSlug(slug);
    if (!item) return { title: 'Dokümantasyon Bulunamadı' };

    return {
        title: `${item.name} Entegrasyon Dokümantasyonu`,
        description: `${item.name} entegrasyonu kurulum rehberi, API uç noktaları, özellikler ve gereksinimler. ${item.shortDesc}`,
        alternates: {
            canonical: `https://pazaryonetimi.com/docs/${slug}`,
        },
        openGraph: {
            title: `${item.name} Entegrasyonu | Pazaryönetimi Dokümantasyon`,
            description: item.desc,
            url: `https://pazaryonetimi.com/docs/${slug}`,
        },
    };
}

export default async function IntegrationDocRoute({ params }: PageProps) {
    const { slug } = await params;
    const integration = getIntegrationByDocSlug(slug);
    if (!integration) notFound();
    return <IntegrationDocPage integration={integration} />;
}

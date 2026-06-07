import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    ArrowRight, CheckCircle2, Clock, Shield, Star, Users, Workflow, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { categoryMeta } from '@/components/landing/integrations-data';
import JsonLd from '@/components/SEO/JsonLd';
import {
    buildIntegrationDetailPath,
    getPublishedIntegrationDetailBySlug,
} from '@/lib/landing-integrations-service';
import { absoluteUrl, buildPageMetadata, truncateForMeta } from '@/lib/seo/site-seo';
import MarketingPageShell from '@/components/landing/MarketingPageShell';

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const integration = await getPublishedIntegrationDetailBySlug(slug);
    if (!integration) {
        return { title: 'Entegrasyon bulunamadı | Pazaryonetimi' };
    }

    const path = buildIntegrationDetailPath(integration);
    const title = integration.metaTitle
        || `${integration.name} Entegrasyonu | Pazaryonetimi`;
    const description = integration.metaDescription
        || truncateForMeta(integration.shortDesc || integration.desc, 165);
    const ogImage = integration.ogImage
        ? absoluteUrl(integration.ogImage)
        : integration.logo.startsWith('/')
            ? absoluteUrl(integration.logo)
            : undefined;

    return buildPageMetadata({
        title,
        description,
        path,
        keywords: integration.metaKeywords,
        noIndex: Boolean(integration.noIndex),
        ogImage,
    });
}

export default async function IntegrationDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const integration = await getPublishedIntegrationDetailBySlug(slug);
    if (!integration) notFound();

    const categoryName = categoryMeta.find((c) => c.id === integration.category)?.name ?? 'Entegrasyon';
    const benefits = integration.features.slice(0, 3);
    const extraFeatures = integration.features.slice(3);
    const detailPath = buildIntegrationDetailPath(integration);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${integration.name} Entegrasyonu`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: integration.shortDesc || integration.desc,
        url: absoluteUrl(detailPath),
        image: integration.ogImage
            ? absoluteUrl(integration.ogImage)
            : integration.logo.startsWith('/')
                ? absoluteUrl(integration.logo)
                : absoluteUrl('/og-image.png'),
        offers: {
            '@type': 'Offer',
            price: integration.price === 'Ücretsiz' ? '0' : undefined,
            priceCurrency: 'TRY',
            description: integration.price,
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: integration.rating,
            reviewCount: integration.reviews,
            bestRating: 5,
        },
        provider: {
            '@type': 'Organization',
            name: 'Pazaryonetimi',
            url: absoluteUrl('/'),
        },
    };

    return (
        <MarketingPageShell as="div" className="flex flex-col" padded={false}>
            <JsonLd data={jsonLd} />

            <div className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/50 dark:border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-transparent to-transparent dark:from-orange-950/20 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-300 rounded-full text-xs font-bold mb-6 uppercase tracking-widest">
                                {categoryName}
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${integration.gradient}`}>
                                    {integration.name}
                                </span>
                                <br />
                                Entegrasyonu
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                                {integration.desc}
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                                {[
                                    { icon: Users, label: integration.stats.users },
                                    { icon: Star, label: `${integration.rating} puan` },
                                    { icon: Clock, label: integration.setupTime },
                                    { icon: Shield, label: integration.stats.uptime },
                                ].map(({ icon: Icon, label }) => (
                                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        <Icon size={14} className="text-orange-500" />
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    href="/signup"
                                    className={`px-8 py-4 bg-gradient-to-r ${integration.gradient} text-white rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg text-lg text-center`}
                                >
                                    Ücretsiz Entegre Et
                                </Link>
                                <Link
                                    href="/entegrasyonlar"
                                    className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    Tüm listeye dön <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 flex justify-center w-full relative">
                            <div className={`w-64 h-64 lg:w-96 lg:h-96 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br ${integration.gradient} blur-[100px] opacity-25`} />
                            <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-8 rounded-[3rem] shadow-2xl flex items-center justify-center gap-8 w-full max-w-md">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-500 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-lg">PY</div>
                                    <div className="text-sm font-bold text-slate-500 mt-3">Pazaryönetimi</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Workflow className="w-10 h-10 text-orange-400 animate-pulse" />
                                    <div className="text-[10px] text-orange-500 font-bold tracking-widest mt-2 uppercase">API Senkron</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${integration.gradient} text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg overflow-hidden`}>
                                        {integration.logo.startsWith('/') ? (
                                            <img src={integration.logo} alt={integration.name} className="w-full h-full object-contain p-3 bg-white" />
                                        ) : (
                                            integration.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 mt-3">{integration.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <div>
                        <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">
                            Neden {integration.name} için Pazaryönetimi?
                        </h2>
                        <div className="space-y-4">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex gap-4 p-6 bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 rounded-2xl">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{benefit}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Otomasyon kuralları sayesinde bu süreç arka planda güvenle çalışır; manuel müdahaleye gerek kalmaz.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {integration.requirements.length > 0 && (
                            <div className="mt-10 p-6 rounded-2xl bg-orange-500/5 border border-orange-200/50 dark:border-orange-500/20">
                                <h3 className="font-black text-slate-900 dark:text-white mb-3">Kurulum gereksinimleri</h3>
                                <ul className="space-y-2">
                                    {integration.requirements.map((req) => (
                                        <li key={req} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle2 size={14} className="text-orange-500 shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">Teknik özellikler</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(extraFeatures.length ? extraFeatures : integration.features).map((feat) => (
                                <div key={feat} className="p-6 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-white/10">
                                    <Zap className="w-6 h-6 text-amber-500 mb-4" />
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat}</h4>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${integration.gradient} opacity-20`} />
                            <div className="relative">
                                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Fiyatlandırma</p>
                                <p className="text-3xl font-black">{integration.price}</p>
                                <p className="text-sm text-white/70 mt-2">Kurulum: {integration.setupTime} · Senkron: {integration.stats.syncTime}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingPageShell>
    );
}

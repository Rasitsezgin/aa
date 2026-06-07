"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, FileText, Cookie, Scale, Lock, Briefcase, ChevronRight, Clock, Building2, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

// İçerikler ayrı dosyadan import edilecek
import { LEGAL_PAGES } from './legal-content';

interface LegalSection {
    title: string;
    content?: string;
}

interface LegalPageData {
    title: string;
    updated: string;
    summary?: string;
    sections?: LegalSection[];
    content?: string;
}

const PAGE_ICONS: Record<string, typeof Shield> = {
    'gizlilik-politikasi': Shield,
    'kullanim-sartlari': FileText,
    'cerez-politikasi': Cookie,
    'kvkk': Lock,
    'satis-sozlesmesi': Scale,
    'hizmet-politikalari': Briefcase,
    'hakkimizda': Building2,
    'kariyer': Briefcase,
};

const RELATED_PAGES = [
    { slug: 'gizlilik-politikasi', title: 'Gizlilik Politikası' },
    { slug: 'kullanim-sartlari', title: 'Kullanım Şartları' },
    { slug: 'cerez-politikasi', title: 'Çerez Politikası' },
    { slug: 'kvkk', title: 'KVKK Aydınlatma Metni' },
    { slug: 'satis-sozlesmesi', title: 'Mesafeli Satış Sözleşmesi' },
    { slug: 'hizmet-politikalari', title: 'Hizmet Politikaları' },
];

export default function LegalPage() {
    const params = useParams();
    const slugParam = params?.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const pageData = slug ? (LEGAL_PAGES as Record<string, LegalPageData>)[slug] : undefined;
    const PageIcon = slug ? PAGE_ICONS[slug] || FileText : FileText;

    if (!pageData) {
        return (
            <div className="min-h-screen pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-20 flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0B1120]">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4">404</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">Aradığınız belge bulunamadı.</p>
                    <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Yasal Belgeler</h3>
                                <nav className="space-y-1">
                                    {RELATED_PAGES.map((page) => {
                                        const Icon = PAGE_ICONS[page.slug] || FileText;
                                        const isActive = slug === page.slug;
                                        return (
                                            <Link key={page.slug} href={`/kurumsal/${page.slug}`}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                                    }`}>
                                                <Icon size={16} />
                                                {page.title}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                            <div className="mt-6 bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-2xl border border-primary/20 p-6">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Sorularınız mı var?</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Yasal konularda destek almak için bizimle iletişime geçin.</p>
                                <div className="space-y-2 text-sm">
                                    <a href="mailto:hukuk@pazaryonetimi.com" className="flex items-center gap-2 text-primary hover:underline">
                                        <Mail size={14} /> hukuk@pazaryonetimi.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-8 lg:p-12">
                            <div className="mb-10 pb-8 border-b border-slate-200 dark:border-white/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                        <PageIcon size={32} />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{pageData.title}</h1>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Clock size={14} /> Son güncelleme: {pageData.updated}</span>
                                        </div>
                                    </div>
                                </div>
                                {pageData.summary && <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{pageData.summary}</p>}
                            </div>

                            {pageData.sections && pageData.sections.length > 0 && (
                                <div className="mb-10 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">İçindekiler</h3>
                                    <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {pageData.sections.map((section, idx) => (
                                            <a key={idx} href={`#section-${idx}`}
                                                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                                                <ChevronRight size={14} /> {idx + 1}. {section.title}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-white/10 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-primary">
                                {pageData.sections ? (
                                    pageData.sections.map((section, idx) => (
                                        <div key={idx} id={`section-${idx}`}>
                                            <h2>{idx + 1}. {section.title}</h2>
                                            <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                                        </div>
                                    ))
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: pageData.content || '' }} />
                                )}
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
                                <p className="text-sm text-slate-500">Bu belge yönetici paneli üzerinden düzenlenebilir.</p>
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </MarketingPageShell>
    );
}

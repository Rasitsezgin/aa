"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeroNew from "@/components/HeroNew";
import SocialProof from "@/components/SocialProof";

import {
  BentoGridSkeleton,
  PricingSkeleton,
  TestimonialsSkeleton,
  FAQSkeleton,
  CardSkeleton
} from "@/components/ui/Skeleton";
import { mapCatalogToHomepagePricing, type PricingCatalog } from '@/config/pricing-catalog';
import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

const BentoGrid = dynamic(() => import("@/components/BentoGrid"), { loading: () => <BentoGridSkeleton /> });
const DashboardPreview = dynamic(() => import("@/components/DashboardPreview"), { loading: () => <CardSkeleton /> });
const Testimonials = dynamic(() => import("@/components/Testimonials"), { loading: () => <TestimonialsSkeleton /> });
const FAQ = dynamic(() => import("@/components/FAQ"), { loading: () => <FAQSkeleton /> });
const Pricing = dynamic(() => import("@/components/Pricing"), { loading: () => <PricingSkeleton /> });
const ChaosVsControl = dynamic(() => import("@/components/ChaosVsControl"), { loading: () => <CardSkeleton /> });
const CTASection = dynamic(() => import("@/components/CTASection"), { loading: () => <CardSkeleton /> });

const INITIAL_CONFIG = [
  { id: 'hero', component: HeroNew, isActive: true },
  { id: 'social-proof', component: SocialProof, isActive: true },
  { id: 'chaos-control', component: ChaosVsControl, isActive: true },
  { id: 'preview', component: DashboardPreview, isActive: true },
  { id: 'bento', component: BentoGrid, isActive: true },
  { id: 'testimonials', component: Testimonials, isActive: true },
  { id: 'pricing', component: Pricing, isActive: true },
  { id: 'faq', component: FAQ, isActive: true },
  { id: 'cta', component: CTASection, isActive: true },
];

const sectionBgClass: Record<string, string> = {
  'chaos-control': 'bg-slate-50/50 dark:bg-[#0B1120]/40',
  'preview': 'bg-white dark:bg-transparent',
  'bento': 'bg-slate-50/30 dark:bg-[#0B1120]/30',
  'testimonials': 'bg-white dark:bg-transparent',
  'pricing': 'bg-slate-50/50 dark:bg-[#0B1120]/50',
};

export default function LandingHomeClient() {
  const [texts, setTexts] = useState(HOMEPAGE_TEXTS);
  const [sections, setSections] = useState(INITIAL_CONFIG);

  useEffect(() => {
    async function loadHomepage() {
      try {
        const res = await fetch('/api/public/homepage', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.texts) setTexts(data.texts);
          if (data.sections?.length) {
            const activeMap = Object.fromEntries(
              data.sections.map((s: { id: string; isActive: boolean }) => [s.id, s.isActive]),
            );
            setSections((prev) =>
              prev.map((s) => ({
                ...s,
                isActive: activeMap[s.id] !== undefined ? activeMap[s.id] : s.isActive,
              })),
            );
          }
        }
      } catch {
        const savedTexts = localStorage.getItem('homepage_texts');
        if (savedTexts) {
          try { setTexts(JSON.parse(savedTexts)); } catch { /* ignore */ }
        }
      }

      try {
        const res = await fetch('/api/pricing-catalog', { cache: 'no-store' });
        if (!res.ok) return;
        const catalog = (await res.json()) as PricingCatalog;
        setTexts((prev) => ({
          ...prev,
          pricing: mapCatalogToHomepagePricing(catalog),
        }));
      } catch {
        // Varsayilan metinler ile devam et
      }
    }
    void loadHomepage();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF9] dark:bg-[#0B1120] text-foreground relative selection:bg-orange-500/30 overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFCF8] via-[#FAFAF9] to-white dark:from-[#0c1222] dark:via-[#0B1120] dark:to-[#0B1120]" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[70vw] h-[30vh] bg-orange-500/[0.05] dark:bg-orange-500/[0.07] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-0 pb-8 sm:pb-0">
        {sections.map((section) => {
          if (!section.isActive) return null;
          const Component = section.component as React.ComponentType<Record<string, unknown>>;

          const componentProps: Record<string, unknown> = {};
          if (section.id === 'hero') componentProps.texts = texts.hero;
          if (section.id === 'bento') componentProps.texts = texts.bento;
          if (section.id === 'pricing') componentProps.texts = texts.pricing;
          if (section.id === 'faq') componentProps.texts = texts.faq;

          const bgClass = sectionBgClass[section.id] || '';

          if (section.id === 'hero') {
            return <Component key={section.id} {...componentProps} />;
          }

          return (
            <div key={section.id} className={bgClass}>
              <Component {...componentProps} />
            </div>
          );
        })}
      </div>
    </main>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeroNew from "@/components/HeroNew";
import SocialProof from "@/components/SocialProof";

// Lazy Load Below-the-fold Components
import {
  BentoGridSkeleton,
  PricingSkeleton,
  TestimonialsSkeleton,
  FAQSkeleton,
  StatsSkeleton,
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
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), { ssr: false, loading: () => <CardSkeleton /> });
const RoiCalculator = dynamic(() => import("@/components/RoiCalculator"), { loading: () => <CardSkeleton /> });
const EcosystemCloud = dynamic(() => import("@/components/EcosystemCloud"), { loading: () => <CardSkeleton /> });
const ComparisonTable = dynamic(() => import("@/components/ComparisonTable"), { loading: () => <CardSkeleton /> });
const CTASection = dynamic(() => import("@/components/CTASection"), { loading: () => <CardSkeleton /> });

// This would normally come from a database or API
const INITIAL_CONFIG = [
  { id: 'hero', component: HeroNew, isActive: true },
  { id: 'social-proof', component: SocialProof, isActive: true },
  { id: 'chaos-control', component: ChaosVsControl, isActive: true },
  { id: 'preview', component: DashboardPreview, isActive: true },
  { id: 'map', component: GlobalMap, isActive: true },
  { id: 'roi', component: RoiCalculator, isActive: true },
  { id: 'ecosystem', component: EcosystemCloud, isActive: true },
  { id: 'bento', component: BentoGrid, isActive: true },
  { id: 'testimonials', component: Testimonials, isActive: true },
  { id: 'comparison', component: ComparisonTable, isActive: true },
  { id: 'pricing', component: Pricing, isActive: true },
  { id: 'faq', component: FAQ, isActive: true },
  { id: 'cta', component: CTASection, isActive: true },
];

export default function LandingHomeClient() {
  const [activeConfig, setActiveConfig] = useState(INITIAL_CONFIG);
  const [texts, setTexts] = useState(HOMEPAGE_TEXTS);

  useEffect(() => {
    // Hydrate Text Config - use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      const savedTexts = localStorage.getItem('homepage_texts');
      if (savedTexts) {
        try {
          setTexts(JSON.parse(savedTexts));
        } catch (e) {
          console.error("Failed to load homepage texts", e);
        }
      }
    }, 0);

    const pricingTimer = setTimeout(async () => {
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
    }, 0);

    setActiveConfig(INITIAL_CONFIG);
    return () => {
      clearTimeout(timer);
      clearTimeout(pricingTimer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-foreground relative selection:bg-blue-500/30 overflow-x-hidden">

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* GLOBAL BACKGROUND SYSTEM (Fixed) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-white dark:bg-[#020617]" />

        {/* Animated Aurora Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

        {/* Global Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION RENDERER */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-0">
        {activeConfig.map((section) => {
          if (!section.isActive) return null;
          const Component = section.component as React.ComponentType<any>;

          // Pass dynamic texts if component supports it
          const componentProps: Record<string, unknown> = {};
          if (section.id === 'hero') componentProps.texts = texts.hero;
          if (section.id === 'bento') componentProps.texts = texts.bento;
          if (section.id === 'pricing') componentProps.texts = texts.pricing;
          if (section.id === 'faq') componentProps.texts = texts.faq;

          return <Component key={section.id} {...componentProps} />;
        })}
      </div>
    </main>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import HeroNew from "@/components/HeroNew";
import SocialProof from "@/components/SocialProof";

// Lazy Load Below-the-fold Components
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
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), { ssr: false, loading: () => <CardSkeleton /> });
const EcosystemCloud = dynamic(() => import("@/components/EcosystemCloud"), { loading: () => <CardSkeleton /> });
const CTASection = dynamic(() => import("@/components/CTASection"), { loading: () => <CardSkeleton /> });

// New Feature Components
const ScrollParticles = dynamic(() => import("@/components/landing/ScrollParticles").then(mod => ({ default: mod.ScrollParticles })), { loading: () => <CardSkeleton /> });
const RealtimeCounter = dynamic(() => import("@/components/landing/RealtimeCounter").then(mod => ({ default: mod.RealtimeCounter })), { loading: () => <CardSkeleton /> });

const ROICalculator2 = dynamic(() => import("@/components/landing/ROICalculator2").then(mod => ({ default: mod.ROICalculator2 })), { loading: () => <CardSkeleton /> });
const CommandPaletteLanding = dynamic(() => import("@/components/landing/CommandPaletteLanding").then(mod => ({ default: mod.CommandPaletteLanding })), { ssr: false });

// This would normally come from a database or API
const INITIAL_CONFIG = [
  { id: 'hero', component: HeroNew, isActive: true },
  { id: 'social-proof', component: SocialProof, isActive: true },
  { id: 'chaos-control', component: ChaosVsControl, isActive: true },
  { id: 'preview', component: DashboardPreview, isActive: true },
  { id: 'particles', component: ScrollParticles, isActive: true },
  { id: 'realtime-counter', component: RealtimeCounter, isActive: true },
  { id: 'map', component: GlobalMap, isActive: true },
  { id: 'roi', component: ROICalculator2, isActive: true },
  { id: 'ecosystem', component: EcosystemCloud, isActive: true },
  { id: 'bento', component: BentoGrid, isActive: true },
  { id: 'command-palette', component: CommandPaletteLanding, isActive: true },
  { id: 'testimonials', component: Testimonials, isActive: true },
  { id: 'pricing', component: Pricing, isActive: true },
  { id: 'faq', component: FAQ, isActive: true },
  { id: 'cta', component: CTASection, isActive: true },
];

// Alternating background variants for visual rhythm
const sectionBgClass: Record<string, string> = {
  'hero': '',
  'social-proof': '',
  'chaos-control': 'bg-slate-50/30 dark:bg-[#020617]/50',
  'preview': '',
  'particles': 'bg-gradient-to-b from-slate-50/20 to-transparent dark:from-[#020617]/40',
  'realtime-counter': '',
  'map': 'bg-slate-50/30 dark:bg-[#020617]/50',
  'roi': '',
  'ecosystem': 'bg-gradient-to-b from-slate-50/20 to-transparent dark:from-[#020617]/40',
  'bento': '',
  'command-palette': 'bg-slate-50/30 dark:bg-[#020617]/50',
  'testimonials': '',
  'pricing': 'bg-slate-50/50 dark:bg-[#020617]/80',
  'faq': '',
  'cta': '',
};

export default function LandingHomeClient() {
  const [activeConfig] = useState(INITIAL_CONFIG);
  const [isMobile, setIsMobile] = useState(false);
  const [texts, setTexts] = useState(HOMEPAGE_TEXTS);
  const [features, setFeatures] = useState({
    particles: { enabled: true, particleCount: 50, triggerScroll: true },
    realTimeCounter: { enabled: true, showCountries: true, updateInterval: 5000 },
    exitIntent: { enabled: true, discountPercent: 20, triggerDelay: 1000 },
    commandPalette: { enabled: true, shortcutKey: 'cmd+k' },
    spotlightTour: { enabled: false, autoStart: false, stepDelay: 2000 },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobile(media.matches);
    onChange();

    media.addEventListener('change', onChange);

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

    // Load Features
    const featuresTimer = setTimeout(() => {
      const savedFeatures = localStorage.getItem('homepage_features');
      if (savedFeatures) {
        try {
          const parsed = JSON.parse(savedFeatures);
          setFeatures(parsed);
        } catch (e) {
          console.error("Failed to load homepage features", e);
        }
      }
    }, 0);

    return () => {
      media.removeEventListener('change', onChange);
      clearTimeout(timer);
      clearTimeout(pricingTimer);
      clearTimeout(featuresTimer);
    };
  }, []);

  const visibleSections = useMemo(() => {
    if (!isMobile) return activeConfig;

    const mobileHidden = new Set(['particles', 'map', 'command-palette']);
    return activeConfig.filter((section) => !mobileHidden.has(section.id));
  }, [activeConfig, isMobile]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#020617] text-foreground relative selection:bg-blue-500/30 overflow-x-hidden">

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* GLOBAL BACKGROUND SYSTEM (Optimized with CSS Animations) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-white dark:bg-[#020617]" />

        {/* CSS Animated Aurora Blobs (Lighter than Framer Motion) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob-slow" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob-slow animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob-slow animation-delay-4000" />
        
        {/* Global Grid Pattern */}
        <div className="absolute inset-0 dark:opacity-[0.1] opacity-[0.2]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* SECTION RENDERER */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-0 pb-8 sm:pb-0">
        {visibleSections.map((section, index) => {
          if (!section.isActive) return null;
          const Component = section.component as React.ComponentType<Record<string, unknown>>;

          // Pass dynamic texts if component supports it
          const componentProps: Record<string, unknown> = {};
          if (section.id === 'hero') componentProps.texts = texts.hero;
          if (section.id === 'bento') componentProps.texts = texts.bento;
          if (section.id === 'pricing') componentProps.texts = texts.pricing;
          if (section.id === 'faq') componentProps.texts = texts.faq;
          
          // Pass features to new components
          if (['particles', 'realtime-counter', 'exit-intent', 'command-palette', 'spotlight-tour'].includes(section.id)) {
            componentProps.features = features;
          }

          const bgClass = sectionBgClass[section.id] || '';

          // Skip animation for hero section (it has its own)
          if (section.id === 'hero') {
            return <Component key={section.id} {...componentProps} />;
          }

          // Add scroll animation for other sections with alternating backgrounds
          return (
            <div
              key={section.id}
              className={`${bgClass} transition-all duration-1000`}
            >
              <Component {...componentProps} />
            </div>
          );
        })}
      </div>

      {/* Global Components (Always Render) */}
      {/* Popup'lar artık DynamicPopupSystem (Layout) üzerinden yönetiliyor */}
    </main>
  );
}

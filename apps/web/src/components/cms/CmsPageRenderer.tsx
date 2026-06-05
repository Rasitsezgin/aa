"use client";

import { motion } from "framer-motion";
import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { CtaSection } from "./sections/CtaSection";
import { FaqSection } from "./sections/FaqSection";
import { StatsSection } from "./sections/StatsSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { StepsSection } from "./sections/StepsSection";
import { TextSection } from "./sections/TextSection";
import { ImageSection } from "./sections/ImageSection";

interface Block {
  id: string;
  type: string;
  content: any;
  align: string;
  width: string;
  customClass?: string;
}

interface Section {
  id: string;
  name: string;
  title: string | null;
  subtitle: string | null;
  bgColor: string | null;
  bgImage: string | null;
  textColor: string | null;
  padding: string;
  container: string;
  columns: number;
  blocks: Block[];
}

interface Page {
  id: string;
  title: string;
  description: string | null;
  layout: string;
  theme: string | null;
  sections: Section[];
}

interface CmsPageRendererProps {
  page: Page;
}

const sectionComponents: Record<string, React.FC<any>> = {
  HERO: HeroSection,
  FEATURES: FeaturesSection,
  PRICING: PricingSection,
  TESTIMONIALS: TestimonialsSection,
  CTA: CtaSection,
  FAQ: FaqSection,
  STATS: StatsSection,
  INTEGRATIONS: IntegrationsSection,
  STEPS: StepsSection,
  TEXT: TextSection,
  IMAGE: ImageSection,
};

export function CmsPageRenderer({ page }: CmsPageRendererProps) {
  const containerClass =
    page.layout === "full-width" ? "w-full" : "container mx-auto px-4";

  return (
    <div className={`cms-page ${page.theme || "light"}`}>
      {page.sections.map((section, index) => {
        const SectionComponent = sectionComponents[section.name.toUpperCase()];

        if (!SectionComponent) {
          // Fallback: Render blocks directly
          return (
            <section
              key={section.id}
              className={`${section.padding} ${
                section.bgColor || ""
              } ${section.textColor || ""}`}
              style={section.bgImage ? { backgroundImage: `url(${section.bgImage})` } : undefined}
            >
              <div className={section.container === "full-width" ? "w-full" : containerClass}>
                {section.title && (
                  <h2 className="text-3xl font-bold text-center mb-8">
                    {section.title}
                  </h2>
                )}
                {section.subtitle && (
                  <p className="text-lg text-center text-slate-600 mb-12">
                    {section.subtitle}
                  </p>
                )}
                <div className={`grid grid-cols-1 md:grid-cols-${section.columns} gap-6`}>
                  {section.blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <SectionComponent
              title={section.title}
              subtitle={section.subtitle}
              bgColor={section.bgColor}
              bgImage={section.bgImage}
              textColor={section.textColor}
              padding={section.padding}
              container={section.container}
              blocks={section.blocks}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  const widthClass =
    {
      full: "col-span-full",
      "1/2": "col-span-1 md:col-span-6",
      "1/3": "col-span-1 md:col-span-4",
      "1/4": "col-span-1 md:col-span-3",
    }[block.width] || "col-span-full";

  const alignClass =
    {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[block.align] || "text-left";

  switch (block.type) {
    case "TEXT":
      return (
        <div className={`${widthClass} ${alignClass} ${block.customClass || ""}`}>
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content.text }}
          />
        </div>
      );

    case "IMAGE":
      return (
        <div className={`${widthClass} ${alignClass} ${block.customClass || ""}`}>
          <img
            src={block.content.src}
            alt={block.content.alt || ""}
            className="w-full h-auto rounded-lg"
          />
        </div>
      );

    case "BUTTON":
      return (
        <div className={`${widthClass} ${alignClass} ${block.customClass || ""}`}>
          <a
            href={block.content.url}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              block.content.variant === "primary"
                ? "bg-orange-600 text-white hover:bg-orange-500"
                : block.content.variant === "secondary"
                ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                : "border-2 border-current text-current hover:bg-slate-100"
            }`}
          >
            {block.content.label}
          </a>
        </div>
      );

    case "VIDEO":
      return (
        <div className={`${widthClass} ${alignClass} ${block.customClass || ""}`}>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={block.content.url}
              title={block.content.title || "Video"}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      );

    case "HTML":
      return (
        <div
          className={`${widthClass} ${block.customClass || ""}`}
          dangerouslySetInnerHTML={{ __html: block.content.html }}
        />
      );

    default:
      return (
        <div className={`${widthClass} ${alignClass} ${block.customClass || ""}`}>
          <pre className="bg-slate-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(block.content, null, 2)}
          </pre>
        </div>
      );
  }
}

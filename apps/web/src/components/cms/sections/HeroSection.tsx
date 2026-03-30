"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  bgImage?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

export function HeroSection({
  title,
  subtitle,
  bgColor = "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900",
  bgImage,
  textColor = "text-white",
  padding = "py-20 lg:py-32",
  container = "container",
  blocks = [],
}: HeroSectionProps) {
  // Blok içeriğini bul
  const headingBlock = blocks?.find((b) => b.content?.heading)?.content?.heading;
  const descriptionBlock = blocks?.find((b) => b.content?.description)?.content?.description;
  const ctaBlock = blocks?.find((b) => b.type === "BUTTON" || b.content?.cta)?.content;

  const displayTitle = headingBlock || title || "Platformunuzun Potansiyelini Açığa Çıkarın";
  const displaySubtitle = descriptionBlock || subtitle || "AI destekli e-ticaret yönetim çözümleri";

  return (
    <section
      className={`relative overflow-hidden ${padding} ${bgColor} ${textColor}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />

      <div className={`${container} mx-auto px-4 relative z-10`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              AI Destekli Platform
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              {displayTitle}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {displaySubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctaBlock ? (
                <Link
                  href={ctaBlock.url || "/signup"}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                >
                  {ctaBlock.label || "Ücretsiz Başla"}
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Ücretsiz Başla
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all backdrop-blur-sm"
                  >
                    Demo İzle
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "50+", label: "Pazaryeri" },
              { value: "10M+", label: "Ürün Senkronize" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "AI Desteği" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

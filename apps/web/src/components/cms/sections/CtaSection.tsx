"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CtaSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

export function CtaSection({
  title,
  subtitle,
  bgColor = "bg-orange-600",
  textColor = "text-white",
  padding = "py-20",
  container = "container",
  blocks = [],
}: CtaSectionProps) {
  const ctaBlock = blocks?.find(b => b.type === "BUTTON")?.content;
  
  const displayTitle = title || "Hemen Başlayın";
  const displaySubtitle = subtitle || "14 gün ücretsiz deneme, kredi kartı gerektirmez.";

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4 text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{displayTitle}</h2>
          <p className="text-lg opacity-90 mb-8">{displaySubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaBlock?.url || "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
            >
              {ctaBlock?.label || "Ücretsiz Deneme Başlat"}
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Demo Talep Et
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

interface ImageSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

export function ImageSection({
  title,
  subtitle,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  padding = "py-16",
  container = "container",
  blocks = [],
}: ImageSectionProps) {
  const imageBlock = blocks?.find(b => b.type === "IMAGE")?.content;
  const displaySrc = imageBlock?.src || blocks?.[0]?.content?.src || "";
  const displayAlt = imageBlock?.alt || blocks?.[0]?.content?.alt || "";

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4`}>
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-lg text-slate-600">{subtitle}</p>}
          </motion.div>
        )}

        {displaySrc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden"
          >
            <img
              src={displaySrc}
              alt={displayAlt}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

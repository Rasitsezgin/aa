"use client";

import { motion } from "framer-motion";

interface TextSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

export function TextSection({
  title,
  subtitle,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  padding = "py-16",
  container = "container",
  blocks = [],
}: TextSectionProps) {
  const textBlock = blocks?.find(b => b.type === "TEXT")?.content;
  const displayText = textBlock?.text || blocks?.[0]?.content?.text || "";

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4 max-w-4xl`}>
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

        {displayText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: displayText }}
          />
        )}
      </div>
    </section>
  );
}

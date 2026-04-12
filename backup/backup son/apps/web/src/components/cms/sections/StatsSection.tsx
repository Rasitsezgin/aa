"use client";

import { motion } from "framer-motion";

interface StatsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultStats = [
  { value: "10,000+", label: "Aktif Kullanıcı" },
  { value: "50M+", label: "Senkronize Ürün" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Destek" },
];

export function StatsSection({
  title,
  subtitle,
  bgColor = "bg-slate-900",
  textColor = "text-white",
  padding = "py-16",
  container = "container",
  blocks = [],
}: StatsSectionProps) {
  const stats = blocks?.filter(b => b.type === "STAT").map(b => b.content) || defaultStats;

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4`}>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && <p className="text-slate-400">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-blue-400">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

interface IntegrationsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultIntegrations = [
  { name: "Trendyol", color: "#F27A1A" },
  { name: "Hepsiburada", color: "#FF6000" },
  { name: "Amazon", color: "#FF9900" },
  { name: "N11", color: "#5D8C87" },
  { name: "Çiçek Sepeti", color: "#4ECDC4" },
  { name: "Gittigidiyor", color: "#3688D4" },
  { name: "PTT AVM", color: "#F4A261" },
  { name: "Morhipo", color: "#2A9D8F" },
];

export function IntegrationsSection({
  title,
  subtitle,
  bgColor = "bg-slate-50",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: IntegrationsSectionProps) {
  const displayTitle = title || "Entegre Pazaryerleri";
  const displaySubtitle = subtitle || "Tüm büyük pazaryerleriyle sorunsuz entegrasyon";
  const integrations = blocks?.filter(b => b.type === "INTEGRATION_LOGO").map(b => b.content) || defaultIntegrations;

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{displayTitle}</h2>
          <p className="text-lg text-slate-600">{displaySubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {integrations.map((integration: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-center h-20"
              style={{ borderColor: integration.color, borderWidth: 2 }}
            >
              <span className="font-semibold" style={{ color: integration.color }}>
                {integration.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

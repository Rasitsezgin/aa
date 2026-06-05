"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultSteps = [
  {
    number: "01",
    title: "Hesap Oluşturun",
    description: "2 dakikada ücretsiz hesabınızı oluşturun.",
  },
  {
    number: "02",
    title: "Pazaryerlerini Bağlayın",
    description: "API anahtarlarınızı girin ve otomatik senkronizasyonu başlatın.",
  },
  {
    number: "03",
    title: "Ürünleri İçe Aktarın",
    description: "Mevcut ürünlerinizi CSV veya API ile kolayca aktarın.",
  },
  {
    number: "04",
    title: "Satışları Artırın",
    description: "AI destekli önerilerle satışlarınızı optimize edin.",
  },
];

export function StepsSection({
  title,
  subtitle,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: StepsSectionProps) {
  const displayTitle = title || "Başlamak Çok Kolay";
  const displaySubtitle = subtitle || "4 basit adımla hemen başlayın";
  const steps = blocks?.filter(b => b.type === "STEP").map(b => b.content) || defaultSteps;

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{displayTitle}</h2>
          <p className="text-lg text-slate-600">{displaySubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-slate-50 rounded-2xl p-8 h-full">
                <div className="text-4xl font-bold text-orange-200 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <Check className="text-orange-500" size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

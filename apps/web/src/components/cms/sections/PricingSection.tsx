"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultPlans = [
  {
    name: "Başlangıç",
    price: "299",
    period: "ay",
    description: "Küçük işletmeler için ideal",
    features: [
      "5 Pazaryeri Entegrasyonu",
      "1.000 Ürün",
      "Temel AI Özellikleri",
      "E-posta Desteği",
      "Raporlama",
    ],
    cta: "Başla",
    popular: false,
  },
  {
    name: "Profesyonel",
    price: "599",
    period: "ay",
    description: "Büyüyen işletmeler için",
    features: [
      "20 Pazaryeri Entegrasyonu",
      "10.000 Ürün",
      "Gelişmiş AI Özellikleri",
      "7/24 Destek",
      "Gelişmiş Raporlama",
      "API Erişimi",
    ],
    cta: "Başla",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: "Özel",
    period: "",
    description: "Büyük ölçekli operasyonlar için",
    features: [
      "Sınırsız Pazaryeri",
      "Sınırsız Ürün",
      "Özel AI Modelleri",
      "Özel Destek Ekibi",
      "SLA Garantisi",
      "Özel Geliştirme",
    ],
    cta: "İletişim",
    popular: false,
  },
];

export function PricingSection({
  title,
  subtitle,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: PricingSectionProps) {
  const displayTitle = title || "Fiyatlandırma";
  const displaySubtitle = subtitle || "İhtiyacınıza uygun planı seçin";
  const plans = blocks?.length > 0 ? blocks.filter(b => b.type === "PRICING_CARD").map(b => b.content) : defaultPlans;

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
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{displaySubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-8 ${
                plan.popular
                  ? "bg-slate-900 text-white ring-4 ring-blue-500"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-full mb-4">
                  En Popüler
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">₺{plan.price}</span>
                {plan.period && (
                  <span className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-500"}`}>
                    /{plan.period}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={16} className={plan.popular ? "text-blue-400" : "text-green-500"} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

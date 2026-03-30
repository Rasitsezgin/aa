"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  BarChart3, 
  ShoppingCart, 
  Shield, 
  Globe, 
  Headphones,
  TrendingUp,
  Package
} from "lucide-react";

interface FeaturesSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultFeatures = [
  {
    icon: Zap,
    title: "AI Destekli Otomasyon",
    description: "Yapay zeka ile stok, fiyat ve ürün yönetimini otomatikleştirin.",
  },
  {
    icon: Globe,
    title: "50+ Pazaryeri",
    description: "Trendyol, Amazon, Hepsiburada ve daha fazlası tek platformda.",
  },
  {
    icon: BarChart3,
    title: "Gelişmiş Analitik",
    description: "Satış tahminleri, karlılık analizi ve rekabetçi fiyatlandırma.",
  },
  {
    icon: ShoppingCart,
    title: "Tek Tıkla Senkronizasyon",
    description: "Tüm pazaryerlerindeki ürünlerinizi saniyeler içinde güncelleyin.",
  },
  {
    icon: Shield,
    title: "Banka Seviyesinde Güvenlik",
    description: "256-bit şifreleme ve çok faktörlü kimlik doğrulama.",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "AI destekli chatbot ve uzman destek ekibi.",
  },
];

export function FeaturesSection({
  title,
  subtitle,
  bgColor = "bg-slate-50",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: FeaturesSectionProps) {
  // Bloklardan özellikleri çıkar veya varsayılanları kullan
  const featureBlocks = blocks?.filter((b) => b.type === "FEATURE") || [];
  const features = featureBlocks.length > 0 
    ? featureBlocks.map((b) => b.content) 
    : defaultFeatures;

  const displayTitle = title || "Neden Pazaryonetimi?";
  const displaySubtitle = subtitle || "E-ticaret operasyonlarınızı bir üst seviyeye taşıyın";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => {
            const Icon = feature.icon || defaultFeatures[index % defaultFeatures.length].icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

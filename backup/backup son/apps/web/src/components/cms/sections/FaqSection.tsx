"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultFaqs = [
  {
    question: "Pazaryonetimi nedir?",
    answer: "Pazaryonetimi, e-ticaret işletmelerinin birden fazla pazaryerindeki operasyonlarını tek bir platformdan yönetmelerini sağlayan AI destekli bir yazılımdır.",
  },
  {
    question: "Hangi pazaryerlerini destekliyorsunuz?",
    answer: "Trendyol, Hepsiburada, Amazon, N11, Çiçek Sepeti, Gittigidiyor ve 50'den fazla pazaryeri ile entegrasyon sunuyoruz.",
  },
  {
    question: "Ücretsiz deneme süresi var mı?",
    answer: "Evet! 14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz. Kredi kartı gerektirmez.",
  },
  {
    question: "Mevcut sistemimizden veri aktarabilir miyiz?",
    answer: "Kesinlikle! Excel, CSV veya API üzerinden mevcut ürünlerinizi kolayca aktarabilirsiniz.",
  },
];

export function FaqSection({
  title,
  subtitle,
  bgColor = "bg-white",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const displayTitle = title || "Sıkça Sorulan Sorular";
  const displaySubtitle = subtitle || "Merak ettiğiniz soruların cevapları";
  const faqs = blocks?.filter(b => b.type === "FAQ_ITEM").map(b => b.content) || defaultFaqs;

  return (
    <section className={`${padding} ${bgColor} ${textColor}`}>
      <div className={`${container} mx-auto px-4 max-w-3xl`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{displayTitle}</h2>
          <p className="text-lg text-slate-600">{displaySubtitle}</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-slate-600">{faq.answer}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface TestimonialsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  padding?: string;
  container?: string;
  blocks?: any[];
}

const defaultTestimonials = [
  {
    quote: "Pazaryonetimi sayesinde 5 farklı pazaryerindeki stoklarımı tek yerden yönetiyorum. Zamandan ve paradan büyük tasarruf sağladım.",
    author: "Ahmet Yılmaz",
    role: "E-ticaret Müdürü",
    company: "TechStore",
  },
  {
    quote: "AI destekli fiyatlandırma özelliği sayesinde karlılığım %30 arttı. Artık rekabetçi fiyatları anında takip edebiliyorum.",
    author: "Zeynep Kaya",
    role: "İşletme Sahibi",
    company: "ModaDunyasi",
  },
  {
    quote: "7/24 destek ekibi ve AI asistanı sayesinde hiçbir sorunumuz çözümsüz kalmıyor. Kesinlikle tavsiye ederim.",
    author: "Mehmet Demir",
    role: "CEO",
    company: "ElektronikPazari",
  },
];

export function TestimonialsSection({
  title,
  subtitle,
  bgColor = "bg-slate-50",
  textColor = "text-slate-900",
  padding = "py-20",
  container = "container",
  blocks = [],
}: TestimonialsSectionProps) {
  const displayTitle = title || "Müşterilerimiz Ne Diyor?";
  const displaySubtitle = subtitle || "Binlerce işletme Pazaryonetimi'ye güveniyor";
  const testimonials = blocks?.filter(b => b.type === "TESTIMONIAL").map(b => b.content) || defaultTestimonials;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <Quote size={32} className="text-blue-200 mb-4" />
              <p className="text-slate-700 mb-6 leading-relaxed">{testimonial.quote}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.author?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

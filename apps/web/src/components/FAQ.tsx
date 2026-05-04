"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
    {
        q: "Ücretsiz deneme süreci nasıl işliyor?",
        a: "14 gün boyunca tüm özellikleri sınırsız olarak kullanabilirsiniz. Kredi kartı bilgisi istenmez. Deneme süresi sonunda otomatik olarak ücretsiz plana geçersiniz."
    },
    {
        q: "Hangi pazaryerlerini destekliyorsunuz?",
        a: "Trendyol, Hepsiburada, N11, Amazon, Etsy, Shopify, WooCommerce ve daha 30+ global ve yerel pazaryeri ile entegre çalışıyoruz."
    },
    {
        q: "Stok senkronizasyonu ne kadar sürer?",
        a: "Stok ve fiyat güncellemeleri 200ms içinde tüm pazaryerlerine anlık olarak yansır. Bu sayede çoklu satış yapan mağazalarda stok karmaşası yaşanmaz."
    },
    {
        q: "AI SEO özelliği nasıl çalışıyor?",
        a: "Gemini 1.5 tabanlı yapay zeka motorumuz, ürün başlıklarınızı, açıklamalarınızı ve etiketlerinizi otomatik olarak optimize eder. Arama sonuçlarında daha üst sıralarda yer almanızı sağlar."
    },
    {
        q: "İptal etmem gerekirse ne olur?",
        a: "İstediğiniz zaman aboneliğinizi iptal edebilirsiniz. Herhangi bir ceza veya gizli ücret uygulanmaz. Verileriniz 30 gün boyunca saklanır."
    }
];

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export default function FAQ({ texts = HOMEPAGE_TEXTS.faq }: { texts?: typeof HOMEPAGE_TEXTS.faq }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute top-1/4 right-0 w-[300px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-6 shadow-sm dark:shadow-none"
                    >
                        <HelpCircle size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">{texts.badge}</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">
                        {texts.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">{texts.subtitle}</p>
                </div>

                <div className="space-y-4">
                    {texts.items.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${openIndex === i
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 shadow-xl shadow-blue-500/5'
                                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg'
                                }`}
                        >
                            <motion.button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                whileHover={{ x: 4 }}
                                className="w-full px-8 py-6 flex justify-between items-center text-left group"
                            >
                                <motion.span 
                                    animate={{ color: openIndex === i ? 'rgb(37,99,235)' : 'rgb(15,23,42)' }}
                                    className={`font-bold text-lg transition-colors ${openIndex === i ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                    }`}
                                >{faq.q}</motion.span>
                                <motion.div 
                                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === i
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20'
                                        }`}
                                >
                                    <Plus size={18} className={openIndex === i ? 'rotate-45' : ''} />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence mode="wait">
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.3 }}
                                            className="px-8 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-blue-100 dark:border-blue-500/20 pt-4"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

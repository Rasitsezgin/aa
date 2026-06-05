"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Phone, Send, MessageCircle, Sparkles, MapPin, Clock, 
    Users, Building2, CheckCircle2, ArrowRight, Headphones, 
    MessageSquare, Globe, Calendar, Shield, Star, Zap, ChevronDown,
    Linkedin, Twitter, Instagram, Youtube
} from 'lucide-react';

const CONTACT_DATA = {
    hero: {
        badge: "7/24 Destek",
        title: "Yanınızdayız.",
        subtitle: "Her Adımda",
        description: "Sorularınız, önerileriniz veya işbirliği fırsatları için bizimle iletişime geçin. Uzman ekibimiz size yardımcı olmak için hazır."
    },
    contactMethods: [
        {
            icon: Headphones,
            label: 'Canlı Destek',
            value: 'Hemen Başlayın',
            desc: 'Ortalama yanıt süresi: 2 dakika',
            color: 'from-green-500 to-emerald-500',
            action: 'chat'
        },
        {
            icon: Phone,
            label: 'Telefon',
            value: '0850 123 45 67',
            desc: 'Hafta içi 09:00 - 22:00',
            color: 'from-orange-500 to-amber-500',
            action: 'tel:+908501234567'
        },
        {
            icon: Mail,
            label: 'E-posta',
            value: 'destek@pazaryonetimi.com',
            desc: '24 saat içinde yanıt',
            color: 'from-purple-500 to-pink-500',
            action: 'mailto:destek@pazaryonetimi.com'
        },
        {
            icon: MessageSquare,
            label: 'WhatsApp',
            value: '+90 532 123 45 67',
            desc: 'Anlık iletişim',
            color: 'from-emerald-500 to-teal-500',
            action: 'https://wa.me/905321234567'
        }
    ],
    offices: [
        {
            city: 'İstanbul',
            type: 'Merkez Ofis',
            address: 'Maslak Mahallesi, Ahi Evran Caddesi No:6, Spine Tower Kat:18, Sarıyer/İstanbul',
            phone: '+90 212 123 45 67',
            email: 'istanbul@pazaryonetimi.com',
            hours: 'Hafta içi 09:00 - 18:00',
            mapUrl: '#'
        },
        {
            city: 'Ankara',
            type: 'Bölge Ofisi',
            address: 'Çankaya Mahallesi, Atatürk Bulvarı No:123, Çankaya/Ankara',
            phone: '+90 312 123 45 67',
            email: 'ankara@pazaryonetimi.com',
            hours: 'Hafta içi 09:00 - 18:00',
            mapUrl: '#'
        },
        {
            city: 'İzmir',
            type: 'Bölge Ofisi',
            address: 'Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No:45, Konak/İzmir',
            phone: '+90 232 123 45 67',
            email: 'izmir@pazaryonetimi.com',
            hours: 'Hafta içi 09:00 - 18:00',
            mapUrl: '#'
        }
    ],
    stats: [
        { value: '5.000+', label: 'Aktif Müşteri', icon: Users },
        { value: '< 2dk', label: 'Ortalama Yanıt', icon: Clock },
        { value: '%98', label: 'Memnuniyet', icon: Star },
        { value: '7/24', label: 'Destek', icon: Shield }
    ],
    departments: [
        { name: 'Satış', email: 'satis@pazaryonetimi.com', desc: 'Fiyat teklifi ve paket seçimi' },
        { name: 'Teknik Destek', email: 'teknik@pazaryonetimi.com', desc: 'Teknik sorunlar ve entegrasyon' },
        { name: 'Finans', email: 'finans@pazaryonetimi.com', desc: 'Fatura ve ödeme işlemleri' },
        { name: 'İş Birlikleri', email: 'partner@pazaryonetimi.com', desc: 'Bayilik ve iş ortaklığı' }
    ],
    faqs: [
        {
            q: 'Destek hattına nasıl ulaşabilirim?',
            a: 'Canlı destek, telefon, e-posta ve WhatsApp üzerinden 7/24 bize ulaşabilirsiniz. En hızlı yanıt için canlı destek önerilir.'
        },
        {
            q: 'Demo toplantısı nasıl ayarlayabilirim?',
            a: 'İletişim formunu doldurun veya satış ekibimizi arayın. 30 dakikalık ücretsiz demo toplantısı için uygun bir zaman belirleyelim.'
        },
        {
            q: 'Teknik destek süresi ne kadar?',
            a: 'Profesyonel ve Kurumsal planlarda 7/24 teknik destek sunuyoruz. Başlangıç planında hafta içi mesai saatlerinde destek verilir.'
        }
    ],
    social: [
        { icon: Linkedin, url: '#', label: 'LinkedIn' },
        { icon: Twitter, url: '#', label: 'Twitter' },
        { icon: Instagram, url: '#', label: 'Instagram' },
        { icon: Youtube, url: '#', label: 'YouTube' }
    ]
};

const FormInput = ({ label, type = 'text', placeholder, required = true, className = '' }: {
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
    className?: string;
}) => (
    <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                required={required}
                className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-medium text-slate-900 dark:text-white outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder={placeholder}
            />
        ) : type === 'select' ? (
            <div className="relative">
                <select
                    required={required}
                    className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 font-medium text-slate-900 dark:text-white outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all appearance-none cursor-pointer"
                >
                    <option value="">{placeholder}</option>
                    <option value="satis">Satış / Fiyat Teklifi</option>
                    <option value="destek">Teknik Destek</option>
                    <option value="demo">Demo Talebi</option>
                    <option value="partner">İş Birliği</option>
                    <option value="diger">Diğer</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
        ) : (
            <input
                type={type}
                required={required}
                className="w-full h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 font-medium text-slate-900 dark:text-white outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder={placeholder}
            />
        )}
    </div>
);

export default function ContactView() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-100 dark:border-green-500/20 rounded-full mb-8"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">{CONTACT_DATA.hero.badge}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[0.95]"
                            >
                                {CONTACT_DATA.hero.subtitle}
                                <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {CONTACT_DATA.hero.title}
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-lg"
                            >
                                {CONTACT_DATA.hero.description}
                            </motion.p>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                                {CONTACT_DATA.stats.map((stat, i) => (
                                    <div key={i} className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                        <stat.icon size={20} className="mx-auto mb-2 text-green-600 dark:text-green-400" />
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right - Contact Methods */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {CONTACT_DATA.contactMethods.map((method, i) => (
                                <motion.a
                                    key={i}
                                    href={method.action !== 'chat' ? method.action : '#'}
                                    onClick={method.action === 'chat' ? (e) => { e.preventDefault(); /* open chat */ } : undefined}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="group p-6 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10 transition-all cursor-pointer"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <method.icon size={24} className="text-white" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{method.label}</div>
                                    <div className="text-xl font-black text-slate-900 dark:text-white mb-1">{method.value}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{method.desc}</div>
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3"
                        >
                            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                        <Send size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bize Yazın</h2>
                                        <p className="text-slate-500 dark:text-slate-400">24 saat içinde size dönüş yapalım</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="Adınız Soyadınız" placeholder="Ahmet Yılmaz" />
                                        <FormInput label="Firma Adı" placeholder="ABC Ticaret Ltd." required={false} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="E-posta Adresi" type="email" placeholder="ahmet@firma.com" />
                                        <FormInput label="Telefon Numarası" type="tel" placeholder="+90 532 123 45 67" />
                                    </div>
                                    <FormInput label="Konu" type="select" placeholder="Konu seçiniz" />
                                    <FormInput label="Mesajınız" type="textarea" placeholder="Size nasıl yardımcı olabiliriz? Lütfen detaylı açıklayın..." />

                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                        <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-green-600 focus:ring-green-500" />
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-bold">KVKK Aydınlatma Metni</span>'ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Gönderiliyor...
                                            </>
                                        ) : isSuccess ? (
                                            <>
                                                <CheckCircle2 size={20} />
                                                Mesajınız İletildi!
                                            </>
                                        ) : (
                                            <>
                                                Mesaj Gönder
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Departments */}
                            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Departmanlar</h3>
                                <div className="space-y-4">
                                    {CONTACT_DATA.departments.map((dept, i) => (
                                        <a
                                            key={i}
                                            href={`mailto:${dept.email}`}
                                            className="block p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-900 dark:text-white">{dept.name}</span>
                                                <ArrowRight size={16} className="text-slate-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{dept.desc}</div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Sosyal Medya</h3>
                                <div className="flex gap-3">
                                    {CONTACT_DATA.social.map((s, i) => (
                                        <a
                                            key={i}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-green-500 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                                        >
                                            <s.icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Quick FAQ */}
                            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Hızlı SSS</h3>
                                <div className="space-y-3">
                                    {CONTACT_DATA.faqs.map((faq, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full text-left p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white pr-4">{faq.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                            </div>
                                            <AnimatePresence>
                                                {openFaq === i && (
                                                    <motion.p
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="text-sm text-slate-500 dark:text-slate-400 mt-3 overflow-hidden"
                                                    >
                                                        {faq.a}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Offices Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                        >
                            Ofislerimiz
                        </motion.h2>
                        <p className="text-slate-600 dark:text-slate-400">Türkiye'nin 3 büyük şehrinde hizmetinizdeyiz</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CONTACT_DATA.offices.map((office, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-xl transition-all"
                            >
                                {/* City Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">{office.type}</span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{office.city}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <Building2 size={20} className="text-white" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{office.address}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-slate-400" />
                                        <a href={`tel:${office.phone}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium">{office.phone}</a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail size={18} className="text-slate-400" />
                                        <a href={`mailto:${office.email}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium">{office.email}</a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400" />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{office.hours}</span>
                                    </div>
                                </div>

                                {/* Map Button */}
                                <a
                                    href={office.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Globe size={16} />
                                    Haritada Göster
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/10 dark:to-white/5 p-12 md:p-20"
                    >
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8">
                                <Calendar size={16} className="text-white" />
                                <span className="text-sm font-bold text-white/90">30 Dakikalık Ücretsiz Demo</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                                Platformumuzu Tanıyın
                            </h2>

                            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                                Uzman ekibimizden birebir demo alın. İhtiyaçlarınıza özel çözümler sunalım.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a href="#" className="group px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:scale-105 flex items-center gap-2">
                                    Demo Randevusu Al
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a href="tel:+908501234567" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
                                    <Phone size={20} />
                                    Hemen Ara
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}

"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift, Users, ArrowRight, Copy, CheckCircle2, Share2,
    Award, Star, Target, Twitter, Facebook,
    Linkedin, MessageCircle, Sparkles, Crown, Medal,
    ChevronRight, ExternalLink, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

const tiers = [
    {
        name: 'Starter',
        icon: Star,
        color: 'from-slate-400 to-slate-600',
        referrals: '1-5',
        reward: '₺500',
        perReferral: '₺100',
        benefits: ['Referans başına ₺100', 'Aylık ödeme', 'Dashboard erişimi']
    },
    {
        name: 'Pro',
        icon: Medal,
        color: 'from-orange-500 to-amber-600',
        referrals: '6-20',
        reward: '₺2,500',
        perReferral: '₺125',
        benefits: ['Referans başına ₺125', 'Haftalık ödeme', 'Öncelikli destek', 'Özel kampanyalar']
    },
    {
        name: 'Elite',
        icon: Award,
        color: 'from-purple-500 to-pink-600',
        referrals: '21-50',
        reward: '₺7,500',
        perReferral: '₺150',
        benefits: ['Referans başına ₺150', 'Anlık ödeme', 'Dedicated manager', 'Co-marketing fırsatları']
    },
    {
        name: 'Champion',
        icon: Crown,
        color: 'from-amber-500 to-orange-600',
        referrals: '50+',
        reward: '₺15,000+',
        perReferral: '₺200',
        benefits: ['Referans başına ₺200', 'Anlık ödeme', 'VIP etkinlikler', 'Özel komşisyon oranları', 'Yıllık bonus']
    }
];

const howItWorks = [
    { step: 1, title: 'Kaydol', description: 'Ücretsiz referans hesabı oluştur', icon: Users },
    { step: 2, title: 'Paylaş', description: 'Benzersiz referans linkini paylaş', icon: Share2 },
    { step: 3, title: 'Kazandır', description: 'Arkadaşların kayıt olup abone olsun', icon: Target },
    { step: 4, title: 'Kazan', description: 'Her kayıt için ödül kazan', icon: Gift },
];

const testimonials = [
    {
        name: 'Ayşe Yılmaz',
        role: 'E-ticaret Danışmanı',
        image: 'AY',
        earning: '₺12,500',
        referrals: 45,
        quote: 'Müşterilerime zaten öneriyordum, şimdi hem onlara hem kendime fayda sağlıyorum.'
    },
    {
        name: 'Mehmet Demir',
        role: 'Dijital Pazarlama Uzmanı',
        image: 'MD',
        earning: '₺8,200',
        referrals: 32,
        quote: 'Referans programı sayesinde yan gelir elde ediyorum. Sistem çok kolay.'
    },
    {
        name: 'Can Özkan',
        role: 'E-ticaret Satıcısı',
        image: 'CO',
        earning: '₺5,800',
        referrals: 24,
        quote: 'Arkadaşlarıma tavsiye ettim, hem onlar büyüdü hem ben kazandım.'
    }
];

const faqs = [
    {
        q: 'Referans programına kimler katılabilir?',
        a: 'Herkes referans programına katılabilir. Mevcut Pazaryonetimi kullanıcısı olmanıza gerek yok.'
    },
    {
        q: 'Kazançlarımı nasıl çekebilirim?',
        a: 'Minimum ₺500 bakiyeye ulaştığınızda IBAN\'ınıza transfer yapabilirsiniz. Pro ve üzeri üyeler için minimum limit yoktur.'
    },
    {
        q: 'Referanslarım ne zaman sayılır?',
        a: 'Referansınız kayıt olduktan ve ilk ödemeyi yaptıktan sonra kazancınız hesabınıza tanımlanır.'
    },
    {
        q: 'Referans linkim ne kadar süre geçerli?',
        a: 'Referans linkiniz süresiz geçerlidir. Cookie süresi 90 gündür.'
    }
];

export default function ReferralPage() {
    const [copied, setCopied] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const referralLink = 'https://pazaryonetimi.com/ref/abc123';

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const shareOptions = [
        { name: 'Twitter', icon: Twitter, color: 'bg-sky-500', url: `https://twitter.com/intent/tweet?text=Pazaryonetimi%20ile%20e-ticaret%20yönetimimi%20kolaylaştırdım!%20${referralLink}` },
        { name: 'Facebook', icon: Facebook, color: 'bg-orange-600', url: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}` },
        { name: 'LinkedIn', icon: Linkedin, color: 'bg-orange-600', url: `https://www.linkedin.com/shareArticle?mini=true&url=${referralLink}` },
        { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', url: `https://wa.me/?text=Pazaryonetimi%20ile%20e-ticaret%20yönetimimi%20kolaylaştırdım!%20${referralLink}` },
    ];

    const stats = [
        { value: '₺2.5M+', label: 'Toplam Ödenen' },
        { value: '5,000+', label: 'Aktif Referrer' },
        { value: '₺500', label: 'Ort. Aylık Kazanç' },
        { value: '24 saat', label: 'Ödeme Süresi' },
    ];

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-pink-500/10 dark:bg-pink-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/20 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-100 to-violet-100 dark:from-pink-900/40 dark:to-violet-900/40 border border-pink-200/50 dark:border-pink-700/50 rounded-full mb-8"
                    >
                        <Gift size={16} className="text-pink-600 dark:text-pink-400" />
                        <span className="text-sm font-bold text-pink-700 dark:text-pink-300 tracking-wide">REFERANS PROGRAMI</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Paylaş,{' '}
                        <span className="bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Kazan
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                        Pazaryonetimi&apos;ni arkadaşlarınıza önerin.
                        <span className="text-pink-600 dark:text-pink-400 font-semibold"> Her başarılı kayıt için ₺200&apos;e kadar kazanın!</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-12 mb-12"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Signup Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-xl mx-auto"
                    >
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-posta adresinizi girin"
                                    required
                                    className="w-full px-6 py-5 pr-40 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-lg"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-pink-600 to-violet-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-violet-700 transition-all"
                                >
                                    Programa Katıl
                                </button>
                            </form>
                        ) : (
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-900/20 dark:to-violet-900/20 border border-pink-200/50 dark:border-pink-700/30">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hoş Geldiniz!</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">Referans linkiniz hazır. Paylaşmaya başlayın!</p>

                                {/* Referral Link */}
                                <div className="p-4 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 mb-4">
                                    <div className="flex items-center gap-3">
                                        <LinkIcon size={18} className="text-slate-400" />
                                        <span className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate">{referralLink}</span>
                                        <button
                                            onClick={copyLink}
                                            className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg font-medium text-sm hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors flex items-center gap-2"
                                        >
                                            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                            {copied ? 'Kopyalandı!' : 'Kopyala'}
                                        </button>
                                    </div>
                                </div>

                                {/* Share Buttons */}
                                <div className="flex justify-center gap-3">
                                    {shareOptions.map((option, i) => (
                                        <a
                                            key={i}
                                            href={option.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center text-white hover:opacity-90 transition-opacity`}
                                        >
                                            <option.icon size={18} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nasıl Çalışır?</h2>
                        <p className="text-slate-600 dark:text-slate-400">4 basit adımda kazanmaya başlayın</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {howItWorks.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:shadow-xl transition-all">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/10 to-violet-500/10 dark:from-pink-500/20 dark:to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                                        <step.icon size={24} className="text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center absolute -top-3 -right-3">
                                        {step.step}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                                </div>
                                {i < 3 && (
                                    <ChevronRight size={24} className="absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 dark:text-slate-600 hidden md:block" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Reward Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ödül Seviyeleri</h2>
                        <p className="text-slate-600 dark:text-slate-400">Ne kadar çok referans, o kadar yüksek kazanç</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {tiers.map((tier, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative rounded-2xl overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 dark:opacity-10`} />
                                <div className="relative p-6 border border-slate-200 dark:border-white/10 rounded-2xl h-full flex flex-col">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                                        <tier.icon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{tier.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{tier.referrals} referans</p>

                                    <div className="mb-4">
                                        <div className="text-3xl font-black text-slate-900 dark:text-white">{tier.perReferral}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">referans başına</div>
                                    </div>

                                    <ul className="space-y-2 mt-auto">
                                        {tier.benefits.map((benefit, j) => (
                                            <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle2 size={14} className="text-pink-500" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Başarı Hikayeleri</h2>
                        <p className="text-slate-600 dark:text-slate-400">Referans programından kazananlar</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold">
                                        {t.image}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{t.role}</div>
                                    </div>
                                </div>

                                <p className="text-slate-600 dark:text-slate-400 italic mb-4">&ldquo;{t.quote}&rdquo;</p>

                                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-white/10">
                                    <div>
                                        <div className="text-2xl font-black text-pink-600 dark:text-pink-400">{t.earning}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Toplam Kazanç</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{t.referrals}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Referans</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Sıkça Sorulan Sorular</h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-5 text-left flex items-center justify-between bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-bold text-slate-900 dark:text-white">{faq.q}</span>
                                    <ChevronRight size={20} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-violet-600 to-purple-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                                <Sparkles size={32} className="text-white" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Bugün Kazanmaya Başla
                            </h3>
                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Referans programına katılmak ücretsiz ve sadece birkaç dakika sürüyor.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="px-8 py-4 bg-white text-pink-700 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Hemen Katıl
                                    <ArrowRight size={18} />
                                </button>
                                <Link
                                    href="/partner"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    Partner Programı
                                    <ExternalLink size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
    Rocket, Mail, Lock, User, Building2, Phone, Eye, EyeOff,
    CheckCircle, ArrowRight, Sparkles, Shield, Zap, Clock,
    CreditCard, Globe, Package, BarChart3, Users, Gift, AlertCircle, Loader2
} from 'lucide-react';
import { DEFAULT_PRICING_CATALOG, formatTryAmount, type PricingCatalog } from '@/config/pricing-catalog';

const DEFAULT_STARTER = DEFAULT_PRICING_CATALOG.plans.find((plan) => plan.id === 'starter')!;
const DEFAULT_PROFESSIONAL = DEFAULT_PRICING_CATALOG.plans.find((plan) => plan.id === 'professional')!;
const DEFAULT_ENTERPRISE = DEFAULT_PRICING_CATALOG.plans.find((plan) => plan.id === 'enterprise')!;

const benefits = [
    { icon: Clock, title: '14 Gün Ücretsiz', description: 'Kredi kartı gerekmez' },
    { icon: Package, title: 'Tüm Özellikler', description: 'Sınırsız erişim' },
    { icon: Users, title: '25K+ Satıcı', description: 'Güvenle kullanıyor' },
    { icon: Shield, title: 'Veri Güvenliği', description: 'SSL & KVKK uyumlu' },
];

const includedFeatures = [
    'Trendyol, Hepsiburada, Amazon, N11 entegrasyonu',
    'Sınırsız ürün ve sipariş yönetimi',
    'Gerçek zamanlı stok senkronizasyonu',
    'Detaylı analitik ve raporlama',
    'AI destekli fiyatlandırma önerileri',
    '7/24 e-posta ve chat desteği',
];

const DEFAULT_SIGNUP_PLANS = [
    {
        id: 'starter',
        name: DEFAULT_STARTER.name,
        price: DEFAULT_STARTER.monthly !== null ? `₺${formatTryAmount(DEFAULT_STARTER.monthly)}` : 'Ozel',
        period: DEFAULT_STARTER.monthly !== null ? '/ay' : '',
        description: DEFAULT_STARTER.signupDescription,
    },
    {
        id: 'professional',
        name: DEFAULT_PROFESSIONAL.name,
        price: DEFAULT_PROFESSIONAL.monthly !== null ? `₺${formatTryAmount(DEFAULT_PROFESSIONAL.monthly)}` : 'Ozel',
        period: DEFAULT_PROFESSIONAL.monthly !== null ? '/ay' : '',
        description: DEFAULT_PROFESSIONAL.signupDescription,
        popular: true,
    },
    {
        id: 'enterprise',
        name: DEFAULT_ENTERPRISE.name,
        price: DEFAULT_ENTERPRISE.enterpriseLabel ?? 'Ozel',
        period: '',
        description: DEFAULT_ENTERPRISE.signupDescription,
    },
];

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('professional');
    const [plans, setPlans] = useState(DEFAULT_SIGNUP_PLANS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        password: '',
        subdomain: '',
        acceptTerms: false,
        acceptMarketing: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        const selected = new URLSearchParams(window.location.search).get('plan');
        if (selected === 'starter' || selected === 'professional' || selected === 'enterprise') {
            setSelectedPlan(selected);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadPricingCatalog = async () => {
            try {
                const res = await fetch('/api/pricing-catalog', { cache: 'no-store' });
                if (!res.ok) return;

                const catalog = (await res.json()) as PricingCatalog;
                const starter = catalog.plans.find((plan) => plan.id === 'starter') ?? DEFAULT_PRICING_CATALOG.plans[0];
                const professional = catalog.plans.find((plan) => plan.id === 'professional') ?? DEFAULT_PRICING_CATALOG.plans[1];
                const enterprise = catalog.plans.find((plan) => plan.id === 'enterprise') ?? DEFAULT_PRICING_CATALOG.plans[2];

                if (isMounted) {
                    setPlans([
                        {
                            id: 'starter',
                            name: starter.name,
                            price: starter.monthly !== null ? `₺${formatTryAmount(starter.monthly)}` : 'Ozel',
                            period: starter.monthly !== null ? '/ay' : '',
                            description: starter.signupDescription,
                        },
                        {
                            id: 'professional',
                            name: professional.name,
                            price: professional.monthly !== null ? `₺${formatTryAmount(professional.monthly)}` : 'Ozel',
                            period: professional.monthly !== null ? '/ay' : '',
                            description: professional.signupDescription,
                            popular: true,
                        },
                        {
                            id: 'enterprise',
                            name: enterprise.name,
                            price: enterprise.enterpriseLabel ?? 'Ozel',
                            period: '',
                            description: enterprise.signupDescription,
                        },
                    ]);
                }
            } catch {
                // Varsayilan planlar ile devam et
            }
        };

        loadPricingCatalog();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (step < 2) {
            // Validate step 1
            if (!formData.firstName.trim() || !formData.email.trim()) {
                setError('Adınız ve e-posta adresi zorunludur.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError('Geçerli bir e-posta adresi giriniz.');
                return;
            }
            setStep(step + 1);
        } else {
            // Submit registration
            if (!formData.password || formData.password.length < 8) {
                setError('Şifre en az 8 karakter olmalıdır.');
                return;
            }
            if (!formData.acceptTerms) {
                setError('Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz.');
                return;
            }

            setIsLoading(true);
            try {
                // Register user
                const registerRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        company: formData.company,
                        phone: formData.phone,
                        subdomain: formData.subdomain,
                    }),
                });

                if (!registerRes.ok) {
                    const data = await registerRes.json();
                    throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
                }

                setSuccess(true);

                // Auto login after successful registration
                setTimeout(async () => {
                    await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        callbackUrl: '/dashboard',
                    });
                }, 1500);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
                setIsLoading(false);
            }
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

                    {/* Left Side - Benefits */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:block sticky top-32"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                            <Gift size={16} />
                            14 Gün Ücretsiz Deneme
                        </span>

                        <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
                            E-ticaretinizi
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Bir Üst Seviyeye
                            </span>
                            <br />
                            Taşıyın
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                            Türkiye&apos;nin en kapsamlı pazaryeri yönetim platformuna katılın.
                            Kredi kartı gerekmez, iptal ücreti yok.
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                >
                                    <benefit.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                                    <h3 className="font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Included Features */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] border border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sparkles className="text-yellow-500" size={20} />
                                Deneme Süresinde Dahil
                            </h3>
                            <ul className="space-y-3">
                                {includedFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Trust Badge */}
                        <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <Shield size={20} />
                            <span>256-bit SSL şifreleme ile güvende</span>
                        </div>
                    </motion.div>

                    {/* Right Side - Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">

                            {/* Progress Steps */}
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Adım {step} / 2
                                    </span>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {step === 1 ? 'Hesap Bilgileri' : 'Plan Seçimi'}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                        initial={{ width: '50%' }}
                                        animate={{ width: step === 1 ? '50%' : '100%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                                    </motion.div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 flex items-start gap-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Kayıt başarılı! Panelinize yönlendiriliyorsunuz...</p>
                                    </motion.div>
                                )}

                                {step === 1 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-5"
                                    >
                                        <div className="text-center mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
                                                <Rocket className="w-7 h-7 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                Ücretsiz Denemeye Başlayın
                                            </h2>
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                                2 dakikada hesabınızı oluşturun
                                            </p>
                                        </div>

                                        {/* Name Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Ad
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        placeholder="Ahmet"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Soyad
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    placeholder="Yılmaz"
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                İş E-postası
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="ahmet@sirketiniz.com"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Telefon
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="0532 123 45 67"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Şirket / Mağaza Adı
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    placeholder="Şirketiniz A.Ş."
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Şifre
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Min. 8 karakter"
                                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subdomain */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Mağaza URL&apos;niz
                                            </label>
                                            <div className="relative flex items-center">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="subdomain"
                                                    value={formData.subdomain}
                                                    onChange={handleInputChange}
                                                    placeholder="magazaniz"
                                                    className="w-full pl-12 pr-40 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                                <span className="absolute right-4 text-sm text-slate-500 dark:text-slate-400">
                                                    .pazaryonetimi.com
                                                </span>
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="space-y-3 pt-2">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="acceptTerms"
                                                    checked={formData.acceptTerms}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-blue-500 mt-0.5"
                                                    required
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    <Link href="/terms" className="text-blue-600 hover:underline">Kullanım Şartları</Link> ve{' '}
                                                    <Link href="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası</Link>&apos;nı kabul ediyorum.
                                                </span>
                                            </label>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="acceptMarketing"
                                                    checked={formData.acceptMarketing}
                                                    onChange={handleInputChange}
                                                    className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-blue-500 mt-0.5"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    E-ticaret ipuçları ve ürün güncellemeleri almak istiyorum.
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Kontrol Ediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    Devam Et
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
                                                <Zap className="w-7 h-7 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                Planınızı Seçin
                                            </h2>
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                                14 gün sonra seçtiğiniz plana geçiş yapılır
                                            </p>
                                        </div>

                                        {/* Plan Selection */}
                                        <div className="space-y-3">
                                            {plans.map((plan) => (
                                                <label
                                                    key={plan.id}
                                                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="radio"
                                                                name="plan"
                                                                value={plan.id}
                                                                checked={selectedPlan === plan.id}
                                                                onChange={(e) => setSelectedPlan(e.target.value)}
                                                                className="w-5 h-5 text-blue-600 border-slate-300 dark:border-white/20 focus:ring-blue-500"
                                                            />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                                        {plan.name}
                                                                    </span>
                                                                    {plan.popular && (
                                                                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                                                                            Popüler
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {plan.description}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                                {plan.price}
                                                            </span>
                                                            <span className="text-slate-500 dark:text-slate-400">
                                                                {plan.period}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Info Box */}
                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                                            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                                                <CreditCard className="w-5 h-5 shrink-0 mt-0.5" />
                                                14 gün boyunca ücretsiz kullanın. Deneme süresi bitiminde otomatik ödeme alınmaz, plan seçimi yapmanız gerekir.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                disabled={isLoading}
                                                className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Geri
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 size={20} className="animate-spin" />
                                                        Kayıt Yapılıyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={20} />
                                                        Ücretsiz Denemeyi Başlat
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Login Link */}
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Zaten hesabınız var mı?{' '}
                                    </span>
                                    <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                        Giriş Yap
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Mobile Benefits */}
                        <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                >
                                    <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{benefit.title}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}

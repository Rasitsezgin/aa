'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    Target, 
    TrendingUp, 
    Users, 
    ShoppingCart, 
    Clock, 
    Zap,
    Sparkles,
    ArrowRight,
    Settings,
    BarChart3,
    Globe,
    Lightbulb
} from 'lucide-react';

interface AIPersonalizationProps {
    features?: {
        aiPersonalization?: {
            enabled: boolean;
            showRecommendations: boolean;
            behaviorTracking: boolean;
            dynamicContent: boolean;
        };
    };
}

interface UserProfile {
    industry: string;
    companySize: string;
    interests: string[];
    behavior: {
        pagesViewed: number;
        timeSpent: number;
        interactions: number;
        lastVisit: string;
    };
    recommendations: {
        features: string[];
        pricing: string;
        content: string[];
    };
}

export const AIPersonalization = ({ features }: AIPersonalizationProps) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showPersonalizedContent, setShowPersonalizedContent] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [companySize, setCompanySize] = useState('');
    
    const showRecommendations = features?.aiPersonalization?.showRecommendations !== false;
    const behaviorTracking = features?.aiPersonalization?.behaviorTracking !== false;
    const dynamicContent = features?.aiPersonalization?.dynamicContent !== false;

    const industries = [
        { id: 'fashion', name: 'Moda & Tekstil', icon: '👗', color: 'from-pink-500 to-rose-500' },
        { id: 'electronics', name: 'Elektronik', icon: '📱', color: 'from-blue-500 to-cyan-500' },
        { id: 'home', name: 'Ev & Yaşam', icon: '🏠', color: 'from-emerald-500 to-green-500' },
        { id: 'beauty', name: 'Kozmetik', icon: '💄', color: 'from-purple-500 to-pink-500' },
        { id: 'sports', name: 'Spor & Outdoor', icon: '⚽', color: 'from-orange-500 to-red-500' },
        { id: 'books', name: 'Kitap & Medya', icon: '📚', color: 'from-indigo-500 to-purple-500' }
    ];

    const companySizes = [
        { id: 'startup', name: 'Startup (1-10)', description: 'Yeni başlayan işletmeler' },
        { id: 'small', name: 'Küçük (11-50)', description: 'Küçük ölçekli işletmeler' },
        { id: 'medium', name: 'Orta (51-200)', description: 'Orta ölçekli işletmeler' },
        { id: 'large', name: 'Büyük (200+)', description: 'Büyük ölçekli işletmeler' },
        { id: 'enterprise', name: 'Kurumsal', description: 'Kurumsal düzey' }
    ];

    useEffect(() => {
        if (!features?.aiPersonalization?.enabled) return;

        // Simulate behavior tracking
        if (behaviorTracking) {
            const trackBehavior = () => {
                const existingProfile = localStorage.getItem('user_profile');
                if (existingProfile) {
                    const parsed = JSON.parse(existingProfile);
                    setProfile(parsed);
                    setShowPersonalizedContent(true);
                }
            };

            trackBehavior();
        }
    }, [behaviorTracking, features?.aiPersonalization?.enabled]);

    const analyzeUser = async () => {
        if (!selectedIndustry || !companySize) return;

        setIsAnalyzing(true);

        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000));

        const userProfile: UserProfile = {
            industry: selectedIndustry,
            companySize: companySize,
            interests: generateInterests(selectedIndustry, companySize),
            behavior: {
                pagesViewed: Math.floor(Math.random() * 10) + 5,
                timeSpent: Math.floor(Math.random() * 300) + 120,
                interactions: Math.floor(Math.random() * 20) + 5,
                lastVisit: new Date().toISOString()
            },
            recommendations: generateRecommendations(selectedIndustry, companySize)
        };

        setProfile(userProfile);
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
        setShowPersonalizedContent(true);
        setIsAnalyzing(false);
    };

    const generateInterests = (industry: string, size: string): string[] => {
        const baseInterests = ['stok yönetimi', 'fiyatlandırma', 'sipariş yönetimi'];
        const industrySpecific = {
            fashion: ['sezonluk planlama', 'beden yönetimi', 'trend analizi'],
            electronics: ['teknik özellikler', 'garanti yönetimi', 'servis takibi'],
            home: ['dekorasyon', 'mevsim kampanyaları', 'stok optimizasyonu'],
            beauty: ['barkod takibi', 'son kullanma tarihi', 'campaign yönetimi'],
            sports: ['kategori yönetimi', 'marka takibi', 'sezon planlama'],
            books: ['yazar yönetimi', 'kategori sıralama', 'kampanya optimizasyonu']
        };

        return [...baseInterests, ...(industrySpecific[industry as keyof typeof industrySpecific] || [])];
    };

    const generateRecommendations = (industry: string, size: string) => {
        const features = {
            startup: ['hızlı kurulum', 'otomatik stok', 'basit raporlama'],
            small: ['çoklu platform', 'fiyat optimizasyonu', 'müşteri analizi'],
            medium: ['AI önerileri', 'detaylı raporlama', 'ekip yönetimi'],
            large: ['API entegrasyonu', 'özel çözümler', 'kurumsal destek'],
            enterprise: ['white-label', 'özel development', '7/24 destek']
        };

        return {
            features: features[size as keyof typeof features] || [],
            pricing: size === 'startup' ? 'Starter' : size === 'enterprise' ? 'Enterprise' : 'Professional',
            content: [
                `${industry} sektörü için özel rehber`,
                `${size} işletmeler için başarı hikayeleri`,
                'Özel webinar davetleri'
            ]
        };
    };

    if (!features?.aiPersonalization?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground">AI Personalizasyon Motoru</h3>
                        <p className="text-sm text-slate-500">Size özel deneyim için analiz edelim</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {!showPersonalizedContent ? (
                    /* Setup Form */
                    <div className="space-y-8">
                        {/* Industry Selection */}
                        <div>
                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Sektörünüz nedir?
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {industries.map((industry) => (
                                    <motion.button
                                        key={industry.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedIndustry(industry.id)}
                                        className={`p-4 rounded-xl border transition-all ${
                                            selectedIndustry === industry.id
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <div className={`text-2xl mb-2 bg-gradient-to-r ${industry.color} bg-clip-text text-transparent`}>
                                            {industry.icon}
                                        </div>
                                        <div className="text-sm font-bold text-foreground">{industry.name}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Company Size */}
                        <div>
                            <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Şirket büyüklüğünüz?
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {companySizes.map((size) => (
                                    <motion.button
                                        key={size.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCompanySize(size.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            companySize === size.id
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="text-sm font-bold text-foreground">{size.name}</div>
                                        <div className="text-xs text-slate-500">{size.description}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={analyzeUser}
                            disabled={!selectedIndustry || !companySize || isAnalyzing}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Brain className="w-5 h-5" />
                                    </motion.div>
                                    AI Analiz Ediyor...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    AI ile Analiz Et
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </div>
                ) : (
                    /* Personalized Content */
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* User Profile Summary */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-foreground">Profiliniz Oluşturuldu!</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-green-600 font-bold">AI Aktif</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">
                                            {industries.find(i => i.id === profile?.industry)?.icon}
                                        </div>
                                        <div className="text-sm font-bold text-foreground">
                                            {industries.find(i => i.id === profile?.industry)?.name}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">👥</div>
                                        <div className="text-sm font-bold text-foreground">
                                            {companySizes.find(s => s.id === profile?.companySize)?.name}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">⚡</div>
                                        <div className="text-sm font-bold text-foreground">
                                            {profile?.behavior.pagesViewed} sayfa incelendi
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            {showRecommendations && profile?.recommendations && (
                                <div>
                                    <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-primary" />
                                        Size Özel AI Önerileri
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Features */}
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                            <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-primary" />
                                                Öne Çıkan Özellikler
                                            </h5>
                                            <div className="space-y-2">
                                                {profile.recommendations.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                            <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-primary" />
                                                Önerilen Paket
                                            </h5>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-primary mb-1">
                                                    {profile.recommendations.pricing}
                                                </div>
                                                <div className="text-xs text-slate-500">Sizin için en uygun</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Recommendations */}
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                        <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-primary" />
                                            İçerik Önerileri
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {profile.recommendations.content.map((content, index) => (
                                                <div key={index} className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                                                    <div className="text-xs font-bold text-foreground">{content}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Behavior Insights */}
                            {behaviorTracking && profile?.behavior && (
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        Davranış Analizi
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{profile.behavior.pagesViewed}</div>
                                            <div className="text-xs text-slate-500">Sayfa Görüntüleme</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{Math.floor(profile.behavior.timeSpent / 60)}dk</div>
                                            <div className="text-xs text-slate-500">Geçen Süre</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{profile.behavior.interactions}</div>
                                            <div className="text-xs text-slate-500">Etkileşim</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">Yüksek</div>
                                            <div className="text-xs text-slate-500">İlgi Düzeyi</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reset Button */}
                            <button
                                onClick={() => {
                                    setShowPersonalizedContent(false);
                                    setProfile(null);
                                    setSelectedIndustry('');
                                    setCompanySize('');
                                }}
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Profili Sıfırla
                            </button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

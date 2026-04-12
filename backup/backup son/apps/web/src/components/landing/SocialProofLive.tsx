'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    ShoppingCart, 
    TrendingUp, 
    Star, 
    MapPin, 
    Clock,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Activity,
    Globe,
    Heart,
    Eye
} from 'lucide-react';

interface SocialProofLiveProps {
    features?: {
        socialProofLive?: {
            enabled: boolean;
            showRealTime: boolean;
            showTestimonials: boolean;
            showMetrics: boolean;
            updateInterval: number;
        };
    };
}

interface LiveActivity {
    id: string;
    type: 'purchase' | 'signup' | 'review' | 'view';
    user: string;
    location: string;
    product?: string;
    rating?: number;
    timestamp: Date;
    message: string;
}

interface Testimonial {
    id: string;
    name: string;
    company: string;
    avatar: string;
    rating: number;
    content: string;
    industry: string;
    results: string;
}

export const SocialProofLive = ({ features }: SocialProofLiveProps) => {
    const [activities, setActivities] = useState<LiveActivity[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [metrics, setMetrics] = useState({
        activeUsers: 1247,
        todaySales: 892,
        totalRevenue: 456789,
        satisfaction: 98.7,
        countries: 47
    });

    const showRealTime = features?.socialProofLive?.showRealTime !== false;
    const showTestimonials = features?.socialProofLive?.showTestimonials !== false;
    const showMetrics = features?.socialProofLive?.showMetrics !== false;
    const updateInterval = features?.socialProofLive?.updateInterval || 3000;

    // Sample data
    const sampleActivities: LiveActivity[] = [
        {
            id: '1',
            type: 'purchase',
            user: 'Ahmet K.',
            location: 'İstanbul, Türkiye',
            product: 'iPhone 15 Pro Max',
            timestamp: new Date(),
            message: 'iPhone 15 Pro Max satın aldı'
        },
        {
            id: '2',
            type: 'signup',
            user: 'Mehmet A.',
            location: 'Ankara, Türkiye',
            timestamp: new Date(),
            message: 'Pazaryonetimi\'e katıldı'
        },
        {
            id: '3',
            type: 'review',
            user: 'Ayşe Y.',
            location: 'İzmir, Türkiye',
            product: 'Samsung Galaxy S24',
            rating: 5,
            timestamp: new Date(),
            message: '5 yıldız verdi: "Harika hizmet!"'
        },
        {
            id: '4',
            type: 'purchase',
            user: 'Fatma S.',
            location: 'Bursa, Türkiye',
            product: 'AirPods Pro 2',
            timestamp: new Date(),
            message: 'AirPods Pro 2 satın aldı'
        },
        {
            id: '5',
            type: 'view',
            user: 'Mustafa K.',
            location: 'Antalya, Türkiye',
            product: 'iPad Pro',
            timestamp: new Date(),
            message: 'iPad Pro inceledi'
        }
    ];

    const sampleTestimonials: Testimonial[] = [
        {
            id: '1',
            name: 'Ahmet Demir',
            company: 'TeknoStore',
            avatar: '👨‍💼',
            rating: 5,
            content: 'Pazaryonetimi sayesinde satışlarımız %300 arttı. Stok yönetimi artık çocuk oyuncağı.',
            industry: 'Elektronik',
            results: '+300% satış artışı'
        },
        {
            id: '2',
            name: 'Ayşe Yılmaz',
            company: 'ModaHouse',
            avatar: '👩‍💼',
            rating: 5,
            content: 'Tüm pazaryerlerimizi tek platformdan yönetmek inanılmaz kolaylaştı. Zaman kazanıyoruz.',
            industry: 'Moda',
            results: '-70% zaman tasarrufu'
        },
        {
            id: '3',
            name: 'Mehmet Kaya',
            company: 'HomeStyle',
            avatar: '👨‍💼',
            rating: 5,
            content: 'AI özellikleri sayesinde fiyatlandırma stratejimiz mükemmel. Rakiplerimiz geride kaldı.',
            industry: 'Ev Yaşam',
            results: '+45% kar marjı'
        }
    ];

    useEffect(() => {
        if (!features?.socialProofLive?.enabled) return;

        // Initialize data
        setActivities(sampleActivities.slice(0, 3));
        setTestimonials(sampleTestimonials);

        // Simulate real-time updates
        const interval = setInterval(() => {
            if (showRealTime) {
                // Add new activity
                const randomActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
                const newActivity: LiveActivity = {
                    ...randomActivity,
                    id: Date.now().toString(),
                    timestamp: new Date()
                };

                setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
            }

            // Update metrics
            if (showMetrics) {
                setMetrics(prev => ({
                    activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
                    todaySales: prev.todaySales + Math.floor(Math.random() * 3),
                    totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 10000),
                    satisfaction: Math.min(100, prev.satisfaction + (Math.random() - 0.5) * 0.1),
                    countries: prev.countries
                }));
            }
        }, updateInterval);

        return () => clearInterval(interval);
    }, [showRealTime, showMetrics, updateInterval, features?.socialProofLive?.enabled]);

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'Az önce';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
        return `${Math.floor(seconds / 86400)} gün önce`;
    };

    const getActivityIcon = (type: LiveActivity['type']) => {
        switch (type) {
            case 'purchase': return <ShoppingCart className="w-4 h-4 text-green-500" />;
            case 'signup': return <Users className="w-4 h-4 text-blue-500" />;
            case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
            case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    if (!features?.socialProofLive?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Canlı Sosyal Kanıt</h3>
                            <p className="text-sm text-slate-500">Gerçek zamanlı kullanıcı aktiviteleri</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-bold">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Metrics Dashboard */}
                {showMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-2xl font-black text-blue-600">
                                    {metrics.activeUsers.toLocaleString()}
                                </span>
                            </div>
                            <div className="text-xs text-blue-600 font-bold">Aktif Kullanıcı</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <ShoppingCart className="w-4 h-4 text-green-500" />
                                <span className="text-2xl font-black text-green-600">
                                    {metrics.todaySales}
                                </span>
                            </div>
                            <div className="text-xs text-green-600 font-bold">Bugün Satış</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                            <div className="text-2xl font-black text-purple-600">
                                ₺{(metrics.totalRevenue / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-purple-600 font-bold">Toplam Ciro</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-2xl font-black text-yellow-600">
                                    {metrics.satisfaction.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-xs text-yellow-600 font-bold">Memnuniyet</div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Globe className="w-4 h-4 text-emerald-500" />
                                <span className="text-2xl font-black text-emerald-600">
                                    {metrics.countries}
                                </span>
                            </div>
                            <div className="text-xs text-emerald-600 font-bold">Ülke</div>
                        </div>
                    </div>
                )}

                {/* Live Activity Feed */}
                {showRealTime && (
                    <div>
                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Canlı Aktivite Akışı
                        </h4>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
                                    >
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{activity.user}</span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {activity.location}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                {activity.message}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500">
                                                {formatTimeAgo(activity.timestamp)}
                                            </div>
                                            {activity.rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                    <span className="text-xs text-yellow-600 font-bold">
                                                        {activity.rating}.0
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Testimonials */}
                {showTestimonials && (
                    <div>
                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Müşteri Yorumları
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-white/10"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-2xl">{testimonial.avatar}</div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{testimonial.name}</div>
                                            <div className="text-xs text-slate-500">{testimonial.company}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${
                                                    i < testimonial.rating
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-slate-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">{testimonial.industry}</span>
                                        <span className="text-xs font-bold text-green-600">{testimonial.results}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        1,247+ mutlu müşteri
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        99.9% uptime
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-3 h-3 text-purple-500" />
                        24/7 destek
                    </div>
                </div>
            </div>
        </div>
    );
};

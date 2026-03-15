"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, AlertCircle, XCircle, Clock, Activity, Server, Database, Globe, Zap, Shield, 
    RefreshCw, Bell, ChevronDown, ChevronRight, Wifi, HardDrive, Cpu, BarChart3, Mail,
    MessageCircle, Rss, Calendar, ArrowUpRight, CheckCheck, AlertTriangle, Info,
    TrendingUp, Cloud, Lock, Webhook, Send, ExternalLink, History, Layers
} from 'lucide-react';
import Link from 'next/link';

type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'outage' | 'maintenance';
type IncidentStatus = 'resolved' | 'investigating' | 'identified' | 'monitoring' | 'scheduled';

interface Service {
    id: string;
    name: string;
    description: string;
    status: ServiceStatus;
    uptime: number;
    responseTime: number;
    icon: React.ElementType;
    category: string;
}

interface Incident {
    id: number;
    title: string;
    status: IncidentStatus;
    severity: 'critical' | 'major' | 'minor' | 'maintenance';
    date: string;
    affectedServices: string[];
    updates: { time: string; status: IncidentStatus; message: string }[];
}

interface ScheduledMaintenance {
    id: number;
    title: string;
    date: string;
    duration: string;
    affectedServices: string[];
    description: string;
}

// Servisler
const services: Service[] = [
    { id: 'web', name: "Web Uygulaması", description: "Ana platform, dashboard ve kullanıcı arayüzü", status: "operational", uptime: 99.99, responseTime: 45, icon: Globe, category: "core" },
    { id: 'api', name: "API Servisleri", description: "RESTful API, GraphQL ve WebSocket endpoint'leri", status: "operational", uptime: 99.98, responseTime: 32, icon: Zap, category: "core" },
    { id: 'db', name: "Veritabanı Kümeleri", description: "PostgreSQL ana veritabanı ve replikalar", status: "operational", uptime: 99.99, responseTime: 8, icon: Database, category: "infrastructure" },
    { id: 'cdn', name: "CDN & Statik Dosyalar", description: "Global içerik dağıtım ağı", status: "operational", uptime: 100, responseTime: 12, icon: Cloud, category: "infrastructure" },
    { id: 'trendyol', name: "Trendyol Entegrasyonu", description: "Trendyol Marketplace API bağlantısı", status: "operational", uptime: 99.95, responseTime: 180, icon: Server, category: "marketplace" },
    { id: 'hepsiburada', name: "Hepsiburada Entegrasyonu", description: "Hepsiburada Marketplace API bağlantısı", status: "operational", uptime: 99.93, responseTime: 210, icon: Server, category: "marketplace" },
    { id: 'amazon', name: "Amazon Entegrasyonu", description: "Amazon SP-API bağlantısı", status: "operational", uptime: 99.97, responseTime: 150, icon: Server, category: "marketplace" },
    { id: 'n11', name: "N11 Entegrasyonu", description: "N11 Marketplace API bağlantısı", status: "operational", uptime: 99.91, responseTime: 195, icon: Server, category: "marketplace" },
    { id: 'ai', name: "AI/ML Servisleri", description: "Yapay zeka, analiz ve öneri motorları", status: "operational", uptime: 99.97, responseTime: 85, icon: Cpu, category: "core" },
    { id: 'auth', name: "Kimlik Doğrulama", description: "OAuth 2.0, 2FA ve SSO servisleri", status: "operational", uptime: 100, responseTime: 25, icon: Lock, category: "security" },
    { id: 'webhook', name: "Webhook Servisleri", description: "Olay bildirimleri ve entegrasyonlar", status: "operational", uptime: 99.98, responseTime: 45, icon: Webhook, category: "core" },
    { id: 'storage', name: "Dosya Depolama", description: "Resim, döküman ve yedekleme depoları", status: "operational", uptime: 99.99, responseTime: 65, icon: HardDrive, category: "infrastructure" },
];

// Son Olaylar
const recentIncidents: Incident[] = [
    {
        id: 1,
        title: "Hepsiburada API Yanıt Gecikmesi",
        status: "resolved",
        severity: "minor",
        date: "3 Şubat 2026",
        affectedServices: ['hepsiburada'],
        updates: [
            { time: "16:30", status: "resolved", message: "Sorun tamamen çözüldü. Tüm senkronizasyonlar normal hızda çalışıyor." },
            { time: "15:45", status: "monitoring", message: "Düzeltme uygulandı. Sistem izleniyor." },
            { time: "15:15", status: "identified", message: "Hepsiburada tarafındaki API rate limiting sorunu tespit edildi." },
            { time: "14:30", status: "investigating", message: "Bazı kullanıcılar Hepsiburada senkronizasyonunda yavaşlık bildirdi. İnceleniyor." },
        ]
    },
    {
        id: 2,
        title: "Planlı Bakım - Veritabanı Yükseltme",
        status: "resolved",
        severity: "maintenance",
        date: "28 Ocak 2026",
        affectedServices: ['db'],
        updates: [
            { time: "06:00", status: "resolved", message: "Bakım tamamlandı. PostgreSQL 16 başarıyla yükseltildi. Tüm sistemler aktif." },
            { time: "04:00", status: "monitoring", message: "Veritabanı yükseltmesi tamamlandı. Doğrulama testleri yapılıyor." },
            { time: "03:00", status: "identified", message: "Planlı bakım başladı. Tahmini süre: 3 saat." },
        ]
    },
    {
        id: 3,
        title: "CDN Performans Optimizasyonu",
        status: "resolved",
        severity: "minor",
        date: "20 Ocak 2026",
        affectedServices: ['cdn'],
        updates: [
            { time: "11:00", status: "resolved", message: "Optimizasyon tamamlandı. Global yanıt süreleri %30 iyileştirildi." },
            { time: "09:00", status: "monitoring", message: "Yeni CDN yapılandırması devreye alındı." },
        ]
    }
];

// Planlı Bakımlar
const scheduledMaintenances: ScheduledMaintenance[] = [
    {
        id: 1,
        title: "Güvenlik Güncellemesi",
        date: "10 Şubat 2026, 03:00 - 04:00",
        duration: "1 saat",
        affectedServices: ['auth', 'api'],
        description: "Güvenlik yamalarının uygulanması. Minimal kesinti bekleniyor."
    },
    {
        id: 2,
        title: "AI Model Güncellemesi",
        date: "15 Şubat 2026, 02:00 - 05:00",
        duration: "3 saat",
        affectedServices: ['ai'],
        description: "Yeni AI modellerinin production ortamına deployment'ı."
    }
];

// Geçmiş ayların uptime verileri
const monthlyUptime = [
    { month: "Şub 2026", uptime: 99.98, incidents: 1 },
    { month: "Oca 2026", uptime: 99.95, incidents: 2 },
    { month: "Ara 2025", uptime: 99.99, incidents: 0 },
    { month: "Kas 2025", uptime: 99.97, incidents: 1 },
    { month: "Eki 2025", uptime: 99.96, incidents: 2 },
    { month: "Eyl 2025", uptime: 100, incidents: 0 },
];

// Yardımcı fonksiyonlar
const getStatusConfig = (status: ServiceStatus) => {
    switch (status) {
        case 'operational':
            return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500', bgLight: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Çalışıyor', pulse: false };
        case 'degraded':
            return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-100 dark:bg-amber-900/30', label: 'Performans Düşük', pulse: true };
        case 'partial':
            return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500', bgLight: 'bg-orange-100 dark:bg-orange-900/30', label: 'Kısmi Kesinti', pulse: true };
        case 'outage':
            return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500', bgLight: 'bg-red-100 dark:bg-red-900/30', label: 'Kesinti', pulse: true };
        case 'maintenance':
            return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500', bgLight: 'bg-blue-100 dark:bg-blue-900/30', label: 'Bakımda', pulse: false };
    }
};

const getIncidentStatusConfig = (status: IncidentStatus) => {
    switch (status) {
        case 'resolved':
            return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Çözüldü', icon: CheckCheck };
        case 'investigating':
            return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'İnceleniyor', icon: AlertCircle };
        case 'identified':
            return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Tespit Edildi', icon: Info };
        case 'monitoring':
            return { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'İzleniyor', icon: Activity };
        case 'scheduled':
            return { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30', label: 'Planlandı', icon: Calendar };
    }
};

const getSeverityConfig = (severity: Incident['severity']) => {
    switch (severity) {
        case 'critical':
            return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Kritik' };
        case 'major':
            return { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Önemli' };
        case 'minor':
            return { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Küçük' };
        case 'maintenance':
            return { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Bakım' };
    }
};

// Uptime geçmişi API kaynağından gelmelidir; veri yoksa boş bırakılır.
const generateUptimeData = () => [] as Array<{ status: 'operational' | 'degraded' | 'outage'; date: Date }>;

// Kategoriler
const categories = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'core', label: 'Temel Servisler', icon: Zap },
    { id: 'marketplace', label: 'Pazaryerleri', icon: Server },
    { id: 'infrastructure', label: 'Altyapı', icon: HardDrive },
    { id: 'security', label: 'Güvenlik', icon: Shield },
];

export default function StatusPage() {
    const [uptimeData] = useState(generateUptimeData);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedIncident, setExpandedIncident] = useState<number | null>(null);
    const [email, setEmail] = useState('');

    // Genel durum hesaplama
    const overallStatus = useMemo(() => {
        const hasOutage = services.some(s => s.status === 'outage');
        const hasPartial = services.some(s => s.status === 'partial');
        const hasDegraded = services.some(s => s.status === 'degraded');
        const hasMaintenance = services.some(s => s.status === 'maintenance');
        
        if (hasOutage) return { status: 'outage' as ServiceStatus, label: 'Sistem Kesintisi', color: 'red' };
        if (hasPartial) return { status: 'partial' as ServiceStatus, label: 'Kısmi Kesinti', color: 'orange' };
        if (hasDegraded) return { status: 'degraded' as ServiceStatus, label: 'Performans Düşüklüğü', color: 'amber' };
        if (hasMaintenance) return { status: 'maintenance' as ServiceStatus, label: 'Bakım Çalışması', color: 'blue' };
        return { status: 'operational' as ServiceStatus, label: 'Tüm Sistemler Çalışıyor', color: 'emerald' };
    }, []);

    // Filtrelenmiş servisler
    const filteredServices = useMemo(() => {
        if (selectedCategory === 'all') return services;
        return services.filter(s => s.category === selectedCategory);
    }, [selectedCategory]);

    // Ortalama uptime
    const averageUptime = useMemo(() => {
        return (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2);
    }, []);

    // Yenileme fonksiyonu
    const handleRefresh = () => {
        setIsRefreshing(true);
        setLastUpdated(new Date());
        setIsRefreshing(false);
    };

    // Auto refresh
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 border border-emerald-200 dark:border-emerald-800 rounded-full mb-6"
                    >
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">Sistem Durumu</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Servis</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500">
                            Durumu
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Pazaryonetimi altyapısının gerçek zamanlı durumunu takip edin
                    </p>
                </motion.div>

                {/* Overall Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`max-w-4xl mx-auto mb-10 p-8 md:p-10 rounded-3xl border-2 ${
                        overallStatus.color === 'emerald' 
                            ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700'
                            : overallStatus.color === 'amber'
                            ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700'
                            : overallStatus.color === 'red'
                            ? 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:via-rose-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700'
                            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700'
                    }`}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ${
                                overallStatus.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                                overallStatus.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/50' :
                                overallStatus.color === 'red' ? 'bg-red-100 dark:bg-red-900/50' :
                                'bg-blue-100 dark:bg-blue-900/50'
                            }`}>
                                {overallStatus.status === 'operational' ? (
                                    <CheckCircle2 className={`w-10 h-10 text-emerald-600 dark:text-emerald-400`} />
                                ) : overallStatus.status === 'degraded' ? (
                                    <AlertCircle className={`w-10 h-10 text-amber-600 dark:text-amber-400`} />
                                ) : overallStatus.status === 'outage' ? (
                                    <XCircle className={`w-10 h-10 text-red-600 dark:text-red-400`} />
                                ) : (
                                    <Clock className={`w-10 h-10 text-blue-600 dark:text-blue-400`} />
                                )}
                                {/* Pulse animation for non-operational */}
                                {overallStatus.status !== 'operational' && (
                                    <span className={`absolute inset-0 rounded-2xl animate-ping opacity-30 ${
                                        overallStatus.color === 'amber' ? 'bg-amber-400' :
                                        overallStatus.color === 'red' ? 'bg-red-400' : 'bg-blue-400'
                                    }`} />
                                )}
                            </div>
                            <div>
                                <h2 className={`text-2xl md:text-3xl font-black ${
                                    overallStatus.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' :
                                    overallStatus.color === 'amber' ? 'text-amber-700 dark:text-amber-400' :
                                    overallStatus.color === 'red' ? 'text-red-700 dark:text-red-400' :
                                    'text-blue-700 dark:text-blue-400'
                                }`}>
                                    {overallStatus.label}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center px-6 py-3 bg-white/50 dark:bg-white/5 rounded-2xl">
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{averageUptime}%</div>
                                <div className="text-xs text-slate-500">Ortalama Uptime</div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw className={`w-6 h-6 ${
                                    overallStatus.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                                }`} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/50 dark:border-white/10">
                        <div className="text-center">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">{services.length}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Toplam Servis</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {services.filter(s => s.status === 'operational').length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Çalışıyor</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Ort. Yanıt</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {recentIncidents.filter(i => i.status === 'resolved').length}/{recentIncidents.length}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Çözülen Olay</div>
                        </div>
                    </div>
                </motion.div>

                {/* 90 Day Uptime Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-10 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Son 90 Gün Uptime</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                                <span className="text-slate-500">Çalışıyor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-amber-500" />
                                <span className="text-slate-500">Düşük</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-red-500" />
                                <span className="text-slate-500">Kesinti</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-[2px]">
                        {uptimeData.length === 0 && (
                            <div className="w-full h-10 rounded-sm bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs text-slate-500">
                                Uptime geçmiş verisi bulunamadı
                            </div>
                        )}
                        {uptimeData.map((day, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-10 rounded-sm transition-all hover:scale-y-125 cursor-pointer ${
                                    day.status === 'operational' ? 'bg-emerald-500 hover:bg-emerald-400' :
                                    day.status === 'degraded' ? 'bg-amber-500 hover:bg-amber-400' : 
                                    'bg-red-500 hover:bg-red-400'
                                }`}
                                title={`${day.date.toLocaleDateString('tr-TR')} - ${
                                    day.status === 'operational' ? 'Çalışıyor' :
                                    day.status === 'degraded' ? 'Performans Düşük' : 'Kesinti'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>90 gün önce</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {uptimeData.length > 0
                                ? `${((uptimeData.filter(d => d.status === 'operational').length / uptimeData.length) * 100).toFixed(2)}% uptime`
                                : 'Uptime verisi yok'}
                        </span>
                        <span>Bugün</span>
                    </div>
                </motion.div>

                {/* Monthly Uptime History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="max-w-4xl mx-auto mb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
                >
                    {monthlyUptime.map((month, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                            <div className="text-xs text-slate-500 mb-1">{month.month}</div>
                            <div className={`text-xl font-black ${month.uptime >= 99.9 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {month.uptime}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                {month.incidents} olay
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-4xl mx-auto mb-6"
                >
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Services List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <Server className="text-emerald-500" />
                        Servisler
                        <span className="text-sm font-normal text-slate-400">({filteredServices.length})</span>
                    </h3>
                    <div className="space-y-3">
                        {filteredServices.map((service, index) => {
                            const statusConfig = getStatusConfig(service.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.03 }}
                                    className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${statusConfig.bgLight} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <service.icon className={`w-6 h-6 ${statusConfig.color}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{service.name}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white">{service.uptime}%</div>
                                                    <div className="text-xs text-slate-400">Uptime</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white">{service.responseTime}ms</div>
                                                    <div className="text-xs text-slate-400">Yanıt</div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bgLight}`}>
                                                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                                <span className={`text-sm font-bold ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Scheduled Maintenance */}
                {scheduledMaintenances.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto mb-16"
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Calendar className="text-blue-500" />
                            Planlı Bakımlar
                        </h3>
                        <div className="space-y-4">
                            {scheduledMaintenances.map((maintenance) => (
                                <div
                                    key={maintenance.id}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{maintenance.title}</h4>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                {maintenance.date} • {maintenance.duration}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold">
                                            Planlandı
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{maintenance.description}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Etkilenen servisler:</span>
                                        {maintenance.affectedServices.map((s, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-white/50 dark:bg-white/10 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {services.find(srv => srv.id === s)?.name || s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Recent Incidents */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <AlertCircle className="text-amber-500" />
                        Son Olaylar
                    </h3>
                    <div className="space-y-4">
                        {recentIncidents.map((incident) => {
                            const statusConfig = getIncidentStatusConfig(incident.status);
                            const severityConfig = getSeverityConfig(incident.severity);
                            const isExpanded = expandedIncident === incident.id;

                            return (
                                <motion.div
                                    key={incident.id}
                                    layout
                                    className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                                        className="w-full p-6 flex items-start justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityConfig.bg} ${severityConfig.color}`}>
                                                    {severityConfig.label}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{incident.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{incident.date}</p>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6">
                                                    {/* Affected Services */}
                                                    <div className="mb-4 flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">Etkilenen:</span>
                                                        {incident.affectedServices.map((s, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">
                                                                {services.find(srv => srv.id === s)?.name || s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Timeline */}
                                                    <div className="space-y-4 border-l-2 border-slate-200 dark:border-white/10 pl-4 ml-2">
                                                        {incident.updates.map((update, i) => {
                                                            const updateStatusConfig = getIncidentStatusConfig(update.status);
                                                            const UpdateIcon = updateStatusConfig.icon;
                                                            return (
                                                                <div key={i} className="relative">
                                                                    <div className={`absolute -left-[22px] w-4 h-4 rounded-full ${updateStatusConfig.bg} flex items-center justify-center`}>
                                                                        <UpdateIcon className={`w-2.5 h-2.5 ${updateStatusConfig.color}`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{update.time}</span>
                                                                            <span className={`text-xs ${updateStatusConfig.color}`}>{getIncidentStatusConfig(update.status).label}</span>
                                                                        </div>
                                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{update.message}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {recentIncidents.length === 0 && (
                        <div className="text-center py-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                                Son 30 günde herhangi bir olay kaydedilmedi! 🎉
                            </p>
                        </div>
                    )}

                    <Link href="/changelog" className="mt-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                        <History size={16} />
                        Tüm olay geçmişini görüntüle
                        <ArrowUpRight size={14} />
                    </Link>
                </motion.div>

                {/* Subscribe Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    
                    <div className="relative z-10 text-center">
                        <Bell className="w-16 h-16 text-white/20 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Durum Güncellemelerini Alın
                        </h2>
                        <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-8">
                            Sistem kesintileri, bakım çalışmaları ve önemli güncellemeler hakkında 
                            anında bildirim alın.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                            />
                            <button className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <Send size={18} /> Abone Ol
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/20">
                            <a href="#" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                <Rss size={18} /> RSS Feed
                            </a>
                            <a href="#" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                <MessageCircle size={18} /> Slack
                            </a>
                            <a href="#" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                <Webhook size={18} /> Webhook
                            </a>
                            <a href="#" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                                <Mail size={18} /> E-posta
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

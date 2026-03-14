"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Book, MessageCircle, Mail, ChevronRight, HelpCircle, FileText, Video, 
    Lightbulb, Phone, Clock, CheckCircle2, ArrowRight, Play, Headphones, Globe,
    Zap, Package, Settings, CreditCard, Shield, Users, BarChart3, Sparkles,
    ChevronDown, ExternalLink, Star, ThumbsUp, Send, Bot, Rocket
} from 'lucide-react';
import Link from 'next/link';

// Kategori verileri
const categories = [
    {
        icon: Rocket,
        title: "Başlangıç Rehberi",
        description: "Platform kullanımına hızlı başlangıç yapın",
        articles: 12,
        color: "blue",
        gradient: "from-blue-500 to-cyan-500",
        popular: ["Hesap oluşturma", "İlk mağaza kurulumu", "Dashboard kullanımı"]
    },
    {
        icon: Package,
        title: "Ürün Yönetimi",
        description: "Ürün ekleme, düzenleme ve senkronizasyon",
        articles: 24,
        color: "purple",
        gradient: "from-purple-500 to-pink-500",
        popular: ["Toplu ürün yükleme", "Varyant yönetimi", "Görsel optimizasyonu"]
    },
    {
        icon: Globe,
        title: "Pazaryeri Entegrasyonları",
        description: "Trendyol, Hepsiburada, Amazon ve diğerleri",
        articles: 32,
        color: "emerald",
        gradient: "from-emerald-500 to-green-500",
        popular: ["Trendyol bağlantısı", "Hepsiburada kurulumu", "Amazon entegrasyonu"]
    },
    {
        icon: Sparkles,
        title: "AI Özellikleri",
        description: "Yapay zeka araçlarını etkili kullanma",
        articles: 18,
        color: "amber",
        gradient: "from-amber-500 to-orange-500",
        popular: ["AI SEO optimizasyonu", "Akıllı fiyatlandırma", "Stok tahmini"]
    },
    {
        icon: BarChart3,
        title: "Raporlar & Analitik",
        description: "Satış analizi ve performans takibi",
        articles: 15,
        color: "cyan",
        gradient: "from-cyan-500 to-blue-500",
        popular: ["Satış raporları", "Performans metrikleri", "Dışa aktarma"]
    },
    {
        icon: CreditCard,
        title: "Ödeme & Faturalama",
        description: "Plan yükseltme, fatura ve ödemeler",
        articles: 10,
        color: "rose",
        gradient: "from-rose-500 to-pink-500",
        popular: ["Plan değiştirme", "Fatura indirme", "Ödeme yöntemleri"]
    },
    {
        icon: Shield,
        title: "Güvenlik & Gizlilik",
        description: "Hesap güvenliği ve veri koruma",
        articles: 8,
        color: "slate",
        gradient: "from-slate-500 to-gray-500",
        popular: ["2FA aktivasyonu", "Şifre sıfırlama", "API güvenliği"]
    },
    {
        icon: Settings,
        title: "Hesap Ayarları",
        description: "Profil, bildirimler ve tercihler",
        articles: 14,
        color: "indigo",
        gradient: "from-indigo-500 to-violet-500",
        popular: ["Bildirim ayarları", "Ekip yönetimi", "Entegrasyon ayarları"]
    },
];

// Popüler makaleler
const popularArticles = [
    { 
        title: "İlk mağazamı nasıl oluşturabilirim?", 
        category: "Başlangıç", 
        views: "12.4K",
        rating: 4.9,
        readTime: "5 dk",
        icon: Rocket
    },
    { 
        title: "Trendyol entegrasyonu adım adım rehber", 
        category: "Entegrasyon", 
        views: "8.7K",
        rating: 4.8,
        readTime: "8 dk",
        icon: Globe
    },
    { 
        title: "Toplu ürün yükleme: Excel şablonu kullanımı", 
        category: "Ürün Yönetimi", 
        views: "6.5K",
        rating: 4.7,
        readTime: "10 dk",
        icon: Package
    },
    { 
        title: "AI SEO ile ürün başlıklarını optimize edin", 
        category: "AI", 
        views: "5.2K",
        rating: 4.9,
        readTime: "6 dk",
        icon: Sparkles
    },
    { 
        title: "Stok senkronizasyonu: Tüm pazaryerlerinde anlık güncelleme", 
        category: "Stok", 
        views: "4.8K",
        rating: 4.6,
        readTime: "7 dk",
        icon: Zap
    },
    { 
        title: "Hepsiburada API bağlantısı kurulumu", 
        category: "Entegrasyon", 
        views: "4.2K",
        rating: 4.8,
        readTime: "12 dk",
        icon: Globe
    },
];

// Video eğitimleri
const videoTutorials = [
    {
        title: "Platform Tanıtımı: 10 Dakikada Pazaryonetimi",
        duration: "10:24",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
        views: "25.3K",
        category: "Başlangıç"
    },
    {
        title: "Trendyol Mağaza Kurulumu A'dan Z'ye",
        duration: "18:45",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
        views: "18.7K",
        category: "Entegrasyon"
    },
    {
        title: "AI Fiyatlandırma ile Kar Marjını Artırın",
        duration: "12:30",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
        views: "14.2K",
        category: "AI"
    },
    {
        title: "Toplu Ürün Güncelleme Masterclass",
        duration: "22:15",
        thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
        views: "11.8K",
        category: "Ürün"
    },
];

// FAQ verileri
const faqCategories = [
    { id: 'general', label: 'Genel', icon: HelpCircle },
    { id: 'pricing', label: 'Fiyatlandırma', icon: CreditCard },
    { id: 'technical', label: 'Teknik', icon: Settings },
    { id: 'security', label: 'Güvenlik', icon: Shield },
];

const faqItems = [
    {
        id: 1,
        category: 'general',
        question: "Pazaryonetimi nedir ve ne işe yarar?",
        answer: "Pazaryonetimi, e-ticaret satıcılarının tüm pazaryerlerini tek bir panelden yönetmelerini sağlayan bir SaaS platformudur. Ürün, stok, sipariş ve fiyat yönetimini otomatikleştirir, AI destekli araçlarla satışlarınızı artırmanıza yardımcı olur."
    },
    {
        id: 2,
        category: 'general',
        question: "Ücretsiz deneme süresi ne kadar?",
        answer: "14 gün boyunca tüm özellikleri ücretsiz olarak deneyebilirsiniz. Deneme süresinde kredi kartı bilgisi istenmez ve otomatik ücretlendirme yapılmaz. Deneme sonunda isterseniz ücretli plana geçebilir, istemezseniz hesabınız otomatik olarak askıya alınır."
    },
    {
        id: 3,
        category: 'general',
        question: "Hangi pazaryerlerini destekliyorsunuz?",
        answer: "Trendyol, Hepsiburada, Amazon Türkiye, N11, Çiçeksepeti, GittiGidiyor, Etsy, Shopify, WooCommerce dahil 30+ pazaryeri ve e-ticaret altyapısını destekliyoruz. Yeni entegrasyonlar sürekli ekleniyor."
    },
    {
        id: 4,
        category: 'pricing',
        question: "Planlar arasındaki farklar nelerdir?",
        answer: "Başlangıç planı küçük satıcılar için ideal, 1 pazaryeri ve 500 ürün limiti sunar. Profesyonel plan büyüyen işletmeler için sınırsız pazaryeri, 5000 ürün ve AI özellikleri içerir. Kurumsal plan ise büyük operasyonlar için özel limitler ve dedike destek sağlar."
    },
    {
        id: 5,
        category: 'pricing',
        question: "İstediğim zaman plan değiştirebilir miyim?",
        answer: "Evet, istediğiniz zaman plan yükseltme veya düşürme yapabilirsiniz. Yükseltmelerde fark anında yansır, düşürmelerde mevcut dönem sonunda yeni plan aktif olur. Tüm verileriniz korunur."
    },
    {
        id: 6,
        category: 'pricing',
        question: "Gizli ücret var mı?",
        answer: "Hayır, tüm ücretler şeffaf şekilde fiyatlandırma sayfamızda belirtilmiştir. Komisyon, işlem ücreti veya gizli maliyet yoktur. Sadece seçtiğiniz plan ücretini ödersiniz."
    },
    {
        id: 7,
        category: 'technical',
        question: "Entegrasyon kurulumu ne kadar sürer?",
        answer: "Çoğu pazaryeri entegrasyonu 5-10 dakika içinde tamamlanır. Sadece API bilgilerinizi girmeniz yeterli. Karmaşık entegrasyonlar için destek ekibimiz ücretsiz yardım sağlar."
    },
    {
        id: 8,
        category: 'technical',
        question: "Stok senkronizasyonu ne sıklıkla güncellenir?",
        answer: "Stok senkronizasyonu gerçek zamanlı olarak çalışır. Bir pazaryerinde satış yapıldığında diğer tüm pazaryerlerindeki stok otomatik olarak saniyeler içinde güncellenir, böylece eksi stok satışı önlenir."
    },
    {
        id: 9,
        category: 'technical',
        question: "API erişimi sağlıyor musunuz?",
        answer: "Evet, Profesyonel ve Kurumsal planlarda REST API erişimi sunuyoruz. Kendi sistemlerinizle entegrasyon yapabilir, özel otomasyon senaryoları oluşturabilirsiniz. Detaylı API dokümantasyonu mevcuttur."
    },
    {
        id: 10,
        category: 'security',
        question: "Verilerim güvende mi?",
        answer: "Evet, tüm verileriniz 256-bit SSL/TLS şifreleme ile korunur. Verilerimiz ISO 27001 sertifikalı veri merkezlerinde saklanır, KVKK ve GDPR uyumludur. Düzenli güvenlik denetimleri ve yedeklemeler yapılır."
    },
    {
        id: 11,
        category: 'security',
        question: "İki faktörlü doğrulama (2FA) mevcut mu?",
        answer: "Evet, hesap güvenliğiniz için 2FA özelliğini aktif edebilirsiniz. Google Authenticator, Authy gibi uygulamalar veya SMS ile doğrulama seçenekleri mevcuttur."
    },
    {
        id: 12,
        category: 'security',
        question: "İptal ettiğimde verilerime ne olur?",
        answer: "İptal sonrası verileriniz 30 gün boyunca saklanır ve dışa aktarmanıza olanak tanır. Bu süre sonunda kalıcı olarak silinir. İstediğiniz zaman verilerinizi JSON veya CSV formatında dışa aktarabilirsiniz."
    },
];

// Destek istatistikleri
const supportStats = [
    { value: "< 2 dk", label: "Ortalama Yanıt Süresi", icon: Clock },
    { value: "%98", label: "Müşteri Memnuniyeti", icon: ThumbsUp },
    { value: "7/24", label: "Canlı Destek", icon: Headphones },
    { value: "50+", label: "Video Eğitim", icon: Video },
];

// Destek kanalları
const supportChannels = [
    {
        title: "Canlı Destek",
        description: "Uzman ekibimizle anlık sohbet",
        icon: MessageCircle,
        color: "blue",
        gradient: "from-blue-500 to-indigo-500",
        availability: "7/24 Aktif",
        responseTime: "< 2 dakika",
        action: "Sohbet Başlat",
        highlight: true
    },
    {
        title: "Telefon Desteği",
        description: "Sesli görüşme ile hızlı çözüm",
        icon: Phone,
        color: "emerald",
        gradient: "from-emerald-500 to-green-500",
        availability: "Hafta içi 09:00-18:00",
        responseTime: "Anında",
        action: "0850 840 26 26",
        highlight: false
    },
    {
        title: "E-posta Desteği",
        description: "Detaylı sorularınız için",
        icon: Mail,
        color: "purple",
        gradient: "from-purple-500 to-pink-500",
        availability: "7/24",
        responseTime: "< 4 saat",
        action: "destek@pazaryonetimi.com",
        highlight: false
    },
    {
        title: "AI Asistan",
        description: "Yapay zeka destekli anında cevap",
        icon: Bot,
        color: "amber",
        gradient: "from-amber-500 to-orange-500",
        availability: "7/24 Aktif",
        responseTime: "Anında",
        action: "PazarAI'ya Sor",
        highlight: false
    },
];

export default function DestekPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFaqCategory, setActiveFaqCategory] = useState('general');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [searchFocused, setSearchFocused] = useState(false);

    const filteredFaqs = faqItems.filter(faq => faq.category === activeFaqCategory);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-800 rounded-full mb-6"
                    >
                        <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 tracking-wide">Yardım Merkezi</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Size Nasıl</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500">
                            Yardımcı Olabiliriz?
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        Kapsamlı dokümantasyon, video eğitimler ve 7/24 destek ekibimiz ile 
                        her adımda yanınızdayız.
                    </p>

                    {/* Search Box */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto relative"
                    >
                        <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Arama yapın... (örn: Trendyol entegrasyonu, stok senkronizasyonu)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="w-full pl-16 pr-6 py-5 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                Ara <ArrowRight size={16} />
                            </button>
                        </div>
                        
                        {/* Quick Search Tags */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                            <span className="text-sm text-slate-500">Popüler:</span>
                            {['Trendyol kurulumu', 'Toplu ürün yükleme', 'AI SEO', 'Fiyat senkronizasyonu'].map((tag) => (
                                <button 
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Support Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
                >
                    {supportStats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                                <stat.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Support Channels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                        Bize Ulaşın
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {supportChannels.map((channel, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-6 rounded-2xl border transition-all hover:shadow-xl ${
                                    channel.highlight 
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-transparent text-white' 
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30'
                                }`}
                            >
                                {channel.highlight && (
                                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        ÇEVRİMİÇİ
                                    </div>
                                )}
                                
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                    channel.highlight 
                                        ? 'bg-white/20' 
                                        : `bg-gradient-to-br ${channel.gradient}`
                                }`}>
                                    <channel.icon className={`w-6 h-6 ${channel.highlight ? 'text-white' : 'text-white'}`} />
                                </div>
                                
                                <h3 className={`font-bold text-lg mb-1 ${channel.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {channel.title}
                                </h3>
                                <p className={`text-sm mb-4 ${channel.highlight ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {channel.description}
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                    <div className={`flex items-center gap-2 text-xs ${channel.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                                        <Clock size={12} />
                                        {channel.availability}
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${channel.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                                        <Zap size={12} />
                                        Yanıt: {channel.responseTime}
                                    </div>
                                </div>
                                
                                <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    channel.highlight 
                                        ? 'bg-white text-blue-600 hover:bg-blue-50' 
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                                }`}>
                                    {channel.action}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Category Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                            Yardım Konuları
                        </h2>
                        <Link href="/destek/tum-konular" className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline">
                            Tümünü Gör <ChevronRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/destek/${category.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 've')}`} className="block group h-full">
                                    <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:shadow-xl h-full">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4`}>
                                            <category.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                            {category.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                <FileText size={12} /> {category.articles} makale
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Popular Articles & Video Tutorials */}
                <div className="grid lg:grid-cols-2 gap-8 mb-20">
                    {/* Popular Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Book className="text-blue-500" size={20} />
                                En Çok Okunan Makaleler
                            </h2>
                            <Link href="/destek/makaleler" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Tümü
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {popularArticles.map((article, i) => (
                                <Link
                                    key={i}
                                    href="#"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <article.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {article.title}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500">{article.category}</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-400">{article.readTime} okuma</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                                                <Star size={10} fill="currentColor" /> {article.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">{article.views}</div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Video Tutorials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Video className="text-purple-500" size={20} />
                                Video Eğitimler
                            </h2>
                            <Link href="/destek/videolar" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Tümü
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {videoTutorials.map((video, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-white text-[10px] font-medium">
                                            {video.duration}
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {video.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">{video.views} görüntüleme</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                            Sık Sorulan Sorular
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            En çok merak edilen soruların cevapları
                        </p>
                    </div>

                    {/* FAQ Category Tabs */}
                    <div className="flex justify-center gap-2 mb-8">
                        {faqCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveFaqCategory(cat.id);
                                    setOpenFaq(null);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                                    activeFaqCategory === cat.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Items */}
                    <div className="max-w-3xl mx-auto space-y-3">
                        <AnimatePresence mode="wait">
                            {filteredFaqs.map((faq) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-medium text-slate-900 dark:text-white pr-4">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 pt-0">
                                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                        <span className="text-xs text-slate-500">Bu cevap yardımcı oldu mu?</span>
                                                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-500 transition-colors">
                                                            <ThumbsUp size={14} /> Evet
                                                        </button>
                                                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors">
                                                            <ThumbsUp size={14} className="rotate-180" /> Hayır
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/faq" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            Tüm Soruları Görüntüle <ExternalLink size={16} />
                        </Link>
                    </div>
                </motion.div>

                {/* Contact Form CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Aradığınızı Bulamadınız mı?
                            </h2>
                            <p className="text-lg text-blue-100 mb-6">
                                Destek ekibimize doğrudan mesaj gönderin, en kısa sürede size dönüş yapalım.
                            </p>
                            <div className="flex items-center gap-4 text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-300" />
                                    Ortalama 2 saat yanıt
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-300" />
                                    Uzman destek
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                                />
                                <textarea
                                    placeholder="Mesajınız..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 resize-none"
                                />
                                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                    <Send size={18} /> Mesaj Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

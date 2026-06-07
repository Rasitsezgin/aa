"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Quote, ArrowRight, Star, Play, ChevronRight, CheckCircle2, 
    Users, ShoppingBag, Zap, Award, Target, BarChart3, Building2, 
    ArrowUpRight, Filter, X, Trophy, Sparkles, Clock,
    Package, Percent, MessageCircle
} from 'lucide-react';
import Link from 'next/link';

// Sektör filtreleri
const industries = [
    { id: 'all', label: 'Tümü', icon: Building2 },
    { id: 'fashion', label: 'Moda & Giyim', icon: ShoppingBag },
    { id: 'electronics', label: 'Elektronik', icon: Zap },
    { id: 'food', label: 'Gıda', icon: Package },
    { id: 'cosmetics', label: 'Kozmetik', icon: Sparkles },
    { id: 'home', label: 'Ev & Yaşam', icon: Building2 },
];

// Detaylı başarı hikayeleri
const successStories = [
    {
        id: "moda-butik",
        company: "ModaBütik",
        logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
        logoInitial: "MB",
        industry: "fashion",
        industryLabel: "Moda & Giyim",
        location: "İstanbul",
        employees: "25-50",
        yearStarted: "2019",
        usingPazarYonetimi: "2022",
        featured: true,
        videoThumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop",
        challenge: "4 farklı pazaryerinde manuel ürün ve sipariş yönetimi, stok tutarsızlıkları, geç kargo sorunları ve ürün görünürlüğü düşüklüğü yaşıyorduk. Ekip sürekli operasyonel işlerle boğuşuyor, stratejik işlere zaman kalmıyordu.",
        solution: "Pazaryonetimi ile tüm pazaryerlerini tek panelden yönetmeye başladık. AI SEO ile 3000+ ürün başlığını optimize ettik. Otomatik fiyat güncelleme ve stok senkronizasyonu sayesinde manuel işleri %90 azalttık.",
        results: [
            { metric: "Satış Artışı", value: "+185%", change: "6 ayda", icon: TrendingUp, color: "emerald" },
            { metric: "Sipariş Hızı", value: "3x", change: "Daha hızlı", icon: Zap, color: "blue" },
            { metric: "İade Oranı", value: "-45%", change: "Düşüş", icon: Percent, color: "purple" },
            { metric: "Müşteri Puanı", value: "4.9", change: "5 üzerinden", icon: Star, color: "yellow" },
        ],
        quote: "Pazaryonetimi olmadan bu büyümeyi yakalaması imkansızdı. Artık satışa odaklanabiliyoruz, operasyonla değil.",
        author: "Ayşe Yılmaz",
        role: "Kurucu & CEO",
        authorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "800", after: "5.000+", label: "Aylık Sipariş", growth: "+525%" },
            { before: "2", after: "6", label: "Pazaryeri", growth: "+200%" },
            { before: "4 saat", after: "30 dk", label: "Günlük İşlem", growth: "-87%" },
            { before: "₺120K", after: "₺680K", label: "Aylık Ciro", growth: "+467%" },
        ],
        timeline: [
            { month: "Ocak", value: 120 },
            { month: "Şubat", value: 180 },
            { month: "Mart", value: 280 },
            { month: "Nisan", value: 420 },
            { month: "Mayıs", value: 580 },
            { month: "Haziran", value: 680 },
        ],
        features: ["AI SEO Optimizasyonu", "Çoklu Pazaryeri Yönetimi", "Otomatik Stok Senkronizasyonu", "Toplu Ürün Güncelleme"]
    },
    {
        id: "tekno-market",
        company: "TeknoMarket",
        logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop",
        logoInitial: "TM",
        industry: "electronics",
        industryLabel: "Elektronik",
        location: "Ankara",
        employees: "50-100",
        yearStarted: "2017",
        usingPazarYonetimi: "2023",
        featured: true,
        videoThumbnail: "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=800&h=450&fit=crop",
        challenge: "Rakip fiyatlarını takip edemiyorduk, stok yönetimi kaotikti ve Trendyol'da görünürlüğümüz düşüktü. Marjlar sürekli eriyordu çünkü fiyat stratejimiz yoktu.",
        solution: "Rakip fiyat analizi ve otomatik fiyat optimizasyonu özelliklerini kullanmaya başladık. AI ile tüm ürünlerimizi SEO optimize ettik. Dinamik fiyatlandırma ile kar marjlarını koruduk.",
        results: [
            { metric: "Trendyol Sıralaması", value: "Top 10", change: "Kategoride", icon: Trophy, color: "amber" },
            { metric: "Kar Marjı", value: "+22%", change: "Artış", icon: TrendingUp, color: "emerald" },
            { metric: "Stok Devir", value: "2x", change: "İyileşme", icon: Package, color: "blue" },
            { metric: "Görünürlük", value: "+340%", change: "Artış", icon: BarChart3, color: "purple" },
        ],
        quote: "Fiyatlandırma artık bilimsel. Rakipleri gerçek zamanlı takip edip anında aksiyon alabiliyoruz. Bu oyun değiştirici.",
        author: "Mehmet Kaya",
        role: "E-ticaret Direktörü",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "₺150K", after: "₺580K", label: "Aylık Ciro", growth: "+287%" },
            { before: "1.200", after: "4.500", label: "Aktif Ürün", growth: "+275%" },
            { before: "%8", after: "%18", label: "Kar Marjı", growth: "+125%" },
            { before: "48 saat", after: "4 saat", label: "Fiyat Güncelleme", growth: "-92%" },
        ],
        timeline: [
            { month: "Ocak", value: 150 },
            { month: "Şubat", value: 220 },
            { month: "Mart", value: 310 },
            { month: "Nisan", value: 390 },
            { month: "Mayıs", value: 480 },
            { month: "Haziran", value: 580 },
        ],
        features: ["Rakip Fiyat Analizi", "Dinamik Fiyatlandırma", "AI SEO", "Stok Optimizasyonu"]
    },
    {
        id: "organik-gurme",
        company: "OrganikGurme",
        logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop",
        logoInitial: "OG",
        industry: "food",
        industryLabel: "Gıda & İçecek",
        location: "İzmir",
        employees: "10-25",
        yearStarted: "2020",
        usingPazarYonetimi: "2023",
        featured: false,
        videoThumbnail: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=800&h=450&fit=crop",
        challenge: "Son kullanma tarihi takibi zordu, siparişler gecikiyordu ve müşteri memnuniyeti düşüktü. Gıda sektöründe fire oranları çok yüksekti.",
        solution: "Gelişmiş stok yönetimi ile SKT takibi, otomatik sipariş işleme ve entegre kargo yönetimi kullanmaya başladık. FIFO mantığıyla stok rotasyonu optimize ettik.",
        results: [
            { metric: "Müşteri Puanı", value: "4.9/5", change: "Puan", icon: Star, color: "yellow" },
            { metric: "Fire Oranı", value: "-70%", change: "Düşüş", icon: Package, color: "red" },
            { metric: "Teslimat Hızı", value: "-40%", change: "Azalma", icon: Clock, color: "blue" },
            { metric: "Tekrar Alışveriş", value: "+85%", change: "Artış", icon: Users, color: "emerald" },
        ],
        quote: "Gıda sektöründe hız ve doğruluk hayati. Pazaryonetimi her ikisini de sağladı ve müşteri sadakati oluşturmamızı sağladı.",
        author: "Zeynep Demir",
        role: "Operasyon Müdürü",
        authorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "%12", after: "%3", label: "Fire Oranı", growth: "-75%" },
            { before: "3.2", after: "4.9", label: "Müşteri Puanı", growth: "+53%" },
            { before: "48 saat", after: "24 saat", label: "Teslimat", growth: "-50%" },
            { before: "₺80K", after: "₺320K", label: "Aylık Ciro", growth: "+300%" },
        ],
        timeline: [
            { month: "Ocak", value: 80 },
            { month: "Şubat", value: 120 },
            { month: "Mart", value: 180 },
            { month: "Nisan", value: 240 },
            { month: "Mayıs", value: 290 },
            { month: "Haziran", value: 320 },
        ],
        features: ["SKT Takibi", "FIFO Stok Yönetimi", "Otomatik Sipariş", "Kargo Entegrasyonu"]
    },
    {
        id: "bella-kozmetik",
        company: "Bella Kozmetik",
        logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop",
        logoInitial: "BK",
        industry: "cosmetics",
        industryLabel: "Kozmetik",
        location: "İstanbul",
        employees: "25-50",
        yearStarted: "2018",
        usingPazarYonetimi: "2024",
        featured: true,
        videoThumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=450&fit=crop",
        challenge: "Kozmetik sektöründe varyant yönetimi çok zordu. Her ürünün 15-20 farklı renk/tonu var. Excel'de takip etmek imkansız hale gelmişti.",
        solution: "Pazaryonetimi'nin gelişmiş varyant yönetimi ile tüm renk ve boyut kombinasyonlarını tek yerden yönetiyoruz. Toplu görsel yükleme ile zaman tasarrufu sağladık.",
        results: [
            { metric: "Ürün Listeleme", value: "10x", change: "Daha hızlı", icon: Zap, color: "purple" },
            { metric: "Varyant Hatası", value: "-95%", change: "Düşüş", icon: CheckCircle2, color: "emerald" },
            { metric: "Satış Artışı", value: "+210%", change: "8 ayda", icon: TrendingUp, color: "blue" },
            { metric: "İade Oranı", value: "-60%", change: "Düşüş", icon: Percent, color: "red" },
        ],
        quote: "Varyant yönetimi artık baş ağrısı değil. Her rengi, her tonu saniyeler içinde tüm pazaryerlerine yükleyebiliyoruz.",
        author: "Selin Ak",
        role: "Dijital Pazarlama Müdürü",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "2 saat", after: "10 dk", label: "Ürün Listeleme", growth: "-92%" },
            { before: "800", after: "3.500", label: "Aktif SKU", growth: "+337%" },
            { before: "₺200K", after: "₺620K", label: "Aylık Ciro", growth: "+210%" },
            { before: "%18", after: "%7", label: "İade Oranı", growth: "-61%" },
        ],
        timeline: [
            { month: "Ocak", value: 200 },
            { month: "Şubat", value: 280 },
            { month: "Mart", value: 350 },
            { month: "Nisan", value: 440 },
            { month: "Mayıs", value: 530 },
            { month: "Haziran", value: 620 },
        ],
        features: ["Varyant Yönetimi", "Toplu Görsel Yükleme", "Renk/Beden Matrisi", "Stok Senkronizasyonu"]
    },
    {
        id: "evim-dekor",
        company: "Evim Dekor",
        logo: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=100&h=100&fit=crop",
        logoInitial: "ED",
        industry: "home",
        industryLabel: "Ev & Yaşam",
        location: "Bursa",
        employees: "50-100",
        yearStarted: "2015",
        usingPazarYonetimi: "2022",
        featured: false,
        videoThumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop",
        challenge: "Büyük ve ağır ürünlerin kargo yönetimi çok zordu. Desi hesaplamaları, kargo firması seçimi ve hasar yönetimi sürekli sorun çıkarıyordu.",
        solution: "Pazaryonetimi'nin kargo optimizasyonu ile en uygun kargo firmasını otomatik seçiyoruz. Hasar takibi ve iade süreçleri tamamen dijitalleşti.",
        results: [
            { metric: "Kargo Maliyeti", value: "-35%", change: "Düşüş", icon: TrendingUp, color: "emerald" },
            { metric: "Hasar Oranı", value: "-80%", change: "Azalma", icon: Package, color: "blue" },
            { metric: "Teslimat Başarısı", value: "%98", change: "Oran", icon: CheckCircle2, color: "green" },
            { metric: "Müşteri Şikayeti", value: "-75%", change: "Azalma", icon: MessageCircle, color: "purple" },
        ],
        quote: "Mobilya ve dekorasyon ürünlerinde lojistik her şey demek. Pazaryonetimi ile teslimat süreçlerimiz profesyonelleşti.",
        author: "Burak Yıldırım",
        role: "Lojistik Direktörü",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "₺45", after: "₺29", label: "Ortalama Kargo", growth: "-36%" },
            { before: "%8", after: "%1.5", label: "Hasar Oranı", growth: "-81%" },
            { before: "5 gün", after: "2 gün", label: "Teslimat Süresi", growth: "-60%" },
            { before: "₺350K", after: "₺890K", label: "Aylık Ciro", growth: "+154%" },
        ],
        timeline: [
            { month: "Ocak", value: 350 },
            { month: "Şubat", value: 450 },
            { month: "Mart", value: 560 },
            { month: "Nisan", value: 680 },
            { month: "Mayıs", value: 780 },
            { month: "Haziran", value: 890 },
        ],
        features: ["Kargo Optimizasyonu", "Desi Hesaplama", "Hasar Takibi", "Çoklu Kargo Firması"]
    },
    {
        id: "spor-zone",
        company: "SporZone",
        logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop",
        logoInitial: "SZ",
        industry: "fashion",
        industryLabel: "Spor & Outdoor",
        location: "Antalya",
        employees: "10-25",
        yearStarted: "2021",
        usingPazarYonetimi: "2024",
        featured: false,
        videoThumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=450&fit=crop",
        challenge: "Sezonluk ürünlerde stok planlaması yapamıyorduk. Yaz ürünleri kışın, kış ürünleri yazın elimizde kalıyordu. Nakit akışı her zaman sıkıntılıydı.",
        solution: "Pazaryonetimi'nin AI destekli stok tahmini ile sezonluk planlamayı optimize ettik. Geçmiş satış verilerini analiz ederek doğru miktarda ürün stokluyoruz.",
        results: [
            { metric: "Stok Doğruluğu", value: "%95", change: "Oran", icon: Target, color: "blue" },
            { metric: "Ölü Stok", value: "-80%", change: "Azalma", icon: Package, color: "red" },
            { metric: "Nakit Akışı", value: "+45%", change: "İyileşme", icon: TrendingUp, color: "emerald" },
            { metric: "Sezon Sonu Fire", value: "-65%", change: "Düşüş", icon: Percent, color: "purple" },
        ],
        quote: "Sezonluk işlerde doğru tahmin yapmak hayati. AI sayesinde artık ne kadar ürün alacağımızı biliyoruz.",
        author: "Can Özdemir",
        role: "Satın Alma Müdürü",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        stats: [
            { before: "%60", after: "%95", label: "Tahmin Doğruluğu", growth: "+58%" },
            { before: "%25", after: "%5", label: "Ölü Stok", growth: "-80%" },
            { before: "₺180K", after: "₺420K", label: "Aylık Ciro", growth: "+133%" },
            { before: "45 gün", after: "22 gün", label: "Stok Devir", growth: "-51%" },
        ],
        timeline: [
            { month: "Ocak", value: 180 },
            { month: "Şubat", value: 220 },
            { month: "Mart", value: 280 },
            { month: "Nisan", value: 340 },
            { month: "Mayıs", value: 380 },
            { month: "Haziran", value: 420 },
        ],
        features: ["AI Stok Tahmini", "Sezonluk Analiz", "Talep Planlama", "Otomatik Sipariş Önerisi"]
    }
];

// Video testimonial'lar
const videoTestimonials = [
    {
        company: "ModaBütik",
        thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=340&fit=crop",
        duration: "3:45",
        title: "Nasıl 6 ayda %185 büyüdük?",
        views: "12.4K"
    },
    {
        company: "TeknoMarket",
        thumbnail: "https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=600&h=340&fit=crop",
        duration: "4:20",
        title: "Rakip fiyat analizi ile kar marjını nasıl artırdık?",
        views: "8.7K"
    },
    {
        company: "Bella Kozmetik",
        thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=340&fit=crop",
        duration: "2:55",
        title: "3500 varyantı nasıl yönetiyoruz?",
        views: "6.2K"
    }
];

// Toplam metrikler
const totalMetrics = [
    { value: "25,000+", label: "Mutlu Satıcı", icon: Users, color: "from-orange-500 to-amber-500" },
    { value: "₺5B+", label: "İşlenen GMV", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
    { value: "2M+", label: "Aylık Sipariş", icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
    { value: "%180", label: "Ortalama Büyüme", icon: BarChart3, color: "from-orange-500 to-red-500" },
];

// Müşteri logoları
const customerLogos = [
    "ModaBütik", "TeknoMarket", "OrganikGurme", "Bella Kozmetik", "Evim Dekor", 
    "SporZone", "PetShop Plus", "KitapDünyası", "Oyuncak Evi", "Bahçe Market"
];

export default function BasariHikayeleriPage() {
    const [selectedIndustry, setSelectedIndustry] = useState('all');
    const [selectedStory, setSelectedStory] = useState<typeof successStories[0] | null>(null);
    const [, setShowVideo] = useState(false);

    const filteredStories = selectedIndustry === 'all' 
        ? successStories 
        : successStories.filter(s => s.industry === selectedIndustry);

    const featuredStories = successStories.filter(s => s.featured);

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-800 rounded-full mb-6"
                    >
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">Gerçek Sonuçlar, Gerçek İşletmeler</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Başarı Hikayeleri</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
                            %180 Ortalama Büyüme
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        25.000+ işletme Pazaryonetimi ile e-ticaret operasyonlarını dönüştürdü. 
                        İşte onların hikayeleri ve elde ettikleri sonuçlar.
                    </p>
                </motion.div>

                {/* Metrics Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
                >
                    {totalMetrics.map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="group relative p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all hover:shadow-xl"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4`}>
                                <metric.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-1">{metric.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Customer Logos Marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20 overflow-hidden"
                >
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Türkiye&apos;nin önde gelen e-ticaret markalarının tercihi
                    </p>
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAF9] dark:from-[#0B1120] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAF9] dark:from-[#0B1120] to-transparent z-10" />
                        <div className="flex gap-8 animate-marquee">
                            {[...customerLogos, ...customerLogos].map((logo, i) => (
                                <div key={i} className="flex-shrink-0 px-6 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <span className="text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">{logo}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Video Testimonials Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Video Testimonial&apos;lar
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">Müşterilerimizin kendi ağzından başarı hikayeleri</p>
                        </div>
                        <Link href="#" className="hidden md:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                            Tüm Videoları Gör <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {videoTestimonials.map((video, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => setShowVideo(true)}
                            >
                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={video.thumbnail} 
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-xs font-medium">
                                        {video.duration}
                                    </div>
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 rounded-full text-white text-xs font-bold">
                                        {video.company}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{video.views} görüntüleme</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Industry Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Filter size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sektöre Göre Filtrele</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {industries.map((ind) => (
                            <button
                                key={ind.id}
                                onClick={() => setSelectedIndustry(ind.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                                    selectedIndustry === ind.id
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <ind.icon size={16} />
                                {ind.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Featured Case Studies */}
                <div className="mb-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
                        Öne Çıkan Hikayeler
                    </h2>
                    
                    <div className="space-y-12">
                        {featuredStories.filter(s => selectedIndustry === 'all' || s.industry === selectedIndustry).map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="relative"
                            >
                                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${index % 2 === 1 ? '' : ''}`}>
                                    {/* Content Side */}
                                    <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                        {/* Company Header */}
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                                                {story.logoInitial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{story.company}</h3>
                                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                                                        ⭐ Öne Çıkan
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{story.industryLabel}</span>
                                                    <span>•</span>
                                                    <span>{story.location}</span>
                                                    <span>•</span>
                                                    <span>{story.employees} çalışan</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Challenge & Solution */}
                                        <div className="space-y-4 mb-6">
                                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                                <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <X size={14} /> Zorluk
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{story.challenge}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                                                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                                    <CheckCircle2 size={14} /> Çözüm
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{story.solution}</p>
                                            </div>
                                        </div>

                                        {/* Results Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                            {story.results.map((result, i) => {
                                                const colorClasses: Record<string, string> = {
                                                    emerald: 'from-emerald-500 to-green-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
                                                    blue: 'from-orange-500 to-amber-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
                                                    purple: 'from-purple-500 to-pink-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
                                                    yellow: 'from-yellow-500 to-amber-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
                                                    amber: 'from-amber-500 to-orange-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
                                                    red: 'from-red-500 to-rose-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
                                                    green: 'from-green-500 to-emerald-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
                                                };
                                                const colorClass = colorClasses[result.color] || colorClasses.emerald;
                                                
                                                return (
                                                    <div key={i} className={`p-3 rounded-xl border ${colorClass.split(' ').slice(2).join(' ')}`}>
                                                        <result.icon className={`w-4 h-4 mb-2 ${colorClass.split(' ').slice(-2).join(' ')}`} />
                                                        <div className={`text-xl font-black ${colorClass.split(' ').slice(-2).join(' ')}`}>{result.value}</div>
                                                        <div className="text-xs text-slate-600 dark:text-slate-400">{result.metric}</div>
                                                        <div className="text-[10px] text-slate-400">{result.change}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Quote */}
                                        <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                            <Quote className="absolute top-4 left-4 w-6 h-6 text-slate-200 dark:text-white/10" />
                                            <p className="text-slate-700 dark:text-slate-300 italic pl-8 mb-4">
                                                &ldquo;{story.quote}&rdquo;
                                            </p>
                                            <div className="flex items-center gap-3 pl-8">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={story.authorImage} alt={story.author} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{story.author}</div>
                                                    <div className="text-xs text-slate-500">{story.role}, {story.company}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Visual Side */}
                                    <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                        {/* Before/After Card */}
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white/10 dark:via-white/5 dark:to-white/10 border border-slate-700 dark:border-white/10 shadow-2xl">
                                            <h4 className="text-white text-center font-bold mb-6 flex items-center justify-center gap-2">
                                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                                Dönüşüm Sonuçları
                                            </h4>
                                            
                                            <div className="space-y-4">
                                                {story.stats.map((stat, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-slate-400">{stat.label}</span>
                                                            <span className="text-xs font-bold text-emerald-400">{stat.growth}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 text-right">
                                                                <div className="text-lg font-bold text-slate-400">{stat.before}</div>
                                                                <div className="text-[10px] text-slate-500">Öncesi</div>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                                <ChevronRight className="text-emerald-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-lg font-bold text-emerald-400">{stat.after}</div>
                                                                <div className="text-[10px] text-slate-500">Sonrası</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Mini Chart */}
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <div className="flex items-end justify-between h-20 px-2">
                                                    {story.timeline.map((point, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-1">
                                                            <div 
                                                                className="w-6 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t"
                                                                style={{ height: `${(point.value / Math.max(...story.timeline.map(p => p.value))) * 60}px` }}
                                                            />
                                                            <span className="text-[9px] text-slate-500">{point.month.slice(0, 3)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-center text-xs text-slate-400 mt-2">Aylık Ciro Gelişimi (₺K)</p>
                                            </div>

                                            {/* Features Used */}
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <p className="text-xs text-slate-400 mb-3">Kullanılan Özellikler</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {story.features.map((feature, i) => (
                                                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* All Case Studies Grid */}
                <div className="mb-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
                        Tüm Başarı Hikayeleri
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStories.map((story, i) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => setSelectedStory(story)}
                            >
                                {story.featured && (
                                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                                        ⭐ ÖNE ÇIKAN
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                        {story.logoInitial}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {story.company}
                                        </h3>
                                        <p className="text-sm text-slate-500">{story.industryLabel}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {story.results.slice(0, 2).map((result, j) => (
                                        <div key={j} className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-center">
                                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.value}</div>
                                            <div className="text-xs text-slate-500">{result.metric}</div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                                    &ldquo;{story.quote}&rdquo;
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={story.authorImage} alt={story.author} className="w-8 h-8 rounded-full object-cover" />
                                        <div>
                                            <div className="text-xs font-medium text-slate-900 dark:text-white">{story.author}</div>
                                            <div className="text-[10px] text-slate-500">{story.role}</div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Testimonials Slider */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                        Müşterilerimiz Ne Diyor?
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {successStories.slice(0, 6).map((story, i) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={16} className="text-yellow-400" fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic mb-4 line-clamp-3">
                                    &ldquo;{story.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={story.authorImage} alt={story.author} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{story.author}</div>
                                        <div className="text-xs text-slate-500">{story.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    
                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur mb-6"
                        >
                            <Award className="w-10 h-10 text-yellow-300" />
                        </motion.div>
                        
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            Bir Sonraki Başarı Hikayesi<br />
                            <span className="text-yellow-300">Sizinki Olsun</span>
                        </h2>
                        
                        <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                            14 gün ücretsiz deneyin, herhangi bir kredi kartı gerekmez. 
                            Binlerce satıcının neden Pazaryonetimi&apos;ni tercih ettiğini kendiniz görün.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/signup" 
                                className="group px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-xl"
                            >
                                Ücretsiz Başla 
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/demo" 
                                className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Play size={18} /> Demo İzle
                            </Link>
                        </div>
                        
                        <div className="flex items-center justify-center gap-6 mt-8 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-300" />
                                14 gün ücretsiz
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-300" />
                                Kredi kartı gerekmez
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-300" />
                                Anında kurulum
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Story Detail Modal */}
            <AnimatePresence>
                {selectedStory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedStory(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black">
                                            {selectedStory.logoInitial}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStory.company}</h2>
                                            <p className="text-slate-500">{selectedStory.industryLabel} • {selectedStory.location}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedStory(null)}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                        <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">🎯 Zorluk</h4>
                                        <p className="text-slate-600 dark:text-slate-300">{selectedStory.challenge}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                                        <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">✅ Çözüm</h4>
                                        <p className="text-slate-600 dark:text-slate-300">{selectedStory.solution}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {selectedStory.results.map((result, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{result.value}</div>
                                            <div className="text-xs text-slate-500">{result.metric}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 rounded-xl bg-slate-50 dark:bg-white/5 mb-6">
                                    <Quote className="w-8 h-8 text-slate-200 dark:text-white/10 mb-2" />
                                    <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-4">&ldquo;{selectedStory.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={selectedStory.authorImage} alt={selectedStory.author} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{selectedStory.author}</div>
                                            <div className="text-sm text-slate-500">{selectedStory.role}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Link 
                                        href="/signup" 
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors text-center"
                                    >
                                        Ücretsiz Deneyin
                                    </Link>
                                    <Link 
                                        href="/demo" 
                                        className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-center"
                                    >
                                        Demo Talep Et
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for marquee animation */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </MarketingPageShell>
    );
}

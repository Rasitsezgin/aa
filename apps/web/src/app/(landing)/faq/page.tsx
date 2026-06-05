"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, HelpCircle, Search, MessageCircle, ArrowRight, Sparkles,
    Settings, CreditCard, Shield, Globe, Zap, Package, Users, BarChart3,
    Clock, CheckCircle2, ThumbsUp, Send, BookOpen, Video, Headphones,
    Star, TrendingUp, Bot, FileText, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// Kategori tanımları
const categories = [
    { 
        id: 'all', 
        label: 'Tüm Sorular', 
        icon: HelpCircle,
        color: 'slate',
        gradient: 'from-slate-500 to-gray-500',
        description: 'Tüm kategorilerdeki sorular'
    },
    { 
        id: 'general', 
        label: 'Genel', 
        icon: Sparkles,
        color: 'blue',
        gradient: 'from-orange-500 to-amber-500',
        description: 'Platform hakkında genel bilgiler'
    },
    { 
        id: 'pricing', 
        label: 'Fiyatlandırma', 
        icon: CreditCard,
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
        description: 'Planlar, ödemeler ve faturalandırma'
    },
    { 
        id: 'integrations', 
        label: 'Entegrasyonlar', 
        icon: Globe,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500',
        description: 'Pazaryeri bağlantıları'
    },
    { 
        id: 'features', 
        label: 'Özellikler', 
        icon: Zap,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500',
        description: 'Platform özellikleri'
    },
    { 
        id: 'security', 
        label: 'Güvenlik', 
        icon: Shield,
        color: 'rose',
        gradient: 'from-rose-500 to-red-500',
        description: 'Veri güvenliği ve gizlilik'
    },
    { 
        id: 'support', 
        label: 'Destek', 
        icon: Headphones,
        color: 'indigo',
        gradient: 'from-amber-500 to-violet-500',
        description: 'Yardım ve müşteri desteği'
    },
];

// Kapsamlı FAQ verileri
const faqItems = [
    // Genel
    {
        id: 'general-1',
        category: 'general',
        question: 'Pazaryonetimi nedir?',
        answer: 'Pazaryonetimi, e-ticaret satıcılarının tüm pazaryerlerini tek bir panelden yönetmelerini sağlayan bulut tabanlı bir SaaS platformudur. Ürün, stok, sipariş, fiyat ve kargo yönetimini tek merkezden otomatikleştirerek operasyonel verimliliği artırır.',
        helpful: 1247,
        views: 15420,
        featured: true
    },
    {
        id: 'general-2',
        category: 'general',
        question: 'Pazaryonetimi kimler için uygun?',
        answer: 'Küçük e-ticaret satıcılarından büyük ölçekli operasyonlara kadar her boyuttaki işletme için uygundur. Özellikle birden fazla pazaryerinde satış yapan, stok ve sipariş yönetiminde zorluk yaşayan, manuel işlerden kurtulmak isteyen satıcılar için idealdir.',
        helpful: 892,
        views: 8750,
        featured: false
    },
    {
        id: 'general-3',
        category: 'general',
        question: 'Ücretsiz deneme nasıl başlatılır?',
        answer: '14 günlük ücretsiz deneme için kayıt olmanız yeterli. Kredi kartı bilgisi istenmez, tüm özelliklere tam erişim sağlanır. Deneme süresi sonunda otomatik ücretlendirme yapılmaz, siz plan seçene kadar hesabınız askıya alınır.',
        helpful: 1105,
        views: 12300,
        featured: true
    },
    {
        id: 'general-4',
        category: 'general',
        question: 'Hangi dillerde hizmet veriyorsunuz?',
        answer: 'Platform arayüzü Türkçe ve İngilizce olarak sunulmaktadır. Destek hizmetleri Türkçe olarak 7/24 verilmektedir. Dokümantasyon ve yardım merkezi içerikleri her iki dilde de mevcuttur.',
        helpful: 456,
        views: 3200,
        featured: false
    },
    {
        id: 'general-5',
        category: 'general',
        question: 'Mobil uygulama var mı?',
        answer: 'Evet, iOS ve Android için mobil uygulamamız mevcuttur. Mobil uygulama ile siparişleri görüntüleyebilir, stok durumunu kontrol edebilir, bildirimleri yönetebilir ve temel operasyonları gerçekleştirebilirsiniz.',
        helpful: 678,
        views: 5400,
        featured: false
    },

    // Fiyatlandırma
    {
        id: 'pricing-1',
        category: 'pricing',
        question: 'Planlar arasındaki farklar nelerdir?',
        answer: 'Başlangıç planı: 1 pazaryeri, 500 ürün, temel özellikler. Profesyonel plan: Sınırsız pazaryeri, 5000 ürün, AI özellikleri, öncelikli destek. Kurumsal plan: Sınırsız her şey, özel entegrasyonlar, dedicated account manager, SLA garantisi.',
        helpful: 1532,
        views: 18900,
        featured: true
    },
    {
        id: 'pricing-2',
        category: 'pricing',
        question: 'Gizli ücret var mı?',
        answer: 'Hayır, kesinlikle gizli ücret yoktur. Fiyatlandırma sayfamızda belirtilen tutarlar dışında komisyon, işlem ücreti veya ek maliyet bulunmaz. Ne görüyorsanız onu ödersiniz.',
        helpful: 1890,
        views: 14500,
        featured: true
    },
    {
        id: 'pricing-3',
        category: 'pricing',
        question: 'Plan değişikliği nasıl yapılır?',
        answer: 'Hesap ayarlarından istediğiniz zaman plan yükseltme veya düşürme yapabilirsiniz. Yükseltmelerde fark anında ödenir ve özellikler hemen aktif olur. Düşürmelerde mevcut dönem sonunda yeni plan geçerli olur.',
        helpful: 756,
        views: 6800,
        featured: false
    },
    {
        id: 'pricing-4',
        category: 'pricing',
        question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        answer: 'Kredi kartı (Visa, Mastercard, American Express), banka kartı, havale/EFT ve kurumsal fatura ile ödeme kabul ediyoruz. Yıllık ödemelerde %20 indirim uygulanır.',
        helpful: 543,
        views: 4200,
        featured: false
    },
    {
        id: 'pricing-5',
        category: 'pricing',
        question: 'İade politikanız nedir?',
        answer: 'İlk 14 gün içinde memnun kalmazsanız tam iade garantisi sunuyoruz. 14 günden sonra kalan süre için orantılı iade yapılır. İptal işlemi hesap ayarlarından kolayca gerçekleştirilebilir.',
        helpful: 892,
        views: 7600,
        featured: false
    },
    {
        id: 'pricing-6',
        category: 'pricing',
        question: 'Kurumsal plan için özel fiyat alabilir miyim?',
        answer: 'Evet, 100+ ürün veya özel gereksinimleriniz varsa kurumsal satış ekibimizle iletişime geçebilirsiniz. İşletmenizin ihtiyaçlarına göre özel fiyatlandırma ve ek özellikler sunabiliriz.',
        helpful: 421,
        views: 3100,
        featured: false
    },

    // Entegrasyonlar
    {
        id: 'integrations-1',
        category: 'integrations',
        question: 'Hangi pazaryerlerini destekliyorsunuz?',
        answer: 'Trendyol, Hepsiburada, Amazon Türkiye, N11, Çiçeksepeti, GittiGidiyor, Etsy, ePttAVM dahil 30+ pazaryerini destekliyoruz. Ayrıca Shopify, WooCommerce, OpenCart gibi e-ticaret altyapıları ile de entegrasyon sağlıyoruz.',
        helpful: 2156,
        views: 25800,
        featured: true
    },
    {
        id: 'integrations-2',
        category: 'integrations',
        question: 'Entegrasyon kurulumu ne kadar sürer?',
        answer: 'Çoğu pazaryeri entegrasyonu 5-10 dakika içinde tamamlanır. Sadece pazaryeri hesap bilgilerinizi ve API anahtarlarınızı girmeniz yeterli. Adım adım kurulum rehberleri ve video eğitimler mevcuttur.',
        helpful: 1432,
        views: 11200,
        featured: true
    },
    {
        id: 'integrations-3',
        category: 'integrations',
        question: 'Stok senkronizasyonu nasıl çalışır?',
        answer: 'Stok senkronizasyonu gerçek zamanlı olarak çalışır. Bir pazaryerinde satış yapıldığında, tüm bağlı pazaryerlerindeki stok otomatik olarak güncellenir. Bu sayede eksi stok satışı ve müşteri memnuniyetsizliği önlenir.',
        helpful: 1876,
        views: 16400,
        featured: true
    },
    {
        id: 'integrations-4',
        category: 'integrations',
        question: 'Kargo firması entegrasyonları var mı?',
        answer: 'Evet, Yurtiçi Kargo, Aras Kargo, MNG Kargo, Sürat Kargo, PTT Kargo dahil tüm büyük kargo firmalarıyla entegrasyonumuz mevcuttur. Otomatik kargo etiketi oluşturma ve takip numarası senkronizasyonu sağlanır.',
        helpful: 1234,
        views: 9800,
        featured: false
    },
    {
        id: 'integrations-5',
        category: 'integrations',
        question: 'Muhasebe yazılımı entegrasyonu mümkün mü?',
        answer: 'Logo, Mikro, Eta, Netsis, Paraşüt gibi popüler muhasebe yazılımlarıyla entegrasyon desteği sunuyoruz. Otomatik fatura oluşturma ve muhasebe kaydı aktarımı yapılabilir.',
        helpful: 678,
        views: 5600,
        featured: false
    },

    // Özellikler
    {
        id: 'features-1',
        category: 'features',
        question: 'AI SEO optimizasyonu ne işe yarar?',
        answer: 'Yapay zeka destekli SEO aracımız, ürün başlıklarınızı ve açıklamalarınızı pazaryeri algoritmalarına uygun şekilde optimize eder. Anahtar kelime önerileri, başlık iyileştirme ve kategori eşleştirme ile ürünlerinizin görünürlüğünü artırır.',
        helpful: 1654,
        views: 13200,
        featured: true
    },
    {
        id: 'features-2',
        category: 'features',
        question: 'Toplu ürün güncelleme nasıl yapılır?',
        answer: 'Excel/CSV dosyası ile toplu ürün yükleme ve güncelleme yapabilirsiniz. Ayrıca platform içinden filtreleme yaparak seçili ürünlerde toplu fiyat, stok, açıklama değişikliği gerçekleştirebilirsiniz.',
        helpful: 1432,
        views: 11800,
        featured: false
    },
    {
        id: 'features-3',
        category: 'features',
        question: 'Rakip fiyat takibi nasıl çalışır?',
        answer: 'Belirlediğiniz rakiplerin fiyatlarını otomatik olarak takip ederiz. Fiyat değişikliklerinde bildirim alır, otomatik fiyat kuralları oluşturabilirsiniz. Dinamik fiyatlandırma ile her zaman rekabetçi kalın.',
        helpful: 1876,
        views: 14500,
        featured: true
    },
    {
        id: 'features-4',
        category: 'features',
        question: 'Raporlama özellikleri nelerdir?',
        answer: 'Satış analizi, stok durumu, kar/zarar, pazaryeri performansı, ürün bazlı raporlar sunuyoruz. Özelleştirilebilir dashboard, otomatik rapor gönderimi ve Excel/PDF dışa aktarım özellikleri mevcuttur.',
        helpful: 1123,
        views: 8900,
        featured: false
    },
    {
        id: 'features-5',
        category: 'features',
        question: 'Sipariş yönetimi nasıl çalışır?',
        answer: 'Tüm pazaryerlerinden gelen siparişler tek panelde görüntülenir. Toplu sipariş onaylama, kargo atama, fatura oluşturma ve müşteri iletişimi tek yerden yönetilir. Otomatik sipariş kuralları tanımlanabilir.',
        helpful: 1567,
        views: 12400,
        featured: false
    },

    // Güvenlik
    {
        id: 'security-1',
        category: 'security',
        question: 'Verilerim güvende mi?',
        answer: 'Evet, verileriniz enterprise-grade güvenlik standartlarıyla korunur. 256-bit SSL/TLS şifreleme, ISO 27001 sertifikalı veri merkezleri, düzenli güvenlik denetimleri, KVKK ve GDPR uyumluluğu sağlanır.',
        helpful: 2341,
        views: 19800,
        featured: true
    },
    {
        id: 'security-2',
        category: 'security',
        question: 'İki faktörlü doğrulama (2FA) var mı?',
        answer: 'Evet, hesap güvenliğiniz için 2FA özelliğini aktif edebilirsiniz. Google Authenticator, Authy veya SMS ile doğrulama seçenekleri mevcuttur. Tüm kullanıcılar için 2FA zorunlu kılınabilir.',
        helpful: 987,
        views: 7600,
        featured: false
    },
    {
        id: 'security-3',
        category: 'security',
        question: 'Yedekleme politikanız nedir?',
        answer: 'Verileriniz günlük olarak otomatik yedeklenir ve 30 gün boyunca saklanır. Coğrafi olarak ayrı veri merkezlerinde replikasyon yapılır. İstenildiğinde manuel yedek alınabilir ve dışa aktarılabilir.',
        helpful: 765,
        views: 5400,
        featured: false
    },
    {
        id: 'security-4',
        category: 'security',
        question: 'API güvenliği nasıl sağlanıyor?',
        answer: 'API erişimi OAuth 2.0 ile güvence altına alınır. IP kısıtlama, rate limiting, API anahtarı rotasyonu ve detaylı erişim logları ile güvenlik sağlanır. API anahtarlarına özel izinler atanabilir.',
        helpful: 543,
        views: 4100,
        featured: false
    },
    {
        id: 'security-5',
        category: 'security',
        question: 'Hesap iptalinde verilerime ne olur?',
        answer: 'İptal sonrası verileriniz 30 gün boyunca saklanır, bu sürede dışa aktarabilirsiniz. Talep üzerine anında kalıcı silme de yapılabilir. KVKK kapsamında veri silme hakkınız her zaman korunur.',
        helpful: 1234,
        views: 9200,
        featured: false
    },

    // Destek
    {
        id: 'support-1',
        category: 'support',
        question: 'Destek saatleri nedir?',
        answer: 'Canlı destek 7/24 aktiftir. Telefon desteği hafta içi 09:00-18:00 saatleri arasında sunulmaktadır. E-posta desteğine 7/24 ulaşabilirsiniz, ortalama yanıt süresi 2 saattir.',
        helpful: 1876,
        views: 15600,
        featured: true
    },
    {
        id: 'support-2',
        category: 'support',
        question: 'Onboarding desteği alabilir miyim?',
        answer: 'Evet, tüm yeni müşterilere ücretsiz onboarding desteği sunuyoruz. Video eğitimler, adım adım rehberler, canlı kurulum desteği ve ilk 30 gün öncelikli destek hizmeti verilir.',
        helpful: 1432,
        views: 11200,
        featured: true
    },
    {
        id: 'support-3',
        category: 'support',
        question: 'Eğitim materyalleri nelerdir?',
        answer: 'Kapsamlı video eğitimler, yazılı rehberler, webinarlar, blog içerikleri ve interaktif ürün turları sunuyoruz. Tüm materyallere Yardım Merkezi üzerinden ücretsiz erişebilirsiniz.',
        helpful: 987,
        views: 7800,
        featured: false
    },
    {
        id: 'support-4',
        category: 'support',
        question: 'Premium destek nedir?',
        answer: 'Premium destek, Profesyonel ve Kurumsal plan müşterilerine sunulur. Öncelikli yanıt (30 dakika içinde), dedicated account manager, özel Slack/Teams kanalı ve aylık strateji görüşmeleri içerir.',
        helpful: 654,
        views: 5200,
        featured: false
    },
    {
        id: 'support-5',
        category: 'support',
        question: 'Özel entegrasyon talebi yapabilir miyim?',
        answer: 'Evet, mevcut entegrasyonlar dışında özel entegrasyon talepleri değerlendirilir. Kurumsal plan müşterilerine özel geliştirme önceliği verilir. Talep formunu doldurarak başvurabilirsiniz.',
        helpful: 432,
        views: 3400,
        featured: false
    },
];

// İstatistikler
const stats = [
    { value: '25,000+', label: 'Mutlu Satıcı', icon: Users },
    { value: '150+', label: 'SSS Makalesi', icon: FileText },
    { value: '%98', label: 'Çözüm Oranı', icon: CheckCircle2 },
    { value: '< 2 dk', label: 'Yanıt Süresi', icon: Clock },
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

    // Filtreleme
    const filteredItems = useMemo(() => {
        return faqItems.filter(item => {
            const matchSearch = searchQuery === '' || 
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchSearch && matchCategory;
        });
    }, [searchQuery, selectedCategory]);

    // Featured sorular
    const featuredItems = faqItems.filter(item => item.featured);

    // Helpful click handler
    const handleHelpful = (id: string) => {
        setHelpfulClicked(prev => new Set(prev).add(id));
    };

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/10 dark:bg-amber-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 blur-[150px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-800 rounded-full mb-6"
                    >
                        <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tracking-wide">Sık Sorulan Sorular</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Sorularınızın</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-500">
                            Cevapları Burada
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        En çok merak edilen soruların cevaplarını derledik. 
                        Aradığınızı bulamazsanız destek ekibimiz her zaman yanınızda.
                    </p>

                    {/* Search Box */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Soru arayın... (örn: stok senkronizasyonu, fiyatlandırma)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        )}
                    </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                                <stat.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                                {cat.id !== 'all' && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        selectedCategory === cat.id 
                                            ? 'bg-white/20' 
                                            : 'bg-slate-200 dark:bg-white/10'
                                    }`}>
                                        {faqItems.filter(f => f.category === cat.id).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Featured Questions - Only show when no search and all category */}
                {searchQuery === '' && selectedCategory === 'all' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">En Çok Sorulan</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredItems.slice(0, 6).map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                    className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 text-sm">
                                                {item.question}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                <span>{item.views.toLocaleString()} görüntüleme</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp size={10} /> {item.helpful}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Main FAQ Section */}
                <div className="max-w-4xl mx-auto">
                    {/* Results count */}
                    {searchQuery && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 text-sm text-slate-500"
                        >
                            &ldquo;{searchQuery}&rdquo; için <strong>{filteredItems.length}</strong> sonuç bulundu
                        </motion.div>
                    )}

                    {/* FAQ Items */}
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, i) => {
                                const category = categories.find(c => c.id === item.category);
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: i * 0.02 }}
                                        layout
                                        className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden hover:border-amber-300 dark:hover:border-amber-500/30 transition-all"
                                    >
                                        <button
                                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                            className="w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category?.gradient || 'from-slate-500 to-gray-500'} flex items-center justify-center flex-shrink-0`}>
                                                {category && <category.icon className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {category?.label}
                                                    </span>
                                                    {item.featured && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-bold">
                                                            ⭐ POPÜLER
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white pr-6">{item.question}</h3>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform mt-2 ${expandedId === item.id ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {expandedId === item.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 pt-0 ml-14">
                                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            {item.answer}
                                                        </p>
                                                        
                                                        {/* Feedback Section */}
                                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs text-slate-500">Bu cevap yardımcı oldu mu?</span>
                                                                {helpfulClicked.has(item.id) ? (
                                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                        <CheckCircle2 size={14} /> Teşekkürler!
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <button 
                                                                            onClick={(e) => { e.stopPropagation(); handleHelpful(item.id); }}
                                                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-500 transition-colors"
                                                                        >
                                                                            <ThumbsUp size={14} /> Evet ({item.helpful})
                                                                        </button>
                                                                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors">
                                                                            <ThumbsUp size={14} className="rotate-180" /> Hayır
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400">{item.views.toLocaleString()} görüntüleme</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* No Results */}
                    {filteredItems.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <HelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sonuç Bulunamadı</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                &ldquo;{searchQuery}&rdquo; ile eşleşen soru bulunamadı.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                className="px-6 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
                            >
                                Filtreleri Temizle
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 grid md:grid-cols-3 gap-6"
                >
                    <Link href="/destek" className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Yardım Merkezi</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Detaylı rehberler ve dokümantasyon</p>
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                            Keşfet <ArrowRight size={14} />
                        </span>
                    </Link>
                    
                    <Link href="/destek/videolar" className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                            <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Video Eğitimler</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Adım adım video anlatımlar</p>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                            İzle <ArrowRight size={14} />
                        </span>
                    </Link>
                    
                    <Link href="/contact" className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                            <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Canlı Destek</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">7/24 uzman destek ekibi</p>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            Sohbet Başlat <ArrowRight size={14} />
                        </span>
                    </Link>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <Bot className="w-16 h-16 text-white/20 mb-4" />
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Hâlâ Sorunuz mu Var?
                            </h2>
                            <p className="text-lg text-amber-100 mb-6">
                                Aradığınız cevabı bulamadıysanız destek ekibimize ulaşın. 
                                Ortalama 2 saat içinde yanıt alın.
                            </p>
                            <div className="flex items-center gap-4 text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-300" />
                                    7/24 Destek
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-300" />
                                    Türkçe Hizmet
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h3 className="text-lg font-bold text-white mb-4">Hızlı Mesaj Gönderin</h3>
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                                />
                                <textarea
                                    placeholder="Sorunuzu yazın..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 resize-none"
                                />
                                <button className="w-full py-3 bg-white text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                                    <Send size={18} /> Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper, FileText, ExternalLink, Download,
    Award, TrendingUp, Globe, ArrowRight, Search,
    Mic, Video, Building2, Star,
    Mail, Phone, Twitter, Linkedin,
    Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface PressItem {
    id: string;
    type: 'haber' | 'basin-bulteni' | 'makale' | 'video' | 'podcast';
    title: string;
    description: string;
    source: string;
    sourceLogo: string;
    date: string;
    link: string;
    featured?: boolean;
    image?: string;
}

const pressItems: PressItem[] = [
    {
        id: '1',
        type: 'haber',
        title: 'Pazaryonetimi, 50 Milyon TL Yatırım Aldı',
        description: 'E-ticaret yönetim platformu Pazaryonetimi, Seri A turunda 50 milyon TL yatırım alarak global genişleme planlarını hızlandırıyor.',
        source: 'TechCrunch Türkiye',
        sourceLogo: 'TC',
        date: '2024-01-15',
        link: '#',
        featured: true,
        image: 'from-orange-500 to-amber-600'
    },
    {
        id: '2',
        type: 'haber',
        title: 'E-ticaret\'te AI Devrimi: Pazaryonetimi Örneği',
        description: 'Yapay zeka destekli fiyatlandırma ile satışları %300 artıran platform, sektörde yeni standartlar belirliyor.',
        source: 'Webrazzi',
        sourceLogo: 'WB',
        date: '2024-01-10',
        link: '#',
        featured: true,
        image: 'from-purple-500 to-pink-600'
    },
    {
        id: '3',
        type: 'basin-bulteni',
        title: 'Pazaryonetimi, Amazon Türkiye Entegrasyonunu Duyurdu',
        description: 'Türk e-ticaret satıcıları artık Amazon\'u da Pazaryonetimi üzerinden yönetebilecek.',
        source: 'Pazaryonetimi',
        sourceLogo: 'PY',
        date: '2024-01-05',
        link: '#',
        image: 'from-orange-500 to-amber-600'
    },
    {
        id: '4',
        type: 'makale',
        title: 'Türkiye\'nin En Hızlı Büyüyen 10 Startup\'ı',
        description: 'Deloitte Fast 50 listesinde yer alan Pazaryonetimi, e-ticaret kategorisinde lider konumda.',
        source: 'Fortune Türkiye',
        sourceLogo: 'FT',
        date: '2023-12-20',
        link: '#'
    },
    {
        id: '5',
        type: 'video',
        title: 'CEO Röportajı: E-ticaret\'in Geleceği',
        description: 'Bloomberg HT\'de yayınlanan özel röportajda CEO Mehmet Yılmaz, sektörün geleceğini değerlendirdi.',
        source: 'Bloomberg HT',
        sourceLogo: 'BH',
        date: '2023-12-15',
        link: '#'
    },
    {
        id: '6',
        type: 'podcast',
        title: 'Girişimcilik Hikayeleri: Pazaryonetimi\'nin Kuruluş Öyküsü',
        description: 'Kurucularımızla birlikte şirketin nasıl başladığını ve bugünlere nasıl geldiğini anlattık.',
        source: 'Startup Türkiye Podcast',
        sourceLogo: 'ST',
        date: '2023-12-01',
        link: '#'
    },
    {
        id: '7',
        type: 'haber',
        title: 'Pazaryonetimi 5.000 Satıcı Barajını Aştı',
        description: 'Platform, Türkiye\'nin dört bir yanından 5.000\'den fazla e-ticaret satıcısına hizmet vermeye başladı.',
        source: 'E-Ticaret Haber',
        sourceLogo: 'EH',
        date: '2023-11-20',
        link: '#'
    },
    {
        id: '8',
        type: 'basin-bulteni',
        title: 'Yeni AI Fiyatlandırma Motoru Tanıtıldı',
        description: 'Makine öğrenmesi tabanlı yeni fiyatlandırma motoru, anlık pazar analizi ve dinamik fiyat optimizasyonu sunuyor.',
        source: 'Pazaryonetimi',
        sourceLogo: 'PY',
        date: '2023-11-10',
        link: '#'
    }
];

const awards = [
    { icon: Award, title: 'Deloitte Fast 50', year: '2023', description: 'En Hızlı Büyüyen Teknoloji Şirketi' },
    { icon: Star, title: 'Webrazzi Awards', year: '2023', description: 'En İyi B2B Startup' },
    { icon: TrendingUp, title: 'Endeavor', year: '2023', description: 'High Impact Girişimci Seçimi' },
    { icon: Globe, title: 'Web Summit', year: '2023', description: 'Top 100 Startup' },
];

const mediaContacts = [
    { name: 'Basın İlişkileri', email: 'basin@pazaryonetimi.com', phone: '+90 212 XXX XX XX' },
    { name: 'Kurumsal İletişim', email: 'iletisim@pazaryonetimi.com', phone: '+90 212 XXX XX XX' },
];

const types = ['Tümü', 'Haber', 'Basın Bülteni', 'Makale', 'Video', 'Podcast'];
const typeMapping: { [key: string]: string } = {
    'Tümü': 'all',
    'Haber': 'haber',
    'Basın Bülteni': 'basin-bulteni',
    'Makale': 'makale',
    'Video': 'video',
    'Podcast': 'podcast'
};

const typeIcons: { [key: string]: typeof Newspaper } = {
    'haber': Newspaper,
    'basin-bulteni': FileText,
    'makale': FileText,
    'video': Video,
    'podcast': Mic
};

export default function PressPage() {
    const [selectedType, setSelectedType] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPress = useMemo(() => {
        return pressItems.filter(item => {
            const matchType = selectedType === 'Tümü' || item.type === typeMapping[selectedType];
            const matchSearch = searchQuery === '' ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.source.toLowerCase().includes(searchQuery.toLowerCase());
            return matchType && matchSearch;
        });
    }, [selectedType, searchQuery]);

    const featuredPress = pressItems.filter(p => p.featured);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const stats = [
        { value: '50+', label: 'Basın Haberi' },
        { value: '100M+', label: 'Medya Erişimi' },
        { value: '15+', label: 'Ödül' },
        { value: '30+', label: 'Röportaj' },
    ];

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-amber-500/10 dark:bg-amber-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[150px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200/50 dark:border-amber-700/50 rounded-full mb-8"
                    >
                        <Newspaper size={16} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300 tracking-wide">BASIN ODASI</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Basında{' '}
                        <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                            Pazaryonetimi
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        En son haberler, basın bültenleri ve medya içerikleri.
                        <span className="text-amber-600 dark:text-amber-400 font-semibold"> Hikayemizi paylaşalım.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-12 mt-10"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Featured Press */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Star size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Öne Çıkanlar</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">En dikkat çekici haberler</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {featuredPress.map((item, i) => (
                            <motion.a
                                key={item.id}
                                href={item.link}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                className="group relative rounded-2xl overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.image}`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                <div className="relative p-8 min-h-[300px] flex flex-col">
                                    <div className="flex items-center gap-3 mb-auto">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
                                            {item.sourceLogo}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{item.source}</div>
                                            <div className="text-white/60 text-sm">{formatDate(item.date)}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">{item.title}</h3>
                                        <p className="text-white/80 mb-4">{item.description}</p>
                                        <span className="inline-flex items-center gap-2 text-white font-medium">
                                            Haberi Oku
                                            <ExternalLink size={16} />
                                        </span>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                {/* Awards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                            <Award size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ödüller & Başarılar</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sektör tarafından tanınan başarılarımız</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {awards.map((award, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 text-center"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                                    <award.icon size={24} className="text-white" />
                                </div>
                                <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">{award.year}</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{award.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{award.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Press Archive */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <FileText size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tüm Haberler</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{pressItems.length} medya içeriği</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 space-y-4">
                        <div className="max-w-xl">
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Haber ara..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === type
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Press List */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredPress.map((item, i) => {
                                const Icon = typeIcons[item.type] || Newspaper;
                                return (
                                    <motion.a
                                        key={item.id}
                                        href={item.link}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: i * 0.05 }}
                                        layout
                                        className="block p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-700/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                                <Icon size={24} className="text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                                                        {item.type.replace('-', ' ').toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(item.date)}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{item.description}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <Building2 size={14} />
                                                    {item.source}
                                                </div>
                                            </div>
                                            <ExternalLink size={20} className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0" />
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Media Kit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/10 border border-slate-200 dark:border-white/10">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <ImageIcon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Basın Kiti</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Logolar, ürün görselleri, kurucu fotoğrafları ve marka rehberi içeren basın kitimizi indirin.
                                </p>
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all">
                                    <Download size={18} />
                                    Basın Kitini İndir
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                                <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-2xl">🎨</div>
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg flex items-center justify-center text-white text-xl font-bold">PY</div>
                                <div className="w-20 h-20 rounded-xl bg-slate-900 dark:bg-white shadow-lg flex items-center justify-center text-white dark:text-slate-900 text-xl font-bold">PY</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Media Contacts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Medya İletişim</h2>
                        <p className="text-slate-600 dark:text-slate-400">Basın soruları için bizimle iletişime geçin</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {mediaContacts.map((contact, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{contact.name}</h3>
                                <div className="space-y-3">
                                    <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                        <Mail size={18} />
                                        {contact.email}
                                    </a>
                                    <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                        <Phone size={18} />
                                        {contact.phone}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social Media */}
                    <div className="flex justify-center gap-4 mt-8">
                        <a href="#" className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Hikayemizi Yazmak İster misiniz?
                            </h3>
                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Röportaj talepleriniz ve basın sorularınız için bizimle iletişime geçin.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="mailto:basin@pazaryonetimi.com"
                                    className="px-8 py-4 bg-white text-amber-700 rounded-xl font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    basin@pazaryonetimi.com
                                </a>
                                <Link
                                    href="/about"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    Hakkımızda
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}

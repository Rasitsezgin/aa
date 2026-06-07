"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, MapPin, Clock, Users, Heart, Sparkles, Coffee,
    Laptop, Globe, Rocket, Target, ArrowRight, Search,
    Building2, Gift, ChevronDown, CheckCircle2,
    Dumbbell, BookOpen, DollarSign, Palmtree
} from 'lucide-react';
import Link from 'next/link';

interface JobPosition {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'Tam Zamanlı' | 'Yarı Zamanlı' | 'Staj' | 'Remote';
    experience: string;
    description: string;
    requirements: string[];
    benefits: string[];
    salary?: string;
    urgent?: boolean;
    new?: boolean;
}

const jobPositions: JobPosition[] = [
    {
        id: 'senior-fullstack',
        title: 'Senior Full-Stack Developer',
        department: 'Mühendislik',
        location: 'İstanbul / Remote',
        type: 'Tam Zamanlı',
        experience: '5+ yıl',
        description: 'E-ticaret platformumuzun temel özelliklerini geliştirmek ve teknik liderlik yapmak.',
        requirements: [
            'React, Next.js ve TypeScript deneyimi',
            'Node.js ve NestJS ile API geliştirme',
            'PostgreSQL ve Redis tecrübesi',
            'Microservices mimarisi bilgisi'
        ],
        benefits: ['Hisse opsiyonu', 'Remote çalışma', 'Teknik eğitim bütçesi'],
        salary: '70.000₺ - 100.000₺',
        urgent: true
    },
    {
        id: 'ai-ml-engineer',
        title: 'AI/ML Engineer',
        department: 'Yapay Zeka',
        location: 'İstanbul / Remote',
        type: 'Tam Zamanlı',
        experience: '3+ yıl',
        description: 'Fiyatlandırma ve öneri sistemleri için makine öğrenmesi modelleri geliştirmek.',
        requirements: [
            'Python ve ML framework deneyimi (PyTorch/TensorFlow)',
            'NLP ve zaman serisi analizi',
            'MLOps ve model deployment',
            'Büyük veri işleme (Spark, Pandas)'
        ],
        benefits: ['GPU workstation', 'Konferans sponsorluğu', 'Araştırma zamanı'],
        salary: '80.000₺ - 120.000₺',
        new: true
    },
    {
        id: 'product-manager',
        title: 'Senior Product Manager',
        department: 'Ürün',
        location: 'İstanbul',
        type: 'Tam Zamanlı',
        experience: '4+ yıl',
        description: 'E-ticaret ürün stratejisini belirlemek ve yol haritasını yönetmek.',
        requirements: [
            'B2B SaaS ürün yönetimi deneyimi',
            'Veri odaklı karar verme',
            'Agile/Scrum metodolojisi',
            'Kullanıcı araştırması ve A/B testing'
        ],
        benefits: ['Liderlik eğitimi', 'Performans bonusu', 'Esnek çalışma'],
        salary: '65.000₺ - 90.000₺'
    },
    {
        id: 'frontend-developer',
        title: 'Frontend Developer',
        department: 'Mühendislik',
        location: 'Remote',
        type: 'Tam Zamanlı',
        experience: '2+ yıl',
        description: 'Modern ve kullanıcı dostu arayüzler geliştirmek.',
        requirements: [
            'React ve TypeScript',
            'Tailwind CSS ve modern CSS',
            'State management (Redux, Zustand)',
            'Test yazma (Jest, Testing Library)'
        ],
        benefits: ['MacBook Pro', 'Home office desteği', 'Eğitim bütçesi'],
        salary: '45.000₺ - 65.000₺',
        new: true
    },
    {
        id: 'customer-success',
        title: 'Customer Success Manager',
        department: 'Müşteri Başarısı',
        location: 'İstanbul',
        type: 'Tam Zamanlı',
        experience: '2+ yıl',
        description: 'Kurumsal müşterilerin başarısını sağlamak ve büyümelerine yardımcı olmak.',
        requirements: [
            'E-ticaret sektör bilgisi',
            'Mükemmel iletişim becerileri',
            'CRM araçları deneyimi',
            'Problem çözme yeteneği'
        ],
        benefits: ['Müşteri ziyareti bütçesi', 'Performans bonusu', 'Kariyer gelişimi'],
        salary: '35.000₺ - 50.000₺'
    },
    {
        id: 'ui-ux-designer',
        title: 'UI/UX Designer',
        department: 'Tasarım',
        location: 'İstanbul / Remote',
        type: 'Tam Zamanlı',
        experience: '3+ yıl',
        description: 'Kullanıcı deneyimini iyileştirmek ve modern tasarımlar oluşturmak.',
        requirements: [
            'Figma ve design systems',
            'Kullanıcı araştırması ve usability testing',
            'Responsive ve mobile-first tasarım',
            'Design token ve component library'
        ],
        benefits: ['Tasarım araçları lisansı', 'Konferans katılımı', 'Yaratıcılık günleri'],
        salary: '40.000₺ - 60.000₺'
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        department: 'Mühendislik',
        location: 'Remote',
        type: 'Tam Zamanlı',
        experience: '3+ yıl',
        description: 'Altyapı otomasyonu ve CI/CD süreçlerini yönetmek.',
        requirements: [
            'AWS veya GCP deneyimi',
            'Kubernetes ve Docker',
            'Terraform ve Infrastructure as Code',
            'Monitoring ve logging (Prometheus, Grafana)'
        ],
        benefits: ['On-call bonusu', 'Sertifika desteği', 'Esnek mesai'],
        salary: '60.000₺ - 85.000₺'
    },
    {
        id: 'sales-executive',
        title: 'Sales Executive',
        department: 'Satış',
        location: 'İstanbul',
        type: 'Tam Zamanlı',
        experience: '2+ yıl',
        description: 'Yeni müşteriler kazanmak ve satış hedeflerini gerçekleştirmek.',
        requirements: [
            'B2B SaaS satış deneyimi',
            'CRM kullanımı (HubSpot, Salesforce)',
            'Sunum ve müzakere becerileri',
            'Sonuç odaklı çalışma'
        ],
        benefits: ['Komisyon paketi', 'Araç desteği', 'Satış eğitimleri'],
        salary: '30.000₺ + Komisyon',
        urgent: true
    }
];

const departments = ['Tümü', 'Mühendislik', 'Yapay Zeka', 'Ürün', 'Tasarım', 'Müşteri Başarısı', 'Satış'];
const locations = ['Tümü', 'İstanbul', 'Remote', 'İstanbul / Remote'];

const benefits = [
    { icon: Laptop, title: 'Modern Ekipman', description: 'MacBook Pro, monitör ve tüm ihtiyaçlar' },
    { icon: Coffee, title: 'Sınırsız Kahve', description: 'Özel kahve makinesi ve atıştırmalıklar' },
    { icon: Dumbbell, title: 'Spor Salonu', description: 'Gym üyeliği ve wellness programları' },
    { icon: BookOpen, title: 'Eğitim Bütçesi', description: 'Yıllık 10.000₺ kişisel gelişim bütçesi' },
    { icon: Palmtree, title: '25+ Gün İzin', description: 'Resmi tatiller hariç yıllık izin' },
    { icon: Heart, title: 'Sağlık Sigortası', description: 'Özel sağlık sigortası tüm aile için' },
    { icon: Gift, title: 'Hisse Opsiyonu', description: 'Erken çalışanlar için ESOP programı' },
    { icon: Globe, title: 'Remote Çalışma', description: 'Dilediğin yerden çalışma imkanı' },
];

const values = [
    { icon: Rocket, title: 'Hızlı Hareket Et', description: 'Mükemmeli beklemeden harekete geç, yolda iyileştir.' },
    { icon: Users, title: 'Takım Oyuncusu Ol', description: 'Başarı bireysel değil, takım olarak gelir.' },
    { icon: Target, title: 'Müşteri Odaklı Ol', description: 'Her karar müşteri değeri düşünülerek alınır.' },
    { icon: Sparkles, title: 'Yenilikçi Düşün', description: 'Statükoya meydan oku, daha iyisini bul.' },
];

export default function CareersPage() {
    const [selectedDepartment, setSelectedDepartment] = useState('Tümü');
    const [selectedLocation, setSelectedLocation] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    const filteredJobs = useMemo(() => {
        return jobPositions.filter(job => {
            const matchDept = selectedDepartment === 'Tümü' || job.department === selectedDepartment;
            const matchLoc = selectedLocation === 'Tümü' || job.location.includes(selectedLocation);
            const matchSearch = searchQuery === '' ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.department.toLowerCase().includes(searchQuery.toLowerCase());
            return matchDept && matchLoc && matchSearch;
        });
    }, [selectedDepartment, selectedLocation, searchQuery]);

    const stats = [
        { value: '80+', label: 'Takım Üyesi' },
        { value: '15+', label: 'Ülke' },
        { value: '4.8', label: 'Glassdoor Puanı' },
        { value: '%92', label: 'Çalışan Memnuniyeti' },
    ];

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-pink-500/10 dark:bg-pink-500/20 blur-[150px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-full mb-8"
                    >
                        <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 tracking-wide">KARİYER FIRSATLARI</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Geleceği Birlikte{' '}
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                            İnşa Edelim
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        E-ticaret&apos;in geleceğini şekillendiren tutkulu bir ekibe katılın.
                        <span className="text-purple-600 dark:text-purple-400 font-semibold"> Yeteneklerinizi keşfedin, sınırlarınızı zorlayın.</span>
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

                {/* Culture Video/Image Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20"
                >
                    <div className="relative rounded-[2rem] overflow-hidden aspect-video">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto cursor-pointer hover:bg-white/30 transition-colors">
                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">Takımımızla Tanışın</h3>
                                <p className="text-white/80">Pazaryonetimi&apos;nde bir gün</p>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-10 left-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm" />
                        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm" />
                        <div className="absolute top-1/2 right-20 w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm rotate-12" />
                    </div>
                </motion.div>

                {/* Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Değerlerimiz</h2>
                        <p className="text-slate-600 dark:text-slate-400">Bizi bir arada tutan prensipler</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all text-center"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                    <value.icon size={24} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Yan Haklar & İmkanlar</h2>
                        <p className="text-slate-600 dark:text-slate-400">En iyi performans için en iyi destekler</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-700 transition-colors group"
                            >
                                <benefit.icon size={24} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{benefit.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Job Listings */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Briefcase size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Açık Pozisyonlar</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{jobPositions.length} pozisyon mevcut</p>
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
                                    placeholder="Pozisyon veya departman ara..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400 py-2">Departman:</span>
                                {departments.map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDepartment(dept)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDepartment === dept
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400 py-2">Lokasyon:</span>
                                {locations.map(loc => (
                                    <button
                                        key={loc}
                                        onClick={() => setSelectedLocation(loc)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedLocation === loc
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Job Cards */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    layout
                                    className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${expandedJob === job.id
                                        ? 'bg-white/10 dark:bg-white/5 border-purple-500/50 shadow-2xl shadow-purple-500/10'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-xl'
                                        }`}
                                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                                            {/* Job Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                                                    {job.urgent && (
                                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                                                            ACİL
                                                        </span>
                                                    )}
                                                    {job.new && (
                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-bold">
                                                            YENİ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 size={14} />
                                                        {job.department}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {job.experience}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase size={14} />
                                                        {job.type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Salary & Actions */}
                                            <div className="flex items-center gap-4">
                                                {job.salary && (
                                                    <div className="text-right hidden md:block">
                                                        <div className="text-lg font-bold text-slate-900 dark:text-white">{job.salary}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Aylık</div>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedJob(expandedJob === job.id ? null : job.id);
                                                    }}
                                                    className={`p-3 rounded-xl transition-colors ${expandedJob === job.id
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                                        : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20'
                                                        }`}
                                                >
                                                    <ChevronDown size={20} className={`text-slate-600 dark:text-slate-400 transition-transform ${expandedJob === job.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {expandedJob === job.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 pt-0 border-t border-dashed border-slate-200 dark:border-white/10 mt-4">
                                                    <div className="h-4" /> {/* Spacer */}
                                                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{job.description}</p>

                                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Aranan Nitelikler</h4>
                                                            <ul className="space-y-2">
                                                                {job.requirements.map((req, j) => (
                                                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <CheckCircle2 size={16} className="text-purple-500 mt-0.5 shrink-0" />
                                                                        {req}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Pozisyona Özel Avantajlar</h4>
                                                            <ul className="space-y-2">
                                                                {job.benefits.map((benefit, j) => (
                                                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                        <Gift size={16} className="text-pink-500 mt-0.5 shrink-0" />
                                                                        {benefit}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    {job.salary && (
                                                        <div className="flex items-center gap-2 mb-6 md:hidden">
                                                            <DollarSign size={18} className="text-green-500" />
                                                            <span className="text-lg font-bold text-slate-900 dark:text-white">{job.salary}</span>
                                                            <span className="text-slate-500 dark:text-slate-400">/ Aylık</span>
                                                        </div>
                                                    )}

                                                    <Link
                                                        href={`/careers/${job.id}`}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                                                    >
                                                        Başvur
                                                        <ArrowRight size={16} />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">Bu kriterlere uygun pozisyon bulunamadı.</p>
                        </div>
                    )}
                </motion.div>

                {/* Open Application CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Aradığın Pozisyon Yok mu?
                            </h3>
                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Açık başvuru yap, yeteneklerini paylaş. Sana uygun bir pozisyon açıldığında seninle iletişime geçeceğiz.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/careers/open-application"
                                    className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Açık Başvuru Yap
                                    <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="mailto:kariyer@pazaryonetimi.com"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    kariyer@pazaryonetimi.com
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}

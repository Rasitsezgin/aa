"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Award, Lock, Database, Zap } from 'lucide-react';

interface CertificationBadge {
    title: string;
    icon: React.ReactNode;
    description: string;
}

const certifications: CertificationBadge[] = [
    {
        title: 'GDPR Compliant',
        icon: <Lock className="w-8 h-8" />,
        description: 'AB veri koruma yönetmeliğine tam uyumlu. Müşteri verileriniz korlu.',
    },
    {
        title: 'ISO 27001',
        icon: <Shield className="w-8 h-8" />,
        description: 'Bilgi güvenliği yönetim sistemi sertifikası.',
    },
    {
        title: 'SOC 2 Type II',
        icon: <Award className="w-8 h-8" />,
        description: 'Denetim yönetim sisteminin bağımsız kontrolü.',
    },
    {
        title: 'KVKK Compliant',
        icon: <Database className="w-8 h-8" />,
        description: 'Türkiye Kişisel Verileri Koruma Kanununa uyumlu.',
    },
    {
        title: '256-bit SSL/TLS',
        icon: <Zap className="w-8 h-8" />,
        description: 'Bank-level şifreleme ile tüm veriler korunuyor.',
    },
    {
        title: '99.99% Uptime SLA',
        icon: <Check className="w-8 h-8" />,
        description: 'Garantili %99.99 çalışma süresi.',
    },
];

const securityFeatures = [
    {
        category: 'Veri Koruması',
        items: [
            '256-bit AES şifreleme',
            'TLS 1.2+ protokolü',
            'Regular security audits',
            'Penetration testing',
            'OWASP standartları',
        ],
    },
    {
        category: 'Erişim Kontrolü',
        items: [
            'Multi-factor authentication',
            'Role-based access control',
            'Session management',
            'IP whitelisting',
            'Activity logging & monitoring',
        ],
    },
    {
        category: 'Altyapı Güvenliği',
        items: [
            'DDoS protection',
            'Web application firewall',
            'Regular backups',
            '30-day data retention',
            'Disaster recovery plan',
        ],
    },
];

export default function SecurityPage() {
    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/5 dark:bg-red-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full mb-6">
                        <Shield size={14} className="text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-700 dark:text-red-300 tracking-wide uppercase">Güvenlik & Uyumluluk</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Verileriniz Güvende
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        Enterprise-grade güvenlik ve endüstri standartları. Verileriniz bizim için en değerli varlığınızdır.
                    </p>
                </motion.div>

                {/* Certifications Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {certifications.map((cert, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all hover:shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                {cert.icon}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{cert.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{cert.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Security Features */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Güvenlik Özellikleri</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {securityFeatures.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">{feature.category}</h3>
                                <ul className="space-y-4">
                                    {feature.items.map((item, j) => (
                                        <li key={j} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Compliance & Standards */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="p-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Uyumluluk & Standartlar</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Yasal Uyumluluk</h3>
                            {[
                                'GDPR (AB Veri Koruma)',
                                'KVKK (Türkiye)',
                                'CCPA (California)',
                                'PCI-DSS (Ödeme İşlemleri)',
                                'Veri Lokasyonu Gereksinimleri',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 mb-4">
                                    <Check className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Teknik Standartlar</h3>
                            {[
                                'ISO 27001 Sertifikası',
                                'SOC 2 Type II Denetimi',
                                'OWASP Top 10 Kontrol',
                                'Regular Penetration Testing',
                                'Kod İnceleme & CI/CD',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 mb-4">
                                    <Check className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Data Handling */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="p-12 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Veri Yönetimi Politikası</h2>
                    <div className="max-w-3xl mx-auto space-y-4 text-slate-700 dark:text-slate-300">
                        <div className="flex gap-4">
                            <div className="text-2xl flex-shrink-0">🔒</div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Şifreleme</h3>
                                <p>Tüm veriler transit (TLS) ve rest (AES-256) sırasında şifrelenir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-2xl flex-shrink-0">📋</div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Yedekleme & Kurtarma</h3>
                                <p>Günlük yedeklemeler birden fazla coğrafi lokasyonda saklanır. Afet kurtarma planı her yıl test edilir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-2xl flex-shrink-0">👤</div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Gizlilik & Veri Sahibi Hakları</h3>
                                <p>Müşteriler istediğinde verilerine erişebilir, düzeltebilir ve silebilir. GDPR Article 20 uygulanır.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-2xl flex-shrink-0">🔍</div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Denetim & Izlenebilirlik</h3>
                                <p>Tüm veri erişimi günlüğe kaydedilir. Düzenli denetimler ve compliance raporları sunulur.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Document Links */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Belgeler & Politikalar</h2>
                    <div className="flex flex-wrap gap-4 justify-center max-w-2xl mx-auto">
                        {[
                            { text: 'Gizlilik Politikası', href: '/kurumsal/gizlilik-politikasi' },
                            { text: 'Kullanım Şartları', href: '/kurumsal/kullanim-sartlari' },
                            { text: 'Çerez Politikası', href: '/kurumsal/cerez-politikasi' },
                            { text: 'KVKK Aydınlatma', href: '/kurumsal/kvkk' },
                            { text: 'Güvenlik Kütüphanesi', href: '#' },
                        ].map((doc, i) => (
                            <a
                                key={i}
                                href={doc.href}
                                className="px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                            >
                                {doc.text}
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}

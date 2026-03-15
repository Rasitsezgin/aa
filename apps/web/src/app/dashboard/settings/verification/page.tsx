"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Search,
    Save,
    CheckCircle,
    AlertCircle,
    Globe,
    ExternalLink,
    Code
} from 'lucide-react';

export default function VerificationSettings() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [codes, setCodes] = useState({
        googleVerificationCode: '',
        bingVerificationCode: '',
        yandexVerificationCode: '',
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify(codes),
            });

            if (!res.ok) {
                throw new Error('Dogrulama ayarlari kaydedilemedi');
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const verificationPlatforms = [
        {
            id: 'google',
            name: 'Google Search Console',
            key: 'googleVerificationCode',
            icon: Search,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            helpUrl: 'https://search.google.com/search-console',
            placeholder: 'google-site-verification=...',
        },
        {
            id: 'bing',
            name: 'Bing Webmaster Tools',
            key: 'bingVerificationCode',
            icon: Globe,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
            helpUrl: 'https://www.bing.com/webmasters',
            placeholder: 'msvalidate.01=...',
        },
        {
            id: 'yandex',
            name: 'Yandex Webmaster',
            key: 'yandexVerificationCode',
            icon: Code,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            helpUrl: 'https://webmaster.yandex.com',
            placeholder: 'yandex-verification: ...',
        }
    ];

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600">
                            <Shield size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Mülk Doğrulama</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Arama motorları için doğrulama kodlarını yönetin</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                        <CheckCircle size={20} />
                    ) : (
                        <Save size={20} />
                    )}
                    {saved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            {/* Main Content */}
            <div className="grid gap-6">
                <div className="p-8 bg-surface rounded-[32px] border border-border space-y-8">
                    <div className="flex items-start gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <AlertCircle className="text-blue-500 mt-1 shrink-0" size={20} />
                        <div className="text-sm text-slate-500 leading-relaxed">
                            Arama motorları sitenizi doğrulamak için genellikle bir meta tag kodu sağlar.
                            Buraya sadece size verilen <strong>doğrulama kodunu</strong> veya <strong>tüm meta etiketini</strong> yapıştırabilirsiniz.
                            Sistem otomatik olarak temizleyip landing sayfanıza yerleştirecektir.
                        </div>
                    </div>

                    <div className="space-y-6">
                        {verificationPlatforms.map((platform) => (
                            <div key={platform.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${platform.bgColor} ${platform.color}`}>
                                            <platform.icon size={16} />
                                        </div>
                                        <label className="text-sm font-bold text-foreground">
                                            {platform.name}
                                        </label>
                                    </div>
                                    <a
                                        href={platform.helpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        Doğrulama sayfası
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={codes[platform.key as keyof typeof codes]}
                                        onChange={(e) => setCodes({ ...codes, [platform.key]: e.target.value })}
                                        placeholder={platform.placeholder}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-mono text-sm"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Aktif</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[32px] border border-white/5 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white">
                            <Code size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Nasıl Çalışır?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                Buraya eklediğiniz kodlar, sitenizin <code>&lt;head&gt;</code> bölümüne otomatik olarak enjekte edilir.
                                Bu sayede arama motoru botları sayfayı taradığında mülkiyeti hemen doğrular.
                                Dashboard erişimi için bu ayarlar zorunlu değildir, ancak Google aramalarında görünmek için kritiktir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

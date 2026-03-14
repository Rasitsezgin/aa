"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    MapPin,
    Phone,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    Briefcase,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const steps = [
    { id: 1, title: 'Kurumsal Bilgiler', icon: Building2 },
    { id: 2, title: 'İletişim & Fatura', icon: MapPin },
    { id: 3, title: 'Tamamla', icon: CheckCircle2 },
];

export default function SetupPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        taxNumber: '',
        taxOffice: '',
        companyType: 'Limited',
        phone: '',
        address: '',
        city: '',
        district: '',
        postcode: ''
    });

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-white dark:bg-[#02040a] selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
                        P
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pazaryonetimi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Güvenli Kurulum</span>
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 pb-20">
                <div className="w-full max-w-2xl">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-12 px-4">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center gap-3 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${currentStep >= step.id
                                        ? 'bg-blue-600 border-transparent text-white shadow-xl shadow-blue-600/20 scale-110'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 size={24} /> : <step.icon size={22} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`flex-1 h-px transition-colors duration-500 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Kurumsal Bilgiler</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Sistemde kullanılacak resmi işletme bilgilerinizi girin.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Firma Adı / Unvanı</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Pazaryeri Teknoloji A.Ş."
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vergi Numarası</label>
                                            <input
                                                type="text"
                                                placeholder="1234567890"
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vergi Dairesi</label>
                                            <input
                                                type="text"
                                                placeholder="Zincirlikuyu V.D."
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">İletişim & Fatura</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Ulaşılabilirlik ve faturalandırma için adres bilgileri.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Telefon Numarası</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    placeholder="+90 5XX XXX XX XX"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tam Adres</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Büyükdere Cad. No: 123 Kat: 4..."
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Şehir</label>
                                            <input
                                                type="text"
                                                placeholder="İstanbul"
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">İlçe</label>
                                            <input
                                                type="text"
                                                placeholder="Beşiktaş"
                                                className="w-full px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-8"
                                >
                                    <div className="relative inline-block">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1.1, rotate: 360 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="w-32 h-32 rounded-full bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-600"
                                        >
                                            <CheckCircle2 size={64} />
                                        </motion.div>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 -z-10"
                                        ></motion.div>
                                    </div>

                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Her Şey Hazır!</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                                            Kurumsal profiliniz oluşturuldu. Artık otonom e-ticaret yönetiminin keyfini çıkarabilirsiniz.
                                        </p>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[30px] border border-slate-100 dark:border-white/10 inline-flex flex-col gap-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                            <CreditCard size={18} className="text-blue-500" />
                                            14 Günlük PRO Deneme Başlatıldı
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Buttons */}
                        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1 || currentStep === 3}
                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${currentStep === 1 || currentStep === 3
                                    ? 'opacity-0 pointer-events-none'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                                Geri Dön
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="group relative flex items-center gap-2 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 duration-300"
                                >
                                    <span className="relative z-10">Devam Et</span>
                                    <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity" />
                                </button>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="group relative flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 duration-300"
                                >
                                    Dashboard&apos;a Git
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>

                    <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Yardıma mı ihtiyacınız var? <Link href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">Destek Ekibine Yazın</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

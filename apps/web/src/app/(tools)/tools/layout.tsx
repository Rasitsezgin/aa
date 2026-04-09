import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Activity, ArrowUpRight } from 'lucide-react';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B1121] text-foreground font-sans selection:bg-primary/30">
            {/* Public Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="text-xl font-black italic text-white">P</span>
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">PAZARYONETIMI</span>
                            <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                                <Calculator className="w-3 h-3" /> Ücretsiz Araçlar
                            </div>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                        <Link href="/tools/komisyon-hesaplama" className="hover:text-primary transition-colors">Komisyon Hesaplama</Link>
                        <Link href="/tools/desi-hesaplama" className="hover:text-primary transition-colors">Kargo Desi Hesaplama</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            Giriş Yap
                        </Link>
                        <Link href="/register">
                            <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                Şimdi Ücretsiz Dene <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 w-full relative">
                        {children}
                    </div>

                    {/* Global Lead Tracking / Banner for Public Tools */}
                    <div className="hidden lg:block w-80 space-y-6">
                        <div className="sticky top-28 bg-white dark:bg-surface border border-border p-6 rounded-3xl shadow-xl shadow-black/5">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Hesaplamaktan sıkıldınız mı?</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Pazaryonetimi ile Trendyol, Hepsiburada ve n11 komisyonlarınızı, kargo ücretlerinizi ve kar marjlarınızı otomatik olarak anlık görün. Manuel hiçbir hesaba gerek kalmasın!
                            </p>
                            <Link href="/register">
                                <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                    7 Gün Ücretsiz Dene <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <div className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">
                                Kredi Kartı Gerekmez
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

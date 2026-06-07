'use client';

import { AlertTriangle, RefreshCw, ArrowLeft, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[min(70vh,560px)] flex items-center justify-center px-4 py-12" data-dashboard>
            <div className="max-w-lg w-full">
                <div className="dash-card p-8 sm:p-10 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center mb-6">
                        <AlertTriangle size={28} className="text-amber-600 dark:text-amber-400" />
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                        Sayfa yüklenemedi
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Kontrol merkezi açılırken beklenmeyen bir sorun oluştu. Yenilemeyi deneyin veya ana panele dönün.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                        <button
                            type="button"
                            onClick={reset}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 dash-btn-primary text-sm"
                        >
                            <RefreshCw size={16} />
                            Tekrar Dene
                        </button>
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors border border-border"
                        >
                            <ArrowLeft size={16} />
                            Kontrol Merkezi
                        </Link>
                    </div>

                    <a
                        href="/dashboard/support"
                        className="inline-flex items-center gap-1.5 mt-6 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <LifeBuoy size={14} />
                        Destek ile iletişime geç
                    </a>

                    {process.env.NODE_ENV === 'development' && error?.message && (
                        <details className="mt-8 text-left rounded-xl border border-border bg-slate-50/80 dark:bg-white/[0.03] p-4">
                            <summary className="text-xs font-mono text-slate-500 cursor-pointer">Geliştirici detayı</summary>
                            <pre className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-mono whitespace-pre-wrap break-all">
                                {error.message}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}

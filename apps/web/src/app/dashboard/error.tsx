'use client';

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1121] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={32} className="text-red-400" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Dashboard Hatası
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Dashboard yüklenirken bir hata oluştu. Sayfayı yenilemeyi deneyin.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        <RefreshCw size={16} />
                        Tekrar Dene
                    </button>
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition-colors border border-white/10"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && error?.message && (
                    <details className="mt-4 text-left bg-slate-900 rounded-xl p-4 border border-white/10">
                        <summary className="text-xs font-mono text-slate-500 cursor-pointer">Hata Detayı</summary>
                        <pre className="mt-2 text-xs text-red-400 font-mono whitespace-pre-wrap break-all">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}

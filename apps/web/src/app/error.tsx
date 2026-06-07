'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally log to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Could send to Sentry, LogRocket, etc.
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0B1120] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Bir şeyler yanlış gitti
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-colors"
                    >
                        <RefreshCw size={16} />
                        Tekrar Dene
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                    >
                        <Home size={16} />
                        Ana Sayfa
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && error?.message && (
                    <details className="mt-4 text-left bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                        <summary className="text-xs font-mono text-slate-500 cursor-pointer">Hata Detayı</summary>
                        <pre className="mt-2 text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-all">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}

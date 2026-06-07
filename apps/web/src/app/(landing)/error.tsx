'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function LandingError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0B1120] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Sayfa yüklenemedi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Bu sayfa yüklenirken bir sorun oluştu.
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
            </div>
        </div>
    );
}

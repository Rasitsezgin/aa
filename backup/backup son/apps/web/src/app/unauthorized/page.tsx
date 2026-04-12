import Link from 'next/link';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-foreground mb-2">Yetkisiz Erişim</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Bu sayfaya erişim yetkiniz bulunmuyor. Lütfen yönetici hesabınızla giriş yapın.
                    </p>
                    
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Giriş Yap
                        </Link>
                        
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Ana Sayfa
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

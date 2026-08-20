import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import { FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları ve Hizmet Sözleşmesi | Pazaryonetimi',
  description: 'Pazaryonetimi.com platformu kullanım koşulları, abonelik ve hizmet şartları.',
};

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline mb-8"
        >
          <ArrowLeft size={14} /> Ana Sayfaya Dön
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Kullanım Koşulları ve Hizmet Şartları
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Son Güncelleme: 1 Ocak 2025
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-orange-500" /> 1. Hizmetin Niteliği
            </h2>
            <p>
              Pazaryonetimi.com, e-ticaret satıcılarının birden fazla pazar yerindeki (Trendyol, Hepsiburada, Amazon, N11 vb.) ürün listelerini, siparişlerini, stoklarını ve dinamik fiyatlandırma süreçlerini tek bir panelden yönetmelerini sağlayan bulut tabanlı bir SaaS (Hizmet Olarak Yazılım) platformudur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Hesap Güvenliği ve Kullanıcı Sorumluluğu
            </h2>
            <p>
              Kullanıcılar, platforma tanımladıkları API anahtarları, şifreler ve entegrasyon bilgilerinin doğruluğundan ve gizliliğinden bizzat sorumludur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Abonelik, Faturalandırma ve İptal
            </h2>
            <p>
              Hizmetlerimiz aylık ve yıllık abonelik paketleri üzerinden faturalandırılır. Kullanıcı dilediği zaman aboneliğini panel üzerinden iptal etme hakkına sahiptir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. İletişim
            </h2>
            <p>
              Kullanım koşullarıyla ilgili tüm soru ve önerileriniz için <strong>destek@pazaryonetimi.com</strong> adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </MarketingPageShell>
  );
}

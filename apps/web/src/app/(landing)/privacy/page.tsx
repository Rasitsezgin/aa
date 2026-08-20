import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | Pazaryonetimi',
  description: 'Pazaryonetimi.com kullanıcı verilerinin korunması, gizlilik politikası ve KVKK aydınlatma metni.',
};

export default function PrivacyPage() {
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
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Gizlilik Politikası ve KVKK Metni
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Son Güncelleme: 1 Ocak 2025
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock size={18} className="text-orange-500" /> 1. Veri Sorumlusu ve Kapsam
            </h2>
            <p>
              Pazaryonetimi.com (&quot;Platform&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca kullanıcılarının ve üye işletmelerinin kişisel verilerinin gizliliğine ve güvenliğine en üst düzeyde önem vermektedir. Bu metin, platformumuz aracılığıyla toplanan verilerin işlenme amaçlarını, aktarım şartlarını ve haklarınızı açıklamaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-orange-500" /> 2. Toplanan Veriler ve İşleme Amaçları
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası ve fatura bilgileri.</li>
              <li><strong>Pazaryeri ve Mağaza Verileri:</strong> API anahtarları aracılığıyla ürün listeleri, sipariş durumları ve envanter bilgileri.</li>
              <li><strong>İşlem Güvenliği Verileri:</strong> IP adresleri, oturum kayıtları ve cihaz bilgileri.</li>
            </ul>
            <p>
              Bu veriler; pazaryeri entegrasyon hizmetlerinin sunulması, sipariş ve stok senkronizasyonunun sağlanması, faturalandırma ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Veri Güvenliği ve Şifreleme
            </h2>
            <p>
              Tüm pazaryeri API anahtarları (Trendyol, Amazon, Hepsiburada vb.) endüstri standardı AES-256 şifreleme protokolleri ile saklanmakta olup, SSL/TLS şifreli kanallar üzerinden aktarılmaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. İletişim ve Haklarınız
            </h2>
            <p>
              KVKK m. 11 kapsamındaki haklarınızı kullanmak ve kişisel verilerinizle ilgili bilgi almak için <strong>destek@pazaryonetimi.com</strong> adresinden bize her zaman ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </MarketingPageShell>
  );
}

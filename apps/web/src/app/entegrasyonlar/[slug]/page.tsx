import React from 'react';
import { ArrowRight, CheckCircle2, Zap, LayoutDashboard, Globe, Lock, Workflow } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Mock Data Database for dynamic SEO pages
const integrationDB: Record<string, {name: string, category: string, desc: string, benefits: string[], features: string[], color: string}> = {
    'trendyol-entegrasyonu': {
        name: 'Trendyol',
        category: 'Pazaryeri',
        color: 'from-orange-500 to-orange-600',
        desc: 'Trendyol mağazanızı Pazaryönetimi panelinize bağlayın. Sipariş, stok güncelleme ve ürün listeleme süreçlerini tek tıkla otomatikleştirin.',
        benefits: ['Otomatik Stok Senkronizasyon (Sıfır stok hatası)', 'Toplu Ürün ve Fiyat Güncelleme', 'Panelden Anlık Fatura Kesimi'],
        features: ['Siparişler Saniyeler İçinde Sisteme Düşer', 'Varyantlı Ürün Yönetimi', 'Buybox Analizi ve Rekabet Optimizasyonu']
    },
    'hepsiburada-entegrasyonu': {
        name: 'Hepsiburada',
        category: 'Pazaryeri',
        color: 'from-orange-600 to-pink-600',
        desc: 'Hepsiburada entegrasyonu ile yüzlerce siparişi tek ekrandan onaylayın, e-faturanızı kesin ve kargo barkodlarını otomatik oluşturun.',
        benefits: ['Hepsiburada Katalog Hızlı Ürün Eşleştirme', 'Toplu Kargo Fişi Çıktısı', 'Hasarlı İade Otomatik Yönetimi'],
        features: ['Kampanya Dönemlerinde Yüksek Hızda Eşitleme', 'Komisyon Hesaplayıcı ile Net Kâr Görünümü', 'Gerçek Zamanlı Api Katmanı']
    },
    'parasut-entegrasyonu': {
        name: 'Paraşüt',
        category: 'Muhasebe',
        color: 'from-blue-500 to-cyan-500',
        desc: 'Pazaryerlerinden veya kendi sitenizden gelen tüm satışları anında resmileştirin. Müşterilerinize uçtan uca otomatik fatura gönderin.',
        benefits: ['Tek Tıkla E-Fatura / E-Arşiv Resmileştirme', 'Otomatik Cari Kart Açılışı', 'Güvenli Tahsilat Takibi (Ön Muhasebe)'],
        features: ['Pazaryeri Kesintilerinin Muhasebeleşmesi', 'Günün Sonunda Tek Tıkla Z Raporu', 'Gelişmiş Finansal Raporlama']
    },
    'ideasoft-entegrasyonu': {
        name: 'IdeaSoft',
        category: 'E-Ticaret Altyapısı',
        color: 'from-blue-700 to-indigo-800',
        desc: 'Sitenizdeki sipariş ve stokları diğer tüm pazaryerleriyle birleştirin. IdeaSoft altyapınızın gücünü Pazaryönetimi ile zirveye taşıyın.',
        benefits: ['Çift Yönlü Ürün Aktarımı (Siteden Pazaryerine)', 'Sitedeki Stoğun Trendyol ve HB\'da Düşmesi', 'Sınırsız Varyant Eşleşmesi'],
        features: ['Kategori ve Marka Haritalaması', 'Özel XML Dışa Aktarımı', 'SEO Meta Verilerinin Korunması']
    },
    'logo-go-3-entegrasyonu': {
        name: 'Logo Go 3 / Tiger',
        category: 'Kurumsal Muhasebe',
        color: 'from-sky-500 to-blue-700',
        desc: 'Büyük ölçekli firmalar için ERP entegrasyonu. Tüm e-ticaret süreçlerinizin arka plan kurumsal muhasebesini hatasız bağlayın.',
        benefits: ['Stok Hareket Fişlerinin (Ambar) Otomasyonu', 'Cari Hesapların Birebir Eşleşmesi', 'Faturaların Logo Sistemine Doğrudan İşlenmesi'],
        features: ['Büyük Veride Hatasız Çalışma', 'Gün Sonu Toplu Onay Mekanizması', 'Kurumsal Düzey Şifreleme (AES)']
    },
    'aras-kargo-entegrasyonu': {
        name: 'Aras Kargo',
        category: 'Kargo',
        color: 'from-red-600 to-red-800',
        desc: 'Onayladığınız tüm siparişlerin barkodlarını tek paket halinde oluşturun. Müşterinize takip linkini saniyeler içinde SMS atın.',
        benefits: ['Aras Kargo Şubesiyle %100 Uyumlu Barkodlar', 'Kargo Durumlarının Anlık Takibi (Teslim Edildi)', 'Otomatik Müşteri Bilgilendirme'],
        features: ['Toplu Yazdırma Özelliği', 'API Üzerinden Kota ve İade Sorgulama', 'Kargo Maliyet Hesaplayıcısı']
    }
};

export default async function IntegrationDetailTemplate({ params }: { params: Promise<{slug: string}> }) {
    // Next.js 15: params bir promise'dir. await işleminden sonra kullanılmalı.
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const data = integrationDB[slug];

    if (!data) {
        // Fallback for demo: if not found in mock, create a generic dynamic layout
        const genericName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Entegrasyonu', '');
        data = {
            name: genericName,
            category: 'Sistem Entegrasyonu',
            color: 'from-indigo-500 to-purple-600',
            desc: \`\${genericName} sistemini Pazaryönetimi altyapısına saniyeler içinde bağlayın. E-Ticaret operasyonlarınızdaki veri akışını tamamen dijitalleştirerek insan hatasını sıfıra indirin.\`,
            benefits: ['Zaman Kaybına Son Veren Otomasyon', 'Verilerinizin %100 Güvenliği', 'Tek Panelden Tüm Süreç Yönetimi'],
            features: ['API ile Gerçek Zamanlı Haberleşme', 'Maliyet ve Kâr Optimizasyonu', 'Kolay Kurulum Sihirbazı']
        };
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] flex flex-col pt-24 pb-20">
            {/* Dynamic SEO Hero */}
            <div className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-border">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[size:32px_32px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-6 uppercase tracking-widest">
                                {data.category} Modülü
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                                <span className={\`text-transparent bg-clip-text bg-gradient-to-r \${data.color}\`}>
                                    {data.name}
                                </span> <br/> Entegrasyonu
                            </h1>
                            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                                {data.desc} Pazaryönetimi ile rakiplerinizden her zaman bir adım önde olun.
                            </p>
                            
                            <div className="flex gap-4">
                                <Link href="/register" className={\`px-8 py-4 bg-gradient-to-r \${data.color} text-white rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg text-lg\`}>
                                    Ücretsiz Entegre Et
                                </Link>
                                <Link href="/entegrasyonlar" className="px-8 py-4 bg-white dark:bg-surface border border-border text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    Tüm Listeye Dön <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 flex justify-center w-full relative">
                            <div className={\`w-64 h-64 lg:w-96 lg:h-96 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 \${data.color} blur-[100px] opacity-20\`} />
                            
                            <div className="relative z-10 bg-white dark:bg-surface border border-border p-8 rounded-[3rem] shadow-2xl flex items-center justify-center gap-8 w-full max-w-md">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-lg">PY</div>
                                    <div className="text-sm font-bold text-slate-500 mt-3">Sistemimiz</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Workflow className="w-10 h-10 text-slate-300 animate-pulse" />
                                    <div className="text-[10px] text-primary font-bold tracking-widest mt-2 uppercase">API SENKRON</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={\`w-20 h-20 bg-gradient-to-br \${data.color} text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg\`}>
                                        {data.name.charAt(0)}
                                    </div>
                                    <div className="text-sm font-bold text-slate-500 mt-3">{data.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-black mb-8">Neden {data.name} İçin Pazaryönetimi İş Ortağınız Olmalı?</h2>
                        <div className="space-y-6">
                            {data.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex gap-4 p-6 bg-white dark:bg-surface border border-border rounded-2xl hover:border-primary/20 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{benefit}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">Otomasyon kurallarımız sayesinde bu işlemi manuel yapmanıza asla gerek kalmaz. Arka planda güvenle çalışır.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black mb-8">Teknik Kapasite & Özellikler</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.features.map((feat, idx) => (
                                <div key={idx} className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                    <Zap className="w-6 h-6 text-amber-500 mb-4" />
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{feat}</h4>
                                </div>
                            ))}
                            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-transparent">
                                <LayoutDashboard className="w-6 h-6 text-indigo-500 mb-4" />
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tekil UI Kontrolü</h4>
                            </div>
                            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-transparent">
                                <Lock className="w-6 h-6 text-rose-500 mb-4" />
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Maksimum Veri Güvenliği</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

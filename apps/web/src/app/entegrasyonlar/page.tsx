"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Store, Search, ArrowRight, ShoppingCart, 
    Calculator, Truck, FileText, FileCode2, Globe, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

const categories = [
    { id: 'all', name: 'Tümü', icon: Globe },
    { id: 'pazaryeri', name: 'Pazaryeri', icon: Store },
    { id: 'eticaret', name: 'E-ticaret Altyapısı', icon: ShoppingCart },
    { id: 'muhasebe', name: 'Muhasebe', icon: Calculator },
    { id: 'kargo', name: 'Kargo', icon: Truck },
    { id: 'efatura', name: 'E-Fatura', icon: FileText },
    { id: 'xml', name: 'XML Kaynakları', icon: FileCode2 },
];

const integrations = [
    // Pazaryeri
    { id: 'trendyol', name: 'Trendyol', category: 'pazaryeri', color: 'bg-orange-500', desc: 'Sipariş, stok, ürün ve fiyat otomasyonu.' },
    { id: 'hepsiburada', name: 'Hepsiburada', category: 'pazaryeri', color: 'bg-orange-600', desc: 'Gerçek zamanlı stok eşitleme ve fatura.' },
    { id: 'n11', name: 'N11', category: 'pazaryeri', color: 'bg-red-600', desc: 'Toplu ürün yükleme ve kategori eşleştirme.' },
    { id: 'amazon', name: 'Amazon Türkiye', category: 'pazaryeri', color: 'bg-yellow-500', desc: 'Siparişten kargoya kadar tam entegrasyon.' },
    { id: 'ciceksepeti', name: 'Çiçeksepeti', category: 'pazaryeri', color: 'bg-emerald-500', desc: 'Anlık sipariş ve kampanya takibi.' },
    // Eticaret
    { id: 'shopify', name: 'Shopify', category: 'eticaret', color: 'bg-green-600', desc: 'E-ihracat ve global satış entegrasyonu.' },
    { id: 'ideasoft', name: 'IdeaSoft', category: 'eticaret', color: 'bg-blue-600', desc: 'Türkiye\'nin lider altyapısı ile çift yönlü anlık senkron.' },
    { id: 'ticimax', name: 'Ticimax', category: 'eticaret', color: 'bg-indigo-600', desc: 'Stok ve siparişlerde sıfır kayıp garantisi.' },
    { id: 'woocommerce', name: 'WooCommerce', category: 'eticaret', color: 'bg-purple-600', desc: 'WordPress sitenizdeki tüm siparişleri tek panelde toplayın.' },
    // Muhasebe
    { id: 'parasut', name: 'Paraşüt', category: 'muhasebe', color: 'bg-blue-500', desc: 'Siparişleri anında faturaya çevirin, tahsilatları izleyin.' },
    { id: 'bizimhesap', name: 'Bizim Hesap', category: 'muhasebe', color: 'bg-orange-400', desc: 'Ön muhasebe süreçlerini tamamen dijitalleştirin.' },
    { id: 'logo', name: 'Logo Go 3 & Tiger', category: 'muhasebe', color: 'bg-cyan-600', desc: 'Kurumsal ERP altyapınızla tam entegre çalışın.' },
    { id: 'mikro', name: 'Mikro', category: 'muhasebe', color: 'bg-red-500', desc: 'Büyük ölçekli stok ve cari verilerini hatasız yönetin.' },
    // Kargo
    { id: 'yurtici', name: 'Yurtiçi Kargo', category: 'kargo', color: 'bg-blue-800', desc: 'Toplu barkod yazdırma ve otomatik takip no aktarımı.' },
    { id: 'aras', name: 'Aras Kargo', category: 'kargo', color: 'bg-red-600', desc: 'Anında kargo fişi oluşturma ve durum sorgulama.' },
    { id: 'mng', name: 'MNG Kargo', category: 'kargo', color: 'bg-blue-500', desc: 'Şube teslimat ve iade operasyonlarını takip edin.' },
    { id: 'sendeo', name: 'Sendeo', category: 'kargo', color: 'bg-yellow-500', desc: 'Hızlı sipariş karşılama ve yeni nesil teslimat entegrasyonu.' },
    // E-fatura
    { id: 'gib', name: 'GİB e-Arşiv', category: 'efatura', color: 'bg-slate-700', desc: '5000/30000 TL faturaları doğrudan Gelir İdaresi\'ne iletin.' },
    { id: 'sovos', name: 'Sovos (Fit Solutions)', category: 'efatura', color: 'bg-indigo-500', desc: 'Özel entegratör üzerinden saniyeler içinde e-fatura kesin.' },
    { id: 'turkcell', name: 'Turkcell e-Fatura', category: 'efatura', color: 'bg-blue-600', desc: 'Güvenilir altyapı ile elektronik faturalandırma.' },
    // XML
    { id: 'aktifbebek', name: 'Aktif Bebek', category: 'xml', color: 'bg-pink-500', desc: 'Binlerce bebek ürününü kar marjı ile XML\'den çekin.' },
    { id: 'zore', name: 'Zore Aksesuar', category: 'xml', color: 'bg-zinc-800', desc: 'Telefon aksesuarlarında otomatik stok güncelleme.' },
    { id: 'egetoptan', name: 'Ege Toptan', category: 'xml', color: 'bg-emerald-600', desc: 'Günlük mutfak gereçlerini anında pazaryerlerine atın.' },
];

export default function IntegrationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredIntegrations = integrations.filter(int => {
        const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) || int.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || int.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] flex flex-col pt-24">
            <Head>
                <title>50'den Fazla Entegrasyon Çözümü | Pazaryonetimi</title>
                <meta name="description" content="Pazaryerleri, E-ticaret siteleri, kargo ve muhasebe programlarıyla tam senkronizasyon. Sopyo benzeri dev entegrasyon havuzumuzu inceleyin." />
            </Head>

            {/* Hero Section */}
            <div className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" /> Sürekli Büyüyen Ekosistem
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        İhtiyacınız Olan <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Tüm Entegrasyonlar</span> Tek Yerde
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Pazaryerleri, e-ticaret siteniz, muhasebe yazılımınız ve kargo firmalarınız. <br className="hidden md:block" />
                        Pazaryonetimi ile tüm operasyonlarınızı otomatize edin, büyümeye odaklanın.
                    </p>

                    <div className="max-w-2xl mx-auto relative">
                        <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            name="search_integrations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Hangi entegrasyonu arıyorsunuz? (Örn: Hepsiburada, Paraşüt, Aras Kargo)"
                            className="w-full bg-white dark:bg-surface border-2 border-border rounded-2xl pl-14 pr-6 py-5 text-lg font-medium shadow-xl shadow-primary/5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-32">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Sidebar Categories */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="sticky top-32 space-y-2 bg-white dark:bg-surface p-4 rounded-3xl border border-border shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-3 mb-4 mt-2">Kategoriler</h3>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={\`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all \${
                                        activeCategory === cat.id 
                                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }\`}
                                >
                                    <div className="flex items-center gap-3">
                                        <cat.icon className="w-5 h-5" />
                                        {cat.name}
                                    </div>
                                    {activeCategory === cat.id && <ArrowRight className="w-4 h-4 opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid List */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {categories.find(c => c.id === activeCategory)?.name} Entegrasyonları
                            </h2>
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-surface px-3 py-1 rounded-full border border-border">
                                {filteredIntegrations.length} Sonuç
                            </span>
                        </div>

                        {filteredIntegrations.length === 0 ? (
                            <div className="bg-white dark:bg-surface border border-border rounded-3xl p-16 text-center">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Aradığınız entegrasyon bulunamadı</h3>
                                <p className="text-slate-500">"{searchQuery}" araması için henüz bir entegrasyonumuz yok veya adı farklı. Ekibimiz her gün yeni sistemler eklemeye devam ediyor.</p>
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors"
                                >
                                    Filtreyi Temizle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredIntegrations.map((int) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            key={int.id}
                                        >
                                            <Link 
                                                href={\`/entegrasyonlar/\${int.id}-entegrasyonu\`}
                                                className="group relative bg-white dark:bg-surface border border-border rounded-3xl p-6 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer flex flex-col h-full overflow-hidden block"
                                            >
                                            <div className={\`absolute top-0 right-0 w-32 h-32 \${int.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity\`} />
                                            
                                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                                <div className={\`w-14 h-14 rounded-2xl \${int.color} flex items-center justify-center text-white font-black text-xl shadow-lg\`}>
                                                    {int.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">{int.name}</h3>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        {categories.find(c => c.id === int.category)?.name}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1 relative z-10">
                                                {int.desc}
                                            </p>
                                            
                                            <div className="pt-4 border-t border-border mt-auto flex items-center justify-between relative z-10">
                                                <span className="text-xs font-bold text-emerald-500">✓ Aktif Eklenti</span>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-400">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 border-t border-white/10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-white mb-2">Tüm Süreçlerinizi Otomatize Edin</h2>
                        <p className="text-indigo-200">Kredi kartı gerekmeden 14 gün boyunca bedava test edin.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/register" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-colors shadow-xl shadow-white/10 text-lg">
                            Ücretsiz Dene
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

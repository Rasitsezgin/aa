'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, DollarSign, Truck, Globe, X, ArrowRight,
  TrendingUp, Percent, CheckCircle, RefreshCw, AlertCircle, Info
} from 'lucide-react';

interface ForumCalculatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profit' | 'shipping' | 'etgb';
}

const MARKETPLACES = [
  { id: 'trendyol', name: 'Trendyol', defaultCommission: 19.5, minCargo: 44.50, color: '#f97316' },
  { id: 'hepsiburada', name: 'Hepsiburada', defaultCommission: 18.0, minCargo: 42.00, color: '#ea580c' },
  { id: 'amazon_tr', name: 'Amazon TR', defaultCommission: 15.0, minCargo: 39.00, color: '#eab308' },
  { id: 'n11', name: 'N11', defaultCommission: 17.5, minCargo: 40.00, color: '#ef4444' },
  { id: 'ciceksepeti', name: 'Çiçeksepeti', defaultCommission: 21.0, minCargo: 45.00, color: '#06b6d4' },
  { id: 'etsy', name: 'Etsy (Global)', defaultCommission: 12.5, minCargo: 180.00, color: '#f59e0b' },
];

export default function ForumCalculatorsModal({
  isOpen,
  onClose,
  defaultTab = 'profit',
}: ForumCalculatorsModalProps) {
  const [activeTab, setActiveTab] = useState<'profit' | 'shipping' | 'etgb'>(defaultTab);

  // 1. KÂR VE KOMİSYON HESAPLAYICI STATE
  const [salePrice, setSalePrice] = useState<number>(450);
  const [costPrice, setCostPrice] = useState<number>(180);
  const [selectedMarketplace, setSelectedMarketplace] = useState(MARKETPLACES[0].id);
  const [commissionRate, setCommissionRate] = useState<number>(19.5);
  const [shippingCost, setShippingCost] = useState<number>(44.50);
  const [kdvRate, setKdvRate] = useState<number>(20);
  const [packagingCost, setPackagingCost] = useState<number>(8.50);
  const [adsBudgetPerItem, setAdsBudgetPerItem] = useState<number>(25);

  // 2. KARGO DESİ VE MALİYET KIYASLAMA STATE
  const [desi, setDesi] = useState<number>(2);

  // 3. MİKRO İHRACAT (ETGB) KDV İADESİ STATE
  const [exportUsdAmount, setExportUsdAmount] = useState<number>(1250);
  const [usdRate, setUsdRate] = useState<number>(36.50);
  const [inputKdvRate, setInputKdvRate] = useState<number>(20);

  // Kâr Hesaplaması
  const profitCalculation = useMemo(() => {
    const sale = Number(salePrice) || 0;
    const cost = Number(costPrice) || 0;
    const comm = (sale * (Number(commissionRate) || 0)) / 100;
    const ship = Number(shippingCost) || 0;
    const pack = Number(packagingCost) || 0;
    const ads = Number(adsBudgetPerItem) || 0;

    const saleKdv = sale - sale / (1 + (Number(kdvRate) || 20) / 100);
    const costKdv = cost - cost / (1 + (Number(kdvRate) || 20) / 100);
    const payableKdv = Math.max(0, saleKdv - costKdv);

    const totalExpense = cost + comm + ship + pack + ads + payableKdv;
    const netProfit = sale - totalExpense;
    const profitMargin = sale > 0 ? (netProfit / sale) * 100 : 0;
    const roi = cost > 0 ? (netProfit / cost) * 100 : 0;

    return {
      commissionAmount: comm,
      payableKdv,
      totalExpense,
      netProfit,
      profitMargin,
      roi,
    };
  }, [salePrice, costPrice, commissionRate, shippingCost, kdvRate, packagingCost, adsBudgetPerItem]);

  // Kargo Fiyat Karşılaştırması
  const shippingComparison = useMemo(() => {
    const d = Math.max(1, Number(desi) || 1);
    return [
      { name: 'Trendyol Express', price: 38.50 + (d - 1) * 7.50, speed: '1-2 Gün', coverage: '%94 Türkiye' },
      { name: 'HepsiJet', price: 36.90 + (d - 1) * 7.20, speed: 'Ertesi Gün', coverage: '%92 Türkiye' },
      { name: 'Sürat Kargo (Pazaryeri)', price: 41.00 + (d - 1) * 8.00, speed: '2-3 Gün', coverage: '%99 Türkiye' },
      { name: 'Yurtiçi Kargo (Özel Anlaşma)', price: 46.50 + (d - 1) * 9.00, speed: '1-2 Gün', coverage: '%100 Türkiye' },
      { name: 'MNG Kargo', price: 43.00 + (d - 1) * 8.50, speed: '2 Gün', coverage: '%98 Türkiye' },
      { name: 'PTT Kargo (Köy / Uzak)', price: 34.00 + (d - 1) * 6.00, speed: '3-4 Gün', coverage: '%100 Türkiye' },
    ].sort((a, b) => a.price - b.price);
  }, [desi]);

  // ETGB KDV İadesi Hesabı
  const etgbCalculation = useMemo(() => {
    const usd = Number(exportUsdAmount) || 0;
    const rate = Number(usdRate) || 36.50;
    const tryEquivalent = usd * rate;
    const estimatedInputCost = tryEquivalent * 0.45;
    const kdvRefund = (estimatedInputCost * (Number(inputKdvRate) || 20)) / 100;
    const yearlyGainEstimate = kdvRefund * 12;

    return {
      tryEquivalent,
      estimatedInputCost,
      kdvRefund,
      yearlyGainEstimate,
    };
  }, [exportUsdAmount, usdRate, inputKdvRate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight text-white">
                Pazaryeri Hesaplayıcıları & Araçlar
              </h2>
              <p className="text-xs text-slate-400">
                Canlı komisyon, net kâr, kargo desi ve ETGB KDV iade simülatörü.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 gap-2">
          <button
            onClick={() => setActiveTab('profit')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profit'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign size={16} /> Komisyon & Net Kâr
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'shipping'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck size={16} /> Kargo Desi Kıyaslama
          </button>
          <button
            onClick={() => setActiveTab('etgb')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'etgb'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe size={16} /> Mikro İhracat (ETGB) KDV İadesi
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: KOMİSYON & NET KÂR */}
          {activeTab === 'profit' && (
            <div className="grid md:grid-cols-12 gap-6">
              {/* Sol Girdi Alanları */}
              <div className="md:col-span-7 space-y-4">
                {/* Pazaryeri Seçimi */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Pazaryeri Seçin
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MARKETPLACES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMarketplace(m.id);
                          setCommissionRate(m.defaultCommission);
                          setShippingCost(m.minCargo);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          selectedMarketplace === m.id
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Satış Fiyatı (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">₺</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Alış / Tedarik Fiyatı (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={costPrice}
                        onChange={(e) => setCostPrice(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">₺</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Komisyon Oranı (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kargo Maliyeti (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">₺</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Koli & Ambalaj (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">₺</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ürün Başı Reklam (TL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={adsBudgetPerItem}
                        onChange={(e) => setAdsBudgetPerItem(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">₺</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Sonuç Kartı */}
              <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-orange-400 uppercase">
                    NET KÂR & MARJ ANALİZİ
                  </span>
                  <div className="mt-2 mb-4">
                    <div className={`text-3xl font-black ${profitCalculation.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profitCalculation.netProfit.toFixed(2)} ₺
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <span>Net Kâr Marjı:</span>
                      <span className="font-bold text-emerald-400">
                        %{profitCalculation.profitMargin.toFixed(1)}
                      </span>
                      <span>• ROI:</span>
                      <span className="font-bold text-amber-400">
                        %{profitCalculation.roi.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Komisyon Kesintisi:</span>
                      <span className="font-medium">{profitCalculation.commissionAmount.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kargo & Ambalaj:</span>
                      <span className="font-medium">{(shippingCost + packagingCost).toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tahmini KDV Yükü:</span>
                      <span className="font-medium">{profitCalculation.payableKdv.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-white">
                      <span>Toplam Gider:</span>
                      <span>{profitCalculation.totalExpense.toFixed(2)} ₺</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-300 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Pazaryonetimi Dinamik Repricer ile bu marjı koruyarak otomatik fiyat güncelleyebilirsiniz.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KARGO DESİ KIYASLAMA */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gönderi Desi / Kg Ağırlığı
                  </label>
                  <p className="text-xs text-slate-500">
                    Formül: (En x Boy x Yükseklik) / 3000
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={desi}
                    onChange={(e) => setDesi(Number(e.target.value))}
                    className="w-40 sm:w-60 accent-orange-500"
                  />
                  <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-extrabold text-sm min-w-[50px] text-center">
                    {desi} Desi
                  </span>
                </div>
              </div>

              {/* Kıyaslama Kartları Tablosu */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shippingComparison.map((item, idx) => (
                  <div
                    key={item.name}
                    className={`p-4 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                          EN UYGUN
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                      {item.price.toFixed(2)} ₺
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                      <div className="flex justify-between">
                        <span>Teslimat Hızı:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kapsama:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.coverage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MİKRO İHRACAT (ETGB) KDV İADESİ */}
          {activeTab === 'etgb' && (
            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong>Mikro İhracat (ETGB) Avantajı:</strong> 15.000 € altı yurtdışı satışlarınızda %0 KDV ile fatura kesip, ürün üretiminde ödediğiniz %10 veya %20 KDV&apos;yi nakit veya vergi mahsubu olarak geri alabilirsiniz.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Aylık Yurtdışı İhracat Tutarı (USD)
                    </label>
                    <input
                      type="number"
                      value={exportUsdAmount}
                      onChange={(e) => setExportUsdAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        USD / TRY Kuru
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={usdRate}
                        onChange={(e) => setUsdRate(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Girdi KDV Oranı (%)
                      </label>
                      <select
                        value={inputKdvRate}
                        onChange={(e) => setInputKdvRate(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white"
                      >
                        <option value={10}>%10 (Tekstil, Ayakkabı, Gıda)</option>
                        <option value={20}>%20 (Genel, Kozmetik, Hırdavat)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-blue-800/60 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-blue-300 uppercase">
                    GERİ ALINABİLİR AYLIK KDV İADESİ
                  </span>
                  <div className="text-3xl font-black text-emerald-400 mt-2 mb-1">
                    {etgbCalculation.kdvRefund.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                  </div>
                  <p className="text-xs text-slate-300">
                    Aylık Ciro Karşılığı: <strong>{etgbCalculation.tryEquivalent.toLocaleString('tr-TR')} ₺</strong>
                  </p>

                  <div className="mt-4 pt-3 border-t border-blue-800/50 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yıllık Ek KDV İade Kazancı:</span>
                      <span className="font-bold text-amber-400">
                        {etgbCalculation.yearlyGainEstimate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <a
                    href="/forum/topic/mikro-ihracat-etgb-ile-kdv-iadesi-nasil-alinir-adim-adim-surec"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>ETGB İade Rehberini Oku</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

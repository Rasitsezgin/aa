"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRightLeft,
  Clock,
  BarChart3,
  Globe,
  Calculator,
  History,
  ArrowRight
} from 'lucide-react';

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  baseCurrency: string;
}

const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  TRY: '🇹🇷',
};

const currencyNames: Record<string, string> = {
  USD: 'Amerikan Doları',
  EUR: 'Euro',
  GBP: 'İngiliz Sterlini',
  TRY: 'Türk Lirası',
};

export default function CurrencyPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('TRY');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setRates([
      { currency: 'USD', rate: 38.50, change: 0.25, baseCurrency: 'TRY' },
      { currency: 'EUR', rate: 40.80, change: -0.15, baseCurrency: 'TRY' },
      { currency: 'GBP', rate: 48.50, change: 0.40, baseCurrency: 'TRY' },
    ]);
    setLoading(false);
    setLastUpdate(new Date());
  }, []);

  const handleConvert = () => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      return;
    }
    const fromRate = fromCurrency === 'TRY' ? 1 : rates.find(r => r.currency === fromCurrency)?.rate || 1;
    const toRate = toCurrency === 'TRY' ? 1 : rates.find(r => r.currency === toCurrency)?.rate || 1;
    setConvertedAmount(Math.round((amount * fromRate / toRate) * 100) / 100);
  };

  useEffect(() => {
    handleConvert();
  }, [amount, fromCurrency, toCurrency, rates]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Döviz Kurları</h1>
          <p className="text-slate-500 font-medium">TCMB güncel kurları ve döviz çevirici</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 flex items-center gap-1.5">
            <Clock size={14} />
            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </span>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-semibold hover:bg-surface transition-colors">
            <RefreshCw size={18} />
            Güncelle
          </button>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rates.map((rate, i) => (
          <motion.div
            key={rate.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currencyFlags[rate.currency]}</span>
                <div>
                  <p className="font-bold text-foreground text-lg">{rate.currency}/TRY</p>
                  <p className="text-xs text-slate-400">{currencyNames[rate.currency]}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${rate.change >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {rate.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}%
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{rate.rate.toFixed(4)}</p>
            <p className="text-sm text-slate-400 mt-1">1 {rate.currency} = {rate.rate.toFixed(4)} TRY</p>
          </motion.div>
        ))}
      </div>

      {/* Currency Converter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Döviz Çevirici</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-500 mb-1 block">Tutar</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-border rounded-xl bg-background text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-500 mb-1 block">Sonuç</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 border border-border rounded-xl bg-background/50 text-foreground font-semibold text-lg">
                {convertedAmount !== null ? convertedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-'}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>
        {convertedAmount !== null && (
          <p className="text-center text-sm text-slate-400 mt-4">
            {amount} {fromCurrency} = {convertedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {toCurrency}
          </p>
        )}
      </motion.div>

      {/* Rate History Placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Kur Geçmişi</h2>
          </div>
          <select className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground">
            <option>Son 7 gün</option>
            <option>Son 30 gün</option>
            <option>Son 90 gün</option>
          </select>
        </div>
        <div className="h-48 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Grafik yakında eklenecek</p>
            <p className="text-sm">TCMB kur geçmişi grafikleri burada gösterilecek</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
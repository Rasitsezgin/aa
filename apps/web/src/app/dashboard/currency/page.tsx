"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Clock,
  BarChart3,
  Calculator,
  History,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  baseCurrency: string;
}

interface HistoryPoint {
  date: string;
  rate: number;
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
  const [refreshing, setRefreshing] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('TRY');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [rateSource, setRateSource] = useState('TCMB');
  const [chartCurrency, setChartCurrency] = useState('USD');
  const [historyDays, setHistoryDays] = useState(7);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadRates = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/currency/rates');
      if (res.ok) {
        const data = await res.json();
        setRates(data.rates || []);
        setRateSource(data.source || 'TCMB');
        setLastUpdate(new Date(data.date || Date.now()));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/currency/history?currency=${chartCurrency}&days=${historyDays}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [chartCurrency, historyDays]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleConvert = useCallback(() => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      return;
    }
    const fromRate = fromCurrency === 'TRY' ? 1 : rates.find((r) => r.currency === fromCurrency)?.rate || 1;
    const toRate = toCurrency === 'TRY' ? 1 : rates.find((r) => r.currency === toCurrency)?.rate || 1;
    setConvertedAmount(Math.round((amount * fromRate / toRate) * 100) / 100);
  }, [amount, fromCurrency, toCurrency, rates]);

  useEffect(() => {
    handleConvert();
  }, [handleConvert]);

  const chartData = history.map((h) => ({
    name: new Date(h.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    rate: h.rate,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Döviz Kurları</h1>
          <p className="text-slate-500 font-medium">
            TCMB güncel kurları ve döviz çevirici
            {rateSource !== 'TCMB' && (
              <span className="ml-2 text-amber-600 text-xs">(yedek veri)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 flex items-center gap-1.5">
            <Clock size={14} />
            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </span>
          <button
            onClick={loadRates}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-semibold hover:bg-surface transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Güncelle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rates.map((rate, i) => (
          <motion.div
            key={rate.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setChartCurrency(rate.currency)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currencyFlags[rate.currency]}</span>
                <div>
                  <p className="font-bold text-foreground text-lg">{rate.currency}/TRY</p>
                  <p className="text-xs text-slate-400">{currencyNames[rate.currency]}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                  rate.change >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}
              >
                {rate.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {rate.change >= 0 ? '+' : ''}
                {rate.change.toFixed(2)}%
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">{rate.rate.toFixed(4)}</p>
            <p className="text-sm text-slate-400 mt-1">
              1 {rate.currency} = {rate.rate.toFixed(4)} TRY
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface border border-border rounded-2xl p-6"
      >
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
                {convertedAmount !== null
                  ? convertedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                  : '-'}
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
            {amount} {fromCurrency} ={' '}
            {convertedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {toCurrency}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-surface border border-border rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Kur Geçmişi — {chartCurrency}/TRY
            </h2>
          </div>
          <div className="flex gap-2">
            <select
              value={chartCurrency}
              onChange={(e) => setChartCurrency(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <select
              value={historyDays}
              onChange={(e) => setHistoryDays(Number(e.target.value))}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground"
            >
              <option value={7}>Son 7 gün</option>
              <option value={30}>Son 30 gün</option>
              <option value={90}>Son 90 gün</option>
            </select>
          </div>
        </div>

        {historyLoading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">Geçmiş veri bulunamadı</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-slate-500" />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.toFixed(2)}
                  className="text-slate-500"
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(4)} TRY`, chartCurrency]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}

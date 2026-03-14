'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tr, Dictionary } from './dictionaries/tr';
import { en } from './dictionaries/en';

type Locale = 'tr' | 'en';

const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en: en as Dictionary,
};

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatRelativeTime: (date: Date | string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr');
  const [dictionary, setDictionary] = useState<Dictionary>(tr);

  // İlk mount'da localStorage'dan dil oku
  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && ['tr', 'en'].includes(stored)) {
      setLocaleState(stored);
      setDictionary(dictionaries[stored]);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(dictionaries[newLocale]);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const formatCurrency = useCallback((amount: number, currency = 'TRY'): string => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [locale]);

  const formatDate = useCallback((
    date: Date | string,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', options).format(d);
  }, [locale]);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US').format(num);
  }, [locale]);

  const formatRelativeTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const t = dictionary.time;

    if (diffMins < 1) return t.now;
    if (diffMins < 60) return `${diffMins} ${t.minutes} ${t.ago}`;
    if (diffHours < 24) return `${diffHours} ${t.hours} ${t.ago}`;
    if (diffDays === 1) return t.yesterday;
    if (diffDays < 7) return `${diffDays} ${t.days} ${t.ago}`;
    
    return formatDate(d);
  }, [dictionary, formatDate]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        t: dictionary,
        setLocale,
        formatCurrency,
        formatDate,
        formatNumber,
        formatRelativeTime,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Dil seçici bileşeni
export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}

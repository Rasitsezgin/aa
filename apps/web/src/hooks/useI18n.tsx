'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, defaultLanguage, getBrowserLanguage, t as translate, formatNumber, formatCurrency, formatDate, languageNames, languageFlags } from '@/lib/i18n';

interface I18nContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
    formatNum: (value: number) => string;
    formatMoney: (value: number, currency?: string) => string;
    formatDt: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
    languages: { code: Language; name: string; flag: string }[];
    dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(defaultLanguage);

    useEffect(() => {
        // Load from localStorage or browser
        const saved = localStorage.getItem('pazaryonetimi-lang') as Language | null;
        const initial = saved || getBrowserLanguage();
        setLangState(initial);

        // Set HTML dir and lang
        document.documentElement.lang = initial;
        document.documentElement.dir = initial === 'ar' ? 'rtl' : 'ltr';
    }, []);

    const setLang = useCallback((newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('pazaryonetimi-lang', newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }, []);

    const t = useCallback((key: string) => translate(key, lang), [lang]);
    const formatNum = useCallback((value: number) => formatNumber(value, lang), [lang]);
    const formatMoney = useCallback((value: number, currency?: string) => formatCurrency(value, currency, lang), [lang]);
    const formatDt = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => formatDate(date, lang, options), [lang]);

    const languages = (Object.keys(languageNames) as Language[]).map(code => ({
        code,
        name: languageNames[code],
        flag: languageFlags[code],
    }));

    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
        <I18nContext.Provider value={{ lang, setLang, t, formatNum, formatMoney, formatDt, languages, dir }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        // Fallback for components not wrapped in provider
        return {
            lang: defaultLanguage as Language,
            setLang: () => { },
            t: (key: string) => translate(key, defaultLanguage),
            formatNum: (value: number) => formatNumber(value, defaultLanguage),
            formatMoney: (value: number, currency?: string) => formatCurrency(value, currency, defaultLanguage),
            formatDt: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDate(date, defaultLanguage, options),
            languages: (Object.keys(languageNames) as Language[]).map(code => ({
                code,
                name: languageNames[code],
                flag: languageFlags[code],
            })),
            dir: 'ltr' as const,
        };
    }
    return context;
}

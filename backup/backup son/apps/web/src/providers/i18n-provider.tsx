'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, defaultLanguage, getBrowserLanguage, t as translate, languageNames, languageFlags } from '@/lib/i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage first, then browser language
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang && savedLang in languageNames) {
      setLanguageState(savedLang);
    } else {
      setLanguageState(getBrowserLanguage());
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update HTML dir attribute for RTL languages
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string) => translate(key, language);

  const languages = Object.entries(languageNames).map(([code, name]) => ({
    code: code as Language,
    name,
    flag: languageFlags[code as Language]
  }));

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages }}>
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

// Language Selector Component
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { language, setLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language);

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <span className="text-lg">{currentLang?.flag}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      language === lang.code
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm">{currentLang?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px]"
            >
              <div className="p-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      language === lang.code
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

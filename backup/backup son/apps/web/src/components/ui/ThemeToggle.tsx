'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, ChevronDown, Check, Palette } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'default', showLabel = true }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isOpen, setIsOpen] = useState(false);

  const themes: { mode: ThemeMode; icon: any; label: string }[] = [
    { mode: 'light', icon: Sun, label: 'Açık' },
    { mode: 'dark', icon: Moon, label: 'Koyu' },
    { mode: 'system', icon: Monitor, label: 'Sistem' }
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
    
    // Apply theme
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(mode);
    }
    
    localStorage.setItem('theme', mode);
  };

  const currentTheme = themes.find(t => t.mode === theme)!;
  const CurrentIcon = currentTheme.icon;

  // Icon only variant - simple toggle button
  if (variant === 'icon-only') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const modes: ThemeMode[] = ['light', 'dark', 'system'];
          const currentIndex = modes.indexOf(theme);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          handleThemeChange(nextMode);
        }}
        className="relative p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        title={currentTheme.label}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CurrentIcon className="w-5 h-5" />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 p-1 bg-slate-800 border border-slate-700 rounded-xl">
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.mode}
              onClick={() => handleThemeChange(t.mode)}
              className={`p-2 rounded-lg transition-colors ${
                theme === t.mode
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={t.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
      >
        <CurrentIcon className="w-4 h-4" />
        {showLabel && <span className="text-sm">{currentTheme.label}</span>}
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
              className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden min-w-[150px]"
            >
              <div className="p-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.mode}
                      onClick={() => handleThemeChange(t.mode)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        theme === t.mode
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{t.label}</span>
                      {theme === t.mode && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Theme Switcher for Header
export function QuickThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-slate-800 border border-slate-700 rounded-full p-1 transition-colors"
    >
      <motion.div
        className="absolute top-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
        animate={{ left: theme === 'dark' ? '4px' : '28px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white" />
        )}
      </motion.div>
      <div className="flex items-center justify-between px-1.5 h-full">
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-transparent' : 'text-slate-500'}`} />
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-transparent' : 'text-slate-500'}`} />
      </div>
    </motion.button>
  );
}

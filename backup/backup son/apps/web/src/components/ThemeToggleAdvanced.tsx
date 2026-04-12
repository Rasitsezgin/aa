'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'oled';

export function ThemeToggleAdvanced() {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'oled'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: ThemeMode = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'oled');
    root.removeAttribute('data-theme');
    
    if (newTheme === 'oled') {
      root.setAttribute('data-theme', 'oled');
    } else if (newTheme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'oled'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) return null;

  const icons = {
    light: Sun,
    dark: Moon,
    oled: Smartphone,
  };

  const labels = {
    light: 'Aydınlık',
    dark: 'Koyu',
    oled: 'OLED Siyah',
  };

  const Icon = icons[theme];

  return (
    <motion.button
      onClick={cycleTheme}
      className="relative p-2 rounded-xl glass-panel hover:scale-105 transition-transform"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="sr-only">{labels[theme]}</span>
    </motion.button>
  );
}

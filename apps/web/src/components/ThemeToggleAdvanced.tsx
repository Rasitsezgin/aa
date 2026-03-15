'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Smartphone } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'oled';

export function ThemeToggleAdvanced() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (resolvedTheme as ThemeMode) || 'dark';

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'oled'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
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

  const Icon = icons[currentTheme];

  return (
    <motion.button
      onClick={cycleTheme}
      className="relative p-2 rounded-xl glass-panel hover:scale-105 transition-transform"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        key={currentTheme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="sr-only">{labels[currentTheme]}</span>
    </motion.button>
  );
}

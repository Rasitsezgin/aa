"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  variant?: 'default' | 'muted' | 'gradient' | 'dark';
  className?: string;
  delay?: number;
}

const variantClasses = {
  default: 'bg-white dark:bg-[#020617]',
  muted: 'bg-slate-50/50 dark:bg-[#020617]/80',
  gradient: 'bg-gradient-to-b from-slate-50/80 to-white dark:from-[#020617]/80 dark:to-[#020617]',
  dark: 'bg-slate-900 dark:bg-[#020617]',
};

export function SectionWrapper({
  children,
  id,
  variant = 'default',
  className = '',
  delay = 0,
}: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full py-16 sm:py-24 ${variantClasses[variant]} ${className}`}
    >
      {/* Subtle top border for visual separation */}
      {variant !== 'default' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </motion.section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = true,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={`mb-12 sm:mb-16 ${centered ? 'text-center' : ''}`}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`inline-block text-xs font-black uppercase tracking-widest mb-4 px-3 py-1 rounded-full ${
            dark
              ? 'bg-white/10 text-white/70'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${
          dark ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`mt-4 text-lg sm:text-xl max-w-3xl leading-relaxed ${
            centered ? 'mx-auto' : ''
          } ${dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

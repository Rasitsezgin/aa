'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function GlowInput({ className, label, error, icon, ...props }: GlowInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-primary">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-2.5 rounded-xl bg-white/5 border transition-all duration-300',
            'placeholder:text-white/30 text-white',
            'focus:outline-none',
            icon && 'pl-10',
            error && 'border-red-500/50 focus:border-red-500',
            !error && 'border-white/10 hover:border-white/20 focus:border-primary/50',
            isFocused && 'shadow-[0_0_20px_rgba(59,130,246,0.3),0_0_40px_rgba(59,130,246,0.1)]',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <div 
          className={cn(
            'absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300',
            isFocused ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

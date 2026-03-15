'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DarkModeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  invert?: boolean;
  brightness?: number;
  contrast?: number;
  saturate?: number;
}

export function DarkModeImage({
  className,
  invert = false,
  brightness = 0.9,
  contrast = 1.1,
  saturate = 0.9,
  style,
  ...props
}: DarkModeImageProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const darkModeFilter = isDark
    ? `${invert ? 'invert(1) ' : ''}brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
    : undefined;

  return (
    <img
      className={cn('transition-all duration-300', className)}
      style={{
        ...style,
        filter: darkModeFilter,
      }}
      {...props}
    />
  );
}

// Container for images that applies consistent dark mode styling
interface DarkModeImageContainerProps {
  children: React.ReactNode;
  className?: string;
  preserveColors?: boolean;
}

export function DarkModeImageContainer({
  children,
  className,
  preserveColors = false,
}: DarkModeImageContainerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        !preserveColors && '[&:has(img)]:dark:[&_img]:brightness-90 [&:has(img)]:dark:[&_img]:contrast-110',
        className
      )}
    >
      {children}
    </div>
  );
}

// CSS-in-JS helper for global image styles
export function DarkModeImageStyles() {
  return (
    <style jsx global>{`
      [data-theme="dark"] img:not([data-preserve-colors]) {
        filter: brightness(0.9) contrast(1.05);
      }
      
      [data-theme="dark"] img[data-invert] {
        filter: invert(1) brightness(0.9) contrast(1.05);
      }
      
      [data-theme="dark"] .product-image {
        filter: brightness(0.95) contrast(1.02);
      }
      
      [data-theme="dark"] .avatar-image {
        filter: none;
      }
      
      [data-theme="dark"] .logo-image {
        filter: brightness(1.1);
      }
    `}</style>
  );
}

// Hook for detecting dark mode
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(dark);
    };

    checkDark();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDark);
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      mediaQuery.removeEventListener('change', checkDark);
      observer.disconnect();
    };
  }, []);

  return isDark;
}

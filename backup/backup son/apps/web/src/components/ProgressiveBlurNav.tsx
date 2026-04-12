'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ProgressiveBlurNav() {
  const [scrollY, setScrollY] = useState(0);
  const [blurIntensity, setBlurIntensity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Calculate blur intensity based on scroll (max at 200px)
      const intensity = Math.min(currentScrollY / 200, 1);
      setBlurIntensity(intensity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backdropBlur = 12 + blurIntensity * 12; // 12px to 24px
  const backgroundOpacity = 0.6 + blurIntensity * 0.3; // 0.6 to 0.9
  const shadowOpacity = blurIntensity * 0.15;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: `blur(${backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        backgroundColor: `rgba(var(--nav-bg-rgb, 2, 2, 4), ${backgroundOpacity})`,
        boxShadow: `0 4px 30px rgba(0, 0, 0, ${shadowOpacity})`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-gradient">Pazaryönetimi</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Nav items here */}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

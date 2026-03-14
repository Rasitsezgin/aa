'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Zap,
  Rocket,
  Target,
  Users,
  Globe
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  target?: string; // CSS selector for highlighting
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'PazarYonetimi\'ne Hoş Geldiniz! 🎉',
    description: 'Tüm pazaryeri işlemlerinizi tek bir yerden yönetmenizi sağlayan güçlü platform. Hadi başlayalım!',
    icon: Rocket,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Ana kontrol paneliniz. Satışlar, siparişler ve tüm önemli metriklerinizi buradan takip edebilirsiniz.',
    icon: BarChart3,
    target: '[data-tour="dashboard"]',
    position: 'right'
  },
  {
    id: 'products',
    title: 'Ürün Yönetimi',
    description: 'Tüm pazaryerlerindeki ürünlerinizi tek noktadan yönetin. Toplu güncelleme, fiyat değişikliği ve stok takibi yapın.',
    icon: Package,
    target: '[data-tour="products"]',
    position: 'right'
  },
  {
    id: 'orders',
    title: 'Sipariş Takibi',
    description: 'Trendyol, Hepsiburada, Amazon ve diğer platformlardan gelen siparişleri tek ekranda görün ve yönetin.',
    icon: ShoppingCart,
    target: '[data-tour="orders"]',
    position: 'right'
  },
  {
    id: 'ai-tools',
    title: 'AI Araçları',
    description: 'Yapay zeka destekli fiyatlama, SEO optimizasyonu ve satış tahminleri ile işinizi büyütün.',
    icon: Sparkles,
    target: '[data-tour="ai-tools"]',
    position: 'right'
  },
  {
    id: 'integrations',
    title: 'Entegrasyonlar',
    description: 'Pazaryeri hesaplarınızı bağlayın, ERP sistemlerinizle entegre olun.',
    icon: Globe,
    target: '[data-tour="integrations"]',
    position: 'right'
  },
  {
    id: 'automation',
    title: 'Otomasyon',
    description: 'Tekrarlayan işlemleri otomatikleştirin. Stok, fiyat ve sipariş otomasyonları kurun.',
    icon: Zap,
    target: '[data-tour="automation"]',
    position: 'right'
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Hesap ayarlarınızı, bildirim tercihlerinizi ve tema özelleştirmelerinizi buradan yapabilirsiniz.',
    icon: Settings,
    target: '[data-tour="settings"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'Hazırsınız! 🚀',
    description: 'Artık platformu kullanmaya başlayabilirsiniz. Herhangi bir sorunuz olursa yardım butonuna tıklayın.',
    icon: Check,
    position: 'center',
    action: {
      label: 'Hadi Başlayalım',
      href: '/dashboard'
    }
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goPrev = () => {
    if (isAnimating || isFirstStep) return;
    setIsAnimating(true);
    setCurrentStep(prev => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') handleSkip();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isAnimating]);

  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          {/* Spotlight Effect - would highlight specific elements in production */}
          {step.target && (
            <div className="absolute inset-0 pointer-events-none">
              {/* This would be dynamic based on target element position */}
            </div>
          )}

          {/* Tour Card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-white mb-3"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg leading-relaxed mb-8"
              >
                {step.description}
              </motion.p>

              {/* Step Counter */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-6 bg-purple-500'
                        : i < currentStep
                        ? 'bg-purple-500/50'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-800/30">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Atla
              </button>

              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goPrev}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Geri
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4" />
                      Tamamla
                    </>
                  ) : (
                    <>
                      İleri
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    const skipped = localStorage.getItem('onboarding_skipped');
    
    if (!completed && !skipped) {
      setShouldShow(true);
      // Auto-show after a short delay
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const openTour = () => setIsOpen(true);
  const closeTour = () => setIsOpen(false);
  const resetTour = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_skipped');
    setShouldShow(true);
    setIsOpen(true);
  };

  return {
    shouldShow,
    isOpen,
    openTour,
    closeTour,
    resetTour
  };
}

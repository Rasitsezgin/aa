'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Dashboard',
    content: 'Tüm pazaryerlerinizin performansını tek ekrandan takip edin. Gerçek zamanlı satış, stok ve sipariş bilgileri.',
    position: 'bottom',
  },
  {
    target: '[data-tour="products"]',
    title: 'Ürün Yönetimi',
    content: 'Tüm ürünlerinizi tek yerden yönetin. Toplu güncelleme, AI optimizasyonu ve otomatik senkronizasyon.',
    position: 'right',
  },
  {
    target: '[data-tour="orders"]',
    title: 'Siparişler',
    content: 'Tüm pazaryerlerinden gelen siparişleri tek panelde görüntüleyin ve yönetin.',
    position: 'right',
  },
  {
    target: '[data-tour="integrations"]',
    title: 'Entegrasyonlar',
    content: 'Trendyol, Hepsiburada, Amazon ve diğer pazaryerleriyle tek tıkla entegre olun.',
    position: 'left',
  },
  {
    target: '[data-tour="ai-assistant"]',
    title: 'AI Asistan',
    content: 'Yapay zeka destekli öneriler, otomatik fiyatlandırma ve içerik optimizasyonu.',
    position: 'left',
  },
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function ProductTour({ isOpen, onClose, onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && step) {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        // Highlight target
        target.classList.add('tour-highlight');
      }
    }

    return () => {
      // Remove highlights
      document.querySelectorAll('.tour-highlight').forEach((el) => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [isOpen, currentStep, step]);

  if (!isOpen || !step || !targetRect) return null;

  const getTooltipPosition = () => {
    const spacing = 16;
    switch (step.position) {
      case 'bottom':
        return {
          top: targetRect.bottom + spacing,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          top: targetRect.top - spacing,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%) translateY(-100%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - spacing,
          transform: 'translateX(-100%) translateY(-50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + spacing,
          transform: 'translateY(-50%)',
        };
    }
  };

  const position = getTooltipPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with hole */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{
              background: `rgba(0, 0, 0, 0.5)`,
            }}
            onClick={onClose}
          >
            {/* Cut out the target area */}
            <div
              className="absolute"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                borderRadius: 12,
              }}
            />
          </motion.div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 w-80"
            style={{
              top: position.top,
              left: position.left,
              transform: position.transform,
            }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {step.title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.content}
                </p>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-1">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500 text-center">
                  {currentStep + 1} / {tourSteps.length}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <button
                  onClick={onClose}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Atla
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {currentStep < tourSteps.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep((s) => s + 1)}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      İleri
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onComplete?.();
                        onClose();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Bitir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Keyboard shortcuts help modal
export function KeyboardShortcutsHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { key: '⌘ K', description: 'Hızlı arama / Command palette' },
    { key: '⌘ /', description: 'Klavye kısayolları' },
    { key: '⌘ B', description: 'Toplu işlemler modu' },
    { key: 'Esc', description: 'Modalları kapat / Seçimi iptal et' },
    { key: 'G + D', description: 'Dashboard\'a git' },
    { key: 'G + P', description: 'Ürünlere git' },
    { key: 'G + O', description: 'Siparişlere git' },
    { key: 'N + P', description: 'Yeni ürün ekle' },
    { key: 'N + O', description: 'Yeni sipariş' },
    { key: '?', description: 'Yardım merkezi' },
    { key: 'T', description: 'Tema değiştir (Dark/Light)' },
    { key: 'F', description: 'Tam ekran modu' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Klavye Kısayolları
          </h2>
          <div className="grid gap-3">
            {shortcuts.map(({ key, description }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
              >
                <span className="text-slate-600 dark:text-slate-300">{description}</span>
                <kbd className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-mono font-medium">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ProductTour;

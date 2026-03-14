'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Command, Search, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Hızlı arama aç', category: 'Navigasyon' },
  { keys: ['G', 'D'], description: 'Dashboard\'a git', category: 'Navigasyon' },
  { keys: ['G', 'P'], description: 'Ürünlere git', category: 'Navigasyon' },
  { keys: ['G', 'O'], description: 'Siparişlere git', category: 'Navigasyon' },
  { keys: ['G', 'C'], description: 'Müşterilere git', category: 'Navigasyon' },
  { keys: ['G', 'S'], description: 'Ayarlara git', category: 'Navigasyon' },
  { keys: ['G', 'N'], description: 'Bildirimlere git', category: 'Navigasyon' },
  
  // Actions
  { keys: ['N'], description: 'Yeni öğe oluştur', category: 'İşlemler' },
  { keys: ['E'], description: 'Seçili öğeyi düzenle', category: 'İşlemler' },
  { keys: ['Delete'], description: 'Seçili öğeyi sil', category: 'İşlemler' },
  { keys: ['Ctrl', 'S'], description: 'Kaydet', category: 'İşlemler' },
  { keys: ['Ctrl', 'Z'], description: 'Geri al', category: 'İşlemler' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Yinele', category: 'İşlemler' },
  
  // View
  { keys: ['Ctrl', 'B'], description: 'Sidebar aç/kapat', category: 'Görünüm' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Tam ekran', category: 'Görünüm' },
  { keys: ['Ctrl', '+'], description: 'Yakınlaştır', category: 'Görünüm' },
  { keys: ['Ctrl', '-'], description: 'Uzaklaştır', category: 'Görünüm' },
  { keys: ['Escape'], description: 'Modal/Popup kapat', category: 'Görünüm' },
  
  // Selection
  { keys: ['Ctrl', 'A'], description: 'Tümünü seç', category: 'Seçim' },
  { keys: ['Shift', 'Click'], description: 'Aralık seç', category: 'Seçim' },
  { keys: ['Ctrl', 'Click'], description: 'Çoklu seç', category: 'Seçim' },
  { keys: ['↑', '↓'], description: 'Listede gezin', category: 'Seçim' },
  { keys: ['Enter'], description: 'Seçimi onayla', category: 'Seçim' },
  
  // Search
  { keys: ['/'], description: 'Arama kutusuna odaklan', category: 'Arama' },
  { keys: ['Ctrl', 'F'], description: 'Sayfada ara', category: 'Arama' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Gelişmiş arama', category: 'Arama' },
  
  // Help
  { keys: ['?'], description: 'Bu yardım menüsünü aç', category: 'Yardım' },
  { keys: ['Ctrl', '?'], description: 'Dokümantasyona git', category: 'Yardım' },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const categories = [...new Set(shortcuts.map(s => s.category))];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // This would be handled by parent
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Klavye Kısayolları</h2>
                  <p className="text-sm text-slate-400">Hızlı navigasyon için kısayollar</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-purple-400 mb-3">{category}</h3>
                    <div className="space-y-2">
                      {shortcuts
                        .filter(s => s.category === category)
                        .map((shortcut, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                          >
                            <span className="text-sm text-slate-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, j) => (
                                <span key={j} className="flex items-center">
                                  <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white font-mono">
                                    {formatKey(key)}
                                  </kbd>
                                  {j < shortcut.keys.length - 1 && (
                                    <span className="text-slate-500 mx-1 text-xs">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-800/30">
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white">
                    ?
                  </kbd>
                  <span>Bu menüyü aç</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white">
                    Esc
                  </kbd>
                  <span>Kapat</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatKey(key: string): React.ReactNode {
  switch (key) {
    case 'Ctrl':
      return <span>Ctrl</span>;
    case 'Shift':
      return <span>⇧</span>;
    case 'Alt':
      return <span>Alt</span>;
    case 'Enter':
      return <CornerDownLeft className="w-3 h-3" />;
    case 'Command':
      return <Command className="w-3 h-3" />;
    case 'Delete':
      return <span>Del</span>;
    case 'Escape':
      return <span>Esc</span>;
    case '↑':
      return <ArrowUp className="w-3 h-3" />;
    case '↓':
      return <ArrowDown className="w-3 h-3" />;
    default:
      return key;
  }
}

// Keyboard Shortcuts Button for Header
export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        title="Klavye Kısayolları (?)"
      >
        <Keyboard className="w-5 h-5" />
      </motion.button>
      <KeyboardShortcutsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

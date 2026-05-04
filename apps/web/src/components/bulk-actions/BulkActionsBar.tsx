'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Edit3,
  Tag,
  Trash2,
  DollarSign,
  Package,
  Upload,
  Download,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkEdit: (field: string, value: unknown) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkSync: (platform: string) => void;
  onBulkAIOptimize: () => void;
}

const actionGroups = [
  {
    label: 'Düzenle',
    actions: [
      { id: 'price', icon: DollarSign, label: 'Fiyat Güncelle', color: 'blue' },
      { id: 'stock', icon: Package, label: 'Stok Güncelle', color: 'green' },
      { id: 'tags', icon: Tag, label: 'Etiket Ekle', color: 'purple' },
    ],
  },
  {
    label: 'İşlemler',
    actions: [
      { id: 'export', icon: Download, label: 'Dışa Aktar', color: 'slate' },
      { id: 'sync', icon: Upload, label: 'Pazaryerlerine Senkronize', color: 'indigo' },
      { id: 'ai', icon: Sparkles, label: 'AI ile Optimize Et', color: 'amber' },
    ],
  },
  {
    label: 'Riskli',
    actions: [
      { id: 'delete', icon: Trash2, label: 'Toplu Sil', color: 'red' },
    ],
  },
];

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onBulkEdit,
  onBulkDelete,
  onBulkExport,
  onBulkSync,
  onBulkAIOptimize,
}: BulkActionsBarProps) {
  const [showActions, setShowActions] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'price':
        setActiveModal('price');
        break;
      case 'stock':
        setActiveModal('stock');
        break;
      case 'tags':
        setActiveModal('tags');
        break;
      case 'export':
        onBulkExport();
        break;
      case 'sync':
        setActiveModal('sync');
        break;
      case 'ai':
        onBulkAIOptimize();
        break;
      case 'delete':
        setActiveModal('delete');
        break;
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Selection Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedCount} ürün seçildi
                    </p>
                    <p className="text-xs text-slate-500">
                      Toplam {totalCount} üründen
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    İşlemler
                    <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

                  <button
                    onClick={onSelectAll}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Tümünü Seç
                  </button>

                  <button
                    onClick={onClearSelection}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Actions */}
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-3 gap-6">
                        {actionGroups.map((group) => (
                          <div key={group.label}>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                              {group.label}
                            </p>
                            <div className="space-y-2">
                              {group.actions.map((action) => {
                                const Icon = action.icon;
                                const colorClasses = {
                                  blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
                                  green: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
                                  purple: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
                                  slate: 'bg-slate-500/10 text-slate-600 hover:bg-slate-500/20',
                                  indigo: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
                                  amber: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
                                  red: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
                                }[action.color];

                                return (
                                  <button
                                    key={action.id}
                                    onClick={() => handleAction(action.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${colorClasses}`}
                                  >
                                    <Icon className="w-4 h-4" />
                                    {action.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals would be implemented here */}
      {activeModal && (
        <BulkActionModal
          type={activeModal}
          selectedCount={selectedCount}
          onClose={() => setActiveModal(null)}
          onConfirm={(value) => {
            if (activeModal === 'price' || activeModal === 'stock' || activeModal === 'tags') {
              onBulkEdit(activeModal, value);
            } else if (activeModal === 'delete') {
              onBulkDelete();
            } else if (activeModal === 'sync') {
              onBulkSync(value as string);
            }
            setActiveModal(null);
          }}
        />
      )}
    </>
  );
}

// Bulk Action Modal Component
function BulkActionModal({
  type,
  selectedCount,
  onClose,
  onConfirm,
}: {
  type: string;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (value: unknown) => void;
}) {
  const [value, setValue] = useState('');

  const modalConfig: Record<string, { title: string; description: string; inputType: string; placeholder: string }> = {
    price: {
      title: 'Toplu Fiyat Güncelleme',
      description: `Seçili ${selectedCount} ürünün fiyatını güncelleyin. Yüzde veya sabit değer girin (+10%, -5, 100 vb.)`,
      inputType: 'text',
      placeholder: '+10% veya 100',
    },
    stock: {
      title: 'Toplu Stok Güncelleme',
      description: `Seçili ${selectedCount} ürünün stok miktarını güncelleyin.`,
      inputType: 'number',
      placeholder: 'Stok miktarı',
    },
    tags: {
      title: 'Etiket Ekle',
      description: `Seçili ${selectedCount} ürüne etiket ekleyin (virgülle ayırın)`,
      inputType: 'text',
      placeholder: 'yeni-sezon, indirim, çok-satan',
    },
    sync: {
      title: 'Pazaryerlerine Senkronize',
      description: `Seçili ${selectedCount} ürünü hangi pazaryerine senkronize etmek istiyorsunuz?`,
      inputType: 'select',
      placeholder: 'Pazaryeri seçin',
    },
    delete: {
      title: 'Toplu Silme Onayı',
      description: `DİKKAT: Seçili ${selectedCount} ürün kalıcı olarak silinecek. Bu işlem geri alınamaz!`,
      inputType: 'confirm',
      placeholder: '',
    },
  };

  const config = modalConfig[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${type === 'delete' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
            {config.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>

          {config.inputType !== 'confirm' && (
            <div className="mt-4">
              {config.inputType === 'select' ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Pazaryeri seçin</option>
                  <option value="trendyol">Trendyol</option>
                  <option value="hepsiburada">Hepsiburada</option>
                  <option value="amazon">Amazon</option>
                  <option value="n11">N11</option>
                  <option value="ciceksepeti">ÇiçekSepeti</option>
                  <option value="all">Tümü</option>
                </select>
              ) : (
                <input
                  type={config.inputType}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={config.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              )}
            </div>
          )}

          {type === 'delete' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">
                Silinecek ürün sayısı: <strong>{selectedCount}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(value)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${
              type === 'delete'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {type === 'delete' ? 'Evet, Sil' : 'Uygula'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

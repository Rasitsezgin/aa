'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Loader2,
  File,
  Trash2,
  Eye,
  ChevronDown
} from 'lucide-react';

export type ExportFormat = 'xlsx' | 'csv' | 'json';
export type DataType = 'products' | 'orders' | 'customers' | 'inventory';

interface ExportOptions {
  format: ExportFormat;
  dataType: DataType;
  columns?: string[];
  filters?: Record<string, any>;
  dateRange?: { start: Date; end: Date };
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors?: { row: number; message: string }[];
}

// Export Hook
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportData = async (options: ExportOptions): Promise<Blob | null> => {
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(i);
      }

      // Generate demo data based on type
      const data = generateDemoData(options.dataType, 100);
      
      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'csv':
          blob = new Blob([convertToCSV(data)], { type: 'text/csv;charset=utf-8;' });
          filename = `${options.dataType}_export_${Date.now()}.csv`;
          break;
        case 'json':
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          filename = `${options.dataType}_export_${Date.now()}.json`;
          break;
        default:
          // For xlsx, we'd use a library like xlsx in production
          blob = new Blob([convertToCSV(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          filename = `${options.dataType}_export_${Date.now()}.xlsx`;
      }

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return blob;
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return { exportData, isExporting, progress };
}

// Import Hook
export function useImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const importData = async (file: File, dataType: DataType): Promise<ImportResult> => {
    setIsImporting(true);
    setProgress(0);

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress(i);
      }

      // Simulate processing
      const totalRows = Math.floor(Math.random() * 500) + 100;
      const errorCount = Math.floor(Math.random() * 5);

      return {
        success: true,
        totalRows,
        successRows: totalRows - errorCount,
        errorRows: errorCount,
        errors: errorCount > 0 ? [
          { row: 15, message: 'Geçersiz SKU formatı' },
          { row: 42, message: 'Fiyat değeri eksik' }
        ].slice(0, errorCount) : []
      };
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  return { importData, isImporting, progress };
}

// Export Modal Component
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: DataType;
}

export function ExportModal({ isOpen, onClose, dataType }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const { exportData, isExporting, progress } = useExport();

  const dataTypeLabels: Record<DataType, string> = {
    products: 'Ürünler',
    orders: 'Siparişler',
    customers: 'Müşteriler',
    inventory: 'Stok'
  };

  const handleExport = async () => {
    await exportData({ format, dataType });
    onClose();
  };

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
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Dışa Aktar</h2>
                  <p className="text-sm text-slate-400">{dataTypeLabels[dataType]}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-slate-300">Format Seçin</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
                  { value: 'csv', label: 'CSV', icon: File },
                  { value: 'json', label: 'JSON', icon: File }
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value as ExportFormat)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      format === f.value
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <f.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isExporting && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Dışa aktarılıyor...</span>
                  <span className="text-sm text-white">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Dışa Aktar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Import Modal Component
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: DataType;
  onSuccess?: (result: ImportResult) => void;
}

export function ImportModal({ isOpen, onClose, dataType, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData, isImporting, progress } = useImport();

  const dataTypeLabels: Record<DataType, string> = {
    products: 'Ürünler',
    orders: 'Siparişler',
    customers: 'Müşteriler',
    inventory: 'Stok'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const importResult = await importData(file, dataType);
    setResult(importResult);
    onSuccess?.(importResult);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">İçe Aktar</h2>
                  <p className="text-sm text-slate-400">{dataTypeLabels[dataType]}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drop Zone */}
            {!result && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  file
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">{file.name}</div>
                      <div className="text-sm text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setFile(null); }}
                      className="p-2 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 mb-1">Dosyayı sürükleyin veya tıklayın</p>
                    <p className="text-sm text-slate-500">Excel, CSV veya JSON</p>
                  </>
                )}
              </div>
            )}

            {/* Progress */}
            {isImporting && (
              <div className="my-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">İçe aktarılıyor...</span>
                  <span className="text-sm text-white">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`my-6 p-4 rounded-xl ${
                result.errorRows === 0
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.errorRows === 0 ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  )}
                  <span className={result.errorRows === 0 ? 'text-green-400' : 'text-yellow-400'}>
                    İçe aktarma {result.errorRows === 0 ? 'tamamlandı' : 'kısmen başarılı'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{result.totalRows}</div>
                    <div className="text-xs text-slate-400">Toplam Satır</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{result.successRows}</div>
                    <div className="text-xs text-slate-400">Başarılı</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{result.errorRows}</div>
                    <div className="text-xs text-slate-400">Hatalı</div>
                  </div>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Hatalar:</p>
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-400">
                        Satır {err.row}: {err.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                {result ? 'Kapat' : 'İptal'}
              </button>
              {!result && (
                <button
                  onClick={handleImport}
                  disabled={!file || isImporting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white disabled:opacity-50"
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  İçe Aktar
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper functions
function generateDemoData(type: DataType, count: number): any[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'products':
        data.push({
          id: `PRD-${i + 1}`,
          name: `Ürün ${i + 1}`,
          sku: `SKU-${1000 + i}`,
          price: Math.floor(Math.random() * 10000) + 100,
          stock: Math.floor(Math.random() * 100),
          category: ['Elektronik', 'Moda', 'Ev', 'Spor'][Math.floor(Math.random() * 4)]
        });
        break;
      case 'orders':
        data.push({
          id: `ORD-${i + 1}`,
          customer: `Müşteri ${i + 1}`,
          total: Math.floor(Math.random() * 5000) + 100,
          status: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
          date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
        });
        break;
      case 'customers':
        data.push({
          id: `CUS-${i + 1}`,
          name: `Müşteri ${i + 1}`,
          email: `musteri${i + 1}@example.com`,
          totalOrders: Math.floor(Math.random() * 50),
          totalSpent: Math.floor(Math.random() * 50000)
        });
        break;
      case 'inventory':
        data.push({
          sku: `SKU-${1000 + i}`,
          product: `Ürün ${i + 1}`,
          quantity: Math.floor(Math.random() * 500),
          warehouse: ['Ana Depo', 'Yedek Depo'][Math.floor(Math.random() * 2)]
        });
        break;
    }
  }
  return data;
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  return [headers.join(','), ...rows].join('\n');
}

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Table,
  Loader2,
} from 'lucide-react';

interface ImportWizardProps {
  onImport: (data: unknown[]) => Promise<void>;
  templateUrl?: string;
  sampleData?: Record<string, unknown>[];
}

const steps = ['Yükle', 'Harita', 'Doğrula', 'İşle'];

export function ExcelImportWizard({ onImport, templateUrl, sampleData }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<unknown[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      parseExcel(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0] as Record<string, unknown>));
        setData(jsonData);
        // Auto-mapping suggestions
        const autoMapping: Record<string, string> = {};
        Object.keys(jsonData[0] as Record<string, unknown>).forEach((col) => {
          const lower = col.toLowerCase();
          if (lower.includes('sku') || lower.includes('ürün kodu')) autoMapping[col] = 'sku';
          if (lower.includes('ad')) autoMapping[col] = 'name';
          if (lower.includes('fiyat') || lower.includes('price')) autoMapping[col] = 'price';
          if (lower.includes('stok') || lower.includes('stock')) autoMapping[col] = 'stock';
        });
        setMapping(autoMapping);
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateData = () => {
    const newErrors: Array<{ row: number; message: string }> = [];
    data.forEach((row, index) => {
      const rowData = row as Record<string, unknown>;
      if (!rowData[mapping['name'] || 'name']) {
        newErrors.push({ row: index + 2, message: 'Ürün adı eksik' });
      }
      if (!rowData[mapping['sku'] || 'sku']) {
        newErrors.push({ row: index + 2, message: 'SKU kodu eksik' });
      }
    });
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const processImport = async () => {
    setIsProcessing(true);
    try {
      const mappedData = data.map((row) => {
        const rowData = row as Record<string, unknown>;
        const mapped: Record<string, unknown> = {};
        Object.entries(mapping).forEach(([source, target]) => {
          if (target) mapped[target] = rowData[source];
        });
        return mapped;
      });

      await onImport(mappedData);
      setResult({ success: mappedData.length, failed: 0 });
    } catch (error) {
      setResult({ success: 0, failed: data.length });
    }
    setIsProcessing(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {isDragActive ? 'Dosyaları buraya bırakın' : 'Excel dosyası sürükleyin veya seçin'}
              </p>
              <p className="mt-2 text-sm text-slate-500">.xlsx veya .xls (max 10MB)</p>
            </div>

            {templateUrl && (
              <a
                href={templateUrl}
                download
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
                Örnek şablonu indir
              </a>
            )}

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl"
              >
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">{file.name}</span>
                <span className="text-sm text-green-600">({data.length} satır)</span>
              </motion.div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Excel kolonlarını sistem alanlarına eşleştirin:
            </p>
            <div className="grid gap-3">
              {columns.map((col) => (
                <div
                  key={col}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300 w-32 truncate">
                    {col}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <select
                    value={mapping[col] || ''}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [col]: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="">Eşleştirme yok</option>
                    <option value="sku">SKU / Ürün Kodu</option>
                    <option value="name">Ürün Adı</option>
                    <option value="description">Açıklama</option>
                    <option value="price">Fiyat</option>
                    <option value="stock">Stok</option>
                    <option value="barcode">Barkod</option>
                    <option value="category">Kategori</option>
                    <option value="brand">Marka</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {errors.length === 0
                  ? `✅ ${data.length} satır doğrulandı`
                  : `⚠️ ${errors.length} hata bulundu`}
              </p>
              <button
                onClick={() => validateData()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Tekrar doğrula
              </button>
            </div>

            {errors.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">
                      Satır {error.row}: {error.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {errors.length === 0 && data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {Object.values(mapping)
                        .filter(Boolean)
                        .map((target) => (
                          <th key={target} className="text-left py-2 px-3 font-medium">
                            {target}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.slice(0, 5) as Record<string, unknown>[]).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        {Object.entries(mapping)
                          .filter(([_, target]) => target)
                          .map(([source, _]) => (
                            <td key={source} className="py-2 px-3">
                              {String(row[source] || '-')}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 5 && (
                  <p className="text-center text-sm text-slate-500 mt-4">
                    ...ve {data.length - 5} satır daha
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {isProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-slate-600 dark:text-slate-400">
                  {data.length} ürün içe aktarılıyor...
                </p>
              </div>
            ) : result ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  İçe aktarma tamamlandı!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {result.success} ürün başarıyla eklendi
                  {result.failed > 0 && `, ${result.failed} ürün başarısız`}
                </p>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Table className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {data.length} ürün içe aktarılacak
                </p>
                <p className="text-sm text-slate-500">
                  İşlem başladıktan sonra geri alınamaz
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Excel'den Ürün Aktar
          </h2>
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  idx <= currentStep ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx < currentStep
                      ? 'bg-blue-600 text-white'
                      : idx === currentStep
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-sm hidden sm:inline">{step}</span>
                {idx < steps.length - 1 && (
                  <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderStep()}</div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => {
              if (currentStep === 2 && !validateData()) return;
              setCurrentStep((s) => s + 1);
            }}
            disabled={currentStep === 0 && !file}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İleri
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={processImport}
            disabled={isProcessing || result !== null}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : result ? (
              <>
                <Check className="w-4 h-4" />
                Tamamlandı
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                İçe Aktar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default ExcelImportWizard;

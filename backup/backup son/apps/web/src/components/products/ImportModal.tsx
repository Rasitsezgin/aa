'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, FileSpreadsheet, Download, AlertCircle,
    CheckCircle2, XCircle, Loader2, Info, ArrowRight
} from 'lucide-react';

interface ImportResult {
    total: number;
    created: number;
    updated: number;
    failed: number;
    results: { row: number; sku: string; status: string; error?: string }[];
}

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: (result: ImportResult) => void;
}

function parseCSV(text: string): Record<string, string>[] {
    const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.replace(/^"|"$/g, '').trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.replace(/^"|"$/g, '').trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
    const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>('upsert');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('upload');
        setFile(null);
        setParsedData([]);
        setImportResult(null);
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFile = useCallback(async (f: File) => {
        setError('');
        const ext = f.name.split('.').pop()?.toLowerCase();

        if (!['csv', 'txt'].includes(ext || '')) {
            setError('Sadece CSV formatı desteklenmektedir. Lütfen .csv uzantılı dosya yükleyin.');
            return;
        }

        if (f.size > 10 * 1024 * 1024) {
            setError('Dosya boyutu 10MB\'ı aşamaz.');
            return;
        }

        setFile(f);
        const text = await f.text();
        const data = parseCSV(text);

        if (data.length === 0) {
            setError('Dosyada veri bulunamadı. Lütfen şablona uygun formatta yükleyin.');
            return;
        }

        setParsedData(data);
        setStep('preview');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleImport = async () => {
        setStep('importing');
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
            const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') || 'default' : 'default';

            const response = await fetch(`${apiBase}/products/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId,
                },
                body: JSON.stringify({ products: parsedData, mode: importMode }),
            });

            if (!response.ok) throw new Error('İçe aktarım başarısız');

            const result: ImportResult = await response.json();
            setImportResult(result);
            setStep('result');
            onImportComplete?.(result);
        } catch (err) {
            console.error('İçe aktarım hatası:', err);
            setError('İçe aktarım tamamlanamadı. Lütfen bağlantı ve API durumunu kontrol edip tekrar deneyin.');
            setStep('preview');
        }
    };

    const downloadTemplate = () => {
        const headers = ['SKU', 'Barkod', 'Ürün Adı', 'Açıklama', 'Fiyat', 'Maliyet', 'Stok', 'Kategori', 'Marka', 'Durum', 'Etiketler', 'Ağırlık (kg)'];
        const example = ['ORNEK-SKU-001', '8680001234567', 'Örnek Ürün Adı', 'Ürün açıklaması', '199.99', '120.00', '100', 'Elektronik', 'Marka', 'active', 'etiket1|etiket2', '0.5'];
        const csv = '\uFEFF' + headers.join(';') + '\n' + example.join(';');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'urun-sablonu.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-border shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <Upload className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Excel / CSV İçe Aktar</h2>
                            <p className="text-sm text-slate-500">Ürünlerinizi toplu olarak yükleyin</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-background rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                    {/* Step: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-6">
                            {/* Import Mode */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-3 block">İçe Aktarma Modu</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'upsert' as const, label: 'Akıllı (Önerilen)', desc: 'Mevcut ürünleri güncelle, yenileri oluştur' },
                                        { value: 'create' as const, label: 'Sadece Yeni', desc: 'Sadece yeni ürünler oluştur' },
                                        { value: 'update' as const, label: 'Sadece Güncelle', desc: 'Sadece mevcut ürünleri güncelle' },
                                    ].map(mode => (
                                        <button
                                            key={mode.value}
                                            onClick={() => setImportMode(mode.value)}
                                            className={`p-3 rounded-xl border text-left transition-all ${importMode === mode.value
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-border bg-background hover:border-slate-400'
                                                }`}
                                        >
                                            <div className="text-sm font-medium text-foreground">{mode.label}</div>
                                            <div className="text-xs text-slate-500 mt-1">{mode.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragActive
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-border hover:border-indigo-400 hover:bg-indigo-500/5'
                                    }`}
                            >
                                <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                <p className="text-foreground font-medium mb-1">
                                    Dosyanızı sürükleyip bırakın veya tıklayın
                                </p>
                                <p className="text-sm text-slate-500">
                                    CSV formatı desteklenmektedir (max 10MB)
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Template Download */}
                            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <Info className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Şablon dosyası indirin</p>
                                        <p className="text-xs text-slate-500">Doğru format için örnek şablonu kullanın</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Şablon İndir
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-foreground font-semibold">Önizleme</h3>
                                    <p className="text-sm text-slate-500">
                                        {file?.name} • {parsedData.length} ürün bulundu
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    Farklı dosya seç
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-border rounded-xl">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="p-3 text-left text-slate-500 font-semibold">#</th>
                                            {Object.keys(parsedData[0] || {}).slice(0, 6).map(key => (
                                                <th key={key} className="p-3 text-left text-slate-500 font-semibold whitespace-nowrap">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {parsedData.slice(0, 10).map((row, i) => (
                                            <tr key={i} className="hover:bg-background/50">
                                                <td className="p-3 text-slate-400">{i + 1}</td>
                                                {Object.values(row).slice(0, 6).map((val, j) => (
                                                    <td key={j} className="p-3 text-foreground truncate max-w-[200px]">
                                                        {val || <span className="text-slate-400">-</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {parsedData.length > 10 && (
                                <p className="text-xs text-slate-500 text-center">
                                    ... ve {parsedData.length - 10} ürün daha
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={reset}
                                    className="flex-1 py-3 bg-background rounded-xl text-slate-500 hover:text-foreground transition-colors border border-border"
                                >
                                    Geri
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {parsedData.length} Ürünü İçe Aktar
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Importing */}
                    {step === 'importing' && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">İçe aktarılıyor...</h3>
                            <p className="text-sm text-slate-500">{parsedData.length} ürün işleniyor, lütfen bekleyin</p>
                        </div>
                    )}

                    {/* Step: Result */}
                    {step === 'result' && importResult && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">İçe Aktarım Tamamlandı</h3>
                                <p className="text-sm text-slate-500">
                                    {importResult.total} üründen {importResult.created + importResult.updated} tanesi başarıyla işlendi
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-green-500">{importResult.created}</div>
                                    <div className="text-xs text-green-400 mt-1">Oluşturulan</div>
                                </div>
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-blue-500">{importResult.updated}</div>
                                    <div className="text-xs text-blue-400 mt-1">Güncellenen</div>
                                </div>
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-500">{importResult.failed}</div>
                                    <div className="text-xs text-red-400 mt-1">Başarısız</div>
                                </div>
                            </div>

                            {importResult.failed > 0 && (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-red-400 mb-3">Hatalar</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {importResult.results
                                            .filter(r => r.status === 'failed')
                                            .map((r, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                    <span className="text-slate-400">Satır {r.row}</span>
                                                    <span className="text-slate-500 font-mono">{r.sku}</span>
                                                    <span className="text-red-400">{r.error}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Tamam
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

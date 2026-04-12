"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Layers, Brain, Sparkles, RefreshCw, CheckCircle2, AlertCircle,
    Play, Clock, ArrowUpRight, TrendingUp, Target, Zap,
    ChevronDown, Eye, Send, Pause, BarChart3, ListChecks
} from 'lucide-react';
import { useBatchOptimization, useContentHealth, BatchJobStatus } from '@/lib/hooks';
import apiClient from '@/lib/api-client';

const PLATFORMS = ['TRENDYOL', 'HEPSIBURADA', 'AMAZON', 'N11', 'CICEKSEPETI'];
const TONES = [
    { id: 'professional', label: 'Profesyonel', emoji: '💼' },
    { id: 'friendly', label: 'Samimi', emoji: '😊' },
    { id: 'luxury', label: 'Lüks', emoji: '✨' },
    { id: 'fun', label: 'Eğlenceli', emoji: '🎉' },
    { id: 'technical', label: 'Teknik', emoji: '🔧' },
];

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; label: string }> = {
        pending: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Bekliyor' },
        processing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'İşleniyor' },
        completed: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Tamamlandı' },
        failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Başarısız' },
    };
    const c = config[status] || config.pending;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.color}`}>
            {c.label}
        </span>
    );
}

export default function BatchOptimizationPage() {
    const { createBatch, fetchJobs, getJobStatus, jobs, loading } = useBatchOptimization();
    const { data: healthData } = useContentHealth();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [platform, setPlatform] = useState('TRENDYOL');
    const [tone, setTone] = useState('professional');
    const [jobName, setJobName] = useState('');
    const [autoApply, setAutoApply] = useState(false);
    const [autoSync, setAutoSync] = useState(false);
    const [skipHighScore, setSkipHighScore] = useState(true);
    const [minScoreThreshold, setMinScoreThreshold] = useState(80);
    const [activeView, setActiveView] = useState<'create' | 'history'>('create');
    const [selectedJob, setSelectedJob] = useState<BatchJobStatus | null>(null);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        loadProducts();
        fetchJobs();
    }, []);

    const loadProducts = async () => {
        setProductsLoading(true);
        try {
            const result = await apiClient.request('/products?limit=100') as any[];
            setProducts(Array.isArray(result) ? result : []);
        } catch {
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p: any) => p.id));
        }
        setSelectAll(!selectAll);
    };

    const toggleProduct = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleCreateBatch = async () => {
        if (!jobName || selectedProducts.length === 0) return;
        await createBatch({
            name: jobName,
            productIds: selectedProducts,
            platform,
            tone,
            config: {
                autoApply,
                autoSync,
                skipHighScore,
                minScoreThreshold: skipHighScore ? minScoreThreshold : undefined,
            },
        });
        setJobName('');
        setSelectedProducts([]);
        setSelectAll(false);
        setActiveView('history');
        fetchJobs();
    };

    const handleViewJob = async (jobId: string) => {
        const job = await getJobStatus(jobId);
        setSelectedJob(job);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Layers className="w-7 h-7 text-white" />
                        </div>
                        Toplu İçerik Optimizasyonu
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Birden fazla ürünü aynı anda AI ile optimize edin ve pazaryerine gönderin
                    </p>
                </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border w-fit">
                <button
                    onClick={() => setActiveView('create')}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeView === 'create' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-foreground'}`}
                >
                    <Zap size={14} /> Yeni Toplu İşlem
                </button>
                <button
                    onClick={() => { setActiveView('history'); fetchJobs(); }}
                    className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeView === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-foreground'}`}
                >
                    <Clock size={14} /> İşlem Geçmişi {jobs.length > 0 && `(${jobs.length})`}
                </button>
            </div>

            {activeView === 'create' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Selection */}
                    <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-blue-500" /> Ürün Seçimi
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">{selectedProducts.length} / {products.length} seçili</span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    {selectAll ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                                </button>
                            </div>
                        </div>

                        {productsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Henüz ürün bulunamadı</p>
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto space-y-1.5">
                                {products.map((product) => {
                                    const isSelected = selectedProducts.includes(product.id);
                                    const aiMeta = product.aiMetadata as any;
                                    const seoScore = aiMeta?.seoScore;
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${isSelected
                                                ? 'bg-blue-500/10 border-blue-500/40'
                                                : 'bg-background border-border hover:border-blue-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                                                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                                                    <p className="text-[10px] text-slate-500">
                                                        SKU: {product.sku}
                                                        {!product.description && <span className="text-red-400 ml-2">Açıklama eksik</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            {seoScore !== undefined && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${seoScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : seoScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {seoScore}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Configuration */}
                    <div className="space-y-4">
                        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-500" /> Ayarlar
                            </h3>

                            <div>
                                <label className="text-xs font-medium text-slate-400 block mb-1.5">İşlem Adı *</label>
                                <input
                                    type="text"
                                    value={jobName}
                                    onChange={(e) => setJobName(e.target.value)}
                                    placeholder="örn: Trendyol Q1 Optimizasyonu"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 block mb-2">Platform</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {PLATFORMS.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatform(p)}
                                            className={`py-2 px-2 text-[10px] font-bold rounded-lg transition-all ${platform === p
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-background border border-border text-slate-500 hover:text-foreground'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tone */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 block mb-2">Ton</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {TONES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTone(t.id)}
                                            className={`py-2 px-2 rounded-lg border text-center transition-all ${tone === t.id
                                                ? 'bg-blue-500/20 border-blue-500'
                                                : 'border-border hover:border-blue-500/50'
                                                }`}
                                        >
                                            <div className="text-sm">{t.emoji}</div>
                                            <div className="text-[10px] text-foreground">{t.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Config Options */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-slate-400 block">Gelişmiş Seçenekler</label>

                                <label className="flex items-center justify-between cursor-pointer p-2.5 bg-background rounded-lg border border-border">
                                    <span className="text-xs text-foreground">Otomatik Uygula</span>
                                    <input
                                        type="checkbox"
                                        checked={autoApply}
                                        onChange={(e) => setAutoApply(e.target.checked)}
                                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer p-2.5 bg-background rounded-lg border border-border">
                                    <span className="text-xs text-foreground">Pazaryerine Gönder</span>
                                    <input
                                        type="checkbox"
                                        checked={autoSync}
                                        onChange={(e) => setAutoSync(e.target.checked)}
                                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer p-2.5 bg-background rounded-lg border border-border">
                                    <span className="text-xs text-foreground">Yüksek Skorluları Atla</span>
                                    <input
                                        type="checkbox"
                                        checked={skipHighScore}
                                        onChange={(e) => setSkipHighScore(e.target.checked)}
                                        className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                    />
                                </label>

                                {skipHighScore && (
                                    <div className="pl-3">
                                        <label className="text-[10px] text-slate-500 block mb-1">Min. Skor Eşiği: {minScoreThreshold}</label>
                                        <input
                                            type="range"
                                            min={50}
                                            max={95}
                                            value={minScoreThreshold}
                                            onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCreateBatch}
                                disabled={loading || !jobName || selectedProducts.length === 0}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        {selectedProducts.length} Ürünü Optimize Et
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Quick Stats */}
                        {healthData && (
                            <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase">İçerik Durumu</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Ortalama SEO</span>
                                        <span className="font-bold text-foreground">{healthData.averageScores.seo}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Düşük Skorlu</span>
                                        <span className="font-bold text-amber-400">{healthData.lowScoreCount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Açıklama Eksik</span>
                                        <span className="font-bold text-red-400">{healthData.missingDescriptionCount}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* History View */
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Henüz toplu işlem yok</p>
                            <p className="text-sm mt-1">İlk toplu optimizasyonunuzu başlatın</p>
                            <button
                                onClick={() => setActiveView('create')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                            >
                                Yeni İşlem Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Job List */}
                            <div className="lg:col-span-2 space-y-3">
                                {jobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`bg-surface rounded-2xl border transition-all cursor-pointer ${selectedJob?.id === job.id ? 'border-blue-500' : 'border-border hover:border-blue-500/30'}`}
                                        onClick={() => handleViewJob(job.id)}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-bold text-foreground">{job.name}</h4>
                                                    <StatusBadge status={job.status} />
                                                </div>
                                                <span className="text-[10px] text-slate-500">{job.platform}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            {job.status === 'processing' && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                        <span>{job.processedProducts} / {job.totalProducts}</span>
                                                        <span>{Math.round((job.processedProducts / job.totalProducts) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full transition-all"
                                                            style={{ width: `${(job.processedProducts / job.totalProducts) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-foreground">{job.totalProducts}</div>
                                                    <div className="text-[10px] text-slate-500">Toplam</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-emerald-400">{job.successCount}</div>
                                                    <div className="text-[10px] text-slate-500">Başarılı</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-red-400">{job.failCount}</div>
                                                    <div className="text-[10px] text-slate-500">Başarısız</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-sm text-red-400">{job.avgScoreBefore}</span>
                                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-sm font-bold text-emerald-400">{job.avgScoreAfter}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">Skor</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Job Detail */}
                            <div>
                                {selectedJob ? (
                                    <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 sticky top-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-foreground">{selectedJob.name}</h4>
                                            <StatusBadge status={selectedJob.status} />
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Platform</span>
                                                <span className="text-foreground">{selectedJob.platform}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Ton</span>
                                                <span className="text-foreground">{selectedJob.tone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Oluşturulma</span>
                                                <span className="text-foreground">{new Date(selectedJob.createdAt).toLocaleString('tr-TR')}</span>
                                            </div>
                                            {selectedJob.completedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Tamamlanma</span>
                                                    <span className="text-foreground">{new Date(selectedJob.completedAt).toLocaleString('tr-TR')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Item List */}
                                        {selectedJob.items && selectedJob.items.length > 0 && (
                                            <div>
                                                <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Ürünler</h5>
                                                <div className="max-h-[300px] overflow-y-auto space-y-1">
                                                    {selectedJob.items.map((item: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background text-xs">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.status === 'completed' ? 'bg-emerald-500' : item.status === 'failed' ? 'bg-red-500' : item.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`} />
                                                                <span className="truncate text-foreground">{item.product?.title || item.productId}</span>
                                                            </div>
                                                            {item.optimization && (
                                                                <span className="text-emerald-400 font-bold ml-2">
                                                                    +{item.optimization.seoScoreAfter - item.optimization.seoScoreBefore}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bulk Apply Button */}
                                        {selectedJob.status === 'completed' && selectedJob.successCount > 0 && (
                                            <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                                <Send size={12} />
                                                Tümünü Pazaryerine Gönder
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center opacity-40">
                                        <Eye size={32} className="mb-3" />
                                        <p className="text-sm font-medium">İş detayları</p>
                                        <p className="text-xs mt-1">Detayları görmek için bir iş seçin</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

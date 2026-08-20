"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Tag,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Download,
    Search,
    Filter,
    Edit3,
    Eye,
    Clock,
    Zap,
    Target,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    Globe,
    Settings,
    Sparkles
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { usePricingAnalysis, PricingItem } from '@/lib/hooks';
import { getPricingRules, togglePricingRule } from '@/app/actions/pricing-rules';

interface PricingRule {
    id: string;
    name: string;
    description: string;
    active: boolean;
    products: number;
}

interface PricingPlatformData {
    price: number;
    buyBox: boolean;
    competitors: number[];
}

interface PricingProduct extends Omit<Partial<PricingItem>, 'id'> {
    id: string | number;
    name: string;
    sku: string;
    cost: number;
    myPrice: number;
    margin: number;
    status: string;
    image: string;
    platforms: Record<string, PricingPlatformData>;
    lastUpdate: string;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || "";
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [editingProduct, setEditingProduct] = useState<number | null>(null);
    const [showRules, setShowRules] = useState(false);
    const [activePricingRules, setActivePricingRules] = useState<PricingRule[]>([]);
    const { analysis: apiPricing, loading } = usePricingAnalysis();

    const activeProducts = (Array.isArray(apiPricing) && apiPricing.length > 0) ? apiPricing : [];

    React.useEffect(() => {
        if (tenantId) {
            getPricingRules(tenantId).then(data => {
                setActivePricingRules(data);
            });
        }
    }, [tenantId]);

    const handleRuleToggle = async (ruleId: string, currentState: boolean) => {
        const newState = !currentState;
        // Optimistic UI update
        setActivePricingRules(prev => prev.map(r => r.id === ruleId ? { ...r, active: newState } : r));
        
        if (tenantId) {
            const result = await togglePricingRule(tenantId, ruleId, newState);
            if (!result.success) {
                // Revert if failed
                setActivePricingRules(prev => prev.map(r => r.id === ruleId ? { ...r, active: currentState } : r));
            }
        }
    };

    const filteredProducts = (activeProducts as PricingProduct[]).filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'competitive': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'high': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'undercut': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'optimal': return 'Optimal';
            case 'competitive': return 'Rekabetçi';
            case 'high': return 'Yüksek';
            case 'undercut': return 'Alt Fiyatlı Rakip';
            default: return 'Bilinmiyor';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-slate-500">Fiyat verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Tag className="w-8 h-8 text-emerald-500" />
                            Fiyat Yönetimi
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Akıllı fiyatlama ve rekabet analizi
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowRules(!showRules)}
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Fiyat Kuralları
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Fiyat Önerisi
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-2xl p-4 border border-emerald-500/20"
                >
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Optimal Fiyat
                    </div>
                    <div className="text-2xl font-black text-foreground">42</div>
                    <div className="text-xs text-slate-500 mt-1">ürün</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-500/20"
                >
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-2">
                        <Target className="w-4 h-4" />
                        Buy Box
                    </div>
                    <div className="text-2xl font-black text-foreground">78%</div>
                    <div className="text-xs text-slate-500 mt-1">kazanım oranı</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-2xl p-4 border border-yellow-500/20"
                >
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Yüksek Fiyat
                    </div>
                    <div className="text-2xl font-black text-foreground">15</div>
                    <div className="text-xs text-slate-500 mt-1">ürün</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-red-500/10 to-red-600/5 dark:from-red-900/40 dark:to-red-800/20 rounded-2xl p-4 border border-red-500/20"
                >
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-2">
                        <TrendingDown className="w-4 h-4" />
                        Alt Fiyatlı
                    </div>
                    <div className="text-2xl font-black text-foreground">8</div>
                    <div className="text-xs text-slate-500 mt-1">rakip var</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl p-4 border border-purple-500/20"
                >
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-2">
                        <BarChart3 className="w-4 h-4" />
                        Ort. Kar Marjı
                    </div>
                    <div className="text-2xl font-black text-foreground">67.4%</div>
                    <div className="text-xs text-slate-500 mt-1">ortalama</div>
                </motion.div>
            </div>

            {/* Pricing Rules Panel */}
            {showRules && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 bg-surface rounded-2xl border border-border p-6"
                >
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Aktif Fiyatlama Kuralları
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activePricingRules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                    <div>
                                        <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                                        <p className="text-xs text-slate-500">{rule.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">{rule.products} ürün</span>
                                                <div 
                                                    className={`w-10 h-6 rounded-full transition-colors p-1 cursor-pointer ${rule.active ? 'bg-primary' : 'bg-muted'}`}
                                                    onClick={() => handleRuleToggle(rule.id, rule.active)}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${rule.active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Ürün veya SKU ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background rounded-xl text-foreground placeholder-slate-500 border border-border focus:border-emerald-500 focus:outline-none"
                    />
                </div>
                <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="px-4 py-2 bg-background rounded-xl text-foreground border border-border focus:border-emerald-500 focus:outline-none"
                >
                    <option value="all">Tüm Platformlar</option>
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="amazon">Amazon</option>
                    <option value="n11">N11</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Fiyat Tara
                </button>
            </div>

            {/* Products Grid */}
            <div className="space-y-4">
                {filteredProducts.map((product, index: number) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-surface rounded-2xl border border-border overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{product.image}</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                                        <p className="text-sm text-slate-500 font-mono">{product.sku}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="text-sm">
                                                <span className="text-slate-500">Maliyet:</span>
                                                <span className="text-slate-600 dark:text-slate-300 ml-1">₺{product.cost}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-500">Benim Fiyatım:</span>
                                                <span className="text-emerald-400 font-bold ml-1">₺{product.myPrice}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-slate-500">Marj:</span>
                                                <span className="text-purple-400 ml-1">%{product.margin}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                                        {getStatusText(product.status)}
                                    </span>
                                    <button className="p-2 text-slate-500 hover:text-foreground hover:bg-background rounded-lg transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Platform Prices */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(product.platforms).map(([platform, data]) => (
                                    <div
                                        key={platform}
                                        className={`p-3 rounded-lg ${data.buyBox ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-background rounded-xl border border-border'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground capitalize">{platform}</span>
                                            {data.buyBox && (
                                                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-400 text-xs rounded-full">
                                                    Buy Box ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-lg font-bold text-foreground">₺{data.price}</div>
                                        <div className="mt-2">
                                            <span className="text-xs text-slate-500">Rakip fiyatları:</span>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {data.competitors.map((price: number, i: number) => (
                                                    <span
                                                        key={i}
                                                        className={`text-xs px-2 py-0.5 rounded ${price < data.price
                                                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        ₺{price}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Son güncelleme: {product.lastUpdate}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        Otomatik Fiyatla
                                    </button>
                                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Detay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

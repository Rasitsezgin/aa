"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Package, Warehouse, TrendingUp, TrendingDown,
    AlertTriangle, Eye, Filter, BarChart3, Clock, ArrowRight
} from 'lucide-react';

import { useSession } from "next-auth/react";
import { getWarehouses, getInventoryDetails } from '@/app/actions/inventory-map';

export interface Warehouse {
    id: string;
    name: string;
    city: string;
    products: number;
    capacity: number;
    value: number;
    status: string;
    lat: number;
    lng: number;
}

export default function InventoryMapPage() {
    const { data: session } = useSession();
    const tenantId = (session?.user as any)?.tenantId || "";

    const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
    const [view, setView] = useState<'map' | 'list'>('map');
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [stockMovements, setStockMovements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        if (tenantId) {
            Promise.all([
                getWarehouses(tenantId),
                getInventoryDetails(tenantId)
            ]).then(([wData, dData]) => {
                setWarehouses(wData);
                setLowStockItems(dData.lowStockItems);
                setStockMovements(dData.stockMovements);
                setIsLoading(false);
            });
        }
    }, [tenantId]);

    const totalProducts = warehouses.reduce((a, w) => a + w.products, 0);
    const totalCapacity = warehouses.reduce((a, w) => a + w.capacity, 0);
    const totalValue = warehouses.reduce((a, w) => a + w.value, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-indigo-400" /> Envanter Haritası
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Depo ve stok konumlarını görselleştirin</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Harita</button>
                    <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Liste</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Ürün', value: totalProducts.toLocaleString(), icon: Package, color: 'text-blue-400' },
                    { label: 'Depo Sayısı', value: warehouses.length.toString(), icon: Warehouse, color: 'text-indigo-400' },
                    { label: 'Kapasite', value: totalCapacity > 0 ? `${Math.round((totalProducts / totalCapacity) * 100)}%` : '0%', icon: BarChart3, color: 'text-emerald-400' },
                    { label: 'Toplam Değer', value: `₺${(totalValue / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{isLoading ? '...' : stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Map / List View */}
                <div className="col-span-2 bg-surface rounded-xl border border-border p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Depo Konumları</h3>
                    {view === 'map' ? (
                        <div className="relative bg-background rounded-xl h-80 overflow-hidden">
                            {/* Simplified Turkey map representation */}
                            <svg viewBox="0 0 400 200" className="w-full h-full opacity-20">
                                <path d="M50,100 Q100,50 200,60 Q300,50 380,80 Q370,120 350,140 Q300,160 250,150 Q200,160 150,150 Q100,160 60,140 Q40,120 50,100Z"
                                    fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-500" />
                            </svg>
                            {warehouses.map(w => {
                                const x = ((w.lng - 26) / (33 - 26)) * 80 + 10;
                                const y = ((42 - w.lat) / (42 - 36)) * 70 + 10;
                                const pct = Math.round((w.products / w.capacity) * 100);
                                return (
                                    <motion.button key={w.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: w.id * 0.1 }}
                                        onClick={() => setSelectedWarehouse(selectedWarehouse === w.id ? null : w.id)}
                                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 group`}
                                        style={{ left: `${x}%`, top: `${y}%` }}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${selectedWarehouse === w.id ? 'scale-125 border-indigo-400 bg-indigo-500/30' : pct > 80 ? 'border-amber-500 bg-amber-500/20' : 'border-emerald-500 bg-emerald-500/20'}`}>
                                            <Warehouse className={`w-4 h-4 ${selectedWarehouse === w.id ? 'text-indigo-400' : pct > 80 ? 'text-amber-400' : 'text-emerald-400'}`} />
                                        </div>
                                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface px-2 py-1 rounded text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-lg">
                                            {w.city} ({w.products})
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="text-sm text-slate-500 text-center py-4">Yükleniyor...</div>
                            ) : warehouses.length > 0 ? warehouses.map(w => {
                                const pct = Math.round((w.products / w.capacity) * 100);
                                return (
                                    <div key={w.id} onClick={() => setSelectedWarehouse(w.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedWarehouse === w.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-border hover:border-indigo-500/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <Warehouse className="w-5 h-5 text-indigo-400" />
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{w.name}</div>
                                                <div className="text-xs text-slate-500">{w.city}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs">
                                            <div><span className="text-foreground font-medium">{w.products}</span> <span className="text-slate-500">/ {w.capacity}</span></div>
                                            <div className="w-20 h-1.5 bg-background rounded-full">
                                                <div className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-slate-400">{pct}%</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-sm text-slate-500 text-center py-4">Depo bulunamadı.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Warehouse Detail */}
                <div className="space-y-4">
                    {selectedWarehouse ? (() => {
                        const w = warehouses.find(wh => wh.id === selectedWarehouse)!;
                        const pct = Math.round((w.products / w.capacity) * 100);
                        return (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-xl border border-border p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-foreground">{w.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {w.status === 'active' ? 'Aktif' : 'Uyarı'}
                                    </span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Ürün</span><span className="text-foreground">{w.products}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Kapasite</span><span className="text-foreground">{w.capacity}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Doluluk</span><span className={pct > 80 ? 'text-amber-400' : 'text-emerald-400'}>{pct}%</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Değer</span><span className="text-foreground">₺{w.value.toLocaleString()}</span></div>
                                </div>
                            </motion.div>
                        );
                    })() : (
                        <div className="bg-surface rounded-xl border border-border p-5 text-center">
                            <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Detay görmek için bir depo seçin</p>
                        </div>
                    )}

                    {/* Low Stock Alerts */}
                    <div className="bg-surface rounded-xl border border-border p-5">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400" /> Düşük Stok
                        </h3>
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="text-xs text-slate-500">Yükleniyor...</div>
                            ) : lowStockItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5">
                                    <div>
                                        <div className="text-xs text-foreground">{item.name}</div>
                                        <div className="text-[10px] text-slate-500">{item.warehouse}</div>
                                    </div>
                                    <div className="text-xs text-red-400 font-medium">{item.current}/{item.min}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Movements */}
            <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Son Stok Hareketleri</h3>
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="text-sm text-slate-500 text-center py-4">Yükleniyor...</div>
                    ) : stockMovements.length > 0 ? stockMovements.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-background">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.type === 'incoming' ? 'bg-emerald-500/10' : m.type === 'outgoing' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                    {m.type === 'incoming' ? <TrendingDown className="w-4 h-4 text-emerald-400" /> : m.type === 'outgoing' ? <TrendingUp className="w-4 h-4 text-red-400" /> : <Filter className="w-4 h-4 text-blue-400" />}
                                </div>
                                <div>
                                    <div className="text-xs text-foreground">{m.product}</div>
                                    <div className="text-[10px] text-slate-500">{m.from} → {m.to}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-medium ${m.type === 'incoming' ? 'text-emerald-400' : m.type === 'outgoing' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {m.type === 'incoming' ? '+' : m.type === 'outgoing' ? '-' : '↔'}{m.qty} adet
                                </div>
                                <div className="text-[10px] text-slate-500">{m.date}</div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-sm text-slate-500 text-center py-4">Son hareket bulunamadı.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

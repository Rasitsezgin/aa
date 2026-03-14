"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Truck, Plus, Search, Star, Phone, Mail, Globe, MapPin,
    Edit, Trash2, Eye, Package, TrendingUp, Clock, AlertTriangle,
    CheckCircle, XCircle, MoreVertical, Filter, Download
} from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    city: string;
    rating: number;
    totalProducts: number;
    avgDeliveryDays: number;
    status: 'active' | 'inactive' | 'pending';
    totalOrders: number;
    lastOrderDate: string;
    paymentTerms: string;
}

const mockSuppliers: Supplier[] = [
    { id: '1', name: 'TechParts A.Ş.', contactPerson: 'Ali Yılmaz', email: 'ali@techparts.com', phone: '+90 532 111 2233', city: 'İstanbul', rating: 4.8, totalProducts: 156, avgDeliveryDays: 2, status: 'active', totalOrders: 342, lastOrderDate: '2025-01-25', paymentTerms: '30 gün vadeli' },
    { id: '2', name: 'Global Aksesuar Ltd.', contactPerson: 'Fatma Demir', email: 'fatma@globalaksesuar.com', phone: '+90 541 222 3344', city: 'Ankara', rating: 4.5, totalProducts: 89, avgDeliveryDays: 3, status: 'active', totalOrders: 187, lastOrderDate: '2025-01-22', paymentTerms: '15 gün vadeli' },
    { id: '3', name: 'Mega Elektronik', contactPerson: 'Mehmet Kaya', email: 'mehmet@megaelektronik.com', phone: '+90 555 333 4455', city: 'İzmir', rating: 4.2, totalProducts: 234, avgDeliveryDays: 4, status: 'active', totalOrders: 456, lastOrderDate: '2025-01-20', paymentTerms: 'Peşin' },
    { id: '4', name: 'Prime Supply Co.', contactPerson: 'Ayşe Çelik', email: 'ayse@primesupply.com', phone: '+90 544 444 5566', city: 'Bursa', rating: 3.9, totalProducts: 67, avgDeliveryDays: 5, status: 'inactive', totalOrders: 89, lastOrderDate: '2024-12-15', paymentTerms: '45 gün vadeli' },
    { id: '5', name: 'Quick Import', contactPerson: 'Can Öztürk', email: 'can@quickimport.com', phone: '+90 533 555 6677', city: 'İstanbul', rating: 4.6, totalProducts: 312, avgDeliveryDays: 7, status: 'active', totalOrders: 678, lastOrderDate: '2025-01-27', paymentTerms: '30 gün vadeli' },
];

import { useSuppliers, SupplierData } from '@/lib/hooks';

export default function SuppliersPage() {
    const { data: suppliersData, loading: isLoading } = useSuppliers();
    const suppliers = (suppliersData || []) as SupplierData[];
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);

    const filtered = suppliers.filter((s) => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.contact.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        return true;
    });

    const stats = {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === 'active').length,
        avgRating: suppliers.length > 0
            ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1)
            : '0.0',
        totalProducts: suppliers.reduce((s, sup) => s + sup.activeProducts, 0),
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Truck className="w-8 h-8 text-orange-500" /> Tedarikçi Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1">Tedarikçilerinizi yönetin ve performanslarını takip edin</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Tedarikçi Ekle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Tedarikçi', value: stats.total, icon: Truck, color: 'orange' },
                    { label: 'Aktif', value: stats.active, icon: CheckCircle, color: 'emerald' },
                    { label: 'Ort. Puan', value: stats.avgRating, icon: Star, color: 'yellow' },
                    { label: 'Toplam Ürün', value: stats.totalProducts, icon: Package, color: 'blue' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-surface rounded-2xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 text-${stat.color}-500 mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Tedarikçi ara..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-orange-500 focus:outline-none" />
                </div>
                <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                    {['all', 'active', 'inactive'].map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${statusFilter === f ? 'bg-orange-500/20 text-orange-400' : 'text-slate-500 hover:text-foreground'}`}>
                            {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Pasif'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-xs font-medium text-slate-500">Tedarikçi</th>
                                <th className="text-left p-4 text-xs font-medium text-slate-500">İletişim</th>
                                <th className="text-center p-4 text-xs font-medium text-slate-500">Puan</th>
                                <th className="text-center p-4 text-xs font-medium text-slate-500">Ürün</th>
                                <th className="text-center p-4 text-xs font-medium text-slate-500">Son Sipariş</th>
                                <th className="text-center p-4 text-xs font-medium text-slate-500">Durum</th>
                                <th className="text-right p-4 text-xs font-medium text-slate-500">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{s.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Bilinmiyor</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-foreground text-xs">{s.contact}</div>
                                        <div className="text-slate-500 text-xs">{s.email}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="text-foreground font-medium">{s.rating}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-foreground">{s.activeProducts}</td>
                                    <td className="p-4 text-center text-foreground">{s.lastOrder}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {s.status === 'active' ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setSelectedSupplier(s)} className="p-1.5 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Eye className="w-4 h-4" /></button>
                                            <button className="p-1.5 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Edit className="w-4 h-4" /></button>
                                            <button className="p-1.5 hover:bg-background rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-slate-500">
                                        Tedarikçi bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Supplier Detail Modal */}
            {selectedSupplier && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSupplier(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl w-full max-w-lg border border-border p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-foreground mb-4">{selectedSupplier.name}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">İletişim</div><div className="text-sm text-foreground mt-1">{selectedSupplier.contact}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Telefon</div><div className="text-sm text-foreground mt-1">{selectedSupplier.phone}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">E-posta</div><div className="text-sm text-foreground mt-1">{selectedSupplier.email}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Şehir</div><div className="text-sm text-foreground mt-1 text-slate-500">Bilinmiyor</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Aktif Ürünler</div><div className="text-sm text-foreground mt-1">{selectedSupplier.activeProducts}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Son Sipariş</div><div className="text-sm text-foreground mt-1">{selectedSupplier.lastOrder}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Puan</div><div className="text-sm text-foreground mt-1 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{selectedSupplier.rating}</div></div>
                        </div>
                        <button onClick={() => setSelectedSupplier(null)} className="mt-4 w-full py-2 bg-background text-foreground rounded-xl text-sm font-medium hover:bg-background/80">Kapat</button>
                    </motion.div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl w-full max-w-lg border border-border p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-foreground mb-4">Yeni Tedarikçi Ekle</h3>
                        <div className="space-y-3">
                            {['Firma Adı', 'İletişim Kişisi', 'E-posta', 'Telefon', 'Şehir'].map(field => (
                                <input key={field} placeholder={field}
                                    className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-orange-500 focus:outline-none" />
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-background text-foreground rounded-xl text-sm font-medium">İptal</button>
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium">Kaydet</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

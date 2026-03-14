"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ScrollText, Search, Filter, Download, User, Clock,
    Shield, Eye, Edit, Trash2, Plus, Settings, LogIn, LogOut,
    Package, ShoppingCart, DollarSign, AlertTriangle, ChevronDown
} from 'lucide-react';

interface AuditEntry {
    id: string;
    action: string;
    category: string;
    user: string;
    userRole: string;
    ip: string;
    timestamp: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
    resource: string;
}

const mockAuditLogs: AuditEntry[] = [
    { id: '1', action: 'Ürün Güncellendi', category: 'product', user: 'Ahmet Yıldız', userRole: 'Admin', ip: '192.168.1.100', timestamp: '2025-01-27 14:32:15', details: 'iPhone 15 Kılıf fiyatı ₺89.90 → ₺79.90 olarak güncellendi', severity: 'info', resource: 'product/PRD-001' },
    { id: '2', action: 'Kullanıcı Giriş', category: 'auth', user: 'Fatma Demir', userRole: 'Editor', ip: '192.168.1.105', timestamp: '2025-01-27 14:28:00', details: 'Başarılı giriş - Chrome/Windows', severity: 'info', resource: 'auth/session' },
    { id: '3', action: 'Toplu Fiyat Değişikliği', category: 'product', user: 'Ahmet Yıldız', userRole: 'Admin', ip: '192.168.1.100', timestamp: '2025-01-27 14:15:30', details: '45 ürünün fiyatı toplu güncellendi', severity: 'warning', resource: 'product/bulk' },
    { id: '4', action: 'API Anahtarı Oluşturuldu', category: 'security', user: 'Sistem', userRole: 'System', ip: '127.0.0.1', timestamp: '2025-01-27 13:45:00', details: 'Yeni API anahtarı oluşturuldu: pk_live_***', severity: 'critical', resource: 'api-key/AK-003' },
    { id: '5', action: 'Sipariş İptal', category: 'order', user: 'Mehmet Kaya', userRole: 'Support', ip: '192.168.1.110', timestamp: '2025-01-27 13:30:00', details: 'Sipariş #ORD-2024-00892 iptal edildi. Sebep: Müşteri talebi', severity: 'warning', resource: 'order/ORD-2024-00892' },
    { id: '6', action: 'Rol Değişikliği', category: 'security', user: 'Ahmet Yıldız', userRole: 'Admin', ip: '192.168.1.100', timestamp: '2025-01-27 12:00:00', details: 'Fatma Demir rolü "Viewer" → "Editor" olarak değiştirildi', severity: 'critical', resource: 'user/USR-005' },
    { id: '7', action: 'Stok Uyarısı', category: 'product', user: 'Sistem', userRole: 'System', ip: '127.0.0.1', timestamp: '2025-01-27 11:30:00', details: '5 ürün stok kritik seviyeye düştü', severity: 'warning', resource: 'product/stock-alert' },
    { id: '8', action: 'Başarısız Giriş', category: 'auth', user: 'bilinmeyen@test.com', userRole: '-', ip: '203.0.113.50', timestamp: '2025-01-27 10:15:00', details: '3 başarısız giriş denemesi', severity: 'critical', resource: 'auth/failed' },
    { id: '9', action: 'Dışa Aktarım', category: 'data', user: 'Fatma Demir', userRole: 'Editor', ip: '192.168.1.105', timestamp: '2025-01-27 09:45:00', details: '1.245 ürün CSV olarak dışa aktarıldı', severity: 'info', resource: 'export/EXP-002' },
    { id: '10', action: 'Webhook Hatası', category: 'system', user: 'Sistem', userRole: 'System', ip: '127.0.0.1', timestamp: '2025-01-27 09:00:00', details: 'İade webhook 3 kez başarısız oldu', severity: 'critical', resource: 'webhook/WH-003' },
];

const categoryIcons: Record<string, React.ElementType> = {
    product: Package,
    order: ShoppingCart,
    auth: LogIn,
    security: Shield,
    data: Download,
    system: Settings,
};

const severityConfig = {
    info: { color: 'blue', label: 'Bilgi' },
    warning: { color: 'yellow', label: 'Uyarı' },
    critical: { color: 'red', label: 'Kritik' },
};

export default function AuditLogPage() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = mockAuditLogs.filter(log => {
        if (search && !log.action.toLowerCase().includes(search.toLowerCase()) && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.details.toLowerCase().includes(search.toLowerCase())) return false;
        if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
        if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ScrollText className="w-8 h-8 text-slate-400" /> Audit Log
                    </h1>
                    <p className="text-slate-500 mt-1">Tüm sistem aktivitelerini izleyin ve denetleyin</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground">
                    <Download className="w-4 h-4" /> Logları İndir
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Log', value: mockAuditLogs.length, color: 'slate' },
                    { label: 'Bilgi', value: mockAuditLogs.filter(l => l.severity === 'info').length, color: 'blue' },
                    { label: 'Uyarı', value: mockAuditLogs.filter(l => l.severity === 'warning').length, color: 'yellow' },
                    { label: 'Kritik', value: mockAuditLogs.filter(l => l.severity === 'critical').length, color: 'red' },
                ].map((s, i) => (
                    <div key={i} className="bg-surface rounded-2xl border border-border p-4">
                        <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Aksiyon, kullanıcı veya detay ara..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:outline-none" />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border">
                    <option value="all">Tüm Kategoriler</option>
                    <option value="product">Ürün</option>
                    <option value="order">Sipariş</option>
                    <option value="auth">Kimlik</option>
                    <option value="security">Güvenlik</option>
                    <option value="data">Veri</option>
                    <option value="system">Sistem</option>
                </select>
                <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
                    className="px-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border">
                    <option value="all">Tüm Seviyeler</option>
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="critical">Kritik</option>
                </select>
            </div>

            {/* Log Entries */}
            <div className="space-y-2">
                {filtered.map((log, i) => {
                    const Icon = categoryIcons[log.category] || Settings;
                    const sev = severityConfig[log.severity];
                    const isExpanded = expandedId === log.id;

                    return (
                        <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className={`bg-surface rounded-xl border transition-colors cursor-pointer ${isExpanded ? 'border-slate-600' : 'border-border hover:border-slate-700'}`}
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                            <div className="p-4 flex items-center gap-4">
                                <div className={`w-1.5 h-8 rounded-full bg-${sev.color}-500`} />
                                <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-foreground">{log.action}</span>
                                        <span className={`px-1.5 py-0.5 text-[10px] rounded bg-${sev.color}-500/20 text-${sev.color}-400`}>{sev.label}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 truncate">{log.details}</div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {log.timestamp.split(' ')[1]}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
                                    <div className="grid grid-cols-4 gap-3 mt-3">
                                        <div className="p-2 bg-background rounded-lg"><div className="text-[10px] text-slate-600">Kullanıcı</div><div className="text-xs text-foreground">{log.user} ({log.userRole})</div></div>
                                        <div className="p-2 bg-background rounded-lg"><div className="text-[10px] text-slate-600">IP Adresi</div><div className="text-xs text-foreground font-mono">{log.ip}</div></div>
                                        <div className="p-2 bg-background rounded-lg"><div className="text-[10px] text-slate-600">Kaynak</div><div className="text-xs text-foreground font-mono">{log.resource}</div></div>
                                        <div className="p-2 bg-background rounded-lg"><div className="text-[10px] text-slate-600">Tarih</div><div className="text-xs text-foreground">{log.timestamp}</div></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

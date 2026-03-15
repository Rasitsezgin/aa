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

const auditLogs: AuditEntry[] = [];

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

    const filtered = auditLogs.filter(log => {
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
                    { label: 'Toplam Log', value: auditLogs.length, color: 'slate' },
                    { label: 'Bilgi', value: auditLogs.filter(l => l.severity === 'info').length, color: 'blue' },
                    { label: 'Uyarı', value: auditLogs.filter(l => l.severity === 'warning').length, color: 'yellow' },
                    { label: 'Kritik', value: auditLogs.filter(l => l.severity === 'critical').length, color: 'red' },
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
                {filtered.length === 0 && (
                    <div className="bg-surface rounded-xl border border-border p-6 text-sm text-slate-500">Audit log verisi bulunamadı</div>
                )}
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

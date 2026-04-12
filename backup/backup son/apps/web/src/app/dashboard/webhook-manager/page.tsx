"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Webhook, Plus, Trash2, Edit, Play, Globe, Copy, Clock, Eye
} from 'lucide-react';

import { useWebhooks } from '@/lib/hooks';

const ALL_EVENTS = ['order.created', 'order.updated', 'order.cancelled', 'order.shipped', 'product.created', 'product.updated', 'product.stock_changed', 'return.created', 'return.approved', 'customer.created', 'payment.received'];

export default function WebhookManagerPage() {
    const { webhooks, loading: isLoading } = useWebhooks();
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Webhook className="w-8 h-8 text-violet-500" /> Webhook Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1">Harici sistemlerle webhook entegrasyonları</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium">
                    <Plus className="w-4 h-4" /> Webhook Ekle
                </button>
            </div>

            <div className="space-y-4">
                {webhooks.map((wh, i) => (
                    <motion.div key={wh.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl border border-border p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${wh.status === 'active' ? 'bg-emerald-500' : wh.status === 'error' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                                    <h3 className="text-sm font-bold text-foreground">{wh.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${wh.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : wh.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        {wh.status === 'active' ? 'Aktif' : wh.status === 'error' ? 'Hata' : 'Pasif'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-2"><Globe className="w-3 h-3" /> {wh.url}</div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {wh.events.map(e => (<span key={e} className="px-2 py-0.5 bg-background text-xs text-slate-400 rounded">{e}</span>))}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span><Clock className="w-3 h-3 inline mr-1" />{wh.lastTriggered || 'Hiç tetiklenmedi'}</span>
                                    <span className={wh.successRate >= 95 ? 'text-emerald-400' : 'text-red-400'}>%{wh.successRate} başarı</span>
                                    <span>{wh.totalCalls} çağrı</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400 tooltip" title="Test Et"><Play className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400"><Edit className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {webhooks.length === 0 && !isLoading && (
                    <div className="text-center p-10 bg-surface rounded-2xl border border-dashed border-border">
                        <Webhook className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-medium">Henüz bir webhook oluşturulmamış.</p>
                        <button onClick={() => setShowCreate(true)} className="mt-4 text-violet-500 font-bold hover:underline">İlk Webhook'u Ekle</button>
                    </div>
                )}
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl w-full max-w-lg border border-border p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-foreground mb-4">Yeni Webhook</h3>
                        <div className="space-y-4">
                            <input placeholder="Webhook Adı" className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border" />
                            <input placeholder="https://your-api.com/webhook" className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border font-mono" />
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Olaylar</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {ALL_EVENTS.map(e => (
                                        <label key={e} className="flex items-center gap-2 text-xs text-slate-300 p-2 bg-background rounded-lg cursor-pointer">
                                            <input type="checkbox" className="rounded" /> {e}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-background text-foreground rounded-xl text-sm font-medium">İptal</button>
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium">Oluştur</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Database, Download, Upload, Clock, CheckCircle2, AlertTriangle,
    HardDrive, Shield, RefreshCw, Calendar,
    FileArchive, Settings, Play, Trash2
} from 'lucide-react';

const backups: any[] = [];

export default function DataBackupPage() {
    const [showSchedule, setShowSchedule] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [scheduleFreq, setScheduleFreq] = useState('daily');
    const [scheduleTime, setScheduleTime] = useState('03:00');
    const [scheduleType, setScheduleType] = useState('full');
    const [retention, setRetention] = useState('30');

    const completedBackups = backups.filter(b => b.status === 'completed').length;
    const failedBackups = backups.filter(b => b.status === 'failed').length;
    const totalSize = '0 GB';

    const startBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => setIsBackingUp(false), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Database className="w-7 h-7 text-indigo-400" /> Veri Yedekleme Yönetimi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Verilerinizi güvende tutun, otomatik yedekleme yapın</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowSchedule(true)} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-foreground text-sm border border-border rounded-xl">
                        <Settings className="w-4 h-4" /> Zamanlama
                    </button>
                    <button onClick={startBackup} disabled={isBackingUp}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm transition-colors">
                        {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isBackingUp ? 'Yedekleniyor...' : 'Şimdi Yedekle'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Son Yedek', value: '2 saat önce', icon: Clock, color: 'text-blue-400' },
                    { label: 'Başarılı', value: completedBackups.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Başarısız', value: failedBackups.toString(), icon: AlertTriangle, color: failedBackups > 0 ? 'text-red-400' : 'text-emerald-400' },
                    { label: 'Toplam Boyut', value: totalSize, icon: HardDrive, color: 'text-indigo-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Current Config */}
            <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" /> Yedekleme Yapılandırması
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Sıklık</div>
                        <div className="text-foreground font-medium">Günlük</div>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Saat</div>
                        <div className="text-foreground font-medium">03:00</div>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Tür</div>
                        <div className="text-foreground font-medium">Tam + Artımlı</div>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Saklama</div>
                        <div className="text-foreground font-medium">30 gün</div>
                    </div>
                </div>
            </div>

            {/* Storage Bar */}
            <div className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Depolama Kullanımı</h3>
                    <span className="text-xs text-slate-500">14.7 GB / 50 GB</span>
                </div>
                <div className="h-3 bg-background rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '29%' }} transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Kullanılan: 14.7 GB</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-background" /> Boş: 35.3 GB</span>
                </div>
            </div>

            {/* Backup History */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Yedekleme Geçmişi</h3>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-500 text-xs border-b border-border">
                            <th className="text-left px-6 py-3 font-medium">Ad</th>
                            <th className="text-left px-4 py-3 font-medium">Tarih</th>
                            <th className="text-left px-4 py-3 font-medium">Boyut</th>
                            <th className="text-left px-4 py-3 font-medium">Tür</th>
                            <th className="text-left px-4 py-3 font-medium">Süre</th>
                            <th className="text-left px-4 py-3 font-medium">Durum</th>
                            <th className="text-right px-6 py-3 font-medium">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.length === 0 && (
                            <tr>
                                <td className="px-6 py-6 text-sm text-slate-500" colSpan={7}>Yedekleme geçmişi verisi bulunamadı</td>
                            </tr>
                        )}
                        {backups.map((b, i) => (
                            <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="border-b border-border/50 hover:bg-background/50">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <FileArchive className="w-4 h-4 text-slate-500" />
                                        <span className="text-foreground text-xs">{b.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{b.date}</td>
                                <td className="px-4 py-3 text-xs text-foreground">{b.size}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${b.type === 'full' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                        {b.type === 'full' ? 'Tam' : 'Artımlı'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{b.duration}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {b.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                        {b.status === 'completed' ? 'Başarılı' : 'Başarısız'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {b.status === 'completed' && (
                                            <>
                                                <button className="p-1.5 text-slate-500 hover:text-foreground" title="İndir"><Download className="w-3.5 h-3.5" /></button>
                                                <button className="p-1.5 text-slate-500 hover:text-foreground" title="Geri Yükle"><Upload className="w-3.5 h-3.5" /></button>
                                            </>
                                        )}
                                        <button className="p-1.5 text-slate-500 hover:text-red-400" title="Sil"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Schedule Modal */}
            {showSchedule && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSchedule(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" /> Yedekleme Zamanlaması
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Sıklık</label>
                                <select value={scheduleFreq} onChange={e => setScheduleFreq(e.target.value)}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border">
                                    <option value="hourly">Saatlik</option>
                                    <option value="daily">Günlük</option>
                                    <option value="weekly">Haftalık</option>
                                    <option value="monthly">Aylık</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Saat</label>
                                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Yedek Türü</label>
                                <select value={scheduleType} onChange={e => setScheduleType(e.target.value)}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border">
                                    <option value="full">Tam Yedek</option>
                                    <option value="incremental">Artımlı Yedek</option>
                                    <option value="mixed">Karışık (Haftalık Tam + Günlük Artımlı)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Saklama Süresi (gün)</label>
                                <input type="number" value={retention} onChange={e => setRetention(e.target.value)}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowSchedule(false)} className="px-4 py-2 text-sm text-slate-400">İptal</button>
                            <button onClick={() => setShowSchedule(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Kaydet</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

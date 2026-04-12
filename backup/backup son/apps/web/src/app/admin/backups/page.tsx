"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Database, Clock, Download, Play, Pause, Plus, Save, X,
    CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw,
    Server, Shield, HardDrive, Calendar, Settings, ChevronRight,
    Archive, RotateCcw, Trash2, Eye, Activity, Zap
} from 'lucide-react';

const scheduleSchema = z.object({
    name: z.string().min(2, 'En az 2 karakter'),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    retentionDays: z.number().min(1).max(365),
    includeMedia: z.boolean(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface Backup {
    id: string;
    status: string;
    type: string;
    size: number;
    createdAt: string;
}

interface Schedule {
    id: string;
    name: string;
    frequency: string;
    retentionDays: number;
    includeMedia: boolean;
    isActive?: boolean;
}

interface DRSettings {
    rpo: string;
    rto: string;
    replicationStatus: string;
    autoFailover: boolean;
    crossRegion: boolean;
    pitr: boolean;
    encrypted: boolean;
}

export default function BackupsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'dr'>('backups');
    const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null);

    const { data: backups, isLoading: backupsLoading } = useQuery({
        queryKey: ['admin-backups'],
        queryFn: () => adminApi.getBackups(),
        enabled: activeTab === 'backups',
    });

    const { data: schedules, isLoading: schedulesLoading } = useQuery({
        queryKey: ['backup-schedules'],
        queryFn: () => adminApi.getBackupSchedules(),
        enabled: activeTab === 'schedules',
    });

    const { data: drSettings, isLoading: drLoading } = useQuery({
        queryKey: ['dr-settings'],
        queryFn: () => adminApi.getDrSettings(),
        enabled: activeTab === 'dr',
    });

    const createScheduleMutation = useMutation({
        mutationFn: (data: ScheduleFormData) => adminApi.createBackupSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backup-schedules'] });
            setIsCreatingSchedule(false);
            scheduleForm.reset();
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (id: string) => adminApi.restoreBackup(id, false),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-backups'] });
            setRestoreConfirm(null);
        },
    });

    const scheduleForm = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: { name: '', frequency: 'daily', retentionDays: 30, includeMedia: true },
    });

    const backupList = (Array.isArray(backups) ? backups : (backups?.backups || [])) as Backup[];
    const scheduleList = (Array.isArray(schedules) ? schedules : (schedules?.schedules || [])) as Schedule[];

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const formatSize = (bytes: number) => {
        if (!bytes) return '—';
        const gb = bytes / (1024 * 1024 * 1024);
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(0)} MB`;
    };

    const tabs = [
        { key: 'backups', label: 'Yedekler', icon: Database },
        { key: 'schedules', label: 'Zamanlamalar', icon: Clock },
        { key: 'dr', label: 'Felaket Kurtarma', icon: Shield },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Yedekleme & Felaket Kurtarma</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Yedekleme işlemleri, zamanlama ve DR politikaları</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit shadow-sm">
                {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as 'backups' | 'schedules' | 'dr')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <TabIcon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* BACKUPS TAB */}
            {activeTab === 'backups' && (
                <div className="space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Yedek', value: backupList.length, icon: Archive, color: 'blue' },
                            { label: 'Başarılı', value: backupList.filter((b: Backup) => b.status === 'completed' || b.status === 'COMPLETED').length, icon: CheckCircle, color: 'green' },
                            { label: 'Başarısız', value: backupList.filter((b: Backup) => b.status === 'failed' || b.status === 'FAILED').length, icon: XCircle, color: 'red' },
                            { label: 'Toplam Boyut', value: formatSize(backupList.reduce((acc: number, b: Backup) => acc + (b.size || 0), 0)), icon: HardDrive, color: 'purple' },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                                        <stat.icon size={18} className={`text-${stat.color}-500`} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Backup List */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        {backupsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tür</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Boyut</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {backupList.map((backup: Backup, idx: number) => {
                                        const isCompleted = backup.status === 'completed' || backup.status === 'COMPLETED';
                                        const isFailed = backup.status === 'failed' || backup.status === 'FAILED';
                                        return (
                                            <tr key={backup.id || idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4">
                                                    <span className={`flex items-center gap-1 text-xs font-bold ${isCompleted ? 'text-green-500' : isFailed ? 'text-red-500' : 'text-amber-500'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle size={14} /> : isFailed ? <XCircle size={14} /> : <Loader2 size={14} className="animate-spin" />}
                                                        {isCompleted ? 'Başarılı' : isFailed ? 'Başarısız' : 'Devam Ediyor'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-foreground">{backup.type || 'full'}</td>
                                                <td className="p-4 text-sm text-slate-500">{formatSize(backup.size)}</td>
                                                <td className="p-4 text-sm text-slate-500">{backup.createdAt ? formatDate(backup.createdAt) : '—'}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {isCompleted && (
                                                            <button
                                                                onClick={() => setRestoreConfirm(backup.id)}
                                                                className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                                            >
                                                                <RotateCcw size={14} /> Geri Yükle
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {backupList.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Henüz yedek bulunmuyor</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* SCHEDULES TAB */}
            {activeTab === 'schedules' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setIsCreatingSchedule(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                            <Plus size={16} /> Yeni Zamanlama
                        </button>
                    </div>

                    {isCreatingSchedule && (
                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <h3 className="font-bold text-foreground flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Yeni Yedekleme Zamanlaması</h3>
                                <button onClick={() => { setIsCreatingSchedule(false); scheduleForm.reset(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"><X size={18} /></button>
                            </div>
                            <form onSubmit={scheduleForm.handleSubmit(data => createScheduleMutation.mutate(data))} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Ad *</label>
                                        <input {...scheduleForm.register('name')} placeholder="Günlük Yedek" className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                                        {scheduleForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{scheduleForm.formState.errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Sıklık</label>
                                        <select {...scheduleForm.register('frequency')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none">
                                            <option value="daily">Günlük</option>
                                            <option value="weekly">Haftalık</option>
                                            <option value="monthly">Aylık</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Saklama Süresi (gün)</label>
                                        <input type="number" {...scheduleForm.register('retentionDays', { valueAsNumber: true })} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none" />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input type="checkbox" {...scheduleForm.register('includeMedia')} className="w-4 h-4 rounded border-slate-300 text-blue-500" />
                                        <label className="text-sm font-bold text-foreground">Medya dosyalarını dahil et</label>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-white/5">
                                    <button type="button" onClick={() => setIsCreatingSchedule(false)} className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface/80">İptal</button>
                                    <button type="submit" disabled={createScheduleMutation.isPending} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50">
                                        {createScheduleMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Oluştur
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Schedule List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedulesLoading ? (
                            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <>
                                {scheduleList.map((schedule: Schedule) => (
                                    <div key={schedule.id} className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-foreground">{schedule.name || 'Zamanlama'}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${schedule.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {schedule.isActive !== false ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-500">Sıklık</span><span className="font-bold text-foreground">{schedule.frequency}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Saklama</span><span className="font-bold text-foreground">{schedule.retentionDays} gün</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Medya</span><span className="font-bold text-foreground">{schedule.includeMedia ? 'Dahil' : 'Hariç'}</span></div>
                                        </div>
                                    </div>
                                ))}
                                {scheduleList.length === 0 && !isCreatingSchedule && (
                                    <div className="col-span-full text-center py-12 text-slate-400">
                                        <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="font-bold">Henüz zamanlama oluşturulmamış</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* DR TAB */}
            {activeTab === 'dr' && (
                <div className="space-y-6">
                    {drLoading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl bg-green-500/10"><Shield size={20} className="text-green-500" /></div>
                                        <h3 className="font-bold text-foreground">RPO (Kurtarma Noktası)</h3>
                                    </div>
                                    <div className="text-3xl font-black text-foreground">{drSettings?.rpo || '1 saat'}</div>
                                    <p className="text-xs text-slate-500 mt-1">Maksimum tolere edilebilir veri kaybı</p>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl bg-blue-500/10"><Zap size={20} className="text-blue-500" /></div>
                                        <h3 className="font-bold text-foreground">RTO (Kurtarma Süresi)</h3>
                                    </div>
                                    <div className="text-3xl font-black text-foreground">{drSettings?.rto || '4 saat'}</div>
                                    <p className="text-xs text-slate-500 mt-1">Maksimum tolere edilebilir kesinti</p>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl bg-purple-500/10"><Server size={20} className="text-purple-500" /></div>
                                        <h3 className="font-bold text-foreground">Replikasyon</h3>
                                    </div>
                                    <div className="text-3xl font-black text-foreground">{drSettings?.replicationStatus || 'Aktif'}</div>
                                    <p className="text-xs text-slate-500 mt-1">Veritabanı replikasyon durumu</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-blue-500" /> DR Politikaları
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Otomatik Failover', status: drSettings?.autoFailover !== false, desc: 'Bağlantı koptuğunda otomatik geçiş' },
                                        { label: 'Cross-Region Backup', status: drSettings?.crossRegion !== false, desc: 'Farklı bölgede yedek saklama' },
                                        { label: 'Point-in-Time Recovery', status: drSettings?.pitr !== false, desc: 'Belirli bir zamana geri dönüş' },
                                        { label: 'Şifreli Yedekleme', status: drSettings?.encrypted !== false, desc: 'AES-256 ile yedek şifreleme' },
                                    ].map((policy, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl">
                                            <div>
                                                <div className="font-bold text-foreground text-sm">{policy.label}</div>
                                                <div className="text-xs text-slate-500">{policy.desc}</div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${policy.status ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {policy.status ? 'Aktif' : 'Pasif'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Restore Confirm Modal */}
            {restoreConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setRestoreConfirm(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 max-w-md w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/10"><AlertTriangle size={24} className="text-amber-500" /></div>
                            <div>
                                <h3 className="text-lg font-black text-foreground">Geri Yükleme Onayı</h3>
                                <p className="text-sm text-slate-500">Bu işlem mevcut verilerin üzerine yazacaktır.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setRestoreConfirm(null)} className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface/80">İptal</button>
                            <button
                                onClick={() => restoreMutation.mutate(restoreConfirm)}
                                disabled={restoreMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50"
                            >
                                {restoreMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Geri Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardList, PlusCircle, CheckCircle2, Clock, AlertTriangle,
    Users, Calendar, Tag, MoreHorizontal, Filter, Search,
    Circle, ArrowUpRight, BarChart3,
    LucideIcon
} from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'review' | 'done';

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
    high: { label: 'Yüksek', color: 'text-red-400', bg: 'bg-red-500/10' },
    medium: { label: 'Orta', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    low: { label: 'Düşük', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: typeof Circle }> = {
    todo: { label: 'Yapılacak', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Circle },
    'in-progress': { label: 'Devam Ediyor', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
    review: { label: 'İncelemede', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
    done: { label: 'Tamamlandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
};

interface Task {
    id: number | string;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    assignee: string;
    dueDate: string;
    tags: string[];
    progress: number;
}

import { useTasks } from '@/lib/hooks';

export default function TaskManagerPage() {
    const { data: tasksData, loading: isLoading } = useTasks();
    const [view, setView] = useState<'board' | 'list'>('board');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const tasks = Array.isArray(tasksData) ? (tasksData as Task[]) : [];
    const columns: Status[] = ['todo', 'in-progress', 'review', 'done'];

    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <ClipboardList className="w-7 h-7 text-indigo-400" /> Görev & Proje Yönetimi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Ekip görevlerini takip edin ve yönetin</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-surface rounded-xl p-1 border border-border">
                        <button onClick={() => setView('board')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Board</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Liste</button>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors">
                        <PlusCircle className="w-4 h-4" /> Yeni Görev
                    </button>
                </div>
            </div>

            {/* Progress & Search */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Görev ara..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                </div>
                <div className="flex items-center gap-3 bg-surface rounded-xl border border-border px-4 py-2.5">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <div className="w-32 h-2 bg-background rounded-full">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="text-xs text-foreground font-medium">{progressPct}%</span>
                    <span className="text-xs text-slate-500">{doneTasks}/{totalTasks}</span>
                </div>
            </div>

            {/* Board View */}
            {view === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map(col => {
                        const cfg = statusConfig[col];
                        const colTasks = filteredTasks.filter((t) => t.status === col);
                        return (
                            <div key={col} className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                                        <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                                        <span className="text-xs text-slate-600 bg-background px-2 py-0.5 rounded-full">{colTasks.length}</span>
                                    </div>
                                </div>
                                {colTasks.map((task, i) => {
                                    const prCfg = priorityConfig[task.priority as Priority];
                                    return (
                                        <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            className="bg-surface rounded-xl border border-border p-4 hover:border-indigo-500/20 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${prCfg.bg} ${prCfg.color}`}>{prCfg.label}</span>
                                                <button className="text-slate-600 hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                                            </div>
                                            <h4 className="text-sm font-medium text-foreground mb-1">{task.title}</h4>
                                            <p className="text-[10px] text-slate-500 mb-3">{task.description}</p>
                                            {task.progress > 0 && task.progress < 100 && (
                                                <div className="mb-3">
                                                    <div className="h-1 bg-background rounded-full">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.progress}%` }} />
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-1">{task.progress}%</div>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {task.tags.map((tag: string) => (
                                                    <span key={tag} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">{tag}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.assignee}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {colTasks.length === 0 && !isLoading && (
                                    <div className="text-center py-8 bg-background/20 rounded-xl border border-dashed border-border/50">
                                        <p className="text-[10px] text-slate-500">Bu aşamada görev yok</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {view === 'list' && (
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500 text-xs border-b border-border">
                                    <th className="text-left px-4 py-3 font-medium">Görev</th>
                                    <th className="text-left px-4 py-3 font-medium">Durum</th>
                                    <th className="text-left px-4 py-3 font-medium">Öncelik</th>
                                    <th className="text-left px-4 py-3 font-medium">Atanan</th>
                                    <th className="text-left px-4 py-3 font-medium">İlerleme</th>
                                    <th className="text-left px-4 py-3 font-medium">Bitiş</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task, i) => {
                                    const sCfg = statusConfig[task.status as Status];
                                    const pCfg = priorityConfig[task.priority as Priority];
                                    return (
                                        <motion.tr key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="border-b border-border/50 hover:bg-background/50">
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-foreground font-medium">{task.title}</div>
                                                <div className="flex gap-1 mt-1">{task.tags.map((t: string) => <span key={t} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px]">{t}</span>)}</div>
                                            </td>
                                            <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${sCfg.bg} ${sCfg.color}`}><sCfg.icon className="w-3 h-3" /> {sCfg.label}</span></td>
                                            <td className="px-4 py-3"><span className={`text-xs ${pCfg.color}`}>{pCfg.label}</span></td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{task.assignee}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-background rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.progress}%` }} /></div>
                                                    <span className="text-xs text-slate-400">{task.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{task.dueDate}</td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Yeni Görev Oluştur</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Başlık</label>
                                <input placeholder="Görev başlığı" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Açıklama</label>
                                <textarea placeholder="Detaylı açıklama..." rows={2}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Öncelik</label>
                                    <select className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border">
                                        <option>Yüksek</option><option>Orta</option><option>Düşük</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Atanan</label>
                                    <input placeholder="Kişi" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Bitiş Tarihi</label>
                                    <input type="date" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-foreground">İptal</button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Oluştur</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

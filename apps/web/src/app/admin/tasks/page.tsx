"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    Plus, Search, CheckCircle, Clock, AlertTriangle,
    MoreVertical, Calendar, CalendarDays, User, Target, Loader2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface AdminTask {
    id: string;
    title: string;
    description: string | null;
    status: string; // TODO, IN_PROGRESS, IN_REVIEW, DONE
    priority: string; // LOW, MEDIUM, HIGH, URGENT
    assignee: { id: string; name: string; email: string } | null;
    dueDate: string | null;
    createdAt: string;
}

const COLUMNS = [
    { id: 'TODO', title: 'Yapılacaklar', color: 'border-slate-200 dark:border-white/10' },
    { id: 'IN_PROGRESS', title: 'Devam Eden', color: 'border-blue-500/30' },
    { id: 'IN_REVIEW', title: 'İncelemede', color: 'border-amber-500/30' },
    { id: 'DONE', title: 'Tamamlandı', color: 'border-emerald-500/30' }
];

export default function KanbanTasksPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['admin-tasks'],
        queryFn: () => adminApi.getTasks(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateTask(id, { status }),
        onMutate: async ({ id, status }) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['admin-tasks'] });
            const previous = queryClient.getQueryData(['admin-tasks']);
            queryClient.setQueryData(['admin-tasks'], (old: any) => {
                return old?.map((t: any) => t.id === id ? { ...t, status } : t) || [];
            });
            return { previous };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['admin-tasks'], context?.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
        }
    });

    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId) return;

        updateMutation.mutate({ id: draggableId, status: destination.droppableId });
    };

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case 'URGENT': return <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-red-100 text-red-600 rounded-lg">Acil</span>;
            case 'HIGH': return <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-amber-100 text-amber-600 rounded-lg">Yüksek</span>;
            case 'MEDIUM': return <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-blue-100 text-blue-600 rounded-lg">Normal</span>;
            default: return <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-slate-100 text-slate-600 rounded-lg">Düşük</span>;
        }
    };

    const filteredTasks = tasks.filter((t: AdminTask) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Görev Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Operasyonel görevleri ve ekip süreçlerini Kanban panosu ile takip edin.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-blue-500/20">
                    <Plus size={16} /> Görev Oluştur
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Görev adı veya içeriğinde ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start h-full min-h-[600px] overflow-x-auto pb-6">
                        {COLUMNS.map(column => {
                            const columnTasks = filteredTasks.filter((t: AdminTask) => t.status === column.id);

                            return (
                                <div key={column.id} className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                    <div className={`p-4 border-b ${column.color} bg-white dark:bg-white/[0.02] flex items-center justify-between shadow-sm z-10`}>
                                        <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm">{column.title}</h3>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex-1 p-3 space-y-3 min-h-[150px] overflow-y-auto"
                                            >
                                                {columnTasks.map((task: AdminTask, index: number) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-4 bg-white dark:bg-slate-800 border ${snapshot.isDragging ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200 dark:border-white/10'} rounded-xl shadow-sm hover:shadow transition-all group select-none`}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    {getPriorityBadge(task.priority)}
                                                                    <button className="text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MoreVertical size={14} />
                                                                    </button>
                                                                </div>
                                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-2">
                                                                    {task.title}
                                                                </h4>
                                                                {task.dueDate && (
                                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-white/5 w-fit px-2 py-1 rounded-lg">
                                                                        <CalendarDays size={12} /> {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between mt-auto">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        <Target size={14} className="text-slate-400" />
                                                                    </div>
                                                                    {task.assignee ? (
                                                                        <div className="flex items-center gap-1.5" title={task.assignee.name}>
                                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold shadow-inner border border-white dark:border-slate-700">
                                                                                {task.assignee.name?.charAt(0)?.toUpperCase()}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400" title="Atanmadı">
                                                                            <User size={12} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            )}
        </div>
    );
}

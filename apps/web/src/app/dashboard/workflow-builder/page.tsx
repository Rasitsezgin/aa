"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Save, Plus, Trash2, Zap, GitBranch,
    Clock, Bot, Webhook, RotateCcw, ArrowRight, Settings,
    Package, ShoppingCart, DollarSign, Bell, Mail, MessageSquare,
    TrendingUp, AlertTriangle, Star, Truck, Users,
    ChevronDown, ChevronRight, GripVertical, X, Check,
    Copy, FileText, Loader2, LayoutTemplate, Workflow,
} from 'lucide-react';

// ============ TYPES ============

interface WorkflowNode {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'delay' | 'ai';
    category: string;
    label: string;
    config: Record<string, any>;
    position: { x: number; y: number };
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    tags: string[];
}

// ============ NODE TYPE DEFINITIONS ============

interface NodeTypeDef {
    type: string;
    category: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bgColor: string;
    description: string;
}

const NODE_TYPES: NodeTypeDef[] = [
    // Triggers
    { type: 'trigger', category: 'orders', label: 'Yeni Sipariş', icon: ShoppingCart, color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30', description: 'Yeni sipariş geldiğinde' },
    { type: 'trigger', category: 'products', label: 'Ürün Güncellendi', icon: Package, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', description: 'Ürün bilgileri değiştiğinde' },
    { type: 'trigger', category: 'inventory', label: 'Stok Değişimi', icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', description: 'Stok seviyesi değiştiğinde' },
    { type: 'trigger', category: 'competitor', label: 'Rakip Fiyat Değişimi', icon: TrendingUp, color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30', description: 'Rakip fiyatı değiştiğinde' },
    { type: 'trigger', category: 'reviews', label: 'Yeni Değerlendirme', icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30', description: 'Yeni bir değerlendirme geldiğinde' },
    { type: 'trigger', category: 'returns', label: 'İade Talebi', icon: RotateCcw, color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', description: 'Müşteri iade istediğinde' },
    { type: 'trigger', category: 'schedule', label: 'Zamanlayıcı', icon: Clock, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', description: 'Belirli zamanlarda çalıştır' },
    { type: 'trigger', category: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/30', description: 'Dış servis tetiklemesi' },
    // Conditions
    { type: 'condition', category: 'logic', label: 'Koşul Kontrolü', icon: GitBranch, color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', description: 'If/else dallanma' },
    // Actions
    { type: 'action', category: 'notification', label: 'E-posta Gönder', icon: Mail, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', description: 'E-posta bildirimi gönder' },
    { type: 'action', category: 'notification', label: 'SMS Gönder', icon: MessageSquare, color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30', description: 'SMS bildirimi gönder' },
    { type: 'action', category: 'notification', label: 'Push Bildirim', icon: Bell, color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30', description: 'Anlık bildirim gönder' },
    { type: 'action', category: 'pricing', label: 'Fiyat Güncelle', icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/30', description: 'Ürün fiyatını değiştir' },
    { type: 'action', category: 'inventory', label: 'Stok Güncelle', icon: Package, color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30', description: 'Stok seviyesini güncelle' },
    { type: 'action', category: 'marketplace', label: 'Pazaryeri Sync', icon: RotateCcw, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/30', description: 'Pazaryerlerine senkronize et' },
    { type: 'action', category: 'finance', label: 'E-Fatura Kes', icon: FileText, color: 'text-teal-400', bgColor: 'bg-teal-500/10 border-teal-500/30', description: 'Otomatik e-fatura oluştur' },
    { type: 'action', category: 'shipping', label: 'Kargo Oluştur', icon: Truck, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', description: 'Kargo sevkiyatı oluştur' },
    // Delay
    { type: 'delay', category: 'utility', label: 'Bekle', icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-500/10 border-gray-500/30', description: 'Belirli süre bekle' },
    // AI
    { type: 'ai', category: 'ai', label: 'AI Karar Ver', icon: Bot, color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/30', description: 'AI ile akıllı karar' },
];

function getNodeDef(node: WorkflowNode): NodeTypeDef {
    return NODE_TYPES.find(n => n.type === node.type && n.category === node.category) 
        || NODE_TYPES.find(n => n.type === node.type)
        || NODE_TYPES[0];
}

// ============ CANVAS NODE ============

function FlowNode({
    node, isSelected, onSelect, onDelete, onDragStart,
}: {
    node: WorkflowNode;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onDragStart: (e: React.MouseEvent) => void;
}) {
    const def = getNodeDef(node);
    const Icon = def.icon;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute select-none cursor-grab active:cursor-grabbing ${isSelected ? 'z-20' : 'z-10'}`}
            style={{ left: node.position.x, top: node.position.y }}
            onMouseDown={onDragStart}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <div className={`w-52 rounded-xl border-2 shadow-xl transition-all ${
                isSelected ? 'border-primary shadow-primary/20 scale-105' : `${def.bgColor} hover:scale-[1.02]`
            } bg-[#0d1117]`}>
                {/* Header */}
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-[10px] ${
                    node.type === 'trigger' ? 'bg-green-500/5' :
                    node.type === 'condition' ? 'bg-amber-500/5' :
                    node.type === 'ai' ? 'bg-violet-500/5' :
                    node.type === 'delay' ? 'bg-gray-500/5' :
                    'bg-blue-500/5'
                }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${def.bgColor}`}>
                        <Icon size={14} className={def.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{node.label}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                            {node.type === 'trigger' ? 'Tetikleyici' :
                             node.type === 'condition' ? 'Koşul' :
                             node.type === 'ai' ? 'AI' :
                             node.type === 'delay' ? 'Gecikme' :
                             'Aksiyon'}
                        </p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Connection points */}
                {node.type !== 'trigger' && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-500 hover:border-primary hover:bg-primary/20 transition-colors" />
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-500 hover:border-primary hover:bg-primary/20 transition-colors" />

                {/* Condition specific: two outputs */}
                {node.type === 'condition' && (
                    <>
                        <div className="absolute -bottom-2 left-6 w-4 h-4 rounded-full bg-green-900 border-2 border-green-500 transition-colors">
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-green-400 font-bold">E</span>
                        </div>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 rounded-full bg-red-900 border-2 border-red-500 transition-colors">
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-red-400 font-bold">H</span>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

// ============ EDGE RENDERER ============

function FlowEdges({ nodes, edges }: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                </marker>
            </defs>
            {edges.map(edge => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;

                const sx = source.position.x + 104; // half of node width (208/2)
                const sy = source.position.y + 60; // bottom of source node
                const tx = target.position.x + 104;
                const ty = target.position.y - 8; // top of target node

                const midY = (sy + ty) / 2;

                return (
                    <g key={edge.id}>
                        <path
                            d={`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`}
                            stroke="#4b5563"
                            strokeWidth={2}
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            strokeDasharray={edge.label === 'Hayır' ? '5,5' : undefined}
                        />
                        {edge.label && (
                            <text
                                x={(sx + tx) / 2}
                                y={(sy + ty) / 2 - 8}
                                textAnchor="middle"
                                className="fill-slate-500 text-[10px] font-bold"
                            >
                                {edge.label}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ============ SIDEBAR PANEL ============

function NodePalette({ onAddNode }: { onAddNode: (typeDef: NodeTypeDef) => void }) {
    const [expandedType, setExpandedType] = useState<string>('trigger');

    const groups = [
        { key: 'trigger', label: 'Tetikleyiciler', icon: Zap, color: 'text-green-400' },
        { key: 'condition', label: 'Koşullar', icon: GitBranch, color: 'text-amber-400' },
        { key: 'action', label: 'Aksiyonlar', icon: Play, color: 'text-blue-400' },
        { key: 'delay', label: 'Yardımcılar', icon: Clock, color: 'text-gray-400' },
        { key: 'ai', label: 'AI İşlemleri', icon: Bot, color: 'text-violet-400' },
    ];

    return (
        <div className="w-64 bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Düğüm Paleti</h3>
                <p className="text-[10px] text-slate-600 mt-1">Sürükleyerek veya tıklayarak ekleyin</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {groups.map(group => {
                    const groupNodes = NODE_TYPES.filter(n => n.type === group.key);
                    return (
                        <div key={group.key}>
                            <button
                                onClick={() => setExpandedType(expandedType === group.key ? '' : group.key)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <group.icon size={14} className={group.color} />
                                <span className="text-xs font-bold text-slate-300 flex-1 text-left">{group.label}</span>
                                <span className="text-[10px] text-slate-600">{groupNodes.length}</span>
                                <ChevronRight size={12} className={`text-slate-600 transition-transform ${expandedType === group.key ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {expandedType === group.key && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-2 space-y-0.5 py-1">
                                            {groupNodes.map(nodeDef => (
                                                <button
                                                    key={`${nodeDef.type}-${nodeDef.category}-${nodeDef.label}`}
                                                    onClick={() => onAddNode(nodeDef)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-slate-700 hover:bg-white/[0.02] transition-all group text-left"
                                                >
                                                    <nodeDef.icon size={13} className={`${nodeDef.color} group-hover:scale-110 transition-transform`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-400 group-hover:text-white truncate">{nodeDef.label}</p>
                                                        <p className="text-[9px] text-slate-600 truncate">{nodeDef.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============ TEMPLATE GALLERY ============

function TemplateGallery({ onSelect, onClose }: { onSelect: (t: WorkflowTemplate) => void; onClose: () => void }) {
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/workflows/templates/list', {
            headers: { 'x-tenant-id': 'default' },
        })
            .then(r => r.json())
            .then(setTemplates)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const categoryColors: Record<string, string> = {
        inventory: 'from-orange-500 to-red-500',
        orders: 'from-blue-500 to-indigo-500',
        pricing: 'from-green-500 to-emerald-500',
        returns: 'from-pink-500 to-rose-500',
        reviews: 'from-yellow-500 to-orange-500',
        marketplace: 'from-purple-500 to-violet-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#0d1117] border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-lg font-black text-white">Hazır İş Akışı Şablonları</h2>
                        <p className="text-sm text-slate-500 mt-1">Bir şablon seçerek hızlıca başlayın</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onSelect(t)}
                                    className="text-left p-5 rounded-xl border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[t.category] || 'from-slate-500 to-slate-600'} flex items-center justify-center mb-3`}>
                                        <Workflow size={18} className="text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{t.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                                    <div className="flex gap-1 mt-3">
                                        {t.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                                        <span>{t.nodes.length} düğüm</span>
                                        <span>•</span>
                                        <span>{t.edges.length} bağlantı</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ============ MAIN PAGE ============

export default function WorkflowBuilderPage() {
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [edges, setEdges] = useState<WorkflowEdge[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState('Yeni İş Akışı');
    const [isActive, setIsActive] = useState(false);
    const [showTemplates, setShowTemplates] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dragInfo, setDragInfo] = useState<{ nodeId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const addNode = useCallback((typeDef: NodeTypeDef) => {
        const id = `${typeDef.type}-${Date.now()}`;
        const yOffset = nodes.length * 130 + 50;
        const newNode: WorkflowNode = {
            id,
            type: typeDef.type as any,
            category: typeDef.category,
            label: typeDef.label,
            config: {},
            position: { x: 250, y: yOffset },
        };
        setNodes(prev => [...prev, newNode]);

        // Auto-connect to last node
        if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            setEdges(prev => [...prev, {
                id: `e-${lastNode.id}-${id}`,
                source: lastNode.id,
                target: id,
            }]);
        }
    }, [nodes]);

    const deleteNode = useCallback((nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (selectedNodeId === nodeId) setSelectedNodeId(null);
    }, [selectedNodeId]);

    const handleDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        setDragInfo({
            nodeId,
            startX: e.clientX,
            startY: e.clientY,
            origX: node.position.x,
            origY: node.position.y,
        });
    }, [nodes]);

    useEffect(() => {
        if (!dragInfo) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragInfo.startX;
            const dy = e.clientY - dragInfo.startY;
            setNodes(prev => prev.map(n =>
                n.id === dragInfo.nodeId
                    ? { ...n, position: { x: Math.max(0, dragInfo.origX + dx), y: Math.max(0, dragInfo.origY + dy) } }
                    : n
            ));
        };

        const handleMouseUp = () => setDragInfo(null);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo]);

    const handleSelectTemplate = (template: WorkflowTemplate) => {
        setNodes(template.nodes);
        setEdges(template.edges);
        setWorkflowName(template.name);
        setShowTemplates(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ name: workflowName, nodes, edges, isActive }),
            });
        } catch {
            // handle error
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 lg:-m-8">
            {/* Top Bar */}
            <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <Workflow size={16} className="text-white" />
                        </div>
                        <input
                            type="text"
                            value={workflowName}
                            onChange={e => setWorkflowName(e.target.value)}
                            className="text-sm font-bold text-white bg-transparent border-none outline-none hover:bg-white/5 focus:bg-white/5 px-2 py-1 rounded-lg transition-colors"
                        />
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{nodes.length} düğüm</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-slate-500">{edges.length} bağlantı</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-slate-700 transition-all"
                    >
                        <LayoutTemplate size={14} /> Şablonlar
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] text-slate-500 font-bold">Aktif</span>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${isActive ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/80 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Kaydet
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 min-h-0">
                {/* Node palette */}
                <NodePalette onAddNode={addNode} />

                {/* Canvas */}
                <div
                    ref={canvasRef}
                    className="flex-1 bg-[#080c14] relative overflow-auto"
                    onClick={() => setSelectedNodeId(null)}
                    style={{
                        backgroundImage: `radial-gradient(circle, #1e293b 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                >
                    {/* Empty state */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                    <Workflow size={32} className="text-slate-600" />
                                </div>
                                <h3 className="text-base font-bold text-slate-400 mb-2">İş akışı boş</h3>
                                <p className="text-sm text-slate-600 mb-4">Soldan düğüm ekleyin veya bir şablon seçin</p>
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <LayoutTemplate size={14} className="inline mr-2" />
                                    Şablonlardan Başla
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Edges */}
                    <FlowEdges nodes={nodes} edges={edges} />

                    {/* Nodes */}
                    {nodes.map(node => (
                        <FlowNode
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onSelect={() => setSelectedNodeId(node.id)}
                            onDelete={() => deleteNode(node.id)}
                            onDragStart={(e) => handleDragStart(node.id, e)}
                        />
                    ))}
                </div>
            </div>

            {/* Template Gallery Modal */}
            <AnimatePresence>
                {showTemplates && (
                    <TemplateGallery
                        onSelect={handleSelectTemplate}
                        onClose={() => setShowTemplates(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

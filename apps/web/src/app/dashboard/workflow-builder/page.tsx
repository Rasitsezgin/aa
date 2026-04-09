"use client";

import React, { useState, useEffect } from 'react';
import { 
    Zap, Plus, ArrowDown, Settings, Play, CheckCircle2, 
    ShoppingCart, Mail, MessageSquare, Truck, Box, FileText, Share2, Tag, 
    MoreHorizontal, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveWorkflow, getActiveWorkflows } from '../../actions/workflow-builder';

const DEMO_TENANT_ID = 'demo-tenant-123';

// Helper to map string icon names back to Lucide components if needed in the future
const getIconFromName = (name: string) => {
    switch(name) {
        case 'ShoppingCart': return ShoppingCart;
        case 'Box': return Box;
        case 'Truck': return Truck;
        case 'FileText': return FileText;
        case 'MessageSquare': return MessageSquare;
        case 'Tag': return Tag;
        case 'Share2': return Share2;
        default: return Settings;
    }
}

type FlowNode = {
    id: string;
    type: 'trigger' | 'action' | 'condition';
    title: string;
    desc: string;
    iconName: string;
    color: string;
};

export default function WorkflowBuilderPage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [workflowName, setWorkflowName] = useState('Trendyol Sipariş Otomasyonu');
    const [isSaving, setIsSaving] = useState(false);
    
    const [workflow, setWorkflow] = useState<FlowNode[]>([
        {
            id: '1',
            type: 'trigger',
            title: 'Sipariş Geldiğinde (Trendyol)',
            desc: 'Tüm yeni Trendyol siparişlerinde tetiklenir.',
            iconName: 'ShoppingCart',
            color: 'bg-orange-500'
        }
    ]);

    const triggers = [
        { title: 'Sipariş Geldiğinde', desc: 'Herhangi bir pazaryerinden sipariş düştüğünde', iconName: 'ShoppingCart', icon: ShoppingCart, color: 'bg-indigo-500' },
        { title: 'Kritik Stok Uyarısı', desc: 'Stok seviyesi belirlediğiniz eşiğin altına indiğinde', iconName: 'Box', icon: Box, color: 'bg-rose-500' },
        { title: 'İade Talebi', desc: 'Müşteri iade süreci başlattığında', iconName: 'Truck', icon: Truck, color: 'bg-amber-500' },
    ];

    const actions = [
        { title: 'E-Fatura Oluştur & Gönder', desc: 'Siparişin faturasını keser ve müşteriye mailler.', iconName: 'FileText', icon: FileText, color: 'bg-emerald-500' },
        { title: 'SMS Bildirimi At', desc: 'Müşteriye takip kodu veya teşekkür SMS i atar.', iconName: 'MessageSquare', icon: MessageSquare, color: 'bg-blue-500' },
        { title: 'Müşteriye Etiket Ata', desc: 'CRM üzerine VIP veya Risksiz etiketi koyar.', iconName: 'Tag', icon: Tag, color: 'bg-purple-500' },
        { title: 'Webhook Çağır', desc: 'Dış bir URL ye veri postalar (Zapier, Make).', iconName: 'Share2', icon: Share2, color: 'bg-slate-700' },
    ];

    const addNode = (item: any, type: 'trigger' | 'action') => {
        setWorkflow([...workflow, {
            id: Math.random().toString(),
            type,
            title: item.title,
            desc: item.desc,
            iconName: item.iconName,
            color: item.color
        }]);
        setSidebarOpen(false);
    };

    const handleDeploy = async () => {
        setIsSaving(true);
        const res = await saveWorkflow(DEMO_TENANT_ID, workflowName, workflow);
        setIsSaving(false);
        if (res.success) {
            alert('Akış başarıyla Prisma veritabanına kaydedildi! Artık gerçek zamanlı dinleniyor.');
        } else {
            alert(res.error || 'Hata oluştu');
        }
    };

    return (
        <div className="h-screen -mt-20 pt-24 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B1121]">
            {/* Topbar */}
            <div className="bg-white dark:bg-surface border-b border-border h-16 shrink-0 px-6 flex items-center justify-between z-10 relative shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="font-black text-lg bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white"
                        />
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Taslak Aşamasında (Kaydedilmedi)
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Test Et</button>
                    <button 
                        onClick={handleDeploy}
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition flex items-center gap-2"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
                        {isSaving ? 'Veritabanına Yazılıyor...' : 'Prisma: Yayına Al'}
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-auto pb-40">
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[size:24px_24px]" />
                
                <div className="relative z-10 flex flex-col items-center pt-20 px-4 min-h-full">
                    <AnimatePresence>
                        {workflow.map((node, index) => {
                            const IconComponent = getIconFromName(node.iconName);
                            return (
                                <React.Fragment key={node.id}>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className="w-full max-w-[340px] bg-white dark:bg-surface border border-border shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-6 relative group"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Kaldır">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className={\`w-12 h-12 \${node.color} text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg\`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <div className="pr-6">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                    {node.type === 'trigger' ? '1. Tetikleyici (Trigger)' : \`\${index + 1}. Aksiyon (Action)\`}
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{node.title}</h3>
                                                <p className="text-xs text-slate-500 mt-2 font-medium">{node.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="h-12 w-px bg-slate-300 dark:bg-slate-700 my-2 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-[#0B1121] border-2 border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center">
                                            <ArrowDown className="w-2 h-2 text-slate-400" />
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add Node Button */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(true)}
                        className="w-16 h-16 bg-white dark:bg-surface border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-colors shadow-lg"
                    >
                        <Plus className="w-8 h-8" />
                    </motion.button>
                </div>
            </div>

            {/* Right Sidebar (Node Selector) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[400px] bg-white dark:bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-6 border-b border-border">
                                <h2 className="text-xl font-black">Ne olmasını istersiniz?</h2>
                                <p className="text-sm text-slate-500 mt-1">Akış zincirine yeni bir düğüm (Node) ekleyin.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pl-2">Kritik Aksiyonlar (Action)</h3>
                                    <div className="space-y-3">
                                        {actions.map((act, i) => {
                                            const Icon = act.icon;
                                            return (
                                                <div 
                                                    key={i} onClick={() => addNode(act, 'action')}
                                                    className="p-4 border border-border rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 cursor-pointer transition-all flex items-start gap-4"
                                                >
                                                    <div className={\`w-10 h-10 \${act.color} text-white rounded-xl flex items-center justify-center shrink-0\`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <strong className="block text-sm text-slate-900 dark:text-white">{act.title}</strong>
                                                        <span className="text-xs text-slate-500 mt-1 block">{act.desc}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                
                                <div className="opacity-60 pointer-events-none">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pl-2">Farklı Tetikleyiciler (Trigger)</h3>
                                    <p className="text-xs text-rose-500 px-2 font-bold mb-2">Not: Sadece tek bir tetikleyici ile başlayabilirsiniz.</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

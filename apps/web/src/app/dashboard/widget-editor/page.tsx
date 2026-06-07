"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Reorder } from 'framer-motion';
import { LayoutGrid, Eye, EyeOff, GripVertical, Save, ArrowLeft, RotateCcw } from 'lucide-react';
import {
  loadDashboardWidgets,
  saveDashboardWidgets,
  loadDashboardWidgetsFromApi,
  saveDashboardWidgetsToApi,
  DEFAULT_DASHBOARD_WIDGETS,
  WIDGET_LABELS,
  type DashboardWidgetConfig,
} from '@/lib/dashboard-layout';

export default function WidgetEditorPage() {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_WIDGETS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const remote = await loadDashboardWidgetsFromApi();
      setWidgets(remote || loadDashboardWidgets());
    })();
  }, []);

  const toggleVisibility = (id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)));
    setSaved(false);
  };

  const handleSave = async () => {
    const withOrder = widgets.map((w, i) => ({ ...w, order: i }));
    await saveDashboardWidgetsToApi(withOrder);
    setWidgets(withOrder);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    await saveDashboardWidgetsToApi(DEFAULT_DASHBOARD_WIDGETS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const visibleCount = widgets.filter((w) => w.visible).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl border border-border bg-surface hover:border-orange-500/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Link>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-3">
              <LayoutGrid className="w-7 h-7 text-orange-500" />
              Panel Özelleştirme
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            Widget görünürlüğünü ve sırasını ayarlayın · {visibleCount}/{widgets.length} aktif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-slate-500 hover:text-foreground transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Varsayılan
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </div>

      <Reorder.Group axis="y" values={widgets} onReorder={setWidgets} className="space-y-3">
        {widgets.map((widget) => (
          <Reorder.Item key={widget.id} value={widget}>
            <motion.div
              layout
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                widget.visible
                  ? 'bg-surface border-border hover:border-orange-500/25'
                  : 'bg-background/50 border-border/60 opacity-60'
              }`}
            >
              <GripVertical className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground">{WIDGET_LABELS[widget.id]}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{widget.id}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisibility(widget.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                  widget.visible
                    ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                    : 'bg-slate-500/10 text-slate-500 border border-border'
                }`}
              >
                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {widget.visible ? 'Görünür' : 'Gizli'}
              </button>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <p className="text-xs text-slate-500 text-center">
        Değişiklikler kaydedildikten sonra{' '}
        <Link href="/dashboard" className="text-orange-600 font-bold hover:underline">
          Kontrol Merkezi
        </Link>
        &apos;nde uygulanır.
      </p>
    </div>
  );
}

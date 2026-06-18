"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  GitBranch,
  Plus,
  Settings,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  Edit2,
  Trash2,
  MoreHorizontal,
  Save,
  X,
  Play,
  Pause,
  RefreshCw,
  Users,
  Shield,
  FileText,
  Check,
  XCircle,
} from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  autoPublish: boolean;
  requireApproval: boolean;
}

interface WorkflowStep {
  id: string;
  type: "DRAFT" | "REVIEW" | "APPROVAL" | "PUBLISH" | "ARCHIVE";
  name: string;
  assigneeRole: string;
  required: boolean;
  duration?: number; // hours
}

interface WorkflowInstance {
  id: string;
  workflow: Workflow;
  postTitle: string;
  currentStep: number;
  status: "active" | "completed" | "rejected";
  assignedTo?: string;
  history: {
    step: number;
    action: string;
    by: string;
    at: string;
    comment?: string;
  }[];
}

export default function ContentWorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeInstances, setActiveInstances] = useState<WorkflowInstance[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch("/api/admin/blog/workflow");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const stageTypeMap: Record<string, WorkflowStep["type"]> = {
          draft: "DRAFT",
          review: "REVIEW",
          scheduled: "APPROVAL",
          published: "PUBLISH",
        };
        const steps: WorkflowStep[] = (data.stages ?? []).map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ""),
          type: stageTypeMap[String(s.id)] ?? "DRAFT",
          name: String(s.name ?? ""),
          assigneeRole: "Editör",
          required: true,
        }));
        const workflow: Workflow = {
          id: "default",
          name: "Varsayılan İş Akışı",
          description: "Blog içerik onay süreci",
          steps,
          isActive: true,
          autoPublish: false,
          requireApproval: true,
        };
        setWorkflows([workflow]);
        const stageIndex = (stage: string) =>
          Math.max(0, steps.findIndex((step) => step.id === stage));
        setActiveInstances(
          (data.items ?? []).map((item: Record<string, unknown>) => ({
            id: String(item.id ?? ""),
            workflow,
            postTitle: String(item.title ?? ""),
            currentStep: stageIndex(String(item.stage ?? "draft")),
            status: item.stage === "published" ? "completed" : "active",
            assignedTo: String(item.author ?? "Editör"),
            history: [],
          }))
        );
      } catch {
        setWorkflows([]);
        setActiveInstances([]);
      } finally {
        setLoading(false);
      }
    }
    void loadWorkflow();
  }, []);

  const getStepIcon = (type: string) => {
    switch (type) {
      case "DRAFT": return <FileText className="w-5 h-5" />;
      case "REVIEW": return <Users className="w-5 h-5" />;
      case "APPROVAL": return <Shield className="w-5 h-5" />;
      case "PUBLISH": return <CheckCircle className="w-5 h-5" />;
      case "ARCHIVE": return <Clock className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case "DRAFT": return "bg-slate-100 text-slate-600";
      case "REVIEW": return "bg-blue-100 text-blue-600";
      case "APPROVAL": return "bg-yellow-100 text-yellow-600";
      case "PUBLISH": return "bg-green-100 text-green-600";
      case "ARCHIVE": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <GitBranch className="w-6 h-6 text-orange-600" />
                  İçerik İş Akışları
                </h1>
                <p className="text-slate-500 text-sm">Onay süreçleri ve otomasyonlar</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Yeni İş Akışı
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        ) : (
        <>
        {/* Active Workflows */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-bold">Aktif İş Akışları</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.isActive ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">{workflow.name}</h3>
                    <p className="text-sm text-slate-500">{workflow.steps.length} adım</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workflow.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktif</span>
                  )}
                  <button
                    onClick={() => setEditingWorkflow(workflow)}
                    className="p-2 hover:bg-slate-200 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Instances */}
        <h2 className="font-bold text-lg mb-4">Devam Eden İşlemler</h2>
        <div className="grid gap-4">
          {activeInstances.map((instance) => (
            <motion.div
              key={instance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{instance.postTitle}</h3>
                  <p className="text-sm text-slate-500">{instance.workflow.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  instance.status === "active" ? "bg-blue-100 text-blue-700" :
                  instance.status === "completed" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {instance.status === "active" ? "Devam Ediyor" :
                   instance.status === "completed" ? "Tamamlandı" : "Reddedildi"}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-4">
                {instance.workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index < instance.currentStep ? "bg-green-100 text-green-600" :
                      index === instance.currentStep ? "bg-blue-100 text-blue-600 border-2 border-blue-500" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      {index < instance.currentStep ? <Check className="w-5 h-5" /> : getStepIcon(step.type)}
                    </div>
                    {index < instance.workflow.steps.length - 1 && (
                      <ArrowRight className={`w-4 h-4 mx-1 ${
                        index < instance.currentStep ? "text-green-500" : "text-slate-300"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Current Step Info */}
              {instance.currentStep < instance.workflow.steps.length && (
                <div className="p-4 bg-blue-50 rounded-xl mb-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Mevcut Adım:</span>{" "}
                    {instance.workflow.steps[instance.currentStep].name}
                    {instance.assignedTo && (
                      <span className="ml-2">• Atanan: {instance.assignedTo}</span>
                    )}
                  </p>
                </div>
              )}

              {/* History */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Son İşlemler</p>
                {instance.history.slice(-3).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400">{new Date(h.at).toLocaleString("tr-TR")}</span>
                    <span className="font-medium">{h.by}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      h.action === "approve" ? "bg-green-100 text-green-700" :
                      h.action === "reject" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {h.action}
                    </span>
                    {h.comment && <span className="text-slate-500">- {h.comment}</span>}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedInstance(instance)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Detayları Gör
                </button>
                {instance.status === "active" && (
                  <>
                    <button className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      Onayla
                    </button>
                    <button className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                      Reddet
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Yeni İş Akışı Oluştur</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İş Akışı Adı</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="örn: Standart İçerik Onayı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adımlar</label>
                  <div className="space-y-3">
                    {["Taslak", "Editör İncelemesi", "SEO Kontrolü", "Onay", "Yayınlama"].map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                        <select className="text-sm border border-slate-200 rounded px-2 py-1">
                          <option>Herkes</option>
                          <option>Editör</option>
                          <option>Admin</option>
                        </select>
                        <button className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-orange-300 hover:text-orange-600">
                      + Adım Ekle
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-slate-700">Otomatik yayınla (son adımda)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                    <span className="text-slate-700">Onay gerektir</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  Oluştur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

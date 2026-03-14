'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  ToggleRight,
  Save,
  X,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';

interface AiModel {
  id: string;
  name: string;
  slug: string;
  provider: string;
  modelId: string;
  description?: string;
  isActive: boolean;
  capabilities?: { seo?: boolean; analysis?: boolean; image?: boolean };
  tokensUsed: number;
  callsCount: number;
  createdAt: string;
}

interface FormData {
  name: string;
  slug: string;
  provider: string;
  modelId: string;
  apiKey: string;
  description: string;
  capabilities: { seo?: boolean; analysis?: boolean; image?: boolean };
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4)', icon: '🤖' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠' },
  { value: 'google', label: 'Google (Gemini)', icon: '🔮' },
  { value: 'local', label: 'Local Model', icon: '💻' },
];

export default function AiModelsAdmin() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    provider: 'openai',
    modelId: '',
    apiKey: '',
    description: '',
    capabilities: { seo: true, analysis: true },
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ai-models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/ai-models/${editingId}`
        : '/api/ai-models';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug.toLowerCase(),
        }),
      });

      if (response.ok) {
        setSuccessMessage(
          editingId ? 'Model güncellendi' : 'Model oluşturuldu'
        );
        resetForm();
        fetchModels();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('AI model save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu modeli silmek istediğinizden emin misiniz?')) return;

    try {
      await fetch(`/api/ai-models/${id}`, { method: 'DELETE' });
      fetchModels();
      setSuccessMessage('Model silindi');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('AI model delete error:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch(`/api/ai-models/${id}/toggle`, { method: 'PUT' });
      fetchModels();
    } catch (error) {
      console.error('AI model toggle error:', error);
    }
  };

  const handleEdit = (model: AiModel) => {
    setEditingId(model.id);
    setFormData({
      name: model.name,
      slug: model.slug,
      provider: model.provider,
      modelId: model.modelId,
      apiKey: '',
      description: model.description || '',
      capabilities: model.capabilities || { seo: true, analysis: true },
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      provider: 'openai',
      modelId: '',
      apiKey: '',
      description: '',
      capabilities: { seo: true, analysis: true },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary" size={32} />
            AI Model Yönetimi
          </h1>
          <p className="text-slate-400 mt-2">
            Yapay zeka modellerini ekle, düzenle ve yönet
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-primary/40"
        >
          <Plus size={20} /> Yeni Model Ekle
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2"
        >
          <Check size={20} /> {successMessage}
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Modeli Düzenle' : 'Yeni Model Ekle'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Model Name & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Model Adı
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                    placeholder="GPT-4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                    placeholder="gpt-4"
                    required
                  />
                </div>
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Sağlayıcı
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model ID */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Model ID
                </label>
                <input
                  type="text"
                  value={formData.modelId}
                  onChange={(e) =>
                    setFormData({ ...formData, modelId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                  placeholder="gpt-4-turbo"
                  required
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  API Anahtarı
                </label>
                <div className="relative">
                  <input
                    type={showApiKey === editingId ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none pr-10"
                    placeholder={editingId ? '••••••••••' : 'sk-...'}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowApiKey(
                        showApiKey === editingId ? null : editingId || 'new'
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showApiKey === editingId ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                  rows={3}
                  placeholder="Model hakkında bilgi..."
                />
              </div>

              {/* Capabilities */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3">
                  Yetenekler
                </label>
                <div className="space-y-2">
                  {[
                    {
                      key: 'seo',
                      label: 'SEO Analizi',
                    },
                    { key: 'analysis', label: 'Genel Analiz' },
                    {
                      key: 'image',
                      label: 'Görsel İşleme',
                    },
                  ].map((cap) => (
                    <label key={cap.key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={
                          formData.capabilities[cap.key as keyof typeof formData.capabilities] ||
                          false
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capabilities: {
                              ...formData.capabilities,
                              [cap.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-slate-300">{cap.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Models Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <Sparkles size={40} className="text-primary" />
          </div>
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-white/5 rounded-2xl">
          <AlertCircle className="mx-auto mb-4 text-slate-500" size={40} />
          <p className="text-slate-400">Henüz model eklenmedi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border transition-all ${model.isActive
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-slate-900/50 border-white/5 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {model.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {PROVIDERS.find((p) => p.value === model.provider)?.label}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(model.id)}
                  className={`p-2 rounded-lg transition-all ${model.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                    }`}
                >
                  <ToggleRight size={18} />
                </button>
              </div>

              {model.description && (
                <p className="text-sm text-slate-400 mb-4">
                  {model.description}
                </p>
              )}

              <div className="space-y-2 mb-6 pb-6 border-b border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Model ID:</span>
                  <span className="text-white font-mono">{model.modelId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Çağrı Sayısı:</span>
                  <span className="text-white font-bold">
                    {model.callsCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Token Kullanımı:</span>
                  <span className="text-white font-bold">
                    {model.tokensUsed.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(model)}
                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-bold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Düzenle
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Sil
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

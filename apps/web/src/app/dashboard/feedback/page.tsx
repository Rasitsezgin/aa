'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Bug,
  TrendingUp,
  ChevronUp,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Send,
  Sparkles,
  ArrowUpRight,
  Tag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────
interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bug';
  status: 'pending' | 'reviewing' | 'planned' | 'completed' | 'rejected';
  votes: number;
  priority: number;
  createdAt: string;
  hasVoted?: boolean;
}

const initialFeatures: FeatureRequest[] = [];

const categoryConfig = {
  feature: { label: 'Yeni Özellik', icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  improvement: { label: 'İyileştirme', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  bug: { label: 'Hata Bildirimi', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const statusConfig = {
  pending: { label: 'Beklemede', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  reviewing: { label: 'İnceleniyor', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  planned: { label: 'Planlandı', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  completed: { label: 'Tamamlandı', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rejected: { label: 'Reddedildi', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function FeedbackPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>(initialFeatures);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'date'>('votes');

  // New feature form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'feature' | 'improvement' | 'bug'>('feature');

  const handleVote = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, votes: f.hasVoted ? f.votes - 1 : f.votes + 1, hasVoted: !f.hasVoted }
          : f
      )
    );
  };

  const handleSubmit = () => {
    if (!newTitle.trim()) return;
    const newFeature: FeatureRequest = {
      id: `new-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      status: 'pending',
      votes: 1,
      priority: 0,
      createdAt: new Date().toISOString().split('T')[0],
      hasVoted: true,
    };
    setFeatures((prev) => [newFeature, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('feature');
    setShowNewForm(false);
  };

  const filtered = features
    .filter((f) => filter === 'all' || f.category === filter)
    .filter((f) => statusFilter === 'all' || f.status === statusFilter)
    .filter(
      (f) =>
        !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (sortBy === 'votes' ? b.votes - a.votes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  const stats = {
    total: features.length,
    planned: features.filter((f) => f.status === 'planned').length,
    completed: features.filter((f) => f.status === 'completed').length,
    totalVotes: features.reduce((sum, f) => sum + f.votes, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Sparkles size={24} className="text-purple-400" />
            </div>
            Özellik İstekleri & Geri Bildirim
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Yeni özellik öner, hata bildir veya mevcut isteklere oy ver
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Plus size={16} />
          Yeni Öneri
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Toplam Öneri', value: stats.total, icon: MessageSquare, color: 'text-blue-400' },
          { label: 'Planlandı', value: stats.planned, icon: Calendar, color: 'text-purple-400' },
          { label: 'Tamamlandı', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Toplam Oy', value: stats.totalVotes, icon: ChevronUp, color: 'text-amber-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'feature', label: '💡 Özellik' },
            { key: 'improvement', label: '📈 İyileştirme' },
            { key: 'bug', label: '🐛 Hata' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                filter === cat.key
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'Tüm Durumlar' },
            { key: 'pending', label: 'Beklemede' },
            { key: 'reviewing', label: 'İnceleniyor' },
            { key: 'planned', label: 'Planlandı' },
            { key: 'completed', label: 'Tamamlandı' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                statusFilter === s.key
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setSortBy('votes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${sortBy === 'votes' ? 'text-purple-400' : 'text-slate-500'}`}
          >
            En Çok Oy
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${sortBy === 'date' ? 'text-purple-400' : 'text-slate-500'}`}
          >
            En Yeni
          </button>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((feature) => {
            const cat = categoryConfig[feature.category];
            const sta = statusConfig[feature.status];
            const CatIcon = cat.icon;
            const StaIcon = sta.icon;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(feature.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all min-w-[56px] ${
                      feature.hasVoted
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-purple-500/30 hover:text-purple-400'
                    }`}
                  >
                    <ChevronUp size={16} strokeWidth={3} />
                    <span className="text-sm font-bold">{feature.votes}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${cat.bg} ${cat.color} ${cat.border} border`}>
                        <CatIcon size={10} />
                        {cat.label}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${sta.bg} ${sta.color}`}>
                        <StaIcon size={10} />
                        {sta.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{feature.description}</p>
                    <p className="text-[10px] text-slate-600 mt-2">{feature.createdAt}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">Sonuç bulunamadı</p>
          </div>
        )}
      </div>

      {/* New Feature Modal */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={20} className="text-purple-400" />
                  Yeni Öneri Gönder
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 block">Kategori</label>
                  <div className="flex gap-2">
                    {(
                      [
                        { key: 'feature', label: '💡 Yeni Özellik' },
                        { key: 'improvement', label: '📈 İyileştirme' },
                        { key: 'bug', label: '🐛 Hata Bildirimi' },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setNewCategory(cat.key)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          newCategory === cat.key
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 block">Başlık</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Kısa ve açıklayıcı bir başlık..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 block">Açıklama</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detayları açıklayın..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <Send size={14} />
                  Gönder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  BarChart3,
  Plus,
  Edit,
  Play,
  Pause,
  Trash2,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  Filter,
  Search,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';

// Types
interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  openRate?: number;
  clickRate?: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: Date;
  scheduledAt?: Date;
}

// Demo data
function generateTemplates(): EmailTemplate[] {
  return [
    { id: '1', name: 'Hoşgeldin Emaili', type: 'welcome', openRate: 42, clickRate: 8 },
    { id: '2', name: 'Terk Edilen Sepet', type: 'abandoned', openRate: 38, clickRate: 10 },
    { id: '3', name: 'Sipariş Onayı', type: 'confirmation', openRate: 45, clickRate: 12 },
    { id: '4', name: 'Kargo Bildirimi', type: 'shipping', openRate: 65, clickRate: 15 },
  ];
}

function generateCampaigns(): EmailCampaign[] {
  return [
    {
      id: '1',
      name: 'Kış İndirimi Kampanyası',
      status: 'sent',
      recipients: 5000,
      sent: 4950,
      openRate: 39.8,
      clickRate: 9.1,
      conversionRate: 1.9,
      createdAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      name: 'Terk Edilen Sepet Kurtarma',
      status: 'sending',
      recipients: 1200,
      sent: 850,
      openRate: 38.0,
      clickRate: 10.0,
      conversionRate: 2.9,
      createdAt: new Date('2025-02-01'),
    },
    {
      id: '3',
      name: 'Yeni Ürün Tanıtımı',
      status: 'scheduled',
      recipients: 8000,
      sent: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: new Date('2025-02-03'),
      scheduledAt: new Date('2025-02-10'),
    },
  ];
}

// Hooks
export function useEmailSystem() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setTemplates(generateTemplates());
      setCampaigns(generateCampaigns());
      setLoading(false);
    }, 300);
  }, []);
  
  return { templates, campaigns, loading };
}

// Campaign Card
function CampaignCard({ campaign, onAction }: { campaign: EmailCampaign; onAction: (action: string, id: string) => void }) {
  const statusConfig = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Taslak', icon: Edit },
    scheduled: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', label: 'Planlandı', icon: Clock },
    sending: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400', label: 'Gönderiliyor', icon: Send },
    sent: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', label: 'Gönderildi', icon: CheckCircle },
    paused: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', label: 'Duraklatıldı', icon: Pause },
  } as any;
  
  const cfg = statusConfig[campaign.status];
  const StatusIcon = cfg.icon;
  
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{campaign.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {campaign.createdAt.toLocaleDateString('tr-TR')}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Alıcı</span>
          <span className="font-semibold">{campaign.recipients}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Gönderilen</span>
          <span className="font-semibold">{campaign.sent}/{campaign.recipients}</span>
        </div>
        
        {campaign.sent > 0 && (
          <>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Eye className="w-4 h-4" />
                Açılma
              </span>
              <span className="font-semibold text-blue-600">{campaign.openRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MousePointer className="w-4 h-4" />
                Tıklama
              </span>
              <span className="font-semibold text-blue-600">{campaign.clickRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Dönüşüm
              </span>
              <span className="font-semibold text-green-600">{campaign.conversionRate.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>
      
      <div className="flex gap-2">
        {campaign.status === 'draft' && (
          <button
            onClick={() => onAction('send', campaign.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Send className="w-4 h-4" />
            Gönder
          </button>
        )}
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
          <Eye className="w-4 h-4" />
          Detay
        </button>
      </div>
    </motion.div>
  );
}

// Template Card
function TemplateCard({ template, onSelect }: { template: EmailTemplate; onSelect: (id: string) => void }) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      onClick={() => onSelect(template.id)}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{template.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{template.type}</p>
        </div>
      </div>
      
      {template.openRate && (
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Açılma</span>
            <span className="font-semibold">{template.openRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tıklama</span>
            <span className="font-semibold">{template.clickRate}%</span>
          </div>
        </div>
      )}
      
      <button className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm font-medium transition">
        Şablonla Kampanya Oluştur
      </button>
    </motion.div>
  );
}

// Main Component
export function AdvancedEmailSystem() {
  const { templates, campaigns, loading } = useEmailSystem();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const avgOpenRate = campaigns.filter(c => c.sent > 0).reduce((sum, c) => sum + c.openRate, 0) / Math.max(1, campaigns.filter(c => c.sent > 0).length);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="w-8 h-8 text-blue-600" />
            Email Sistemi
          </h2>
          <p className="text-gray-500 mt-1">Kampanya yönetimi, analitikler ve A/B testler</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Yeni Kampanya
        </button>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Toplam Gönderilen</p>
          <p className="text-3xl font-bold">{totalSent.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-gray-500 mt-1">Email</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Ort. Açılma</p>
          <p className="text-3xl font-bold">{avgOpenRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Açık oran</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Aktivkampanyalar</p>
          <p className="text-3xl font-bold">{campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}</p>
          <p className="text-xs text-gray-500 mt-1">Şu anda</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Şablonlar</p>
          <p className="text-3xl font-bold">{templates.length}</p>
          <p className="text-xs text-gray-500 mt-1">Kullanılabilir</p>
        </motion.div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Kampanyalar
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Şablonlar
        </button>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : activeTab === 'campaigns' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onAction={(action, id) => alert(`${action} işlemi: ${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => alert(`${template.name} seçildi`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdvancedEmailSystem;

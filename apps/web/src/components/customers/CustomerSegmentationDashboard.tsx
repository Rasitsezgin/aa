'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Crown,
  Heart,
  AlertCircle,
  Target,
  BarChart3,
  Mail,
  Settings,
  Download,
  Plus,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Calendar,
  Zap,
} from 'lucide-react';

// Types
interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  revenue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  lifetimeValue: number;
  churnRisk: number;
  icon: any;
  color: string;
  bgColor: string;
}

// Demo data
function generateSegmentData(): CustomerSegment[] {
  return [
    {
      id: 'champions',
      name: 'Şampiyonlar',
      description: 'Yüksek değer, sık alışveriş yapan müşteriler',
      count: 125,
      revenue: 450000,
      averageOrderValue: 450,
      purchaseFrequency: 15,
      lifetimeValue: 3600,
      churnRisk: 2,
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/20',
    },
    {
      id: 'loyal',
      name: 'Sadık Müşteriler',
      description: 'Düzenli alışveriş yapan, takdir edilen müşteriler',
      count: 320,
      revenue: 380000,
      averageOrderValue: 320,
      purchaseFrequency: 10,
      lifetimeValue: 3200,
      churnRisk: 8,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-500/20',
    },
    {
      id: 'potential',
      name: 'Potansiyel',
      description: 'Orta değer müşteriler, büyüme potansiyeli var',
      count: 450,
      revenue: 145000,
      averageOrderValue: 290,
      purchaseFrequency: 4,
      lifetimeValue: 1160,
      churnRisk: 35,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    },
    {
      id: 'at_risk',
      name: 'Riskli Müşteriler',
      description: 'Uzun süredir alışveriş yapmayan müşteriler',
      count: 280,
      revenue: 85000,
      averageOrderValue: 250,
      purchaseFrequency: 2,
      lifetimeValue: 500,
      churnRisk: 70,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-500/20',
    },
    {
      id: 'new',
      name: 'Yeni Müşteriler',
      description: 'Son 3 ayda ilk alışverişi yapan müşteriler',
      count: 180,
      revenue: 42000,
      averageOrderValue: 180,
      purchaseFrequency: 1,
      lifetimeValue: 180,
      churnRisk: 45,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-500/20',
    },
  ];
}

// Hook
export function useCustomerSegmentation() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setSegments(generateSegmentData());
      setLoading(false);
    }, 300);
  }, []);
  
  return { segments, loading };
}

// Segment Card
function SegmentCard({
  segment,
  onSelect,
}: {
  segment: CustomerSegment;
  onSelect: (id: string) => void;
}) {
  const Icon = segment.icon;
  const churnColor = segment.churnRisk > 50 ? 'text-red-600' : segment.churnRisk > 25 ? 'text-yellow-600' : 'text-green-600';
  
  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      onClick={() => onSelect(segment.id)}
      className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${segment.bgColor}`}>
          <Icon className={`w-6 h-6 ${segment.color}`} />
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full">
          {segment.count} müşteri
        </span>
      </div>
      
      <h3 className="font-bold text-lg mb-1">{segment.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{segment.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Toplam Gelir</span>
          <span className="font-semibold">₺{(segment.revenue / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Ort. Sipariş</span>
          <span className="font-semibold">₺{segment.averageOrderValue}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sıklık</span>
          <span className="font-semibold">{segment.purchaseFrequency}x/yıl</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Hayat Değeri</span>
          <span className="font-semibold">₺{segment.lifetimeValue}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Ayrılma Riski</span>
          <span className={`font-semibold ${churnColor}`}>{segment.churnRisk}%</span>
        </div>
      </div>
      
      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm font-medium transition">
        Detaylar
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Campaign Modal
function CampaignModal({
  segment,
  onClose,
}: {
  segment: CustomerSegment | null;
  onClose: () => void;
}) {
  if (!segment) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
      >
        <h3 className="text-2xl font-bold mb-4">
          {segment.name} kampanyası oluştur
        </h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Kampanya Adı</label>
            <input
              type="text"
              placeholder={`${segment.name} - Kasım 2025`}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Kampanya Türü</label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent">
              <option>Email Kampanyası</option>
              <option>SMS Kampanyası</option>
              <option>Push Notification</option>
              <option>Özel Teklif</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Hedef Müşteri Sayısı</label>
            <input
              type="text"
              value={segment.count}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tahmini Kâr</label>
            <input
              type="text"
              value={`₺${(segment.revenue * 0.15).toLocaleString('tr-TR')}`}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Kampanya Oluştur
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export function CustomerSegmentationDashboard() {
  const { segments, loading } = useCustomerSegmentation();
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  const totalCustomers = segments.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = segments.reduce((sum, s) => sum + s.revenue, 0);
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Müşteri Segmentasyonu
          </h2>
          <p className="text-gray-500 mt-1">RFM analizi ve hedefli kampanyalar</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Mail className="w-4 h-4" />
          Kampanya Gönder
        </button>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Toplam Müşteri</p>
          <p className="text-3xl font-bold">{totalCustomers}</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Toplam Gelir</p>
          <p className="text-3xl font-bold">₺{(totalRevenue / 1000).toFixed(0)}K</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Ort. Hayat Değeri</p>
          <p className="text-3xl font-bold">₺{Math.round(avgLTV)}</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Segmentler</p>
          <p className="text-3xl font-bold">{segments.length}</p>
        </motion.div>
      </div>
      
      {/* Segments Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map(segment => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onSelect={() => {
                setSelectedSegment(segment);
                setShowCampaignModal(true);
              }}
            />
          ))}
        </div>
      )}
      
      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          segment={selectedSegment}
          onClose={() => setShowCampaignModal(false)}
        />
      )}
    </div>
  );
}

export default CustomerSegmentationDashboard;

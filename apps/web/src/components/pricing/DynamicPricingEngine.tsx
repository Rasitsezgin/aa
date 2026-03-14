'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Settings,
  Target,
  Zap,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Edit,
  Trash2,
  DollarSign,
} from 'lucide-react';

// Types
interface PricingRule {
  id: string;
  name: string;
  type: 'demand' | 'competitor' | 'inventory' | 'seasonal' | 'segment';
  condition: string;
  priceAdjustment: number;
  active: boolean;
  appliedProducts: number;
  impact: number;
}

interface DynamicPrice {
  productId: string;
  productName: string;
  basePrice: number;
  currentPrice: number;
  adjustment: number;
  adjustmentPercent: number;
  reason: string;
  demand: 'low' | 'medium' | 'high';
  competitorPrice?: number;
  stockLevel: 'critical' | 'low' | 'normal' | 'high';
  lastUpdate: Date;
  forecast: number;
}

// Demo data
function generatePricingRules(): PricingRule[] {
  return [
    {
      id: 'rule1',
      name: 'Yüksek Talep Fiyat Artışı',
      type: 'demand',
      condition: 'Günlük satışlar > 50',
      priceAdjustment: 15,
      active: true,
      appliedProducts: 45,
      impact: 8500,
    },
    {
      id: 'rule2',
      name: 'Düşük Stok İndirim',
      type: 'inventory',
      condition: 'Stok < 10 birim',
      priceAdjustment: -20,
      active: true,
      appliedProducts: 12,
      impact: -2400,
    },
    {
      id: 'rule3',
      name: 'Rekabetçi Fiyatlandırma',
      type: 'competitor',
      condition: 'Rakip fiyatı 10% düşük',
      priceAdjustment: -8,
      active: true,
      appliedProducts: 78,
      impact: 3200,
    },
    {
      id: 'rule4',
      name: 'Mevsimsel Artış',
      type: 'seasonal',
      condition: 'Aralık (Kış)',
      priceAdjustment: 25,
      active: true,
      appliedProducts: 120,
      impact: 15000,
    },
    {
      id: 'rule5',
      name: 'VIP Müşteri İndirimi',
      type: 'segment',
      condition: 'VIP segmenti',
      priceAdjustment: -12,
      active: false,
      appliedProducts: 30,
      impact: -4500,
    },
  ];
}

function generateDynamicPrices(): DynamicPrice[] {
  return [
    {
      productId: 'p1',
      productName: 'Elektronik A',
      basePrice: 1000,
      currentPrice: 1150,
      adjustment: 150,
      adjustmentPercent: 15,
      reason: 'Yüksek talep + Mevsimsel',
      demand: 'high',
      competitorPrice: 1180,
      stockLevel: 'normal',
      lastUpdate: new Date(),
      forecast: 1200,
    },
    {
      productId: 'p2',
      productName: 'Tekstil B',
      basePrice: 500,
      currentPrice: 400,
      adjustment: -100,
      adjustmentPercent: -20,
      reason: 'Düşük stok, rakip fiyat',
      demand: 'low',
      competitorPrice: 420,
      stockLevel: 'critical',
      lastUpdate: new Date(),
      forecast: 380,
    },
    {
      productId: 'p3',
      productName: 'Aksesuar C',
      basePrice: 250,
      currentPrice: 250,
      adjustment: 0,
      adjustmentPercent: 0,
      reason: 'Optimal fiyat',
      demand: 'medium',
      competitorPrice: 260,
      stockLevel: 'normal',
      lastUpdate: new Date(),
      forecast: 255,
    },
  ];
}

// Rule Card
function RuleCard({
  rule,
  onEdit,
  onDelete,
}: {
  rule: PricingRule;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isPositiveImpact = rule.impact > 0;
  
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-5 border ${
        rule.active ? 'border-green-200 dark:border-green-500/30' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            {rule.active && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            {rule.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{rule.condition}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          rule.type === 'demand' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
          rule.type === 'competitor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
          rule.type === 'inventory' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
          rule.type === 'seasonal' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
          'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
        }`}>
          {rule.type === 'demand' ? 'Talep' : rule.type === 'competitor' ? 'Rekabet' : rule.type === 'inventory' ? 'Stok' : rule.type === 'seasonal' ? 'Mevsimsel' : 'Segment'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Fiyat Ayarı</span>
          <span className={`font-semibold ${rule.priceAdjustment > 0 ? 'text-green-600' : rule.priceAdjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {rule.priceAdjustment > 0 ? '+' : ''}{rule.priceAdjustment}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Uygulanan Ürün</span>
          <span className="font-semibold">{rule.appliedProducts}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tahmini Etki</span>
          <span className={`font-semibold flex items-center gap-1 ${isPositiveImpact ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveImpact ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
            ₺{Math.abs(rule.impact).toLocaleString('tr-TR')}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(rule.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm"
        >
          <Edit className="w-4 h-4" />
          Düzenle
        </button>
        <button
          onClick={() => onDelete(rule.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Sil
        </button>
      </div>
    </motion.div>
  );
}

// Price Card
function PriceCard({ price }: { price: DynamicPrice }) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{price.productName}</h3>
          <p className="text-xs text-gray-500">{price.productId}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          price.demand === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
          price.demand === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
          'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
        }`}>
          {price.demand === 'high' ? 'Yüksek' : price.demand === 'medium' ? 'Orta' : 'Düşük'} Talep
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Taban Fiyat</span>
          <span className="font-semibold">₺{price.basePrice}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Güncel Fiyat</span>
          <span className="text-lg font-bold">₺{price.currentPrice}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Ayarlama</span>
          <span className={`font-semibold ${price.adjustment > 0 ? 'text-green-600' : price.adjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {price.adjustment > 0 ? '+' : ''}{price.adjustment} ({price.adjustmentPercent > 0 ? '+' : ''}{price.adjustmentPercent}%)
          </span>
        </div>
        <div className="text-xs text-gray-500 py-2 border-t border-gray-200 dark:border-gray-700">
          {price.reason}
        </div>
      </div>
      
      <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
        Fiyat Düzenle
      </button>
    </motion.div>
  );
}

// Main Component
export function DynamicPricingEngine() {
  const [rules] = useState<PricingRule[]>(generatePricingRules());
  const [prices] = useState<DynamicPrice[]>(generateDynamicPrices());
  const [activeTab, setActiveTab] = useState<'rules' | 'prices'>('rules');
  
  const totalImpact = rules.reduce((sum, r) => sum + r.impact, 0);
  const activeRules = rules.filter(r => r.active).length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Dinamik Fiyatlandırma
          </h2>
          <p className="text-gray-500 mt-1">Talep, rekabet ve stok bazlı otomatik fiyat ayarlaması</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Yeni Kural
        </button>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Aktif Kurallar</p>
          <p className="text-3xl font-bold">{activeRules}/{rules.length}</p>
          <p className="text-xs text-gray-500 mt-1">Fiyatlandırma aktif</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Tahmini Gelir</p>
          <p className={`text-3xl font-bold ${totalImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalImpact > 0 ? '+' : ''}₺{(totalImpact / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">Aylık etki</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Denetlenen Ürün</p>
          <p className="text-3xl font-bold">{prices.length}</p>
          <p className="text-xs text-gray-500 mt-1">Dinamik fiyat</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Ort. Fiyat Değişim</p>
          <p className="text-3xl font-bold">+8.5%</p>
          <p className="text-xs text-gray-500 mt-1">Taban fiyata göre</p>
        </motion.div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Kurallar
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'prices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Fiyatlar
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'rules' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => alert(`${rule.name} düzenleniyor`)}
              onDelete={() => alert(`${rule.name} siliniyor`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map(price => (
            <PriceCard key={price.productId} price={price} />
          ))}
        </div>
      )}
    </div>
  );
}

export default DynamicPricingEngine;

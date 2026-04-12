'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Zap,
  BarChart3,
  RefreshCw,
  Plus,
  Minus,
  Filter,
  Download,
  Eye,
  Settings,
  Clock,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

// Types & Data
interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  status: 'normal' | 'low' | 'critical' | 'out_of_stock';
  daysUntilStockout: number;
  value: number;
  turnoverRate: number;
}

// Demo data
function generateInventoryData(): InventoryItem[] {
  return [
    { productId: 'p1', productName: 'Elektronik A', sku: 'SKU001', currentStock: 45, minimumStock: 20, reorderPoint: 30, status: 'normal', daysUntilStockout: 45, value: 6750, turnoverRate: 3.2 },
    { productId: 'p2', productName: 'Tekstil B', sku: 'SKU002', currentStock: 8, minimumStock: 15, reorderPoint: 50, status: 'critical', daysUntilStockout: 3, value: 240, turnoverRate: 4.1 },
    { productId: 'p3', productName: 'Aksesuar C', sku: 'SKU003', currentStock: 0, minimumStock: 10, reorderPoint: 25, status: 'out_of_stock', daysUntilStockout: 0, value: 0, turnoverRate: 2.8 },
    { productId: 'p4', productName: 'Kitap D', sku: 'SKU004', currentStock: 234, minimumStock: 50, reorderPoint: 100, status: 'normal', daysUntilStockout: 180, value: 11700, turnoverRate: 1.5 },
    { productId: 'p5', productName: 'Spor E', sku: 'SKU005', currentStock: 12, minimumStock: 25, reorderPoint: 75, status: 'low', daysUntilStockout: 8, value: 1200, turnoverRate: 3.8 },
  ];
}

// Hooks
export function useInventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'optimal'>('all');
  
  useEffect(() => {
    setTimeout(() => {
      const data = generateInventoryData();
      setItems(data);
      setAlerts(data.filter(item => item.status === 'critical' || item.status === 'out_of_stock'));
      setLoading(false);
    }, 300);
  }, []);
  
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });
  
  return { items: filteredItems, allItems: items, alerts, loading, filter, setFilter };
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config = {
    normal: { bg: 'bg-green-100', text: 'text-green-700', label: 'Normal', icon: CheckCircle },
    low: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Düşük', icon: AlertTriangle },
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Kritik', icon: AlertTriangle },
    out_of_stock: { bg: 'bg-red-200', text: 'text-red-800', label: 'Tükendi', icon: XCircle },
  } as any;
  
  const cfg = config[status];
  const Icon = cfg.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// Inventory Item Card
function InventoryCard({ item, onRestock }: { item: InventoryItem; onRestock: (id: string) => void }) {
  const stockPercentage = Math.min(100, (item.currentStock / (item.reorderPoint * 2)) * 100);
  
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{item.productName}</p>
          <p className="text-xs text-gray-500">{item.sku}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      
      {/* Stock Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Stok</span>
          <span className="font-semibold">{item.currentStock}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stockPercentage}%` }}
            className={`h-2 rounded-full ${
              item.status === 'normal' ? 'bg-green-500' :
              item.status === 'low' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Minimum: {item.minimumStock} | Yeniden sipariş: {item.reorderPoint}
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-gray-500 dark:text-gray-400">Değer</p>
          <p className="font-semibold">₺{(item.value / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-gray-500 dark:text-gray-400">Bitişe Kalan</p>
          <p className="font-semibold">{item.daysUntilStockout}g</p>
        </div>
      </div>
      
      {/* Action Button */}
      {item.status !== 'normal' && (
        <button
          onClick={() => onRestock(item.productId)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Truck className="w-4 h-4" />
          Yeniden Sipariş
        </button>
      )}
    </motion.div>
  );
}

// Main Component
export function InventoryManagementDashboard() {
  const { items, allItems, alerts, loading, filter, setFilter } = useInventoryManagement();
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  
  const totalValue = allItems.reduce((sum, item) => sum + item.value, 0);
  const alertCount = alerts.length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Envanter Yönetimi
          </h2>
          <p className="text-gray-500 mt-1">Stok seviyeleri, tahminleri ve otomatik yeniden sipariş</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Yeni Stok
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Toplam Ürün</p>
          <p className="text-3xl font-bold">{allItems.length}</p>
          <p className="text-xs text-gray-500 mt-1">Değer: ₺{(totalValue / 1000).toFixed(0)}K</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Kritik Uyarılar</p>
          <p className={`text-3xl font-bold ${alertCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {alertCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Acil eylem gerekli</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Düşük Stok</p>
          <p className="text-3xl font-bold text-yellow-600">
            {allItems.filter(i => i.status === 'low').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Uyarı durumunda</p>
        </motion.div>
        
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Tükenen Ürünler</p>
          <p className="text-3xl font-bold text-red-600">
            {allItems.filter(i => i.status === 'out_of_stock').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Stok dışında</p>
        </motion.div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'optimal', 'low', 'critical'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'optimal' ? 'Optimal' : f === 'low' ? 'Düşük' : 'Kritik'}
          </button>
        ))}
      </div>
      
      {/* Inventory Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <InventoryCard
              key={item.productId}
              item={item}
              onRestock={() => alert(`${item.productName} için yeniden sipariş oluşturuldu`)}
            />
          ))}
        </div>
      )}
      
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-500/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Acil Uyarılar ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.productId} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded">
                <div>
                  <p className="font-medium">{alert.productName}</p>
                  <p className="text-sm text-gray-500">
                    {alert.status === 'out_of_stock' ? 'Stok tükendi' : `${alert.daysUntilStockout} gün içinde tükenir`}
                  </p>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Sipariş Ver
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default InventoryManagementDashboard;

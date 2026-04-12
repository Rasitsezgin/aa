'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Plus,
  Settings,
  GripVertical,
  X,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Bell,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  RefreshCw,
  LucideIcon
} from 'lucide-react';

type WidgetSize = 'small' | 'medium' | 'large';
type WidgetType = 'stats' | 'chart' | 'list' | 'activity' | 'custom';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: LucideIcon;
  size: WidgetSize;
  isVisible: boolean;
  data?: {
    value?: string;
    change?: string;
    trend?: 'up' | 'down';
    labels?: string[];
    values?: number[];
    items?: Array<{ name?: string; value?: number; color?: string; id?: string; customer?: string; amount?: string; status?: string; text?: string; type?: string; stock?: number }>;
    count?: number;
  };
  refreshInterval?: number;
  color?: string;
}

const defaultWidgets: Widget[] = [
  {
    id: 'total-sales',
    type: 'stats',
    title: 'Toplam Satış',
    icon: DollarSign,
    size: 'small',
    isVisible: true,
    data: { value: '₺245,890', change: '+12.5%', trend: 'up' },
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'orders-today',
    type: 'stats',
    title: 'Bugünkü Siparişler',
    icon: ShoppingCart,
    size: 'small',
    isVisible: true,
    data: { value: '47', change: '+8', trend: 'up' },
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'total-products',
    type: 'stats',
    title: 'Toplam Ürün',
    icon: Package,
    size: 'small',
    isVisible: true,
    data: { value: '1,234', change: '+15', trend: 'up' },
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'active-customers',
    type: 'stats',
    title: 'Aktif Müşteri',
    icon: Users,
    size: 'small',
    isVisible: true,
    data: { value: '892', change: '+45', trend: 'up' },
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'sales-chart',
    type: 'chart',
    title: 'Satış Grafiği',
    icon: BarChart3,
    size: 'large',
    isVisible: true,
    data: {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      values: [45, 52, 38, 65, 73, 48, 62]
    },
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'platform-distribution',
    type: 'chart',
    title: 'Platform Dağılımı',
    icon: PieChart,
    size: 'medium',
    isVisible: true,
    data: {
      items: [
        { name: 'Trendyol', value: 45, color: '#F27A1A' },
        { name: 'Hepsiburada', value: 30, color: '#FF6000' },
        { name: 'Amazon', value: 15, color: '#FF9900' },
        { name: 'N11', value: 10, color: '#7B68EE' }
      ]
    },
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'recent-orders',
    type: 'list',
    title: 'Son Siparişler',
    icon: ShoppingCart,
    size: 'medium',
    isVisible: true,
    data: {
      items: [
        { id: 'TRY-001', customer: 'Ahmet Y.', amount: '₺450', status: 'pending' },
        { id: 'AMZ-002', customer: 'Mehmet D.', amount: '₺1,250', status: 'shipped' },
        { id: 'N11-003', customer: 'Fatma K.', amount: '₺890', status: 'delivered' }
      ]
    }
  },
  {
    id: 'ai-insights',
    type: 'activity',
    title: 'AI Önerileri',
    icon: Zap,
    size: 'medium',
    isVisible: true,
    data: {
      items: [
        { text: '12 üründe fiyat optimizasyonu önerisi', type: 'suggestion' },
        { text: '5 üründe stok azalması tahmin ediliyor', type: 'warning' },
        { text: 'Satış performansı %15 arttı', type: 'success' }
      ]
    },
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'low-stock',
    type: 'list',
    title: 'Düşük Stok',
    icon: TrendingDown,
    size: 'small',
    isVisible: false,
    data: {
      items: [
        { name: 'Ürün A', stock: 5 },
        { name: 'Ürün B', stock: 3 },
        { name: 'Ürün C', stock: 8 }
      ]
    }
  },
  {
    id: 'notifications',
    type: 'activity',
    title: 'Bildirimler',
    icon: Bell,
    size: 'small',
    isVisible: false,
    data: { count: 5 }
  }
];

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const visibleWidgets = widgets.filter(w => w.isVisible);
  const hiddenWidgets = widgets.filter(w => !w.isVisible);

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, isVisible: !w.isVisible } : w
    ));
  };

  const changeWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, isVisible: false } : w
    ));
  };

  const resetWidgets = () => {
    setWidgets(defaultWidgets);
  };

  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3';
    }
  };

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-foreground">{widget.data?.value}</div>
              <div className={`flex items-center gap-1 text-sm ${widget.data?.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                {widget.data?.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {widget.data?.change}
              </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${widget.color || 'from-slate-600 to-slate-700'} flex items-center justify-center`}>
              <widget.icon className="w-7 h-7 text-white" />
            </div>
          </div>
        );

      case 'chart':
        if (widget.data?.values) {
          // Bar chart
          const maxValue = Math.max(...widget.data.values);
          return (
            <div className="h-40 flex items-end justify-between gap-2">
              {widget.data.values.map((value: number, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxValue) * 100}%` }}
                    className={`w-full bg-gradient-to-t ${widget.color || 'from-purple-500 to-pink-500'} rounded-t-lg min-h-[4px]`}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-500">{widget.data?.labels?.[i]}</span>
                </div>
              ))}
            </div>
          );
        }
        // Pie chart representation
        return (
          <div className="flex flex-col gap-3">
            {widget.data?.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 dark:text-slate-300 flex-1">{item.name}</span>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {widget.data?.items?.map((item, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-200 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-foreground text-sm">{item.id || item.name}</div>
                  {item.customer && <div className="text-slate-600 dark:text-slate-400 text-xs">{item.customer}</div>}
                </div>
                <div className="text-right">
                  <div className="text-foreground text-sm">{item.amount || `Stok: ${item.stock}`}</div>
                  {item.status && (
                    <span className={`text-xs px-2 py-0.5 rounded ${item.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status === 'delivered' ? 'Teslim' :
                        item.status === 'shipped' ? 'Kargoda' : 'Bekliyor'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-3">
            {widget.data?.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${item.type === 'success' ? 'bg-green-500' :
                  item.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                <span className="text-slate-700 dark:text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-slate-400">Widget içeriği</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Widget&apos;ları</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Widget&apos;ları düzenleyerek kendi dashboard&apos;unuzu oluşturun</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetWidgets}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Sıfırla</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${isEditing
                ? 'bg-purple-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Settings className={`w-4 h-4 ${isEditing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isEditing ? 'Düzenleniyor' : 'Düzenle'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Widget Ekle</span>
            </motion.button>
          </div>
        </div>

        {/* Editing Mode Info */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-2xl p-4 flex items-center gap-4">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Düzenleme modu aktif. Widget&apos;ları taşıyabilir, boyutlarını değiştirebilir veya gizleyebilirsiniz.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${getSizeClasses(widget.size)} group relative bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4 ${isEditing ? 'cursor-move hover:border-purple-500/50' : ''
                }`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <GripVertical className="w-4 h-4 text-slate-600" />
                  )}
                  <widget.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="font-medium text-slate-700 dark:text-slate-300">{widget.title}</h3>
                </div>

                {/* Widget Actions */}
                {isEditing && (
                  <div className="flex items-center gap-1">
                    {/* Size Toggle */}
                    <select
                      value={widget.size}
                      onChange={(e) => changeWidgetSize(widget.id, e.target.value as WidgetSize)}
                      className="appearance-none px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                    >
                      <option value="small">Küçük</option>
                      <option value="medium">Orta</option>
                      <option value="large">Büyük</option>
                    </select>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <button className="p-1 text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Widget Content */}
              {renderWidgetContent(widget)}
            </motion.div>
          ))}
        </div>

        {/* Hidden Widgets */}
        {hiddenWidgets.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Gizli Widget&apos;lar ({hiddenWidgets.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {hiddenWidgets.map((widget) => (
                <motion.button
                  key={widget.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                >
                  <widget.icon className="w-4 h-4" />
                  {widget.title}
                  <Eye className="w-4 h-4 ml-2 text-slate-600" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Add Widget Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Widget Ekle</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {widgets.map((widget) => (
                    <motion.button
                      key={widget.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        toggleWidgetVisibility(widget.id);
                        setShowAddModal(false);
                      }}
                      disabled={widget.isVisible}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${widget.isVisible
                        ? 'bg-slate-200 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/50 opacity-50 cursor-not-allowed'
                        : 'bg-slate-200 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:border-purple-500/50'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color || 'from-slate-600 to-slate-700'} flex items-center justify-center`}>
                        <widget.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{widget.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{
                          widget.type === 'stats' ? 'İstatistik Widget' :
                            widget.type === 'chart' ? 'Grafik Widget' :
                              widget.type === 'list' ? 'Liste Widget' :
                                'Aktivite Widget'
                        }</div>
                      </div>
                      {widget.isVisible ? (
                        <span className="text-xs text-green-600 dark:text-green-400">Aktif</span>
                      ) : (
                        <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

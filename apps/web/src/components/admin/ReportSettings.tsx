'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Calendar,
  Clock,
  Send,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Users,
  Target,
  BarChart3,
  PieChart,
  Zap,
  Crown,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  Bell,
  BellOff,
  Sparkles,
  FileText,
  Store,
} from 'lucide-react';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'yearly';
type PlanType = 'professional' | 'enterprise';

interface ReportSchedule {
  period: ReportPeriod;
  enabled: boolean;
  lastSent?: Date;
  nextSend?: Date;
}

interface ReportPreviewData {
  storeName: string;
  period: ReportPeriod;
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  marketplaces: { name: string; revenue: number; growth: number }[];
  recommendations: { title: string; impact: string; priority: 'high' | 'medium' | 'low' }[];
}

const periodConfig: Record<ReportPeriod, { label: string; description: string; icon: any; cronText: string }> = {
  daily: { label: 'Günlük', description: 'Her gün saat 08:00', icon: Clock, cronText: 'Her gün' },
  weekly: { label: 'Haftalık', description: 'Her Pazartesi 08:00', icon: Calendar, cronText: 'Haftada 1' },
  monthly: { label: 'Aylık', description: 'Her ayın 1\'i 08:00', icon: Calendar, cronText: 'Ayda 1' },
  quarterly: { label: '3 Aylık', description: 'Her 3 ayda bir', icon: BarChart3, cronText: '3 ayda 1' },
  'semi-annual': { label: '6 Aylık', description: 'Her 6 ayda bir', icon: PieChart, cronText: '6 ayda 1' },
  yearly: { label: 'Yıllık', description: 'Her yılın başında', icon: Target, cronText: 'Yılda 1' },
};

const planFeatures: Record<PlanType, { name: string; periods: ReportPeriod[]; features: string[] }> = {
  professional: {
    name: 'Profesyonel',
    periods: ['weekly', 'monthly', 'quarterly', 'yearly'],
    features: [
      'Satış ve sipariş analizi',
      'Pazaryeri performansı',
      'En çok satan ürünler',
      'Stok uyarıları',
      'Kategori analizi',
      'AI önerileri',
      'Hedef takibi',
    ],
  },
  enterprise: {
    name: 'Kurumsal',
    periods: ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'yearly'],
    features: [
      'Tüm Pro özellikleri',
      'Günlük raporlar',
      '6 aylık raporlar',
      'Müşteri analizi',
      'Rakip analizi',
      'Pazar payı takibi',
      'Fiyat karşılaştırması',
      'Arama sıralaması takibi',
      'VIP destek',
    ],
  },
};

// Demo report preview data
const demoPreviewData: ReportPreviewData = {
  storeName: 'Örnek Mağaza',
  period: 'monthly',
  totalRevenue: 45230.50,
  revenueChange: 12.5,
  totalOrders: 328,
  ordersChange: 8.3,
  topProducts: [
    { name: 'Wireless Headphones', sales: 156, revenue: 18720 },
    { name: 'USB-C Cables', sales: 342, revenue: 10260 },
    { name: 'Phone Stand', sales: 234, revenue: 4680 },
  ],
  marketplaces: [
    { name: 'Trendyol', revenue: 18500, growth: 15.2 },
    { name: 'Amazon', revenue: 16850, growth: -2.1 },
    { name: 'Hepsiburada', revenue: 9880, growth: 28.5 },
  ],
  recommendations: [
    {
      title: 'Stok Uyarısı',
      impact: 'USB-C Cables stoğu %15 azaldı ve trend devam ediyor',
      priority: 'high',
    },
    {
      title: 'Fırsat',
      impact: 'Wireless Headphones Trendyol\'da daha yüksek fiyatla satılabilir',
      priority: 'medium',
    },
  ],
};

function ReportPreviewCard({ data }: { data: ReportPreviewData }) {
  const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR')}`;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-500/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Rapor Önizlemesi
        </h4>
        <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
          {periodConfig[data.period].label}
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Toplam Gelir</div>
          <div className="font-bold text-lg">{formatCurrency(data.totalRevenue)}</div>
          <div className={`text-xs ${data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(data.revenueChange)}%
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Toplam Sipariş</div>
          <div className="font-bold text-lg">{data.totalOrders.toLocaleString()}</div>
          <div className={`text-xs ${data.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(data.ordersChange)}%
          </div>
        </div>
      </div>

      {/* Top Products Mini List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
        <div className="text-xs font-semibold text-gray-500 mb-2">🏆 En Çok Satanlar</div>
        {data.topProducts.slice(0, 3).map((product, i) => (
          <div key={i} className="flex items-center justify-between py-1 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                {i + 1}
              </span>
              <span className="truncate max-w-[120px]">{product.name}</span>
            </span>
            <span className="text-gray-500 text-xs">{product.sales} adet</span>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">🤖 AI Önerileri</div>
        {data.recommendations.slice(0, 2).map((rec, i) => (
          <div
            key={i}
            className={`text-xs p-2 rounded-lg ${rec.priority === 'high'
                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
                : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
              }`}
          >
            <div className="font-semibold">{rec.title}</div>
            <div className="opacity-80">{rec.impact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({
  period,
  schedule,
  planType,
  onToggle,
  onSendNow,
}: {
  period: ReportPeriod;
  schedule: ReportSchedule;
  planType: PlanType;
  onToggle: () => void;
  onSendNow: () => void;
}) {
  const config = periodConfig[period];
  const Icon = config.icon;
  const isAvailable = planFeatures[planType].periods.includes(period);

  return (
    <motion.div
      whileHover={{ scale: isAvailable ? 1.02 : 1 }}
      className={`
        relative p-4 rounded-xl border transition-all
        ${isAvailable
          ? schedule.enabled
            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
          : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
        }
      `}
    >
      {!isAvailable && (
        <div className="absolute top-2 right-2">
          <span className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            Kurumsal
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${schedule.enabled ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Icon className={`w-5 h-5 ${schedule.enabled ? 'text-green-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h4 className="font-semibold">{config.label} Rapor</h4>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>

        {isAvailable && (
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${schedule.enabled
                ? 'bg-green-100 dark:bg-green-500/20 text-green-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600'
              }`}
          >
            {schedule.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {isAvailable && schedule.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-green-200 dark:border-green-500/30"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              {schedule.lastSent && (
                <span>Son: {schedule.lastSent.toLocaleDateString('tr-TR')}</span>
              )}
            </div>
            <button
              onClick={onSendNow}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
            >
              <Send className="w-3 h-3" />
              Şimdi Gönder
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ReportSettings() {
  const [planType, setPlanType] = useState<PlanType>('professional');
  const [email, setEmail] = useState('magaza@example.com');
  const [schedules, setSchedules] = useState<Record<ReportPeriod, ReportSchedule>>({
    daily: { period: 'daily', enabled: false },
    weekly: { period: 'weekly', enabled: true, lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    monthly: { period: 'monthly', enabled: true, lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    quarterly: { period: 'quarterly', enabled: false },
    'semi-annual': { period: 'semi-annual', enabled: false },
    yearly: { period: 'yearly', enabled: true, lastSent: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
  });
  const [showPreview, setShowPreview] = useState(true);
  const [previewPeriod, setPreviewPeriod] = useState<ReportPeriod>('monthly');
  const [sending, setSending] = useState<ReportPeriod | null>(null);
  const [sentNotification, setSentNotification] = useState<string | null>(null);

  const toggleSchedule = (period: ReportPeriod) => {
    setSchedules(prev => ({
      ...prev,
      [period]: { ...prev[period], enabled: !prev[period].enabled },
    }));
  };

  const sendNow = async (period: ReportPeriod) => {
    setSending(period);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(null);
    setSentNotification(`${periodConfig[period].label} rapor ${email} adresine gönderildi!`);
    setTimeout(() => setSentNotification(null), 4000);
  };

  const enabledCount = Object.values(schedules).filter(s => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-7 h-7 text-indigo-600" />
            Mağaza Analiz Raporları
          </h2>
          <p className="text-gray-500 mt-1">
            Detaylı performans raporlarını otomatik e-posta ile alın
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{enabledCount} aktif rapor</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {sentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-xl"
          >
            <CheckCircle className="w-5 h-5" />
            {sentNotification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Plan Seçimi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(['professional', 'enterprise'] as PlanType[]).map(plan => (
                <button
                  key={plan}
                  onClick={() => setPlanType(plan)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${planType === plan
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {plan === 'enterprise' ? (
                      <Building2 className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Zap className="w-5 h-5 text-indigo-600" />
                    )}
                    <span className="font-bold">{planFeatures[plan].name}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {planFeatures[plan].periods.length} farklı rapor periyodu
                  </p>
                  {planType === plan && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Özellikler:</p>
                      <div className="flex flex-wrap gap-1">
                        {planFeatures[plan].features.slice(0, 4).map((f, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                        {planFeatures[plan].features.length > 4 && (
                          <span className="text-xs text-indigo-600">+{planFeatures[plan].features.length - 4} daha</span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              E-posta Adresi
            </h3>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="rapor@example.com"
              />
              <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors">
                Kaydet
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Raporlar bu e-posta adresine gönderilecek
            </p>
          </div>

          {/* Report Schedules */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Rapor Zamanlaması
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(periodConfig) as ReportPeriod[]).map(period => (
                <ScheduleCard
                  key={period}
                  period={period}
                  schedule={schedules[period]}
                  planType={planType}
                  onToggle={() => toggleSchedule(period)}
                  onSendNow={() => sendNow(period)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* Preview Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Rapor Önizleme
              </h3>
              {showPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  {/* Period Selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {planFeatures[planType].periods.map(period => (
                      <button
                        key={period}
                        onClick={() => setPreviewPeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewPeriod === period
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                          }`}
                      >
                        {periodConfig[period].label}
                      </button>
                    ))}
                  </div>

                  <ReportPreviewCard data={{ ...demoPreviewData, period: previewPeriod }} />

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => sendNow(previewPeriod)}
                      disabled={sending === previewPeriod}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
                    >
                      {sending === previewPeriod ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Send className="w-4 h-4" />
                          </motion.div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Test Gönder
                        </>
                      )}
                    </button>
                    <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Report Features */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Rapor İçerikleri
            </h3>
            <ul className="space-y-2">
              {planFeatures[planType].features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {planType === 'professional' && (
              <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors">
                ⬆️ Kurumsal'a Yükselt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportSettings;

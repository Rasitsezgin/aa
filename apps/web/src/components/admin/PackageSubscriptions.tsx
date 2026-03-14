'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  User,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Clock,
  Eye,
  Search,
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  CreditCard,
  Star,
  Zap,
  Crown,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Download,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Copy,
} from 'lucide-react';

// Types
export type SubscriptionStatus = 
  | 'pending' 
  | 'active' 
  | 'cancelled' 
  | 'expired'
  | 'suspended';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PackageType = 'starter' | 'professional' | 'enterprise';

export interface PackageSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  companyName?: string;
  packageType: PackageType;
  paymentMethod: 'credit_card' | 'bank_transfer';
  paymentStatus: PaymentStatus;
  status: SubscriptionStatus;
  amount: number;
  billingPeriod: 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// Package Config
const packageConfig: Record<PackageType, { 
  name: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
  bgColor: string;
  price: { monthly: number; yearly: number };
}> = {
  starter: { 
    name: 'Başlangıç', 
    icon: Zap, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    price: { monthly: 299, yearly: 2990 }
  },
  professional: { 
    name: 'Profesyonel', 
    icon: Star, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    price: { monthly: 599, yearly: 5990 }
  },
  enterprise: { 
    name: 'Kurumsal', 
    icon: Crown, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    price: { monthly: 1299, yearly: 12990 }
  },
};

// Status Config
const statusConfig: Record<SubscriptionStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Onay Bekliyor', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: Clock },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: CheckCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: XCircle },
  expired: { label: 'Süresi Doldu', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', icon: Clock },
  suspended: { label: 'Askıya Alındı', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', icon: AlertCircle },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Ödeme Bekliyor', color: 'text-orange-600' },
  paid: { label: 'Ödendi', color: 'text-green-600' },
  failed: { label: 'Başarısız', color: 'text-red-600' },
  refunded: { label: 'İade Edildi', color: 'text-gray-600' },
};

// Subscription Card Component
function SubscriptionCard({
  subscription,
  onApprove,
  onReject,
  onViewDetails,
}: {
  subscription: PackageSubscription;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (sub: PackageSubscription) => void;
}) {
  const pkg = packageConfig[subscription.packageType];
  const status = statusConfig[subscription.status];
  const StatusIcon = status.icon;
  const PackageIcon = pkg.icon;
  const isPending = subscription.status === 'pending';
  
  const createdTime = useMemo(() => subscription.createdAt.getTime(), [subscription.createdAt]);
  const timeSince = Math.floor((Date.now() - createdTime) / (1000 * 60));
  const timeString = timeSince < 60 
    ? `${timeSince} dakika önce` 
    : timeSince < 1440 
      ? `${Math.floor(timeSince / 60)} saat önce`
      : `${Math.floor(timeSince / 1440)} gün önce`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden
        ${isPending ? 'border-orange-300 dark:border-orange-500/50' : 'border-gray-200 dark:border-gray-700'}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${pkg.bgColor}`}>
              <PackageIcon className={`w-5 h-5 ${pkg.color}`} />
            </div>
            <div>
              <span className={`font-bold ${pkg.color}`}>{pkg.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({subscription.billingPeriod === 'yearly' ? 'Yıllık' : 'Aylık'})
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">{subscription.userName}</p>
            {subscription.companyName && (
              <p className="text-sm text-gray-500">{subscription.companyName}</p>
            )}
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ₺{subscription.amount.toLocaleString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>{subscription.userEmail}</span>
          </div>
          <button 
            onClick={() => copyToClipboard(subscription.userEmail)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <Copy className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{subscription.userPhone}</span>
          </div>
          <button 
            onClick={() => copyToClipboard(subscription.userPhone.replace(/\s/g, ''))}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <Copy className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{timeString}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {subscription.paymentMethod === 'credit_card' ? (
            <span className="flex items-center gap-1 text-blue-600">
              <CreditCard className="w-4 h-4" />
              Kredi Kartı
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-600">
              <Building2 className="w-4 h-4" />
              Havale/EFT
            </span>
          )}
          <span className={`ml-2 ${paymentStatusConfig[subscription.paymentStatus].color}`}>
            • {paymentStatusConfig[subscription.paymentStatus].label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => onViewDetails(subscription)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Detay
        </button>

        {isPending && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onApprove(subscription.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Onayla
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReject(subscription.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Reddet
            </motion.button>
          </>
        )}
      </div>

      {/* Pending indicator */}
      {isPending && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">
              {subscription.paymentMethod === 'bank_transfer' 
                ? 'Havale onayı bekliyor - Admin onayı gerekli'
                : 'Ödeme doğrulaması bekliyor'}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      {subscription.notes && (
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
            <span className="text-sm text-blue-700 dark:text-blue-400">{subscription.notes}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Detail Modal
function SubscriptionDetailModal({
  subscription,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onCancel,
}: {
  subscription: PackageSubscription;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  
  const pkg = packageConfig[subscription.packageType];
  const status = statusConfig[subscription.status];
  const StatusIcon = status.icon;
  const PackageIcon = pkg.icon;
  const isPending = subscription.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${pkg.bgColor}`}>
                <PackageIcon className={`w-6 h-6 ${pkg.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{pkg.name} Paket</h2>
                <p className="text-gray-500">Abonelik Detayı</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Abonelik Durumu</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Ödeme</p>
              <p className="text-2xl font-bold text-blue-600">₺{subscription.amount.toLocaleString('tr-TR')}</p>
              <p className="text-sm text-gray-500">
                {subscription.billingPeriod === 'yearly' ? 'Yıllık' : 'Aylık'}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ad Soyad</p>
                <p className="font-medium">{subscription.userName}</p>
              </div>
              {subscription.companyName && (
                <div>
                  <p className="text-gray-500">Şirket</p>
                  <p className="font-medium">{subscription.companyName}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">E-posta</p>
                <p className="font-medium">{subscription.userEmail}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefon</p>
                <p className="font-medium">{subscription.userPhone}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {subscription.paymentMethod === 'credit_card' ? (
                <CreditCard className="w-5 h-5 text-green-600" />
              ) : (
                <Building2 className="w-5 h-5 text-green-600" />
              )}
              Ödeme Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ödeme Yöntemi</p>
                <p className="font-medium">
                  {subscription.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Havale/EFT'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Ödeme Durumu</p>
                <p className={`font-medium ${paymentStatusConfig[subscription.paymentStatus].color}`}>
                  {paymentStatusConfig[subscription.paymentStatus].label}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Period */}
          {subscription.startDate && (
            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Abonelik Dönemi
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Başlangıç</p>
                  <p className="font-medium">{subscription.startDate.toLocaleDateString('tr-TR')}</p>
                </div>
                {subscription.endDate && (
                  <div>
                    <p className="text-gray-500">Bitiş</p>
                    <p className="font-medium">{subscription.endDate.toLocaleDateString('tr-TR')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {subscription.notes && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                Müşteri Notu
              </h3>
              <p className="text-sm">{subscription.notes}</p>
            </div>
          )}

          {/* Admin Notes */}
          {isPending && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Admin Notu
              </h3>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
                placeholder="İsteğe bağlı not ekleyin..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
          )}

          {/* Actions for pending */}
          {isPending && !showRejectForm && (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onApprove(subscription.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                Aboneliği Onayla
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRejectForm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
              >
                <XCircle className="w-5 h-5" />
                Reddet
              </motion.button>
            </div>
          )}

          {/* Actions for active */}
          {subscription.status === 'active' && (
            <div className="flex gap-3">
              <button
                onClick={() => onSuspend(subscription.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700"
              >
                <AlertCircle className="w-5 h-5" />
                Askıya Al
              </button>
              <button
                onClick={() => onCancel(subscription.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
              >
                <XCircle className="w-5 h-5" />
                İptal Et
              </button>
            </div>
          )}

          {/* Reject form */}
          {showRejectForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl space-y-3"
            >
              <h4 className="font-semibold text-red-700 dark:text-red-400">Red Sebebi</h4>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Lütfen red sebebini belirtin..."
                className="w-full px-4 py-3 rounded-xl border border-red-300 dark:border-red-500/50 bg-white dark:bg-gray-800"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onReject(subscription.id);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold"
                >
                  Reddet ve Bildir
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export function PackageSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<PackageSubscription | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'cancelled'>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | PackageType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = 
      filter === 'all' ||
      sub.status === filter;

    const matchesPackage =
      packageFilter === 'all' ||
      sub.packageType === packageFilter;

    const matchesSearch =
      !searchQuery ||
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userPhone.includes(searchQuery) ||
      (sub.companyName && sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPackage && matchesSearch;
  });

  const handleApprove = (id: string) => {
    setSubscriptions(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              status: 'active' as SubscriptionStatus,
              paymentStatus: 'paid' as PaymentStatus,
              startDate: new Date(),
              endDate: new Date(Date.now() + (s.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
              approvedAt: new Date(),
              approvedBy: 'Admin',
            }
          : s
      )
    );
    setSelectedSubscription(null);
    showNotificationToast('✅ Abonelik onaylandı ve müşteriye bildirim gönderildi!');
  };

  const handleReject = (id: string) => {
    setSubscriptions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: 'cancelled' as SubscriptionStatus, paymentStatus: 'refunded' as PaymentStatus }
          : s
      )
    );
    setSelectedSubscription(null);
    showNotificationToast('❌ Abonelik reddedildi ve müşteriye bildirim gönderildi.');
  };

  const handleSuspend = (id: string) => {
    setSubscriptions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: 'suspended' as SubscriptionStatus }
          : s
      )
    );
    setSelectedSubscription(null);
    showNotificationToast('⏸️ Abonelik askıya alındı.');
  };

  const handleCancel = (id: string) => {
    setSubscriptions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: 'cancelled' as SubscriptionStatus }
          : s
      )
    );
    setSelectedSubscription(null);
    showNotificationToast('🚫 Abonelik iptal edildi.');
  };

  const showNotificationToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Stats
  const stats = {
    total: subscriptions.length,
    pending: subscriptions.filter(s => s.status === 'pending').length,
    active: subscriptions.filter(s => s.status === 'active').length,
    monthlyRevenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.billingPeriod === 'monthly' ? s.amount : s.amount / 12), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" />
            Paket Abonelikleri
          </h2>
          <p className="text-gray-500 mt-1">Müşteri paket siparişlerini yönetin</p>
        </div>

        {pendingCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-full"
          >
            <Bell className="w-5 h-5" />
            <span className="font-semibold">{pendingCount} onay bekleyen abonelik</span>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Abonelik', value: stats.total, icon: Package, color: 'bg-blue-500' },
          { label: 'Onay Bekleyen', value: stats.pending, icon: Clock, color: 'bg-orange-500' },
          { label: 'Aktif Abonelik', value: stats.active, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Aylık Gelir', value: `₺${Math.round(stats.monthlyRevenue).toLocaleString('tr-TR')}`, icon: Star, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="İsim, e-posta, telefon veya şirket ara..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'pending', label: 'Onay Bekleyen' },
            { id: 'active', label: 'Aktif' },
            { id: 'cancelled', label: 'İptal' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'pending' | 'active' | 'cancelled')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Package Filter */}
          {[
            { id: 'all', label: 'Tüm Paketler', color: 'gray' },
            { id: 'starter', label: 'Başlangıç', color: 'blue' },
            { id: 'professional', label: 'Profesyonel', color: 'purple' },
            { id: 'enterprise', label: 'Kurumsal', color: 'amber' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPackageFilter(p.id as 'all' | PackageType)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                packageFilter === p.id
                  ? `bg-${p.color}-600 text-white`
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredSubscriptions.map(subscription => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={setSelectedSubscription}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Bu kategoride abonelik bulunamadı.</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSubscription && (
          <SubscriptionDetailModal
            subscription={selectedSubscription}
            onClose={() => setSelectedSubscription(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 px-6 py-4 bg-gray-900 text-white rounded-xl shadow-lg z-50"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PackageSubscriptions;

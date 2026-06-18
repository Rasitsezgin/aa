'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  CreditCard,
  Building2,
  Check,
  X,
  Clock,
  Eye,
  Search,
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  User,
  MapPin,
  DollarSign,
  FileText,
  MessageSquare,
  RefreshCw,
  Download,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

// Types
export type OrderStatus = 
  | 'pending_payment' 
  | 'payment_confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentMethod = 'credit_card' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
  };
  transferReceipt?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
}

// Status config
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending_payment: { label: 'Ödeme Bekleniyor', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: Clock },
  payment_confirmed: { label: 'Ödeme Onaylandı', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: CheckCircle },
  processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: RefreshCw },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: Check },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: XCircle },
  refunded: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', icon: RefreshCw },
};

// Order Card Component
function OrderCard({
  order,
  onApprove,
  onReject,
  onViewDetails,
}: {
  order: Order;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (order: Order) => void;
}) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const isPending = order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer';
  const createdTime = useMemo(() => order.createdAt.getTime(), [order.createdAt]);
  const timeSince = Math.floor((Date.now() - createdTime) / (1000 * 60));
  const timeString = timeSince < 60 
    ? `${timeSince} dakika önce` 
    : `${Math.floor(timeSince / 60)} saat önce`;

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-blue-600">#{order.orderNumber}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <span className="text-sm text-gray-500">{timeString}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            {order.paymentMethod === 'credit_card' ? (
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <CreditCard className="w-4 h-4" />
                Kredi Kartı
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-orange-600">
                <Building2 className="w-4 h-4" />
                Havale/EFT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="space-y-2">
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="truncate flex-1">{item.name} {item.variant && `(${item.variant})`}</span>
              <span className="ml-2 text-gray-500">x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-gray-500">+{order.items.length - 2} ürün daha</p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Toplam</span>
          <span className="text-xl font-bold text-blue-600">
            ₺{order.total.toLocaleString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-2">
        <button
          onClick={() => onViewDetails(order)}
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
              onClick={() => onApprove(order.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Onayla
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReject(order.id)}
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
              Havale onayı bekliyor - Admin onayı gerekli
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Order Detail Modal
function OrderDetailModal({
  order,
  onClose,
  onApprove,
  onReject,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const isPending = order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer';

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
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                Sipariş Detayı
              </h2>
              <p className="text-gray-500 mt-1">#{order.orderNumber}</p>
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
              <p className="text-sm text-gray-500 mb-2">Sipariş Durumu</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Ödeme Yöntemi</p>
              <div className="flex items-center gap-2">
                {order.paymentMethod === 'credit_card' ? (
                  <>
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Kredi Kartı</span>
                    <span className="text-xs text-green-600 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded">Otomatik</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">Havale/EFT</span>
                    <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded">Manuel Onay</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ad Soyad</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">E-posta</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-gray-500">Telefon</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Teslimat Adresi
            </h3>
            <p className="text-sm">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.address}<br />
              {order.shippingAddress.district} / {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">📦 Sipariş Kalemleri</h3>
            <div className="space-y-2">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam</span>
                <span>₺{order.subtotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo</span>
                <span>{order.shippingCost === 0 ? 'Ücretsiz' : `₺${order.shippingCost}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-₺{order.discount.toLocaleString('tr-TR')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 font-bold text-lg">
                <span>Toplam</span>
                <span className="text-blue-600">₺{order.total.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Transfer Receipt */}
          {order.paymentMethod === 'bank_transfer' && order.transferReceipt && (
            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Transfer Dekontu
              </h3>
              <button className="flex items-center gap-2 text-purple-600 hover:underline">
                <Download className="w-4 h-4" />
                {order.transferReceipt}
              </button>
            </div>
          )}

          {/* Admin Notes */}
          {isPending && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
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

          {/* Actions for pending bank transfer */}
          {isPending && !showRejectForm && (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onApprove(order.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                Ödemeyi Onayla
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
                    onReject(order.id);
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

          {/* Status update for confirmed orders */}
          {order.status === 'payment_confirmed' && (
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateStatus(order.id, 'processing')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                <RefreshCw className="w-5 h-5" />
                Hazırlamaya Başla
              </button>
            </div>
          )}

          {order.status === 'processing' && (
            <div className="flex gap-3">
              <button
                onClick={() => onUpdateStatus(order.id, 'shipped')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
              >
                <Truck className="w-5 h-5" />
                Kargoya Ver
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Admin Order Management Component
export function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'processing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const mapDbStatus = (status: string): OrderStatus => {
    const map: Record<string, OrderStatus> = {
      PENDING: 'pending_payment',
      CONFIRMED: 'payment_confirmed',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
      RETURNED: 'refunded',
    };
    return map[status] ?? 'processing';
  };

  const mapPaymentStatus = (status: string): Order['paymentStatus'] => {
    if (status === 'PAID') return 'confirmed';
    if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') return 'failed';
    return 'pending';
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const response: any = await adminApi.getOrders({ limit: 100, page: 1 });
        const incoming = Array.isArray(response?.orders)
          ? response.orders
          : Array.isArray(response?.items)
            ? response.items
            : [];

        const normalized: Order[] = incoming.map((o: any) => ({
          id: String(o.id ?? ''),
          orderNumber: String(o.marketplaceOrderId ?? o.orderNumber ?? o.id ?? ''),
          customerId: String(o.customerId ?? ''),
          customerName: String(o.customerName ?? 'Bilinmiyor'),
          customerEmail: String(o.customerEmail ?? ''),
          customerPhone: String(o.customerPhone ?? ''),
          items: Array.isArray(o.items) ? o.items.map((it: any, i: number) => ({
            id: String(it.id ?? i),
            name: String(it.productName ?? it.name ?? ''),
            quantity: Number(it.quantity ?? 0),
            price: Number(it.unitPrice ?? it.price ?? 0),
            variant: it.variant ? String(it.variant) : undefined,
          })) : [],
          subtotal: Number(o.totalAmount ?? 0) - Number(o.shippingCost ?? 0),
          shippingCost: Number(o.shippingCost ?? 0),
          discount: 0,
          total: Number(o.totalAmount ?? o.total ?? 0),
          paymentMethod: 'credit_card' as PaymentMethod,
          paymentStatus: mapPaymentStatus(String(o.paymentStatus ?? 'UNPAID')),
          status: mapDbStatus(String(o.status ?? 'PENDING')),
          shippingAddress: {
            fullName: String(o.customerName ?? ''),
            address: String(o.shippingAddress ?? ''),
            city: '',
            district: '',
            postalCode: '',
          },
          notes: o.notes ? String(o.notes) : undefined,
          createdAt: o.orderDate ? new Date(o.orderDate) : o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        }));

        setOrders(normalized);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const pendingCount = orders.filter(
    o => o.status === 'pending_payment' && o.paymentMethod === 'bank_transfer'
  ).length;

  const filteredOrders = orders.filter(order => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'pending' && order.status === 'pending_payment') ||
      (filter === 'confirmed' && order.status === 'payment_confirmed') ||
      (filter === 'processing' && order.status === 'processing');

    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    try {
      await adminApi.updateOrderStatus(id, 'CONFIRMED');
      setOrders(prev =>
        prev.map(o =>
          o.id === id
            ? { ...o, status: 'payment_confirmed' as OrderStatus, paymentStatus: 'confirmed' as const, confirmedAt: new Date(), confirmedBy: 'Admin' }
            : o
        )
      );
      setSelectedOrder(null);
      showNotificationToast('Ödeme onaylandı ve müşteriye bildirim gönderildi!');
    } catch {
      showNotificationToast('Durum güncellenemedi.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.updateOrderStatus(id, 'CANCELLED');
      setOrders(prev =>
        prev.map(o =>
          o.id === id ? { ...o, status: 'cancelled' as OrderStatus, paymentStatus: 'failed' as const } : o
        )
      );
      setSelectedOrder(null);
      showNotificationToast('Sipariş reddedildi.');
    } catch {
      showNotificationToast('Durum güncellenemedi.');
    }
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    const dbMap: Record<OrderStatus, string> = {
      pending_payment: 'PENDING',
      payment_confirmed: 'CONFIRMED',
      processing: 'CONFIRMED',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
      refunded: 'RETURNED',
    };
    try {
      await adminApi.updateOrderStatus(id, dbMap[status]);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      setSelectedOrder(null);
      showNotificationToast(`Sipariş durumu güncellendi: ${statusConfig[status].label}`);
    } catch {
      showNotificationToast('Durum güncellenemedi.');
    }
  };

  const showNotificationToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            Sipariş Yönetimi
          </h2>
          <p className="text-gray-500 mt-1">Siparişleri yönetin ve ödeme onaylarını kontrol edin</p>
        </div>

        {pendingCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-full"
          >
            <Bell className="w-5 h-5" />
            <span className="font-semibold">{pendingCount} onay bekleyen sipariş</span>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Sipariş', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
          { label: 'Onay Bekleyen', value: pendingCount, icon: Clock, color: 'bg-orange-500' },
          { label: 'Onaylanan', value: orders.filter(o => o.status === 'payment_confirmed').length, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Bugünkü Ciro', value: `₺${orders.filter(o => o.paymentStatus === 'confirmed').reduce((sum, o) => sum + o.total, 0).toLocaleString('tr-TR')}`, icon: DollarSign, color: 'bg-purple-500' },
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sipariş no veya müşteri adı ara..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'pending', label: 'Onay Bekleyen' },
            { id: 'confirmed', label: 'Onaylanan' },
            { id: 'processing', label: 'Hazırlanan' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as 'all' | 'pending' | 'confirmed' | 'processing')}
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
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={setSelectedOrder}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Bu kategoride sipariş bulunamadı.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onUpdateStatus={handleUpdateStatus}
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

export default AdminOrderManagement;

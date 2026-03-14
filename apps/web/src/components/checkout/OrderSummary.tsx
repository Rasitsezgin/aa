'use client';

import { motion } from 'framer-motion';
import { Package, Shield, Zap, Download, Mail, Sparkles } from 'lucide-react';
import { CartItem } from './CheckoutWizard';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export function OrderSummary({
  items,
  subtotal,
  discount,
  total,
}: OrderSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        Sipariş Özeti
      </h3>

      {/* Items list */}
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-gray-500 truncate">{item.variant}</p>
              )}
              <p className="text-xs text-gray-500">x{item.quantity}</p>
            </div>
            <p className="font-semibold text-sm">
              ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
          <span>₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              İndirim
            </span>
            <span>-₺{discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Toplam</span>
        <span className="font-bold text-2xl text-blue-600">
          ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Digital product benefits */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Dijital Ürün Avantajları</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Anında Teslimat</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Download className="w-4 h-4 text-blue-500" />
            <span>Hemen Erişim</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Güvenli Ödeme</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 text-purple-500" />
            <span>E-posta ile Gönderim</span>
          </div>
        </div>
      </div>

      {/* Digital delivery notice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-xl"
      >
        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium text-center">
          ⚡ Ödeme sonrası erişim bilgileri anında e-posta ile gönderilir
        </p>
      </motion.div>
    </motion.div>
  );
}

export default OrderSummary;

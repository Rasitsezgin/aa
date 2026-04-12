'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ShoppingCart,
  CreditCard,
  Building2,
  Check,
  ChevronRight,
  ChevronLeft,
  Package,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Gift,
  Percent,
  Zap,
  Download,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import { CreditCardForm } from './CreditCardForm';
import { BankTransferForm } from './BankTransferForm';
import { OrderSummary } from './OrderSummary';

// Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
}

export interface OrderData {
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: 'credit_card' | 'bank_transfer';
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
}

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation' | 'result';

// Step indicator component
function StepIndicator({
  steps,
  currentStep
}: {
  steps: { id: CheckoutStep; label: string; icon: any }[];
  currentStep: CheckoutStep;
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
                backgroundColor: isCompleted
                  ? '#10B981'
                  : isActive
                    ? '#3B82F6'
                    : '#E5E7EB',
              }}
              className={`
                relative flex items-center justify-center w-12 h-12 rounded-full
                ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}
                transition-colors duration-300
              `}
            >
              {isCompleted ? (
                <Check className="w-6 h-6" />
              ) : (
                <Icon className="w-5 h-5" />
              )}

              {isActive && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute inset-0 rounded-full border-4 border-blue-300"
                  initial={false}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>

            <span className={`
              hidden sm:block ml-2 text-sm font-medium
              ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}
            `}>
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  className="h-full bg-green-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Customer info form component (for digital products)
function CustomerInfoForm({
  data,
  onChange,
}: {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold mb-2">👤 Müşteri Bilgileri</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dijital ürün erişim bilgileriniz bu adrese gönderilecek
        </p>
      </div>

      {/* Digital delivery notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-800 dark:text-blue-300">Anında Dijital Teslimat</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ödeme onaylandıktan sonra erişim bilgileriniz anında e-posta ile gönderilecek.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Ad Soyad
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={e => onChange({ ...data, fullName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ahmet Yılmaz"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            E-posta Adresi *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={e => onChange({ ...data, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="ornek@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">Erişim bilgileriniz bu adrese gönderilecek</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            Telefon
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={e => onChange({ ...data, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="0532 XXX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Şirket Adı (Opsiyonel)</label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={e => onChange({ ...data, companyName: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Fatura için şirket adı"
          />
        </div>
      </div>

      {/* Features included */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { icon: Download, label: 'Anında İndirme' },
          { icon: Mail, label: 'E-posta ile Erişim' },
          { icon: Shield, label: 'Güvenli Ödeme' },
          { icon: Zap, label: 'Otomatik Aktivasyon' },
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <feature.icon className="w-4 h-4 text-green-500" />
            <span>{feature.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Payment method selector
function PaymentMethodSelector({
  selected,
  onSelect,
}: {
  selected: 'credit_card' | 'bank_transfer' | null;
  onSelect: (method: 'credit_card' | 'bank_transfer') => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold mb-4">💳 Ödeme Yöntemi</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Card Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('credit_card')}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${selected === 'credit_card'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }
          `}
        >
          {selected === 'credit_card' && (
            <motion.div
              layoutId="paymentSelected"
              className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Kredi/Banka Kartı</h4>
              <p className="text-sm text-gray-500">Anında onay</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4 text-green-500" />
            <span>3D Secure ile güvenli ödeme</span>
          </div>

          <div className="flex gap-2 mt-4">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" width={48} height={16} className="h-6 object-contain" unoptimized />
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" width={48} height={16} className="h-6 object-contain" unoptimized />
          </div>

          <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full inline-block">
            ⚡ Otomatik Onay
          </div>
        </motion.button>

        {/* Bank Transfer Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('bank_transfer')}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${selected === 'bank_transfer'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
            }
          `}
        >
          {selected === 'bank_transfer' && (
            <motion.div
              layoutId="paymentSelected"
              className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Havale / EFT</h4>
              <p className="text-sm text-gray-500">Banka transferi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Ödeme onayı 1-24 saat içinde</span>
          </div>

          <div className="flex gap-2 mt-4">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">Garanti</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">İş Bankası</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">Yapı Kredi</span>
          </div>

          <div className="mt-4 px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-full inline-block">
            👨‍💼 Admin Onayı Gerekli
          </div>
        </motion.button>
      </div>

      {/* Payment form based on selection */}
      <AnimatePresence mode="wait">
        {selected === 'credit_card' && (
          <motion.div
            key="credit_card_form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <CreditCardForm />
          </motion.div>
        )}

        {selected === 'bank_transfer' && (
          <motion.div
            key="bank_transfer_form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <BankTransferForm />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Confirmation step
function ConfirmationStep({
  orderData,
  onConfirm,
  isProcessing,
}: {
  orderData: OrderData;
  onConfirm: () => void;
  isProcessing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-bold mb-4">✅ Sipariş Onayı</h3>

      {/* Order summary card */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Ödeme Yöntemi</span>
          <span className="font-semibold flex items-center gap-2">
            {orderData.paymentMethod === 'credit_card' ? (
              <>
                <CreditCard className="w-5 h-5 text-blue-500" />
                Kredi Kartı
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 text-orange-500" />
                Havale / EFT
              </>
            )}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
            <span>₺{orderData.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Kargo</span>
            <span>₺{orderData.shippingCost.toFixed(2)}</span>
          </div>
          {orderData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>İndirim</span>
              <span>-₺{orderData.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200 dark:border-gray-700">
            <span>Toplam</span>
            <span className="text-blue-600">₺{orderData.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Info boxes */}
      {orderData.paymentMethod === 'credit_card' ? (
        <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">⚡ Anında Dijital Teslimat</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Kredi kartı ile yaptığınız ödemeler anında onaylanır ve erişim bilgileriniz e-posta ile gönderilir.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-800 dark:text-orange-300">Admin Onayı Gerekli</p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Havale/EFT ödemeleri admin tarafından kontrol edildikten sonra onaylanır. Bu işlem 1-24 saat sürebilir.
            </p>
          </div>
        </div>
      )}

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="w-5 h-5 mt-0.5 rounded" defaultChecked />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          <a href="#" className="text-blue-600 hover:underline">Satış sözleşmesi</a> ve{' '}
          <a href="#" className="text-blue-600 hover:underline">gizlilik politikasını</a> okudum, kabul ediyorum.
        </span>
      </label>

      {/* Confirm button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        disabled={isProcessing}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            İşleniyor...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Siparişi Onayla
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// Result step
function ResultStep({
  success,
  orderNumber,
  paymentMethod,
  onClose,
}: {
  success: boolean;
  orderNumber: string;
  paymentMethod: 'credit_card' | 'bank_transfer';
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      {success ? (
        <>
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">
            {paymentMethod === 'credit_card' ? '🎉 Siparişiniz Alındı!' : '⏳ Sipariş Beklemede'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {paymentMethod === 'credit_card'
              ? 'Ödemeniz başarıyla gerçekleşti. Erişim bilgileriniz e-posta adresinize gönderildi.'
              : 'Havale/EFT bilgileri e-posta ile gönderildi. Admin onayından sonra erişim bilgileriniz iletilecek.'}
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 inline-block">
            <p className="text-sm text-gray-500">Sipariş Numarası</p>
            <p className="text-2xl font-bold text-blue-600">#{orderNumber}</p>
          </div>

          {/* Status timeline */}
          <div className="max-w-md mx-auto text-left mb-8">
            <div className="space-y-4">
              {[
                { label: 'Sipariş Alındı', status: 'completed', time: 'Şimdi' },
                { label: paymentMethod === 'credit_card' ? 'Ödeme Onaylandı' : 'Ödeme Bekleniyor', status: paymentMethod === 'credit_card' ? 'completed' : 'pending', time: paymentMethod === 'credit_card' ? 'Şimdi' : '1-24 saat' },
                { label: paymentMethod === 'credit_card' ? 'Hesap Aktif Edildi' : 'Hesap Aktifleştirilecek', status: paymentMethod === 'credit_card' ? 'completed' : 'waiting', time: paymentMethod === 'credit_card' ? 'Şimdi' : '' },
                { label: paymentMethod === 'credit_card' ? 'E-posta Gönderildi' : 'E-posta Gönderilecek', status: paymentMethod === 'credit_card' ? 'completed' : 'waiting', time: paymentMethod === 'credit_card' ? 'Şimdi' : '' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'pending' ? 'bg-orange-500 text-white animate-pulse' :
                        'bg-gray-200 dark:bg-gray-700'}
                  `}>
                    {step.status === 'completed' ? <Check className="w-4 h-4" /> :
                      step.status === 'pending' ? <Clock className="w-4 h-4" /> :
                        <span className="text-xs">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.status === 'waiting' ? 'text-gray-400' : ''}`}>
                      {step.label}
                    </p>
                    {step.time && <p className="text-xs text-gray-500">{step.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Siparişlerimi Gör
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Alışverişe Devam
            </button>
          </div>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <X className="w-12 h-12 text-red-500" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">İşlem Başarısız</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.
          </p>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </>
      )}
    </motion.div>
  );
}

// Cart step component
function CartStep({
  items,
  onUpdateQuantity,
  onRemove,
}: {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold mb-4">🛒 Sepetiniz</h3>

      {items.map(item => (
        <motion.div
          key={item.id}
          layout
          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
        >
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{item.name}</h4>
            {item.variant && (
              <p className="text-sm text-gray-500">{item.variant}</p>
            )}
            <p className="text-blue-600 font-bold">₺{item.price.toLocaleString('tr-TR')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      ))}

      {/* Coupon code */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Gift className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Kupon kodu girin"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Uygula
        </button>
      </div>
    </motion.div>
  );
}

// Main Checkout Wizard
export function CheckoutWizard() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; orderNumber: string } | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Profesyonel Paket - Yıllık', price: 5990, quantity: 1, variant: 'Tüm Özellikler Dahil' },
    { id: '2', name: 'Ek Kullanıcı Lisansı', price: 499, quantity: 2, variant: '12 Aylık' },
    { id: '3', name: 'API Entegrasyon Paketi', price: 1299, quantity: 1, variant: 'Sınırsız Çağrı' },
  ]);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
  });

  const steps = [
    { id: 'cart' as const, label: 'Sepet', icon: ShoppingCart },
    { id: 'shipping' as const, label: 'Bilgiler', icon: User },
    { id: 'payment' as const, label: 'Ödeme', icon: CreditCard },
    { id: 'confirmation' as const, label: 'Onay', icon: Check },
    { id: 'result' as const, label: 'Sonuç', icon: Package },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const shippingCost = 0;
  const total = subtotal - discount + shippingCost;

  const orderData: OrderData = {
    items: cartItems,
    customer,
    paymentMethod: paymentMethod || 'credit_card',
    subtotal,
    discount,
    shippingCost,
    total,
  };

  const handleNext = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation', 'result'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation', 'result'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          shipping: customer,
          paymentMethod,
          subtotal,
          discount,
          shippingCost,
          total,
        }),
      });

      if (!res.ok) throw new Error('Siparis olusturulamadi');
      const data = await res.json();
      setOrderResult({ success: true, orderNumber: String(data?.orderNumber || data?.id || '') });
      setCurrentStep('result');
    } catch {
      setOrderResult({ success: false, orderNumber: '' });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: qty } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'cart':
        return cartItems.length > 0;
      case 'shipping':
        return customer.fullName && customer.email && customer.phone;
      case 'payment':
        return paymentMethod !== null;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'cart' && (
                  <CartStep
                    items={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                )}
                {currentStep === 'shipping' && (
                  <CustomerInfoForm data={customer} onChange={setCustomer} />
                )}
                {currentStep === 'payment' && (
                  <PaymentMethodSelector
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                )}
                {currentStep === 'confirmation' && (
                  <ConfirmationStep
                    orderData={orderData}
                    onConfirm={handleConfirm}
                    isProcessing={isProcessing}
                  />
                )}
                {currentStep === 'result' && orderResult && (
                  <ResultStep
                    success={orderResult.success}
                    orderNumber={orderResult.orderNumber}
                    paymentMethod={paymentMethod || 'credit_card'}
                    onClose={() => {
                      setCurrentStep('cart');
                      setOrderResult(null);
                      setPaymentMethod(null);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              {currentStep !== 'result' && currentStep !== 'confirmation' && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 'cart'}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Geri
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Devam Et
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          {currentStep !== 'result' && (
            <div className="lg:col-span-1">
              <OrderSummary
                items={cartItems}
                subtotal={subtotal}
                discount={discount}
                total={total}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutWizard;

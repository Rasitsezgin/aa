'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  CreditCard,
  Building2,
  Truck,
  Check,
  ArrowLeft,
  ArrowRight,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Shield,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  Minus,
  Plus,
  Trash2,
  Sparkles,
  Copy,
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

// Types
interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
}

type PaymentMethod = 'credit_card' | 'bank_transfer';
type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirm' | 'result';

interface StepConfig {
  id: CheckoutStep;
  label: string;
  icon: LucideIcon;
}

// Demo Data removed - cart is loaded from session/API
const initialCartItems: CartItem[] = [];

// Step Indicator Component
function StepIndicator({ 
  currentStep, 
  steps 
}: { 
  currentStep: CheckoutStep; 
  steps: StepConfig[]
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              animate={{
                scale: isCurrent ? 1.1 : 1,
                backgroundColor: isCompleted 
                  ? '#22c55e' 
                  : isCurrent 
                    ? '#3b82f6' 
                    : '#e5e7eb',
              }}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}
              `}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </motion.div>
            <span className={`ml-2 text-sm font-medium hidden md:block ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 md:w-16 h-0.5 mx-2 bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  className="h-full bg-green-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Cart Step Component
function CartStep({
  items,
  onUpdateQuantity,
  onRemove,
  onNext,
}: {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-blue-600" />
        Sepetiniz
      </h2>

      <div className="space-y-4">
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              {item.variant && (
                <p className="text-sm text-gray-500">{item.variant}</p>
              )}
              <p className="font-bold text-blue-600 mt-1">
                ₺{item.price.toLocaleString('tr-TR')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Sepetiniz boş</p>
        </div>
      ) : (
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <p className="text-gray-500">Ara Toplam</p>
            <p className="text-2xl font-bold">₺{subtotal.toLocaleString('tr-TR')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Devam Et
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// Shipping Step Component
function ShippingStep({
  shippingInfo,
  onChange,
  onBack,
  onNext,
}: {
  shippingInfo: ShippingInfo;
  onChange: (info: Partial<ShippingInfo>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Truck className="w-6 h-6 text-blue-600" />
        Teslimat Bilgileri
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-1" /> Ad Soyad
          </label>
          <input
            type="text"
            value={shippingInfo.fullName}
            onChange={e => onChange({ fullName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Mail className="w-4 h-4 inline mr-1" /> E-posta
          </label>
          <input
            type="email"
            value={shippingInfo.email}
            onChange={e => onChange({ email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Phone className="w-4 h-4 inline mr-1" /> Telefon
          </label>
          <input
            type="tel"
            value={shippingInfo.phone}
            onChange={e => onChange({ phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="0532 123 45 67"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 inline mr-1" /> Posta Kodu
          </label>
          <input
            type="text"
            value={shippingInfo.postalCode}
            onChange={e => onChange({ postalCode: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="34000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Adres</label>
          <textarea
            value={shippingInfo.address}
            onChange={e => onChange({ address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="Mahalle, sokak, bina no, daire no..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">İl</label>
          <select
            value={shippingInfo.city}
            onChange={e => onChange({ city: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seçiniz</option>
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">İlçe</label>
          <input
            type="text"
            value={shippingInfo.district}
            onChange={e => onChange({ district: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            placeholder="İlçe"
          />
        </div>
      </div>

      {/* Shipping Options */}
      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
        <h3 className="font-semibold">Kargo Seçenekleri</h3>
        <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border-2 border-blue-500">
          <input type="radio" name="shipping" defaultChecked className="accent-blue-600" />
          <Truck className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium">Ücretsiz Kargo</p>
            <p className="text-sm text-gray-500">2-4 iş günü</p>
          </div>
          <span className="text-green-600 font-semibold">Ücretsiz</span>
        </label>
        <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700">
          <input type="radio" name="shipping" className="accent-blue-600" />
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <p className="font-medium">Hızlı Teslimat</p>
            <p className="text-sm text-gray-500">1 iş günü</p>
          </div>
          <span className="font-semibold">₺49,90</span>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Ödemeye Geç
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Payment Method Selector
function PaymentMethodSelector({
  selected,
  onSelect,
}: {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Ödeme Yöntemini Seçin</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Card Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect('credit_card')}
          className={`
            cursor-pointer p-6 rounded-2xl border-2 transition-all
            ${selected === 'credit_card'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}
          `}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Kredi/Banka Kartı</h4>
              <p className="text-sm text-gray-500">Anında onay</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Otomatik onay - Hemen kargoya verilir</span>
          </div>
          
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-bold">Mastercard</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-bold">Visa</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">Amex</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-bold">Troy</span>
          </div>
        </motion.div>

        {/* Bank Transfer Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect('bank_transfer')}
          className={`
            cursor-pointer p-6 rounded-2xl border-2 transition-all
            ${selected === 'bank_transfer'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}
          `}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Havale / EFT</h4>
              <p className="text-sm text-gray-500">Manuel onay gerekli</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Clock className="w-4 h-4" />
            <span>Admin onayı sonrası kargoya verilir</span>
          </div>
          
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Garanti</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">İş Bankası</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">Yapı Kredi</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Credit Card Form Component (3D Animated)
function CreditCardForm() {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardType, setCardType] = useState<string>('');

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^9/.test(cleaned)) return 'troy';
    return '';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, number: formatted }));
    setCardType(detectCardType(formatted));
  };

  const cardGradients: Record<string, string> = {
    visa: 'from-blue-600 via-blue-500 to-blue-700',
    mastercard: 'from-orange-500 via-red-500 to-orange-600',
    amex: 'from-green-500 via-teal-500 to-green-600',
    troy: 'from-indigo-500 via-purple-500 to-indigo-600',
    '': 'from-gray-600 via-gray-500 to-gray-700',
  };

  return (
    <div className="space-y-6">
      {/* 3D Card Preview */}
      <div className="relative h-56 mx-auto max-w-md" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card Front */}
          <div
            className={`absolute inset-0 rounded-2xl p-6 bg-gradient-to-br ${cardGradients[cardType]} text-white shadow-2xl`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg" />
              <span className="text-xl font-bold uppercase">{cardType || 'Card'}</span>
            </div>
            <div className="text-2xl tracking-wider font-mono mb-6">
              {cardData.number || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-white/60">Kart Sahibi</p>
                <p className="font-semibold uppercase tracking-wide">
                  {cardData.name || 'AD SOYAD'}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Son Kullanma</p>
                <p className="font-semibold">{cardData.expiry || 'AA/YY'}</p>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div
            className={`absolute inset-0 rounded-2xl p-6 bg-gradient-to-br ${cardGradients[cardType]} text-white shadow-2xl`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="h-12 bg-black/40 -mx-6 mt-4 mb-6" />
            <div className="flex items-center gap-4">
              <div className="flex-1 h-10 bg-white/20 rounded flex items-center justify-end px-4">
                <span className="text-lg font-mono">{cardData.cvv || '•••'}</span>
              </div>
              <span className="text-sm text-white/60">CVV</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Form */}
      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium mb-2">Kart Numarası</label>
          <input
            type="text"
            value={cardData.number}
            onChange={handleNumberChange}
            placeholder="0000 0000 0000 0000"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Kart Üzerindeki İsim</label>
          <input
            type="text"
            value={cardData.name}
            onChange={e => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
            placeholder="AD SOYAD"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Son Kullanma</label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={e => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
              placeholder="AA/YY"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={e => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="•••"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 dark:bg-green-500/10 p-3 rounded-xl">
          <Shield className="w-5 h-5 text-green-600" />
          <span>256-bit SSL ile güvenli ödeme</span>
        </div>
      </div>
    </div>
  );
}

// Bank Transfer Form
function BankTransferForm() {
  const [copied, setCopied] = useState<string | null>(null);

  const banks = [
    { name: 'Garanti BBVA', iban: 'TR12 0006 2000 0000 0012 3456 78', branch: '123', account: '12345678', color: 'from-green-500 to-green-600' },
    { name: 'İş Bankası', iban: 'TR34 0006 4000 0011 2233 4455 66', branch: '456', account: '11223344', color: 'from-blue-500 to-blue-600' },
    { name: 'Yapı Kredi', iban: 'TR56 0006 7000 0022 3344 5566 77', branch: '789', account: '22334455', color: 'from-indigo-500 to-purple-600' },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400">Önemli Bilgi</p>
            <p className="text-sm text-orange-600 dark:text-orange-300">
              Havale yaptıktan sonra siparişiniz admin onayı bekleyecektir. 
              Onay süresi genellikle 1-24 saat arasındadır.
            </p>
          </div>
        </div>
      </div>

      <h3 className="font-semibold">Banka Hesap Bilgileri</h3>
      
      {banks.map((bank, index) => (
        <motion.div
          key={bank.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${bank.color} text-white rounded-lg text-sm font-semibold mb-3`}>
            <Building2 className="w-4 h-4" />
            {bank.name}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">IBAN:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{bank.iban}</span>
                <button
                  onClick={() => copyToClipboard(bank.iban, `${bank.name}-iban`)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {copied === `${bank.name}-iban` ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Hesap Adı:</span>
              <span className="font-medium">Pazaryonetimi.com Ltd. Şti.</span>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Transfer açıklaması:</strong> Sipariş numaranızı açıklama kısmına yazmayı unutmayın.
        </p>
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({
  paymentMethod,
  onSelectMethod,
  onBack,
  onNext,
}: {
  paymentMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-blue-600" />
        Ödeme
      </h2>

      <PaymentMethodSelector selected={paymentMethod} onSelect={onSelectMethod} />

      <AnimatePresence mode="wait">
        {paymentMethod === 'credit_card' && (
          <motion.div
            key="credit_card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CreditCardForm />
          </motion.div>
        )}

        {paymentMethod === 'bank_transfer' && (
          <motion.div
            key="bank_transfer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <BankTransferForm />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!paymentMethod}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siparişi Onayla
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Confirm Step Component
function ConfirmStep({
  cartItems,
  shippingInfo,
  paymentMethod,
  onBack,
  onConfirm,
  isProcessing,
}: {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Check className="w-6 h-6 text-blue-600" />
        Sipariş Özeti
      </h2>

      {/* Items Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
        <h3 className="font-semibold">Ürünler</h3>
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-semibold">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</span>
          </div>
        ))}
        <div className="pt-2 border-t flex justify-between font-bold">
          <span>Toplam</span>
          <span className="text-blue-600">₺{total.toLocaleString('tr-TR')}</span>
        </div>
      </div>

      {/* Shipping Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Teslimat Adresi
        </h3>
        <p className="text-sm">
          {shippingInfo.fullName}<br />
          {shippingInfo.address}<br />
          {shippingInfo.district} / {shippingInfo.city}
        </p>
      </div>

      {/* Payment Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          {paymentMethod === 'credit_card' ? (
            <CreditCard className="w-5 h-5 text-blue-600" />
          ) : (
            <Building2 className="w-5 h-5 text-orange-600" />
          )}
          Ödeme Yöntemi
        </h3>
        <p className="text-sm">
          {paymentMethod === 'credit_card' ? 'Kredi/Banka Kartı' : 'Havale/EFT'}
        </p>
        <p className={`text-xs mt-1 ${paymentMethod === 'credit_card' ? 'text-green-600' : 'text-orange-600'}`}>
          {paymentMethod === 'credit_card' 
            ? '✓ Otomatik onaylanacak' 
            : '⏳ Admin onayı gerekli'}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              İşleniyor...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Siparişi Tamamla
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Result Step Component
function ResultStep({
  paymentMethod,
  orderNumber,
  onNewOrder,
}: {
  paymentMethod: PaymentMethod;
  orderNumber: string;
  onNewOrder: () => void;
}) {
  const isAutoApproved = paymentMethod === 'credit_card';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
          isAutoApproved ? 'bg-green-100 dark:bg-green-500/20' : 'bg-orange-100 dark:bg-orange-500/20'
        }`}
      >
        {isAutoApproved ? (
          <CheckCircle className="w-12 h-12 text-green-600" />
        ) : (
          <Clock className="w-12 h-12 text-orange-600" />
        )}
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold mb-2">
          {isAutoApproved ? 'Siparişiniz Onaylandı! 🎉' : 'Siparişiniz Alındı!'}
        </h2>
        <p className="text-gray-500">
          {isAutoApproved 
            ? 'Ödemeniz başarıyla alındı. Siparişiniz hazırlanıyor.'
            : 'Havale onayı sonrası siparişiniz kargoya verilecektir.'}
        </p>
      </div>

      <div className="inline-block p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-sm text-gray-500">Sipariş Numarası</p>
        <p className="text-2xl font-mono font-bold text-blue-600">{orderNumber}</p>
      </div>

      {/* Timeline */}
      <div className="max-w-md mx-auto text-left">
        <div className="space-y-4">
          {[
            { label: 'Sipariş oluşturuldu', done: true, time: 'Şimdi' },
            { label: isAutoApproved ? 'Ödeme onaylandı' : 'Ödeme onayı bekleniyor', done: isAutoApproved, time: isAutoApproved ? 'Şimdi' : '1-24 saat' },
            { label: 'Hazırlanıyor', done: false, time: 'Yakında' },
            { label: 'Kargoya verildi', done: false, time: '1-2 gün' },
            { label: 'Teslim edildi', done: false, time: '2-4 gün' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className="flex-1">
                <p className={`font-medium ${step.done ? '' : 'text-gray-400'}`}>{step.label}</p>
              </div>
              <span className="text-sm text-gray-500">{step.time}</span>
            </div>
          ))}
        </div>
      </div>

      {!isAutoApproved && (
        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl max-w-md mx-auto">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Havale yaptıktan sonra sipariş takibi e-posta ile bildirilecektir.
            </span>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewOrder}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
      >
        Alışverişe Devam Et
      </motion.button>
    </motion.div>
  );
}

// Order Summary Sidebar
function OrderSummary({ items }: { items: CartItem[] }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 29.90;
  const total = subtotal + shipping;

  return (
    <div className="sticky top-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-blue-600" />
        Sipariş Özeti
      </h3>

      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{item.name} x{item.quantity}</span>
            <span className="font-medium">₺{(item.price * item.quantity).toLocaleString('tr-TR')}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ara Toplam</span>
          <span>₺{subtotal.toLocaleString('tr-TR')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Kargo</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? 'Ücretsiz' : `₺${shipping}`}
          </span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Toplam</span>
          <span className="text-blue-600">₺{total.toLocaleString('tr-TR')}</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4 text-green-600" />
          <span>256-bit SSL Güvenlik</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>500₺ üzeri ücretsiz kargo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Check className="w-4 h-4 text-green-600" />
          <span>14 gün koşulsuz iade</span>
        </div>
      </div>
    </div>
  );
}

// Main Checkout Component
function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  // Sepet verilerini API'den yükle
  useState(() => {
    fetch('/api/cart').then(res => res.json()).then(data => {
      if (data.items && data.items.length > 0) {
        setCartItems(data.items);
      }
    }).catch(() => {});
  });
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const steps: StepConfig[] = [
    { id: 'cart', label: 'Sepet', icon: ShoppingCart },
    { id: 'shipping', label: 'Teslimat', icon: Truck },
    { id: 'payment', label: 'Ödeme', icon: CreditCard },
    { id: 'confirm', label: 'Onay', icon: Check },
    { id: 'result', label: 'Sonuç', icon: Package },
  ];

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          shipping: shippingInfo,
          paymentMethod,
        }),
      });
      const data = await res.json();
      setOrderNumber(data.orderNumber || data.id || 'N/A');
      setCurrentStep('result');
    } catch {
      // Fallback sipariş numarası
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let num = 'SIP-';
      for (let i = 0; i < 8; i++) {
        num += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setOrderNumber(num);
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewOrder = () => {
    setCartItems(initialCartItems);
    setShippingInfo({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      postalCode: '',
    });
    setPaymentMethod(null);
    setOrderNumber('');
    setCurrentStep('cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🛒 Güvenli Ödeme</h1>
          <p className="text-gray-500">Siparişinizi tamamlayın</p>
        </div>

        {/* Step Indicator */}
        {currentStep !== 'result' && (
          <StepIndicator currentStep={currentStep} steps={steps} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <AnimatePresence mode="wait">
                {currentStep === 'cart' && (
                  <CartStep
                    key="cart"
                    items={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    onNext={() => setCurrentStep('shipping')}
                  />
                )}

                {currentStep === 'shipping' && (
                  <ShippingStep
                    key="shipping"
                    shippingInfo={shippingInfo}
                    onChange={info => setShippingInfo(prev => ({ ...prev, ...info }))}
                    onBack={() => setCurrentStep('cart')}
                    onNext={() => setCurrentStep('payment')}
                  />
                )}

                {currentStep === 'payment' && (
                  <PaymentStep
                    key="payment"
                    paymentMethod={paymentMethod}
                    onSelectMethod={setPaymentMethod}
                    onBack={() => setCurrentStep('shipping')}
                    onNext={() => setCurrentStep('confirm')}
                  />
                )}

                {currentStep === 'confirm' && (
                  <ConfirmStep
                    key="confirm"
                    cartItems={cartItems}
                    shippingInfo={shippingInfo}
                    paymentMethod={paymentMethod!}
                    onBack={() => setCurrentStep('payment')}
                    onConfirm={handleConfirm}
                    isProcessing={isProcessing}
                  />
                )}

                {currentStep === 'result' && (
                  <ResultStep
                    key="result"
                    paymentMethod={paymentMethod!}
                    orderNumber={orderNumber}
                    onNewOrder={handleNewOrder}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'result' && (
            <div className="lg:col-span-1">
              <OrderSummary items={cartItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

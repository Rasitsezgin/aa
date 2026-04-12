'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Shield,
  Check,
  AlertCircle,
  Wifi,
} from 'lucide-react';

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

// Card type detection
function getCardType(number: string): 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown' {
  const cleaned = number.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^9792/.test(cleaned)) return 'troy';
  return 'unknown';
}

// Format card number with spaces
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

// Format expiry date
function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
}

// 3D Credit Card Component
function Card3D({
  cardData,
  isFlipped,
  cardType,
}: {
  cardData: CardData;
  isFlipped: boolean;
  cardType: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown';
}) {
  const cardBgColors = {
    visa: 'from-blue-600 via-blue-700 to-blue-900',
    mastercard: 'from-red-600 via-orange-600 to-yellow-600',
    amex: 'from-gray-600 via-gray-700 to-gray-900',
    troy: 'from-green-600 via-teal-600 to-cyan-600',
    unknown: 'from-gray-700 via-gray-800 to-gray-900',
  };

  return (
    <div className="perspective-1000 w-full max-w-[400px] mx-auto mb-8">
      <motion.div
        className="relative w-full h-56 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front side */}
        <div
          className={`absolute inset-0 rounded-2xl p-6 bg-gradient-to-br ${cardBgColors[cardType]} shadow-2xl`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Chip and NFC */}
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center">
              <div className="w-8 h-6 border-2 border-yellow-600 rounded-sm" />
            </div>
            <Wifi className="w-8 h-8 text-white/60 rotate-90" />
          </div>

          {/* Card Number */}
          <div className="mb-6">
            <p className="text-white/60 text-xs mb-1">Kart Numarası</p>
            <p className="text-white text-2xl font-mono tracking-wider">
              {cardData.number || '•••• •••• •••• ••••'}
            </p>
          </div>

          {/* Name and Expiry */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs mb-1">Kart Sahibi</p>
              <p className="text-white font-semibold uppercase tracking-wider">
                {cardData.name || 'AD SOYAD'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-1">Son Kullanma</p>
              <p className="text-white font-semibold">
                {cardData.expiry || 'MM/YY'}
              </p>
            </div>
          </div>

          {/* Card type logo */}
          <div className="absolute bottom-6 right-6">
            {cardType === 'visa' && (
              <span className="text-white text-2xl font-bold italic">VISA</span>
            )}
            {cardType === 'mastercard' && (
              <div className="flex -space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full" />
                <div className="w-8 h-8 bg-yellow-500 rounded-full opacity-80" />
              </div>
            )}
            {cardType === 'troy' && (
              <span className="text-white text-xl font-bold">TROY</span>
            )}
          </div>
        </div>

        {/* Back side */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cardBgColors[cardType]} shadow-2xl`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Magnetic stripe */}
          <div className="w-full h-12 bg-gray-900 mt-6" />

          {/* CVV */}
          <div className="px-6 mt-6">
            <div className="bg-white h-10 rounded flex items-center justify-end px-4">
              <span className="font-mono text-gray-900 tracking-widest">
                {cardData.cvv || '•••'}
              </span>
            </div>
            <p className="text-white/60 text-xs mt-2 text-right">CVV</p>
          </div>

          {/* Info text */}
          <div className="px-6 mt-8">
            <p className="text-white/40 text-xs leading-relaxed">
              Bu kart yalnızca yetkili kart sahibi tarafından kullanılabilir.
              Kartı tüm işlemler için güvende tutunuz.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main Credit Card Form
export function CreditCardForm() {
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [installment, setInstallment] = useState(1);
  const [save3DSecure, setSave3DSecure] = useState(true);

  const cardType = getCardType(cardData.number);

  const handleNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.length <= 19) {
      setCardData(prev => ({ ...prev, number: formatted }));
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    if (formatted.length <= 5) {
      setCardData(prev => ({ ...prev, expiry: formatted }));
    }
  };

  const handleCvvChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCardData(prev => ({ ...prev, cvv: cleaned }));
    }
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    
    if (cardData.number.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Geçerli bir kart numarası girin';
    }
    if (!cardData.name.trim()) {
      newErrors.name = 'Kart sahibi adını girin';
    }
    if (cardData.expiry.length < 5) {
      newErrors.expiry = 'Geçerli bir tarih girin';
    }
    if (cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV kodunu girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      {/* 3D Card Preview */}
      <Card3D cardData={cardData} isFlipped={isFlipped} cardType={cardType} />

      {/* Card Form */}
      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium mb-2">Kart Numarası</label>
          <div className="relative">
            <input
              type="text"
              value={cardData.number}
              onChange={e => handleNumberChange(e.target.value)}
              onFocus={() => {
                setIsFlipped(false);
                setFocusedField('number');
              }}
              onBlur={() => setFocusedField(null)}
              placeholder="0000 0000 0000 0000"
              className={`
                w-full px-4 py-3 pl-12 rounded-xl border-2 bg-white dark:bg-gray-800 font-mono text-lg
                transition-all duration-200
                ${focusedField === 'number' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
                ${errors.number ? 'border-red-500' : ''}
              `}
            />
            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            
            {/* Card type indicator */}
            <div className="absolute right-4 top-3">
              {cardType === 'visa' && (
                <span className="text-blue-600 font-bold italic">VISA</span>
              )}
              {cardType === 'mastercard' && (
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full" />
                  <div className="w-5 h-5 bg-yellow-500 rounded-full" />
                </div>
              )}
              {cardType === 'troy' && (
                <span className="text-green-600 font-bold">TROY</span>
              )}
            </div>
          </div>
          {errors.number && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.number}
            </p>
          )}
        </div>

        {/* Card Holder Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Kart Üzerindeki İsim</label>
          <input
            type="text"
            value={cardData.name}
            onChange={e => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
            onFocus={() => {
              setIsFlipped(false);
              setFocusedField('name');
            }}
            onBlur={() => setFocusedField(null)}
            placeholder="AD SOYAD"
            className={`
              w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 uppercase
              transition-all duration-200
              ${focusedField === 'name' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
              ${errors.name ? 'border-red-500' : ''}
            `}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Son Kullanma</label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={e => handleExpiryChange(e.target.value)}
              onFocus={() => {
                setIsFlipped(false);
                setFocusedField('expiry');
              }}
              onBlur={() => setFocusedField(null)}
              placeholder="AA/YY"
              className={`
                w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 font-mono text-center
                transition-all duration-200
                ${focusedField === 'expiry' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
                ${errors.expiry ? 'border-red-500' : ''}
              `}
            />
            {errors.expiry && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.expiry}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <input
              type="password"
              value={cardData.cvv}
              onChange={e => handleCvvChange(e.target.value)}
              onFocus={() => {
                setIsFlipped(true);
                setFocusedField('cvv');
              }}
              onBlur={() => {
                setIsFlipped(false);
                setFocusedField(null);
              }}
              placeholder="•••"
              maxLength={4}
              className={`
                w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 font-mono text-center
                transition-all duration-200
                ${focusedField === 'cvv' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
                ${errors.cvv ? 'border-red-500' : ''}
              `}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.cvv}
              </p>
            )}
          </div>
        </div>

        {/* Installment Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Taksit Seçenekleri</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 6, 9, 12].map(month => (
              <motion.button
                key={month}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInstallment(month)}
                className={`
                  p-3 rounded-xl border-2 text-center transition-all
                  ${installment === month 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }
                `}
              >
                <p className="font-bold">{month}</p>
                <p className="text-xs text-gray-500">Taksit</p>
              </motion.button>
            ))}
          </div>
          
          {installment > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl"
            >
              <div className="flex justify-between text-sm">
                <span>Aylık Taksit</span>
                <span className="font-bold">₺{(67996 / installment).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Toplam</span>
                <span>₺67,996.00</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 3D Secure */}
        <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={save3DSecure}
              onChange={e => setSave3DSecure(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div className="flex-1">
              <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                3D Secure ile Güvenli Ödeme
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                Ödemeniz bankanızın güvenlik sistemi ile doğrulanacak
              </p>
            </div>
          </label>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>PCI DSS</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Check className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditCardForm;

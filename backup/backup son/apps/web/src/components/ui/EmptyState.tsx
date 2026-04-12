'use client';

import { motion } from 'framer-motion';
import { Package, Search, FileX, Inbox, ShoppingCart, Users } from 'lucide-react';

interface EmptyStateProps {
  type: 'products' | 'search' | 'orders' | 'inbox' | 'cart' | 'customers' | 'generic';
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const icons = {
  products: Package,
  search: Search,
  orders: ShoppingCart,
  inbox: Inbox,
  cart: ShoppingCart,
  customers: Users,
  generic: FileX,
};

const defaultMessages = {
  products: {
    title: 'Ürün Bulunamadı',
    description: 'Henüz hiç ürün eklenmemiş veya arama kriterlerinize uygun ürün yok.',
  },
  search: {
    title: 'Sonuç Bulunamadı',
    description: 'Aramanızla eşleşen herhangi bir sonuç bulunamadı.',
  },
  orders: {
    title: 'Sipariş Yok',
    description: 'Henüz hiç sipariş oluşturulmamış.',
  },
  inbox: {
    title: 'Gelen Kutusu Boş',
    description: 'Yeni mesajınız bulunmuyor.',
  },
  cart: {
    title: 'Sepet Boş',
    description: 'Sepetinizde ürün bulunmuyor.',
  },
  customers: {
    title: 'Müşteri Yok',
    description: 'Henüz hiç müşteri kaydedilmemiş.',
  },
  generic: {
    title: 'Veri Yok',
    description: 'Görüntülenecek veri bulunamadı.',
  },
};

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const Icon = icons[type];
  const messages = defaultMessages[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        className="relative w-24 h-24 mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        {/* Animated background circles */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.h3
        className="text-lg font-semibold text-white mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title || messages.title}
      </motion.h3>
      
      <motion.p
        className="text-sm text-white/60 max-w-xs mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description || messages.description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export function EmptyStateSvg({ type }: { type: '404' | '500' | 'offline' | 'loading' }) {
  const svgs = {
    404: (
      <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
        <defs>
          <linearGradient id="grad404" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="200"
          cy="150"
          r="100"
          fill="url(#grad404)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.text
          x="200"
          y="170"
          textAnchor="middle"
          className="text-6xl font-bold"
          fill="white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          404
        </motion.text>
        <motion.path
          d="M150 200 Q200 240 250 200"
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </svg>
    ),
    500: (
      <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
        <motion.rect
          x="150"
          y="100"
          width="100"
          height="100"
          rx="20"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.text
          x="200"
          y="155"
          textAnchor="middle"
          fill="#ef4444"
          fontSize="40"
          fontWeight="bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          !
        </motion.text>
      </svg>
    ),
    offline: (
      <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
        <motion.circle
          cx="180"
          cy="150"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.circle
          cx="220"
          cy="150"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        <motion.path
          d="M200 100 L200 200"
          stroke="#ef4444"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5 }}
        />
      </svg>
    ),
    loading: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0.25, rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    ),
  };

  return svgs[type];
}

'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  Home,
  ArrowLeft,
  WifiOff,
  ServerCrash,
  FileQuestion,
  Lock,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type ErrorType = 'general' | 'notFound' | 'unauthorized' | 'network' | 'server' | 'timeout';

interface ErrorDisplayProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  fullScreen?: boolean;
}

const errorConfig: Record<ErrorType, { icon: any; defaultTitle: string; defaultMessage: string; color: string }> = {
  general: {
    icon: AlertTriangle,
    defaultTitle: 'Bir Hata Oluştu',
    defaultMessage: 'İşlem sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin.',
    color: 'from-yellow-500 to-orange-500'
  },
  notFound: {
    icon: FileQuestion,
    defaultTitle: 'Sayfa Bulunamadı',
    defaultMessage: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
    color: 'from-slate-500 to-slate-600'
  },
  unauthorized: {
    icon: Lock,
    defaultTitle: 'Erişim Reddedildi',
    defaultMessage: 'Bu sayfaya erişmek için yetkiniz bulunmuyor.',
    color: 'from-red-500 to-rose-500'
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Bağlantı Hatası',
    defaultMessage: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    color: 'from-blue-500 to-cyan-500'
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Sunucu Hatası',
    defaultMessage: 'Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.',
    color: 'from-purple-500 to-pink-500'
  },
  timeout: {
    icon: Clock,
    defaultTitle: 'Zaman Aşımı',
    defaultMessage: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
    color: 'from-amber-500 to-yellow-500'
  }
};

export function ErrorDisplay({
  type = 'general',
  title,
  message,
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  fullScreen = false
}: ErrorDisplayProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-6'
    : 'flex items-center justify-center p-6';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-2xl`}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-3"
        >
          {title || config.defaultTitle}
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 mb-8"
        >
          {message || config.defaultMessage}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </motion.button>
          )}

          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </motion.button>
          )}

          {showHomeButton && (
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                Ana Sayfa
              </motion.div>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Inline Error for form fields or small areas
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-red-400 text-sm ${className}`}
    >
      <XCircle className="w-4 h-4" />
      {message}
    </motion.div>
  );
}

// Toast-style Error Notification
interface ErrorToastProps {
  message: string;
  onClose?: () => void;
  autoClose?: number;
}

export function ErrorToast({ message, onClose, autoClose = 5000 }: ErrorToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-xl text-red-400">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-md mb-6">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-sm"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

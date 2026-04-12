'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  ShoppingCart,
  Package,
  TrendingUp,
  Star,
  LucideIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'order' | 'stock' | 'price' | 'review';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Icon & Color Maps ────────────────────────────────
const toastConfig: Record<ToastType, { icon: LucideIcon; bg: string; border: string; iconColor: string; titleColor: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
  },
  order: {
    icon: ShoppingCart,
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    titleColor: 'text-purple-300',
  },
  stock: {
    icon: Package,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    titleColor: 'text-orange-300',
  },
  price: {
    icon: TrendingUp,
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
    titleColor: 'text-cyan-300',
  },
  review: {
    icon: Star,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
  },
};

// ─── Provider ─────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast].slice(-5)); // Max 5 toasts

    if (!toast.persistent) {
      const duration = toast.duration || 5000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message = '') => addToast({ type: 'success', title, message }),
    [addToast],
  );
  const error = useCallback(
    (title: string, message = '') => addToast({ type: 'error', title, message, duration: 8000 }),
    [addToast],
  );
  const warning = useCallback(
    (title: string, message = '') => addToast({ type: 'warning', title, message }),
    [addToast],
  );
  const info = useCallback(
    (title: string, message = '') => addToast({ type: 'info', title, message }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Toast Container ──────────────────────────────────
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Toast Item ───────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className={`pointer-events-auto ${config.bg} backdrop-blur-xl border ${config.border} rounded-2xl p-4 shadow-2xl`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${config.bg}`}>
          <Icon size={18} className={config.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${config.titleColor}`}>{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`mt-2 text-xs font-bold ${config.iconColor} hover:underline`}
            >
              {toast.action.label} →
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Hook ─────────────────────────────────────────────
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return no-op fallback
    return {
      toasts: [],
      addToast: () => '',
      removeToast: () => {},
      clearAll: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    } as ToastContextType;
  }
  return context;
}

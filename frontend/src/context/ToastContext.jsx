import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#0f2d1f] border-emerald-500/30',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-200',
    bodyColor: 'text-emerald-300/80',
    barColor: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[#2d0f0f] border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-200',
    bodyColor: 'text-red-300/80',
    barColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#2d1f0f] border-amber-500/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-200',
    bodyColor: 'text-amber-300/80',
    barColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-[#0f1d2d] border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-200',
    bodyColor: 'text-blue-300/80',
    barColor: 'bg-blue-500',
  },
};

function ToastItem({ toast, onRemove }) {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`relative flex items-start gap-3 w-80 max-w-sm rounded-xl border px-4 py-3.5 shadow-toast overflow-hidden ${config.bg}`}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${config.barColor}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
      />

      <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon className="w-4.5 h-4.5" size={18} />
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold leading-tight ${config.titleColor}`}>{toast.title}</p>
        )}
        {toast.message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${config.bodyColor}`}>{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

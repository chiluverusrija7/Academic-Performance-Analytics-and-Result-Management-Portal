import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10 border-blue-500/20',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={`relative w-full ${maxWidth} bg-navy-900 border border-white/10 rounded-modal shadow-modal z-10 overflow-hidden my-8`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/5 bg-navy-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <div className={`p-2 rounded-lg border shrink-0 ${iconBg} ${iconColor}`}>
                      <Icon size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-100 tracking-tight truncate">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-6 max-h-[calc(85vh-80px)] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

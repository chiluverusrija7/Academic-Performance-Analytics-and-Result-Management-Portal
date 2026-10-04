import React from 'react';
import { motion } from 'framer-motion';

const baseStyles = [
  'inline-flex items-center justify-center font-medium rounded-btn',
  'transition-all duration-150',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950',
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
  'select-none',
].join(' ');

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm shadow-blue-900/30 focus-visible:ring-blue-500',
  secondary: 'bg-white/5 hover:bg-white/10 active:bg-white/[0.03] text-slate-300 border border-white/8 hover:border-white/15 focus-visible:ring-white/20',
  danger:    'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm shadow-red-900/30 focus-visible:ring-red-500',
  success:   'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm focus-visible:ring-emerald-500',
  ghost:     'text-slate-400 hover:text-slate-100 hover:bg-white/5 active:bg-white/[0.03] focus-visible:ring-white/20',
  outline:   'border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/5 focus-visible:ring-blue-500',
  soft:      'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 focus-visible:ring-blue-500',
};

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2.5',
  xl: 'px-6 py-3 text-base gap-3',
};

const Spinner = () => (
  <svg
    className="animate-spin -ml-0.5 shrink-0"
    width="14" height="14"
    fill="none" viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      whileHover={!isDisabled ? { scale: 1.015 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.1 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 13 : 15} className="shrink-0" aria-hidden="true" />
      ) : null}
      {children}
      {!loading && IconRight && (
        <IconRight size={size === 'xs' || size === 'sm' ? 13 : 15} className="shrink-0" aria-hidden="true" />
      )}
    </motion.button>
  );
}

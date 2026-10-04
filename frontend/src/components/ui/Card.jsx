import React from 'react';
import { motion } from 'framer-motion';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10 border-blue-500/20',
  noPadding = false,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-navy-900/90 backdrop-blur border border-white/5 rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || action || Icon) && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className={`p-2 rounded-lg border shrink-0 ${iconBg} ${iconColor}`}>
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-semibold text-slate-100 text-sm md:text-base tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </motion.div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  className = '',
}) {
  const colorMap = {
    indigo: {
      border: 'hover:border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      valueColor: 'text-white',
      accentGlow: 'from-indigo-500/5',
    },
    blue: {
      border: 'hover:border-blue-500/30',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      valueColor: 'text-white',
      accentGlow: 'from-blue-500/5',
    },
    emerald: {
      border: 'hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      valueColor: 'text-white',
      accentGlow: 'from-emerald-500/5',
    },
    amber: {
      border: 'hover:border-amber-500/30',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      valueColor: 'text-white',
      accentGlow: 'from-amber-500/5',
    },
    sky: {
      border: 'hover:border-sky-500/30',
      iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
      valueColor: 'text-white',
      accentGlow: 'from-sky-500/5',
    },
    purple: {
      border: 'hover:border-purple-500/30',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      valueColor: 'text-white',
      accentGlow: 'from-purple-500/5',
    },
    rose: {
      border: 'hover:border-rose-500/30',
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      valueColor: 'text-white',
      accentGlow: 'from-rose-500/5',
    },
    cyan: {
      border: 'hover:border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      valueColor: 'text-white',
      accentGlow: 'from-cyan-500/5',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative bg-navy-900/90 backdrop-blur border border-white/5 ${scheme.border} rounded-card p-5 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group ${className}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.accentGlow} to-transparent rounded-bl-full pointer-events-none`} />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${scheme.iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className={`text-2xl font-bold tracking-tight font-display ${scheme.valueColor}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
            {trend && <span className="shrink-0">{trend}</span>}
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

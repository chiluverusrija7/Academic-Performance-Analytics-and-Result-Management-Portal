/**
 * RiskBadge.jsx
 * Shared risk level badge component used across the Intelligence Center.
 */
import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle, HelpCircle } from 'lucide-react';

export function RiskBadge({ level, probability, size = 'sm' }) {
  const config = {
    HIGH: {
      label: 'HIGH RISK',
      icon: AlertOctagon,
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-400',
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      icon: AlertTriangle,
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    LOW: {
      label: 'LOW RISK',
      icon: CheckCircle,
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
    },
    UNKNOWN: {
      label: 'NO DATA',
      icon: HelpCircle,
      bg: 'bg-slate-500/15',
      border: 'border-slate-500/30',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const c = config[level] || config.UNKNOWN;
  const Icon = c.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold
        ${c.bg} ${c.border} ${c.text}
        ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}
      `}
    >
      <Icon size={isSmall ? 10 : 13} className="shrink-0" />
      {c.label}
      {probability != null && (
        <span className="ml-1 opacity-80">({probability}%)</span>
      )}
    </span>
  );
}

/**
 * RiskProgressBar — visual probability bar
 */
export function RiskProgressBar({ probability, level }) {
  const color = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500',
    UNKNOWN: 'bg-slate-500',
  }[level] || 'bg-slate-500';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-400">Risk Probability</span>
        <span className="text-[10px] font-bold text-slate-200">{probability ?? '—'}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: probability != null ? `${Math.min(probability, 100)}%` : '0%' }}
        />
      </div>
    </div>
  );
}

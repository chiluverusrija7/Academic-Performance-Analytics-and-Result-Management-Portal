import React from 'react';

/**
 * Premium animated progress bar.
 * Usage:
 *   <ProgressBar value={75} max={100} color="blue" label="Attendance" showValue />
 */
export function ProgressBar({
  value = 0,
  max = 100,
  color = 'blue',
  label,
  showValue = false,
  size = 'md',
  animate = true,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
  };

  const glowMap = {
    blue: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    emerald: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    amber: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    red: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    cyan: 'shadow-[0_0_8px_rgba(6,182,212,0.5)]',
    purple: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    indigo: 'shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    rose: 'shadow-[0_0_8px_rgba(244,63,94,0.5)]',
  };

  const sizeMap = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const barColor = colorMap[color] || colorMap.blue;
  const barGlow = glowMap[color] || '';
  const barSize = sizeMap[size] || sizeMap.md;

  // Determine color based on percentage for conditional coloring
  const getAutoColor = () => {
    if (pct >= 75) return 'emerald';
    if (pct >= 50) return 'amber';
    return 'red';
  };

  const effectiveColor = color === 'auto' ? getAutoColor() : color;
  const effectiveBarColor = colorMap[effectiveColor] || colorMap.blue;
  const effectiveGlow = glowMap[effectiveColor] || '';

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
          {showValue && (
            <span className={`text-xs font-bold tabular-nums ${
              effectiveColor === 'emerald' ? 'text-emerald-400' :
              effectiveColor === 'amber' ? 'text-amber-400' :
              effectiveColor === 'red' ? 'text-red-400' :
              'text-blue-400'
            }`}>
              {pct.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${barSize} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`${barSize} ${color === 'auto' ? effectiveBarColor : barColor} ${effectiveGlow} rounded-full`}
          style={{
            width: `${pct}%`,
            transition: animate ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </div>
    </div>
  );
}

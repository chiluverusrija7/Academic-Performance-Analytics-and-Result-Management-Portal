import React from 'react';

const variantStyles = {
  default:  'bg-white/5 text-slate-400 border-white/8 ring-0',
  primary:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger:   'bg-red-500/10 text-red-400 border-red-500/20',
  sky:      'bg-sky-500/10 text-sky-400 border-sky-500/20',
  purple:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cyan:     'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  orange:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  rose:     'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const dotStyles = {
  default:  'bg-slate-400',
  primary:  'bg-blue-400',
  success:  'bg-emerald-400',
  warning:  'bg-amber-400',
  danger:   'bg-red-400',
  sky:      'bg-sky-400',
  purple:   'bg-purple-400',
  cyan:     'bg-cyan-400',
  orange:   'bg-orange-400',
  rose:     'bg-rose-400',
};

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-2.5 py-1 text-sm gap-2',
};

// Smart auto-variant from text content
function resolveVariant(variant, children) {
  if (variant !== 'auto' && variant !== 'default') return variant;
  if (typeof children === 'string') {
    const v = children.toLowerCase().trim();
    if (['active', 'paid', 'distinction', 'published', 'regular', 'eligible', 'present',
         'passed', 'cleared', 'approved', 'completed', 'enrolled', 'assigned'].includes(v)) return 'success';
    if (['pending', 'first class', 'draft', 'scheduled', 'partial', 'processing', 'review'].includes(v)) return 'warning';
    if (['failed', 'absent', 'inactive', 'unpaid', 'overdue', 'deactivated', 'suspended',
         'shortage (<75%)', 'rejected', 'cancelled'].includes(v)) return 'danger';
    if (['admin', 'hod', 'exam_cell'].includes(v)) return 'purple';
    if (['faculty'].includes(v)) return 'sky';
    if (['student'].includes(v)) return 'primary';
  }
  return 'default';
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) {
  const resolved = resolveVariant(variant, children);
  const vstyle = variantStyles[resolved] || variantStyles.default;
  const dstyle = dotStyles[resolved] || dotStyles.default;
  const sstyle = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${vstyle} ${sstyle} ${className}`}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dstyle}`} />
      )}
      {children}
    </span>
  );
}

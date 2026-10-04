import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { Button } from './Button';

export function LoadingSpinner({
  message = 'Loading academic records...',
  size = 'md',
  subMessage = 'Fetching verified records from PostgreSQL database',
}) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in text-center">
      <div className="relative mb-4">
        <div className={`${sizeClasses[size]} rounded-full border-blue-500/20 border-t-blue-500 animate-spin`} />
        <div className="absolute inset-0 rounded-full blur-sm bg-blue-500/10 animate-pulse-slow pointer-events-none" />
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-200 tracking-tight">{message}</p>
      )}
      {subMessage && (
        <p className="mt-1 text-xs text-slate-500 max-w-xs">{subMessage}</p>
      )}
    </div>
  );
}

export function ErrorAlert({
  message = 'An error occurred while communicating with the server',
  title = 'Database Connection / API Error',
  onRetry,
  className = '',
}) {
  return (
    <div className={`p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
          <AlertCircle size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-300">{title}</p>
          <p className="text-xs text-red-200/90 mt-0.5 break-words">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="xs"
          icon={RefreshCw}
          onClick={onRetry}
          className="shrink-0 border-red-500/30 text-red-200 hover:bg-red-500/20 self-start sm:self-center"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'No Records Found',
  description = 'There are currently no records available in the database for this view.',
  icon: Icon,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-navy-900/40 ${className}`}>
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          <Icon size={22} />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

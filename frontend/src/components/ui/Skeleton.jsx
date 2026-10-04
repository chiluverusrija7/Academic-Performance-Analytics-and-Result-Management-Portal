import React from 'react';

// ── Skeleton Block ──────────────────────────────────────────
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ── Metric Card Skeleton ────────────────────────────────────
export function MetricCardSkeleton() {
  return (
    <div className="bg-navy-800 border border-white/5 rounded-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ── Dashboard Skeleton ──────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <Skeleton className="h-28 w-full rounded-xl" />
      {/* 4 metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      {/* 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} className="h-40" />)}
      </div>
      {/* Table */}
      <TableSkeleton rows={5} />
    </div>
  );
}

// ── Card Skeleton ───────────────────────────────────────────
export function CardSkeleton({ className = 'h-64', rows = 3 }) {
  return (
    <div className={`bg-navy-800 border border-white/5 rounded-card shadow-card p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
        ))}
      </div>
    </div>
  );
}

// ── Table Skeleton ──────────────────────────────────────────
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-navy-800 border border-white/5 rounded-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-40" />
      </div>
      {/* Table */}
      <div className="p-4">
        {/* TH row */}
        <div className="flex gap-4 px-2 pb-3 border-b border-white/5">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className={`h-3 flex-1 ${i === 0 ? 'w-16' : ''}`} />
          ))}
        </div>
        {/* TR rows */}
        {[...Array(rows)].map((_, rowI) => (
          <div key={rowI} className="flex gap-4 px-2 py-3.5 border-b border-white/5">
            {[...Array(cols)].map((_, colI) => (
              <Skeleton
                key={colI}
                className={`h-3.5 flex-1 ${colI === 0 ? 'w-20' : ''}`}
                style={{ opacity: 1 - rowI * 0.08 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Skeleton ────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="bg-navy-800 border border-white/5 rounded-card p-6 flex items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} className="h-32" rows={2} />
        ))}
      </div>
    </div>
  );
}

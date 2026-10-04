import React from 'react';
import { EmptyState } from './States';

export function Table({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found',
  emptyIcon,
  className = '',
  compact = false,
  stickyHeader = false,
}) {
  return (
    <div className={`overflow-x-auto rounded-card border border-white/5 bg-navy-900/60 shadow-card ${className}`}>
      <table className="w-full text-left text-xs md:text-sm text-slate-300">
        <thead className={`bg-navy-800/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5 ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur' : ''}`}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 ${compact ? 'py-2.5' : 'py-3.5'} font-semibold text-slate-400 select-none ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center">
                <EmptyState
                  title="No Data Available"
                  description={emptyMessage}
                  icon={emptyIcon}
                />
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                className="hover:bg-white/[0.03] transition-colors duration-150 group"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 ${compact ? 'py-2.5' : 'py-3.5'} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row[col.accessor], row, rowIdx) : (row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

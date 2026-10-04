import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Building } from 'lucide-react';

export function DepartmentRiskChart() {
  const [viewMode, setViewMode] = useState('rate'); // 'rate' | 'count'

  const deptData = [
    { name: 'AIML', rate: 16.4, count: 14, total: 85 },
    { name: 'CSE', rate: 12.8, count: 16, total: 125 },
    { name: 'ECE', rate: 14.5, count: 8, total: 55 },
    { name: 'MECH', rate: 11.4, count: 4, total: 35 },
  ];

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#0B0F17]/90 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Building size={16} className="text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Department Risk Breakdown
          </h3>
        </div>

        {/* Count vs Rate toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-mono">
          <button
            onClick={() => setViewMode('rate')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'rate'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Risk % Rate
          </button>
          <button
            onClick={() => setViewMode('count')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'count'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            At-Risk Count
          </button>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={deptData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              unit={viewMode === 'rate' ? '%' : ' stu'}
              domain={viewMode === 'rate' ? [0, 25] : [0, 20]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e2e8f0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B0F17',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val, name, item) => [
                viewMode === 'rate'
                  ? `${val}% (${item.payload.count} / ${item.payload.total} students)`
                  : `${val} at-risk students (${item.payload.rate}% rate)`,
                'Risk Metric',
              ]}
            />
            <Bar
              dataKey={viewMode === 'rate' ? 'rate' : 'count'}
              fill="#a855f7"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>AIML shows slightly higher sensitivity due to rapid Semester 2 curriculum transition.</span>
        <span className="font-mono text-purple-300 text-[10px]">Total Cohort: 300</span>
      </div>
    </div>
  );
}

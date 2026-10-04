import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Layers, Sparkles } from 'lucide-react';

export function FeatureImportanceChart() {
  const [checkpoint, setCheckpoint] = useState('W12');

  const featureImportanceByCheckpoint = {
    W4: [
      { name: 'Lecture Attendance (%)', importance: 0.38 },
      { name: 'Diagnostic Quiz Score', importance: 0.24 },
      { name: 'Prior Cumulative SGPA', importance: 0.18 },
      { name: 'Historical Backlog Count', importance: 0.12 },
      { name: 'Week 4 Lab Record Status', importance: 0.08 },
    ],
    W8: [
      { name: 'Mid-1 Assessment Score (%)', importance: 0.42 },
      { name: 'Lecture Attendance (%)', importance: 0.28 },
      { name: 'Assignment Submission Rate', importance: 0.14 },
      { name: 'Prior Cumulative SGPA', importance: 0.10 },
      { name: 'Continuous Quiz Score', importance: 0.06 },
    ],
    W12: [
      { name: 'Mid-2 Assessment Score (%)', importance: 0.44 },
      { name: 'Mid-1 Assessment Score (%)', importance: 0.26 },
      { name: 'Practical Lab Performance', importance: 0.15 },
      { name: 'Overall Lecture Attendance', importance: 0.10 },
      { name: 'Assignment Composite Score', importance: 0.05 },
    ],
  };

  const data = featureImportanceByCheckpoint[checkpoint] || featureImportanceByCheckpoint.W12;

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#0B0F17]/90 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Model-Level Top Feature Importance (SHAP Gain)
          </h3>
        </div>

        {/* Checkpoint Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-mono">
          {['W4', 'W8', 'W12'].map((cp) => (
            <button
              key={cp}
              onClick={() => setCheckpoint(cp)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                checkpoint === cp
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cp}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 0.5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e2e8f0', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B0F17',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val) => [`${(val * 100).toFixed(1)}% Relative Gain`, 'Importance']}
            />
            <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Demonstrates how early attendance signals transition to exam mastery features by Week 12.</span>
        <span className="font-mono text-purple-300 text-[10px]">TreeSHAP Mean Abs Value</span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Award, Cpu, Filter } from 'lucide-react';

export function ModelComparisonChart() {
  const [checkpoint, setCheckpoint] = useState('W12');

  const benchmarkData = {
    W4: [
      { metric: 'ROC-AUC', 'Logistic Regression': 68.4, 'Random Forest': 76.5, XGBoost: 81.2 },
      { metric: 'PR-AUC', 'Logistic Regression': 58.2, 'Random Forest': 68.0, XGBoost: 74.1 },
      { metric: 'F1-Score', 'Logistic Regression': 52.0, 'Random Forest': 64.2, XGBoost: 70.5 },
      { metric: 'Recall', 'Logistic Regression': 55.0, 'Random Forest': 66.0, XGBoost: 72.0 },
    ],
    W8: [
      { metric: 'ROC-AUC', 'Logistic Regression': 74.1, 'Random Forest': 88.2, XGBoost: 91.4 },
      { metric: 'PR-AUC', 'Logistic Regression': 64.0, 'Random Forest': 82.5, XGBoost: 86.2 },
      { metric: 'F1-Score', 'Logistic Regression': 58.4, 'Random Forest': 79.1, XGBoost: 84.0 },
      { metric: 'Recall', 'Logistic Regression': 60.0, 'Random Forest': 78.0, XGBoost: 83.5 },
    ],
    W12: [
      { metric: 'ROC-AUC', 'Logistic Regression': 79.2, 'Random Forest': 94.1, XGBoost: 97.1 },
      { metric: 'PR-AUC', 'Logistic Regression': 68.4, 'Random Forest': 89.5, XGBoost: 94.5 },
      { metric: 'F1-Score', 'Logistic Regression': 62.5, 'Random Forest': 85.2, XGBoost: 91.3 },
      { metric: 'Recall', 'Logistic Regression': 60.0, 'Random Forest': 83.0, XGBoost: 90.0 },
    ],
  };

  const data = benchmarkData[checkpoint] || benchmarkData.W12;

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#0B0F17]/90 p-5 backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-purple-400" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Cross-Validated Model Comparison Matrix
            </h3>
            <p className="text-[11px] text-slate-400">GroupKFold evaluation across temporal milestones</p>
          </div>
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

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
            <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B0F17',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val) => [`${val}%`]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="Logistic Regression" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Random Forest" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="XGBoost" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
          <Award size={13} />
          <span>Champion Architecture: XGBoost (PR-AUC 94.5% at W12)</span>
        </div>
        <span className="font-mono text-slate-500 text-[10px]">Student-Grouped Cross Validation</span>
      </div>
    </div>
  );
}

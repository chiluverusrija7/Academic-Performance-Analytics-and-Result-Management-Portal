import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { FeatureImportanceChart } from './FeatureImportanceChart';

export function TemporalAnalysisTab() {
  const [selectedMilestone, setSelectedMilestone] = useState('W12');

  const milestoneStats = [
    {
      id: 'W4',
      title: 'Week 4 — Early Diagnostic',
      timing: 'Initial 25% of Semester',
      rocAuc: 0.812,
      prAuc: 0.741,
      f1Score: 0.705,
      topFeatures: ['Lecture Attendance (%)', 'Diagnostic Quiz Score', 'Prior Semester SGPA'],
      riskDistribution: { high: 28, medium: 45, low: 227 },
      description: 'First early-warning signal based on attendance patterns and initial diagnostic quizzes.',
    },
    {
      id: 'W8',
      title: 'Week 8 — Mid-Semester Review',
      timing: 'Mid 50% of Semester',
      rocAuc: 0.914,
      prAuc: 0.862,
      f1Score: 0.840,
      topFeatures: ['Mid-1 Internal Assessment (%)', 'Lecture Attendance (%)', 'Assignment Submissions'],
      riskDistribution: { high: 36, medium: 32, low: 232 },
      description: 'Significantly higher predictive power incorporating Mid-1 examination scores and continuous lab evals.',
    },
    {
      id: 'W12',
      title: 'Week 12 — Pre-Final Synthesis',
      timing: '75% of Semester (Pre-Finals)',
      rocAuc: 0.971,
      prAuc: 0.945,
      f1Score: 0.913,
      topFeatures: ['Mid-2 Internal Score (%)', 'Mid-1 Internal Score (%)', 'Practical Lab Marks (%)'],
      riskDistribution: { high: 41, medium: 21, low: 238 },
      description: 'Peak discriminative capability right before end-semester examinations for high-urgency remediation.',
    },
  ];

  const temporalProgressionData = [
    { checkpoint: 'Week 4', roc_auc: 81.2, pr_auc: 74.1, f1_score: 70.5, high_risk: 28, medium_risk: 45, low_risk: 227 },
    { checkpoint: 'Week 8', roc_auc: 91.4, pr_auc: 86.2, f1_score: 84.0, high_risk: 36, medium_risk: 32, low_risk: 232 },
    { checkpoint: 'Week 12', roc_auc: 97.1, pr_auc: 94.5, f1_score: 91.3, high_risk: 41, medium_risk: 21, low_risk: 238 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                TEMPORAL CHECKPOINTS (W4 $\to$ W8 $\to$ W12)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Longitudinal Semester Milestones
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Multi-Milestone Risk Evolution
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Tracking early academic risk as new internal assessments and attendance signals accumulate over Weeks 4, 8, and 12.
            </p>
          </div>

          {/* Milestone Selection Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {milestoneStats.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMilestone(m.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedMilestone === m.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {m.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestoneStats.map((stat) => {
          const isSelected = selectedMilestone === stat.id;
          return (
            <motion.div
              key={stat.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedMilestone(stat.id)}
              className={`cursor-pointer rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                isSelected
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'bg-[#0B0F17]/90 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white font-mono">{stat.id}</span>
                <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/15">
                  PR-AUC {(stat.prAuc * 100).toFixed(1)}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{stat.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.timing}</p>

              <div className="my-3 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>ROC-AUC:</span>
                  <span className="font-mono font-bold text-blue-400">{(stat.rocAuc * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>F1-Score:</span>
                  <span className="font-mono font-bold text-emerald-400">{(stat.f1Score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>High Risk Flagged:</span>
                  <span className="font-mono font-bold text-red-400">{stat.riskDistribution.high} Students</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Key Predictors:</span>
                <div className="flex flex-wrap gap-1">
                  {stat.topFeatures.map((f, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Visual Analytics: PR-AUC/F1 Evolution + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Evolution Line Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Accuracy &amp; F1 Signal Progression Across Milestones
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">PR-AUC vs F1</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalProgressionData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <XAxis dataKey="checkpoint" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="pr_auc" name="PR-AUC Score" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="f1_score" name="F1-Score" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="roc_auc" name="ROC-AUC Score" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
            Demonstrates how predictive signal strengthens from PR-AUC 74.1% (W4) to 94.5% (W12).
          </p>
        </div>

        {/* Feature Importance Component (6 cols) */}
        <div className="lg:col-span-6">
          <FeatureImportanceChart />
        </div>
      </div>
    </div>
  );
}

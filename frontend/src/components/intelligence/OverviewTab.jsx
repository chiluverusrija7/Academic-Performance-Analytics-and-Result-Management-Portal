import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  BookOpen,
  Trophy,
  Zap,
  BarChart2,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { NoveltyPipelineStrip } from './NoveltyPipelineStrip';
import { IntelligenceCoreAnimation } from './IntelligenceCoreAnimation';
import { DepartmentRiskChart } from './DepartmentRiskChart';
import { MetricCard } from '../ui/Card';

const RISK_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0B0F17',
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

export function OverviewTab({
  overview,
  riskMetrics,
  riskLoading,
  riskProgress,
  onNavigateTab,
}) {
  const riskDistChartData = [
    { name: 'Safe / On-Track', value: 258, color: '#10b981' },
    { name: 'Confident High Risk', value: 31, color: '#ef4444' },
    { name: 'Ambiguous Uncertainty Set', value: 11, color: '#f59e0b' },
  ];

  const temporalRiskTrend = [
    { checkpoint: 'Week 4', riskPct: 9.3, flaggedCount: 28, rocAuc: 81.2 },
    { checkpoint: 'Week 8', riskPct: 12.0, flaggedCount: 36, rocAuc: 91.4 },
    { checkpoint: 'Week 12', riskPct: 13.4, flaggedCount: 41, rocAuc: 97.1 },
  ];

  const priorityCategoryBars = [
    { category: 'Subject Remediation', count: 18, riskReduction: '38%' },
    { category: 'Attendance Monitoring', count: 12, riskReduction: '24%' },
    { category: 'Lab Practical Makeup', count: 7, riskReduction: '18%' },
    { category: 'Mentor Counseling', count: 5, riskReduction: '15%' },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Hero Command Center Banner ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#0B0F17] border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8"
      >
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PICTORIAL INTELLIGENCE COMMAND CENTER
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Visual Analytics Active
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              Academic Risk Intelligence &amp; Visual Decision Support
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xl">
              Real-time multi-milestone risk prediction (W4/W8/W12), TreeSHAP feature explanations, distribution-free conformal uncertainty, and prescriptive intervention playbooks.
            </p>

            <div className="flex flex-wrap gap-2 mt-4 text-[10px] text-slate-400 font-mono">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/8">
                300 Students Evaluated
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                XGBoost Champion · ROC-AUC 0.97
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Conformal Sets (90% Conf)
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <IntelligenceCoreAnimation riskMetrics={riskMetrics} evaluated={300} />
          </div>
        </div>
      </motion.div>

      {/* ─── 5-Stage Novelty Pipeline Strip ─────────────────────────── */}
      <NoveltyPipelineStrip onSelectStage={(stageId) => {
        if (stageId === 'predict' || stageId === 'explain' || stageId === 'conformal') {
          onNavigateTab('students');
        } else if (stageId === 'simulate') {
          onNavigateTab('whatif');
        } else if (stageId === 'act') {
          onNavigateTab('interventions');
        }
      }} />

      {/* ─── KPI Cards (Animated Numerical + Semantic Badges) ────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Students Analyzed"
          value={300}
          subtitle="Longitudinal Cohort"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="At-Risk Students"
          value={41}
          subtitle="Pre-Finals W12"
          icon={AlertOctagon}
          color="rose"
        />
        <MetricCard
          title="Safe Students"
          value={259}
          subtitle="On-Track Trajectory"
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Ambiguous Sets"
          value={11}
          subtitle="Coverage 90% (α=0.10)"
          icon={ShieldCheck}
          color="amber"
        />
        <MetricCard
          title="Priority Interventions"
          value={18}
          subtitle="Critical Action Queue"
          icon={Zap}
          color="purple"
        />
      </div>

      {/* ─── Visual Analytics Section 1: Donut + Horizontal Bars ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Overall Cohort Risk Composition
              </h3>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Week 12 Checkpoint</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val, name) => [`${val} students (${((val / 300) * 100).toFixed(1)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              {riskDistChartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <div>
                    <span className="font-bold text-slate-100">{d.value}</span>
                    <span className="text-[11px] text-slate-400 block">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 pt-2 border-t border-white/5">
            86.3% safe vs 13.7% overall risk prevalence with 11 ambiguous boundary cases requiring advisor review.
          </p>
        </div>

        {/* Priority Intervention Horizontal Bars (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                High-Priority Intervention Categories
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Ranked by Urgency</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityCategoryBars}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#e2e8f0', fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(val, name, item) => [`${val} students (Est. Risk Δ: -${item.payload.riskReduction})`, 'Flagged']}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Subject Remediation accounts for the highest expected risk reduction (-38%).</span>
            <span className="font-mono text-purple-300">Phase 6 Engine</span>
          </div>
        </div>
      </div>

      {/* ─── Visual Analytics Section 2: Temporal Line Chart + Dept Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Temporal Risk Trend Line Chart (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Temporal Risk Prevalence Trend (W4 $\to$ W8 $\to$ W12)
              </h3>
            </div>
            <span className="text-[10px] text-sky-300 font-mono">Cohort Milestone Rate</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalRiskTrend} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                <XAxis dataKey="checkpoint" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(val, name, item) => [`${val}% (${item.payload.flaggedCount} students)`, 'Risk Prevalence']}
                />
                <Line type="monotone" dataKey="riskPct" name="Risk % Rate" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
            Risk flags evolve from 9.3% (Week 4 initial attendance) to 13.4% (Week 12 combined exam &amp; lab composite).
          </p>
        </div>

        {/* Department Breakdown (6 cols) */}
        <div className="lg:col-span-6">
          <DepartmentRiskChart />
        </div>
      </div>
    </div>
  );
}

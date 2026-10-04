import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Layers,
  ShieldCheck,
  Sliders,
  CheckSquare,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const PIPELINE_STAGES = [
  {
    id: 'predict',
    num: '01',
    title: 'Temporal Risk Prediction',
    subtitle: 'W4 · W8 · W12 Milestones',
    icon: Brain,
    accent: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]',
    badge: 'STAGE 1',
    description: 'Multi-checkpoint longitudinal ML inference before end-semester exams.',
  },
  {
    id: 'explain',
    num: '02',
    title: 'SHAP Attribution',
    subtitle: 'TreeSHAP Feature Drivers',
    icon: Layers,
    accent: 'from-purple-500 to-violet-600',
    border: 'border-purple-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    badge: 'STAGE 2',
    description: 'Exact mathematical attributions for risk drivers vs protective factors.',
  },
  {
    id: 'conformal',
    num: '03',
    title: 'Conformal Uncertainty',
    subtitle: 'Guaranteed Prediction Sets',
    icon: ShieldCheck,
    accent: 'from-amber-500 to-yellow-600',
    border: 'border-amber-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    badge: 'STAGE 3',
    description: 'Rigorous coverage guarantees distinguishing ambiguous vs confident cases.',
  },
  {
    id: 'simulate',
    num: '04',
    title: 'Counterfactual Simulator',
    subtitle: 'What-If Optimization',
    icon: Sliders,
    accent: 'from-cyan-500 to-teal-600',
    border: 'border-cyan-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    badge: 'STAGE 4',
    description: 'Actionable parameter search and real-time model re-evaluation.',
  },
  {
    id: 'act',
    num: '05',
    title: 'Prescriptive Action',
    subtitle: 'Prioritized Intervention',
    icon: CheckSquare,
    accent: 'from-emerald-500 to-green-600',
    border: 'border-emerald-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    badge: 'STAGE 5',
    description: 'Urgency-ranked queue with targeted remediation playbooks.',
  },
];

export function NoveltyPipelineStrip({ activeStage = 'predict', onSelectStage }) {
  return (
    <div className="w-full bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-20 bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-20 bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-violet-500 text-white shadow-sm">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              EduInsight 5-Stage Institutional Decision Pipeline
              <span className="text-[10px] normal-case px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                End-to-End ML Architecture
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive academic intelligence workflow from early detection to faculty action
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time Inference</span>
        </div>
      </div>

      {/* Pipeline Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectStage && onSelectStage(stage.id)}
              className={`group relative cursor-pointer p-3.5 rounded-xl border transition-all duration-300 ${
                isActive
                  ? `bg-white/[0.08] ${stage.border} shadow-[0_0_20px_rgba(168,85,247,0.2)]`
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
              } ${stage.glow}`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activePipelineIndicator"
                  className={`absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r ${stage.accent} rounded-t-xl`}
                />
              )}

              <div className="flex items-start justify-between mb-2.5">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stage.accent} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon size={16} />
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                  {stage.num}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400 font-bold block mb-0.5">
                  {stage.badge}
                </span>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-200 transition-colors leading-snug">
                  {stage.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stage.subtitle}</p>
              </div>

              <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {stage.description}
              </p>

              <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-purple-300 transition-colors">
                <span>{isActive ? 'Active Stage' : 'Inspect Stage'}</span>
                <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

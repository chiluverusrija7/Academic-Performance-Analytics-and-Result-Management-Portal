import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  AlertOctagon,
  AlertTriangle,
  Clock,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';

export function PrescriptiveActionPlan({ actions = [], compact = false }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!actions || actions.length === 0) {
    return (
      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-slate-400 text-center">
        No specific prescriptive interventions flagged. Student trajectory is on track.
      </div>
    );
  }

  const urgencyStyles = {
    CRITICAL: {
      border: 'border-red-500/30',
      bg: 'bg-red-950/20',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: AlertOctagon,
      iconColor: 'text-red-400',
    },
    HIGH: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-950/20',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
    },
    MEDIUM: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Clock,
      iconColor: 'text-amber-400',
    },
    LOW: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/20',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: CheckCircle2,
      iconColor: 'text-blue-400',
    },
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-[#0B0F17]/90 p-4 md:p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckSquare size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Prescriptive Intervention Playbook
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {actions.length} Action{actions.length > 1 ? 's' : ''} Prioritized
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ranked remediation pathways designed for maximum projected risk reduction
            </p>
          </div>
        </div>
      </div>

      {/* Action List */}
      <div className="space-y-3">
        {actions.map((act, idx) => {
          const urgencyKey = act.urgency || 'MEDIUM';
          const style = urgencyStyles[urgencyKey] || urgencyStyles.MEDIUM;
          const UrgencyIcon = style.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl border ${style.border} ${style.bg} p-3.5 transition-all`}
            >
              {/* Card Header & Toggle */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0 mt-0.5">
                    #{act.rank || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100 truncate">
                        {act.action_title || act.title || act.intervention_type}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${style.badge}`}>
                        {urgencyKey}
                      </span>
                      {act.estimated_risk_reduction != null && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          -{(act.estimated_risk_reduction * 100).toFixed(1)}% Risk Δ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      Target: {act.target_parameter || 'Academic Mastery'} • Goal: +{act.required_improvement || '15'}%
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-slate-400 p-1">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Expanded Action Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/5 space-y-3 text-xs"
                  >
                    {/* Faculty Guidance Note */}
                    {act.faculty_note && (
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                        <Sparkles size={13} className="text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-purple-300">Faculty Advisory Note:</strong> {act.faculty_note}
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Implementation Steps */}
                    {act.implementation_steps && act.implementation_steps.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                          Execution Checklist:
                        </span>
                        {act.implementation_steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="w-4 h-4 rounded bg-white/5 text-slate-400 flex items-center justify-center text-[9px] font-mono shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

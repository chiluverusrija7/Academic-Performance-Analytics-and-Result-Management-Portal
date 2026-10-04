import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowUpRight, ArrowDownRight, Info, Sparkles } from 'lucide-react';

export const FEATURE_LABEL_MAP = {
  mid1_marks_pct: 'Mid-1 Assessment Score (%)',
  mid2_marks_pct: 'Mid-2 Assessment Score (%)',
  attendance_pct: 'Lecture Attendance Rate (%)',
  assignment_pct: 'Assignment Submissions (%)',
  lab_marks_pct: 'Laboratory Practical Marks (%)',
  prior_sgpa: 'Cumulative / Prior SGPA',
  backlog_history_count: 'Historical Backlogs Count',
  subject_fail_count: 'Current Failing Subjects',
  quiz_avg_pct: 'Continuous Quiz Average (%)',
  internal_assessment_avg: 'Composite Internal Assessment',
};

export function formatFeatureName(rawName) {
  if (!rawName) return 'Feature';
  if (FEATURE_LABEL_MAP[rawName]) return FEATURE_LABEL_MAP[rawName];
  return rawName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatFeatureValue(val, feature) {
  if (val == null) return '—';
  if (typeof val === 'number') {
    if (feature && (feature.includes('pct') || feature.includes('attendance') || feature.includes('marks'))) {
      return `${val.toFixed(1)}%`;
    }
    if (feature && (feature.includes('sgpa') || feature.includes('cgpa'))) {
      return val.toFixed(2);
    }
    return val % 1 === 0 ? val.toString() : val.toFixed(2);
  }
  return String(val);
}

export function ShapAttributionChart({ explainability, compact = false }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'risk' | 'protective'

  if (!explainability) {
    return (
      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-slate-400 text-center">
        SHAP explainability attributions loading…
      </div>
    );
  }

  const {
    base_value = 0.1339,
    top_risk_drivers = [],
    top_protective_factors = [],
    all_attributions = [],
    narrative_summary = '',
  } = explainability;

  // Compute max absolute SHAP value for proportional bar width
  const maxShap = Math.max(
    0.01,
    ...all_attributions.map((a) => Math.abs(a.shap_value || a.value || 0)),
    ...top_risk_drivers.map((a) => Math.abs(a.shap_value || a.value || 0)),
    ...top_protective_factors.map((a) => Math.abs(a.shap_value || a.value || 0))
  );

  const displayedList =
    filterMode === 'risk'
      ? top_risk_drivers
      : filterMode === 'protective'
      ? top_protective_factors
      : [
          ...top_risk_drivers.map((d) => ({ ...d, isRisk: true })),
          ...top_protective_factors.map((d) => ({ ...d, isRisk: false })),
        ].sort((a, b) => Math.abs(b.shap_value || 0) - Math.abs(a.shap_value || 0));

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#0B0F17]/90 p-4 md:p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                SHAP Risk Driver Attribution
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TreeSHAP (Additive)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact feature contributions shifting risk from population baseline ({((base_value || 0.1339) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-[11px]">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Factors
          </button>
          <button
            onClick={() => setFilterMode('risk')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterMode === 'risk'
                ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            Risk Drivers (+Δ)
          </button>
          <button
            onClick={() => setFilterMode('protective')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterMode === 'protective'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Protective (-Δ)
          </button>
        </div>
      </div>

      {/* SHAP Narrative summary if provided */}
      {narrative_summary && (
        <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
          <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{narrative_summary}</p>
        </div>
      )}

      {/* Attribution Bars */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No attributions found for this filter.</p>
        ) : (
          displayedList.map((item, idx) => {
            const rawName = item.feature || item.feature_name || `Feature ${idx + 1}`;
            const featureLabel = formatFeatureName(rawName);
            const shapVal = item.shap_value != null ? item.shap_value : item.value || 0;
            const isPositiveRisk = shapVal > 0 || item.isRisk;
            const rawStudentVal = item.student_value != null ? item.student_value : item.val;
            const barWidthPct = Math.min(100, Math.max(8, (Math.abs(shapVal) / maxShap) * 100));

            return (
              <div
                key={rawName + idx}
                className="p-2.5 rounded-lg bg-white/[0.015] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isPositiveRisk ? (
                      <ArrowUpRight size={13} className="text-red-400 shrink-0" />
                    ) : (
                      <ArrowDownRight size={13} className="text-emerald-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 truncate">{featureLabel}</span>
                    {rawStudentVal != null && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Observed: {formatFeatureValue(rawStudentVal, rawName)})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span
                      className={`text-xs font-bold ${
                        isPositiveRisk ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {shapVal > 0 ? `+${(shapVal * 100).toFixed(1)}%` : `${(shapVal * 100).toFixed(1)}%`}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isPositiveRisk ? 'Risk Driver' : 'Protective'}
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidthPct}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                    className={`h-full rounded-full ${
                      isPositiveRisk
                        ? 'bg-gradient-to-r from-red-600 to-rose-400'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Non-Causal Grounding Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500">
        <Info size={12} className="shrink-0" />
        <span>
          Attribution values represent mathematical feature contributions under TreeSHAP, not direct causal interventions.
        </span>
      </div>
    </div>
  );
}

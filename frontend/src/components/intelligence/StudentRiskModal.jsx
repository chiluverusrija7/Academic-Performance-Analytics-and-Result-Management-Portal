/**
 * StudentRiskModal.jsx
 * Detailed student risk panel opened from the risk table.
 * Displays:
 *  - Student identity & academic profile
 *  - Risk probability & level (from ML API)
 *  - Current academic indicators (from live PostgreSQL)
 *  - Explainable model signals (from prediction.explainable_reasons)
 *  - Academic recommendations (from prediction.recommendations)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Target,
  Lightbulb,
  Activity,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { RiskBadge, RiskProgressBar } from './RiskBadge';
import { Skeleton } from '../ui/Skeleton';

function IndicatorRow({ label, value, sub, alert = false, positive = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-300">{label}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`text-sm font-bold shrink-0 ml-3 ${
          alert ? 'text-red-400' : positive ? 'text-emerald-400' : 'text-slate-100'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function StudentRiskModal({ entry, onClose }) {
  const { student, prediction } = entry;
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await api.getStudentSummary(student.student_id);
        if (res.success) setSummary(res.data);
      } catch (err) {
        setSummaryError('Failed to load academic summary');
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [student.student_id]);

  const features = prediction?.features;
  const reasons = prediction?.explainable_reasons || [];
  const recommendations = prediction?.recommendations || [];
  const riskLevel = prediction?.risk_category || 'UNKNOWN';
  const riskPct = prediction?.risk_percentage;
  const hasData = prediction?.status === 'success';
  const isInsufficient = prediction?.status === 'insufficient_data';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 h-full w-full max-w-[480px] bg-[#0b1220] border-l border-white/8 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0b1220]/95 backdrop-blur border-b border-white/8 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 font-bold text-sm">
                {student.first_name?.[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {student.first_name} {student.last_name || ''}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">{student.roll_no}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Risk Summary Card */}
            <div
              className={`rounded-xl border p-4 ${
                riskLevel === 'HIGH'
                  ? 'bg-red-500/8 border-red-500/25'
                  : riskLevel === 'MEDIUM'
                  ? 'bg-amber-500/8 border-amber-500/25'
                  : riskLevel === 'LOW'
                  ? 'bg-emerald-500/8 border-emerald-500/25'
                  : 'bg-white/3 border-white/8'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    AI / ML · Early Risk Prediction
                  </p>
                  <RiskBadge level={riskLevel} size="md" />
                </div>
                {riskPct != null && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{riskPct}%</div>
                    <div className="text-[10px] text-slate-400">risk probability</div>
                  </div>
                )}
              </div>
              {hasData && <RiskProgressBar probability={riskPct} level={riskLevel} />}
              {isInsufficient && (
                <p className="text-xs text-slate-400 mt-2 italic">{prediction.message}</p>
              )}
            </div>

            {/* Student Info */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <User size={11} /> Student Profile
              </p>
              <div className="bg-white/[0.025] border border-white/5 rounded-lg px-4">
                <IndicatorRow label="Department" value={student.dept_name || '—'} />
                <IndicatorRow label="Course" value={student.course_name || '—'} />
                <IndicatorRow label="Current Semester" value={`Semester ${student.current_semester}`} />
                <IndicatorRow label="Section" value={student.section || '—'} />
              </div>
            </div>

            {/* Current Academic Indicators from ML features */}
            {hasData && features && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Activity size={11} /> Current Academic Indicators
                </p>
                <div className="bg-white/[0.025] border border-white/5 rounded-lg px-4">
                  <IndicatorRow
                    label="Attendance to Date"
                    value={`${features.attendance_pct_to_date ?? '—'}%`}
                    sub="Current semester classes attended"
                    alert={features.attendance_pct_to_date != null && features.attendance_pct_to_date < 75}
                    positive={features.attendance_pct_to_date != null && features.attendance_pct_to_date >= 85}
                  />
                  <IndicatorRow
                    label="In-Sem Average"
                    value={`${features.in_sem_avg_pct ?? '—'}%`}
                    sub="Internal assessment average"
                    alert={features.in_sem_avg_pct != null && features.in_sem_avg_pct < 50}
                    positive={features.in_sem_avg_pct != null && features.in_sem_avg_pct >= 75}
                  />
                  <IndicatorRow
                    label="Subjects Below 50% Internal"
                    value={features.low_internal_subjects_count ?? '—'}
                    sub="Number of subjects with critical internal marks"
                    alert={features.low_internal_subjects_count > 0}
                  />
                  <IndicatorRow
                    label="Previous SGPA"
                    value={features.previous_sgpa != null ? features.previous_sgpa.toFixed(2) : 'No prior record'}
                    sub="Historical semester grade average"
                    alert={features.previous_sgpa != null && features.previous_sgpa < 6.0}
                    positive={features.previous_sgpa != null && features.previous_sgpa >= 8.0}
                  />
                  <IndicatorRow
                    label="Previous Backlogs"
                    value={features.previous_backlogs ?? '0'}
                    sub="Accumulated backlog subjects"
                    alert={features.previous_backlogs > 0}
                  />
                  <IndicatorRow
                    label="Performance Trend"
                    value={
                      features.performance_trend > 0.05
                        ? '↑ Improving'
                        : features.performance_trend < -0.05
                        ? '↓ Declining'
                        : '→ Stable'
                    }
                    sub="Relative to historical performance average"
                    positive={features.performance_trend > 0.05}
                    alert={features.performance_trend < -0.05}
                  />
                </div>
              </div>
            )}

            {/* Explainability — Why the model flagged this student */}
            {hasData && reasons.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Info size={11} /> Model Signals
                </p>
                <p className="text-[10px] text-slate-500 mb-3 italic">
                  The following are predictive indicators identified by the ML model. These are contributing factors, not guaranteed causal relationships.
                </p>
                <div className="space-y-2">
                  {reasons.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 bg-amber-500/6 border border-amber-500/15 rounded-lg"
                    >
                      <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {hasData && recommendations.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Lightbulb size={11} /> Academic Recommendations
                </p>
                <p className="text-[10px] text-slate-500 mb-3 italic">
                  Recommendations are derived from actual academic indicators and model factors. They do not guarantee outcomes.
                </p>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 bg-blue-500/6 border border-blue-500/15 rounded-lg"
                    >
                      <CheckCircle size={12} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Marks Summary from PostgreSQL */}
            {!summaryLoading && summary?.marks_by_subject?.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <BookOpen size={11} /> Subject Performance · Live Data
                </p>
                <div className="space-y-1.5">
                  {summary.marks_by_subject.map((subj) => {
                    const internalPct = subj.avg_internal != null ? ((subj.avg_internal / 40) * 100).toFixed(0) : null;
                    const isLow = internalPct != null && parseFloat(internalPct) < 50;
                    return (
                      <div
                        key={subj.subject_code}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                          isLow
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-white/[0.025] border-white/5'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[10px] text-slate-400">{subj.subject_code}</span>
                          <span className="text-slate-300 ml-2">{subj.subject_name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className={`font-bold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                            {subj.avg_total ?? '—'} / 100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {summaryLoading && (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            )}

            {summaryError && (
              <p className="text-xs text-slate-400 text-center py-3">{summaryError}</p>
            )}

            {/* Results History */}
            {!summaryLoading && summary?.results?.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Target size={11} /> Semester Results History
                </p>
                <div className="space-y-1.5">
                  {summary.results.map((r) => (
                    <div
                      key={r.result_id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.025] border border-white/5 text-xs"
                    >
                      <span className="text-slate-300">
                        Semester {r.semester_no} · {r.academic_year}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400">{r.percentage != null ? `${parseFloat(r.percentage).toFixed(1)}%` : '—'}</span>
                        <span className="font-bold text-sky-300">SGPA {r.sgpa != null ? parseFloat(r.sgpa).toFixed(2) : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

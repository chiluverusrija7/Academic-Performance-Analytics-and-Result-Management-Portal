/**
 * StudentPersonalIntelligence.jsx
 *
 * Student Personal Intelligence section - embedded inside StudentDashboard.
 * All data comes from real PostgreSQL (via Express analytics APIs) and the
 * verified ML risk-prediction microservice.
 *
 * NO hardcoded values, NO synthetic training data, NO invented predictions.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, BookOpen, Target, Lightbulb, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Minus, BarChart2, X, Eye, Shield,
  AlertOctagon, HelpCircle, Calendar, Clock, Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RiskBadge, RiskProgressBar } from '../intelligence/RiskBadge';
import { Badge } from '../ui/Badge';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n, decimals = 1) {
  if (n == null || isNaN(n)) return '-';
  return Number(n).toFixed(decimals);
}
function pct(n) {
  return n != null ? `${fmt(n)}%` : '-';
}

function classifySubject(avgInternal, attendancePct) {
  const internalPct = avgInternal != null ? (avgInternal / 40) * 100 : null;
  const attPct = attendancePct != null ? Number(attendancePct) : null;
  const internalOk = internalPct == null || internalPct >= 60;
  const attOk = attPct == null || attPct >= 75;
  if (internalOk && attOk) {
    if (internalPct != null && internalPct >= 75 && (attPct == null || attPct >= 85)) return 'Strong';
    return 'Stable';
  }
  return 'Needs Attention';
}

const classificationConfig = {
  Strong:            { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Stable:            { bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  'Needs Attention': { bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   text: 'text-amber-400',   dot: 'bg-amber-400' },
};

const riskConfig = {
  HIGH:    { gradient: 'from-red-500/20 to-red-900/5',         border: 'border-red-500/30',     icon: AlertOctagon,  color: 'text-red-400',     label: 'HIGH RISK' },
  MEDIUM:  { gradient: 'from-amber-500/20 to-amber-900/5',     border: 'border-amber-500/30',   icon: AlertTriangle, color: 'text-amber-400',   label: 'MEDIUM RISK' },
  LOW:     { gradient: 'from-emerald-500/20 to-emerald-900/5', border: 'border-emerald-500/30', icon: CheckCircle,   color: 'text-emerald-400', label: 'LOW RISK' },
  UNKNOWN: { gradient: 'from-slate-500/10 to-transparent',     border: 'border-slate-500/20',   icon: HelpCircle,    color: 'text-slate-400',   label: 'INSUFFICIENT DATA' },
};

/* ─── animated counter ────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '%', duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((target * eased).toFixed(2)));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return <span>{display.toFixed(1)}{suffix}</span>;
}

/* ─── IndicatorRow ────────────────────────────────────────── */
function IndicatorRow({ label, value, sub, alert = false, positive = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="min-w-0 pr-4">
        <p className="text-xs font-medium text-slate-300 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <span className={`text-sm font-bold shrink-0 ${alert ? 'text-red-400' : positive ? 'text-emerald-400' : 'text-slate-100'}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── Why Drawer ──────────────────────────────────────────── */
function WhyDrawer({ prediction, onClose }) {
  const f = prediction?.features || {};
  const trend = f.performance_trend;
  const trendLabel = trend > 0.05 ? 'Improving' : trend < -0.05 ? 'Declining' : 'Steady';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="relative z-10 w-full max-w-lg bg-[#0b121e] border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Brain size={16} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Prediction Explanation</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Contributing factors · Not causal claims</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-0 mb-5">
          {f.attendance_pct_to_date != null && <IndicatorRow label="Attendance to Date" value={pct(f.attendance_pct_to_date)} sub="Percentage of scheduled sessions attended" alert={f.attendance_pct_to_date < 75} positive={f.attendance_pct_to_date >= 85} />}
          {f.in_sem_avg_pct != null && <IndicatorRow label="Internal Exam Performance" value={pct(f.in_sem_avg_pct)} sub="Average internal marks (as % of maximum 40)" alert={f.in_sem_avg_pct < 50} positive={f.in_sem_avg_pct >= 70} />}
          {f.low_internal_subjects_count != null && <IndicatorRow label="Subjects Below 50% Internal" value={f.low_internal_subjects_count} sub="Subjects where internal marks < 20/40" alert={f.low_internal_subjects_count > 1} positive={f.low_internal_subjects_count === 0} />}
          {f.previous_sgpa != null && <IndicatorRow label="Previous Semester SGPA" value={fmt(f.previous_sgpa)} sub="SGPA from the most recently published semester" alert={f.previous_sgpa < 5.5} positive={f.previous_sgpa >= 8.0} />}
          {trend != null && <IndicatorRow label="Performance Trend" value={trendLabel} sub="Directional change across available semesters" positive={trend > 0.05} alert={trend < -0.05} />}
          {f.backlogs_count != null && <IndicatorRow label="Active Backlogs" value={f.backlogs_count} sub="Subjects with pending clearance" alert={f.backlogs_count > 0} positive={f.backlogs_count === 0} />}
        </div>
        {prediction?.recommendations?.length > 0 && (
          <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500 mb-2.5">System Recommendations</p>
            <ul className="space-y-1.5">
              {prediction.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-cyan-500 shrink-0 mt-0.5">›</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-[10px] text-slate-600 text-center">
          These are predictive indicators from a trained ML model, not guaranteed outcomes.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── SGPA Tooltip ────────────────────────────────────────── */
function SgpaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0b121e] border border-white/10 rounded-lg px-3 py-2.5 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">Semester {label}</p>
      <p className="font-bold text-blue-400">SGPA: {payload[0]?.value?.toFixed(2)}</p>
    </div>
  );
}

/* ─── SubjectCard ─────────────────────────────────────────── */
function SubjectCard({ subjectName, subjectCode, avgInternal, avgTotal, attendancePct, delay = 0 }) {
  const classification = classifySubject(avgInternal, attendancePct);
  const cfg = classificationConfig[classification];
  const internalPct = avgInternal != null ? (avgInternal / 40) * 100 : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }}
      className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-100 truncate">{subjectName}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{subjectCode}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${cfg.bg} ${cfg.border} ${cfg.text} shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{classification}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/20 rounded-lg p-2.5">
          <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Internal</p>
          <p className={`text-base font-bold ${cfg.text}`}>{internalPct != null ? `${fmt(internalPct)}%` : '-'}</p>
          {avgInternal != null && <p className="text-[9px] text-slate-600 mt-0.5">{fmt(avgInternal, 1)}/40</p>}
        </div>
        {attendancePct != null ? (
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Attendance</p>
            <p className={`text-base font-bold ${Number(attendancePct) < 75 ? 'text-red-400' : 'text-slate-100'}`}>{pct(attendancePct)}</p>
            <p className="text-[9px] text-slate-600 mt-0.5">{Number(attendancePct) < 75 ? 'Below threshold' : 'Good standing'}</p>
          </div>
        ) : avgTotal != null ? (
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Avg Total</p>
            <p className="text-base font-bold text-slate-100">{fmt(avgTotal)}</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export function StudentPersonalIntelligence() {
  const { user } = useAuth();
  const studentId = user?.student_id || user?.id;

  const [prediction, setPrediction] = useState(null);
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);

  const load = useCallback(async () => {
    if (!studentId) { setError('Student profile not found. Please log in again.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [riskRes, summaryRes, attRes] = await Promise.all([
        api.getRiskPrediction(studentId),
        api.getStudentSummary(studentId),
        api.getAttendance(studentId),
      ]);
      if (riskRes?.prediction) setPrediction(riskRes.prediction);
      if (summaryRes?.success) setSummary(summaryRes.data);
      if (attRes?.success) setAttendance(attRes);
    } catch (err) {
      setError(err.message || 'Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  /* derived */
  const p = prediction;
  const riskLevel = p?.risk_category || 'UNKNOWN';
  const riskProbability = p?.risk_percentage ?? null;
  const hasPrediction = p?.status === 'success';
  const rcfg = riskConfig[riskLevel] || riskConfig.UNKNOWN;
  const RiskIcon = rcfg.icon;

  const results = summary?.results || [];
  const sgpaTrend = results
    .filter((r) => r.sgpa != null)
    .sort((a, b) => a.semester_no - b.semester_no)
    .map((r) => ({ sem: r.semester_no, sgpa: parseFloat(r.sgpa) }));

  const marksBySubject = summary?.marks_by_subject || [];
  const subjectAttendance = attendance?.subject_summary || [];

  const mergedSubjects = marksBySubject.map((m) => {
    const att = subjectAttendance.find((a) => a.subject_code === m.subject_code);
    return { ...m, attendancePct: att?.attendance_percentage ?? null };
  });

  const prioritySubjects = [...mergedSubjects]
    .filter((s) => s.avg_internal != null)
    .sort((a, b) => a.avg_internal - b.avg_internal)
    .slice(0, 3);

  const lowAttSubjects = subjectAttendance.filter(
    (s) => s.attendance_percentage != null && Number(s.attendance_percentage) < 75
  );

  const overallAtt =
    summary?.attendance?.attendance_pct != null
      ? parseFloat(summary.attendance.attendance_pct)
      : attendance?.stats?.overall_percentage != null
      ? parseFloat(attendance.stats.overall_percentage)
      : null;

  /* action plan */
  function buildActionPlan() {
    const actions = [];
    if (overallAtt != null && overallAtt < 75)
      actions.push({ priority: 'critical', icon: '⚠️', text: `Your overall attendance is ${fmt(overallAtt)}%. You need ≥75% to be eligible for end-semester exams. Attend every remaining session.` });
    if (lowAttSubjects.length > 0)
      actions.push({ priority: 'high', icon: '📋', text: `${lowAttSubjects.length} subject(s) (${lowAttSubjects.map((s) => s.subject_code).join(', ')}) are below 75% attendance. Prioritise these first.` });
    if (prioritySubjects.length > 0) {
      const weakest = prioritySubjects[0];
      const ip = weakest.avg_internal != null ? (weakest.avg_internal / 40) * 100 : null;
      if (ip != null && ip < 60)
        actions.push({ priority: 'high', icon: '📚', text: `${weakest.subject_name} has your lowest internal performance (${fmt(ip)}%). Seek additional study resources or faculty support.` });
    }
    if (riskLevel === 'HIGH')
      actions.push({ priority: 'high', icon: '🎯', text: 'Your risk indicators are elevated. Visit your academic advisor to develop a remediation plan before the end-semester exams.' });
    else if (riskLevel === 'MEDIUM')
      actions.push({ priority: 'medium', icon: '🔍', text: 'Some risk indicators are present. Monitor your attendance and internal marks closely over the next few weeks.' });
    if (sgpaTrend.length >= 2) {
      const last = sgpaTrend[sgpaTrend.length - 1].sgpa;
      const prev = sgpaTrend[sgpaTrend.length - 2].sgpa;
      if (last < prev)
        actions.push({ priority: 'medium', icon: '📈', text: `Your SGPA dropped from ${fmt(prev)} to ${fmt(last)} in the latest semester. Review what changed and address it proactively.` });
    }
    if (actions.length === 0 && riskLevel === 'LOW')
      actions.push({ priority: 'positive', icon: '✅', text: 'Your current indicators are strong. Maintain your attendance and internal performance to keep this trajectory.' });
    if (actions.length === 0)
      actions.push({ priority: 'neutral', icon: '📊', text: 'Insufficient academic data is available yet to generate specific recommendations. Check back after your first semester records are finalised.' });
    return actions;
  }

  /* insights */
  function buildInsights() {
    const ins = [];
    if (sgpaTrend.length >= 2) {
      const last = sgpaTrend[sgpaTrend.length - 1];
      const prev = sgpaTrend[sgpaTrend.length - 2];
      const delta = last.sgpa - prev.sgpa;
      if (Math.abs(delta) >= 0.1)
        ins.push({
          icon: delta >= 0 ? TrendingUp : TrendingDown,
          color: delta >= 0 ? 'text-emerald-400' : 'text-red-400',
          text: delta >= 0
            ? `SGPA improved by ${fmt(Math.abs(delta))} points from Semester ${prev.sem} to ${last.sem}.`
            : `SGPA declined by ${fmt(Math.abs(delta))} points from Semester ${prev.sem} to ${last.sem}.`,
        });
    }
    if (overallAtt != null)
      ins.push({
        icon: overallAtt >= 85 ? CheckCircle : overallAtt >= 75 ? Minus : AlertTriangle,
        color: overallAtt >= 85 ? 'text-emerald-400' : overallAtt >= 75 ? 'text-blue-400' : 'text-amber-400',
        text: overallAtt >= 85
          ? `Overall attendance is ${fmt(overallAtt)}% — excellent standing across all subjects.`
          : overallAtt >= 75
          ? `Overall attendance is ${fmt(overallAtt)}% — eligible but monitor closely to stay above 75%.`
          : `Overall attendance is ${fmt(overallAtt)}% — below the 75% minimum eligibility threshold.`,
      });
    const strongSubs = mergedSubjects.filter((s) => classifySubject(s.avg_internal, s.attendancePct) === 'Strong');
    if (strongSubs.length > 0)
      ins.push({ icon: CheckCircle, color: 'text-emerald-400', text: `${strongSubs.length} subject(s) classified as Strong: ${strongSubs.map((s) => s.subject_code).join(', ')}.` });
    if (ins.length === 0)
      ins.push({ icon: Activity, color: 'text-slate-400', text: 'Insufficient historical data to generate trend-based academic insights yet.' });
    return ins;
  }

  const actionPlan = buildActionPlan();
  const insights = buildInsights();

  const priorityStyles = {
    critical: 'border-red-500/30 bg-red-500/5',
    high:     'border-amber-500/30 bg-amber-500/5',
    medium:   'border-blue-500/20 bg-blue-500/5',
    positive: 'border-emerald-500/30 bg-emerald-500/5',
    neutral:  'border-white/10 bg-white/3',
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-1">
        {[0,1,2].map((i) => <div key={i} className="h-36 rounded-2xl bg-white/3 animate-pulse" />)}
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center">
        <AlertTriangle size={20} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-slate-300">{error}</p>
        <button onClick={load} className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline">Retry</button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWhyDrawer && hasPrediction && <WhyDrawer prediction={p} onClose={() => setShowWhyDrawer(false)} />}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Section header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
            <Brain size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Personal Academic Intelligence</h2>
            <p className="text-xs text-slate-400 mt-0.5">Understand your current academic performance, risk signals, and areas that need attention.</p>
          </div>
        </div>

        {/* Snapshot bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Attendance', value: overallAtt != null ? `${fmt(overallAtt)}%` : '-', color: overallAtt == null ? 'text-slate-400' : overallAtt >= 75 ? 'text-emerald-400' : 'text-red-400', icon: CheckCircle },
            { label: 'Latest SGPA', value: sgpaTrend.length > 0 ? fmt(sgpaTrend[sgpaTrend.length-1].sgpa) : '-', color: 'text-blue-400', icon: Award },
            { label: 'Subjects', value: mergedSubjects.length > 0 ? mergedSubjects.length : '-', color: 'text-sky-400', icon: BookOpen },
            { label: 'Risk Level', value: riskLevel, color: rcfg.color, icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
              className="bg-navy-900/80 border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
              <Icon size={16} className={`shrink-0 ${color}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Risk Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className={`relative rounded-2xl border bg-gradient-to-br ${rcfg.gradient} ${rcfg.border} overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/3 to-transparent pointer-events-none rounded-bl-full" />
          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-black/20 border border-white/10">
                  <RiskIcon size={24} className={rcfg.color} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">AI Academic Risk · Trained Model</p>
                  {hasPrediction ? (
                    <>
                      <h3 className={`text-2xl font-black tracking-tight ${rcfg.color}`}>{rcfg.label}</h3>
                      <p className="text-slate-300 text-sm mt-0.5 font-mono">
                        Risk probability: <span className={`font-bold ${rcfg.color}`}><AnimatedCounter target={riskProbability} /></span>
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-slate-400">Prediction Unavailable</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Insufficient academic history for a meaningful risk estimate yet.</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 sm:items-end">
                {hasPrediction && (
                  <>
                    <div className="w-full sm:w-52"><RiskProgressBar probability={riskProbability} level={riskLevel} /></div>
                    <button onClick={() => setShowWhyDrawer(true)} className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                      <Eye size={13} />View Why
                    </button>
                  </>
                )}
                {p?.timestamp && (
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Clock size={9} />{new Date(p.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* SGPA Trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}
          className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"><TrendingUp size={16} className="text-blue-400" /></div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Academic Performance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">SGPA per semester from verified PostgreSQL result records</p>
            </div>
          </div>
          <div className="p-5">
            {sgpaTrend.length >= 1 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sgpaTrend} margin={{ top: 10, right: 16, left: -24, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="sem" tickFormatter={(v) => `Sem ${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                    <Tooltip content={<SgpaTooltip />} />
                    <ReferenceLine y={7.5} stroke="rgba(16,185,129,0.2)" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="sgpa" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0b121e' }} activeDot={{ r: 7, fill: '#60a5fa' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center">
                <BarChart2 size={28} className="text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 text-center">No published semester results yet.<br />Trend will appear once your first result is recorded.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Subject Intelligence */}
        {mergedSubjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.3 }}
            className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20"><BookOpen size={16} className="text-purple-400" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Subject Intelligence</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Per-subject internal performance &amp; attendance from PostgreSQL</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Strong</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Stable</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Needs Attention</span>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mergedSubjects.map((s, i) => (
                  <SubjectCard key={s.subject_code || i} subjectName={s.subject_name} subjectCode={s.subject_code}
                    avgInternal={s.avg_internal != null ? Number(s.avg_internal) : null}
                    avgTotal={s.avg_total != null ? Number(s.avg_total) : null}
                    attendancePct={s.attendancePct} delay={i * 0.04} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Priority + Attendance row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Priority Subjects */}
          {prioritySubjects.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><Target size={16} className="text-amber-400" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Priority Subjects</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lowest-performing subjects by internal marks</p>
                </div>
              </div>
              <div className="p-5 divide-y divide-white/5">
                {prioritySubjects.map((s, i) => {
                  const ip = s.avg_internal != null ? (s.avg_internal / 40) * 100 : null;
                  const isWeak = ip != null && ip < 60;
                  return (
                    <div key={s.subject_code || i} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{s.subject_name}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">{s.subject_code}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${isWeak ? 'text-amber-400' : 'text-blue-400'}`}>{ip != null ? `${fmt(ip)}%` : '-'}</p>
                          <p className="text-[10px] text-slate-500">internal</p>
                        </div>
                      </div>
                      {ip != null && (
                        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${isWeak ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(ip, 100)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Attendance Intelligence */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.3 }}
            className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20"><Calendar size={16} className="text-sky-400" /></div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Attendance Intelligence</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real attendance records from PostgreSQL</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300">Overall Attendance</span>
                  <span className={`text-sm font-bold ${overallAtt == null ? 'text-slate-400' : overallAtt >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {overallAtt != null ? `${fmt(overallAtt)}%` : '-'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${overallAtt == null ? 'bg-slate-500' : overallAtt >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${overallAtt != null ? Math.min(overallAtt, 100) : 0}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
                  <span>{(summary?.attendance?.attended_classes || attendance?.stats?.attended_classes || '-') + ' sessions attended'}</span>
                  <span className="text-amber-500">75% required</span>
                </div>
              </div>
              {lowAttSubjects.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-2">Below 75% Threshold</p>
                  <div className="space-y-2">
                    {lowAttSubjects.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-300 truncate">{s.subject_name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{s.subject_code}</p>
                        </div>
                        <span className="text-sm font-bold text-red-400 shrink-0">{pct(s.attendance_percentage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : subjectAttendance.length > 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle size={13} />All subjects are above the 75% attendance threshold.
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No per-subject attendance data available.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action Plan */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.3 }}
          className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20"><Lightbulb size={16} className="text-cyan-400" /></div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Personalized Action Plan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Data-grounded recommendations derived from your actual academic records</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {actionPlan.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                className={`flex items-start gap-3 rounded-xl border p-3.5 ${priorityStyles[item.priority] || 'border-white/10 bg-white/3'}`}>
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Academic Insights */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.3 }}
          className="bg-navy-900/90 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><Activity size={16} className="text-emerald-400" /></div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Recent Academic Insights</h3>
              <p className="text-xs text-slate-400 mt-0.5">Observations generated from your real academic data</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {insights.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0">
                  <Icon size={14} className={`shrink-0 mt-0.5 ${item.color}`} />
                  <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}

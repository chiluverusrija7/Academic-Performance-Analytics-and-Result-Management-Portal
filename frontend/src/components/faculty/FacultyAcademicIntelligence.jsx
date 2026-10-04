/**
 * FacultyAcademicIntelligence.jsx
 *
 * Faculty Academic Intelligence Layer - Scoped to the authenticated faculty member.
 * Displays class overview, early-risk student attention panel, subject intelligence,
 * performance distribution charts, review tables, and non-causal ML risk explainability.
 *
 * All data is sourced directly from PostgreSQL (via Express /api/analytics/faculty-summary/:id)
 * and verified live ML risk predictions (/api/intelligence/risk/:studentId).
 * NO hardcoded statistics, NO synthetic training data, NO fabricated predictions.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  BookOpen,
  Users,
  Target,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart as PieChartIcon,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  Shield,
  ArrowRight,
  RefreshCw,
  Award,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RiskBadge, RiskProgressBar } from '../intelligence/RiskBadge';
import { Badge } from '../ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n, decimals = 1) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
}
function pct(n) {
  return n != null ? `${fmt(n)}%` : '—';
}

const riskLevelColors = {
  HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-400', dot: 'bg-red-400' },
  MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', dot: 'bg-amber-400' },
  LOW: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  UNKNOWN: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
};

/* ─── Student Risk Detail Drawer ─────────────────────────── */
function FacultyStudentDrawer({ student, prediction, onClose }) {
  const navigate = useNavigate();
  const f = prediction?.features || {};
  const reasons = prediction?.explainable_reasons || [];
  const recommendations = prediction?.recommendations || [];
  const level = prediction?.risk_category || 'UNKNOWN';
  const riskPct = prediction?.risk_percentage;
  const hasPrediction = prediction?.status === 'success';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="relative z-10 w-full max-w-lg h-full bg-[#0b121e] border-l border-white/10 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Brain size={18} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {student?.first_name} {student?.last_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Roll No: <span className="text-cyan-300 font-semibold">{student?.roll_no}</span> • Sem {student?.current_semester} (Sec {student?.section})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subject Context */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500">Enrolled Teaching Subject</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">{student?.subject_name}</p>
            </div>
            <Badge variant="primary" size="sm">{student?.subject_code}</Badge>
          </div>

          {/* ML Early Risk Assessment */}
          <div className="bg-navy-900/90 border border-white/10 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Early Academic Risk
              </span>
              <RiskBadge level={level} size="sm" />
            </div>

            {hasPrediction ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-300">Model Risk Probability</span>
                  <span className="text-2xl font-black text-white font-mono">{riskPct}%</span>
                </div>
                <RiskProgressBar probability={riskPct} level={level} />
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Predictive signal generated from live attendance, internal marks, and longitudinal records. Not a guarantee.
                </p>
              </div>
            ) : (
              <div className="py-2 text-center">
                <HelpCircle size={20} className="text-slate-500 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 font-semibold">Prediction Unavailable</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Insufficient historical or current records for early risk estimation.
                </p>
              </div>
            )}
          </div>

          {/* Current Academic Indicators */}
          <div className="space-y-3 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Academic Indicators</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase text-slate-500 font-semibold">Subject Attendance</p>
                <p className={`text-lg font-bold mt-1 ${student?.attendance_pct != null && Number(student.attendance_pct) < 75 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {pct(student?.attendance_pct)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {student?.attended_classes != null ? `${student.attended_classes}/${student.total_classes || 0} sessions` : 'No logs recorded'}
                </p>
              </div>

              <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase text-slate-500 font-semibold">Subject Internal</p>
                <p className={`text-lg font-bold mt-1 ${student?.internal_pct != null && Number(student.internal_pct) < 50 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {pct(student?.internal_pct)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {student?.internal_marks != null ? `${fmt(student.internal_marks)}/40 marks` : 'Pending entry'}
                </p>
              </div>
            </div>
          </div>

          {/* Contributing Signals */}
          {hasPrediction && reasons.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Model Contributing Signals
              </p>
              <ul className="space-y-1.5">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Attention */}
          {hasPrediction && recommendations.length > 0 && (
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <Lightbulb size={12} /> Recommended Faculty Attention
              </p>
              <ul className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 shrink-0 mt-0.5">›</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/faculty/attendance');
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-colors text-center"
          >
            Manage Attendance
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/faculty/marks');
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg transition-colors text-center"
          >
            Update Marks
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export function FacultyAcademicIntelligence() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const facultyId = user?.faculty_id || user?.id || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [riskMap, setRiskMap] = useState({});
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConcern, setFilterConcern] = useState('ALL');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState(null);

  /* Load faculty summary data */
  const loadData = useCallback(async () => {
    if (!facultyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFacultySummary(facultyId);
      if (res?.success) {
        setSummaryData(res.data);

        // Fetch live ML risk predictions for unique students taught
        const uniqueStudentIds = Array.from(
          new Set((res.data.students || []).map((s) => s.student_id).filter(Boolean))
        );

        // Batch fetch predictions in parallel
        const predictions = await Promise.allSettled(
          uniqueStudentIds.map((id) => api.getRiskPrediction(id))
        );

        const newMap = {};
        predictions.forEach((pRes, idx) => {
          const sid = uniqueStudentIds[idx];
          if (pRes.status === 'fulfilled' && pRes.value?.prediction) {
            newMap[sid] = pRes.value.prediction;
          }
        });
        setRiskMap(newMap);
      } else {
        throw new Error(res?.message || 'Failed to load faculty summary');
      }
    } catch (err) {
      setError(err.message || 'Failed to load faculty intelligence');
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Derived data */
  const subjects = summaryData?.subjects || [];
  const subjectStats = summaryData?.subject_stats || [];
  const allStudents = summaryData?.students || [];

  // Filter students by selected subject
  const scopedStudents = useMemo(() => {
    if (selectedSubjectId === 'ALL') return allStudents;
    return allStudents.filter((s) => s.subject_id === parseInt(selectedSubjectId, 10));
  }, [allStudents, selectedSubjectId]);

  // Merge student records with live risk predictions
  const enrichedStudents = useMemo(() => {
    return scopedStudents.map((s) => {
      const pred = riskMap[s.student_id];
      const riskLevel = pred?.risk_category || 'UNKNOWN';
      const riskProb = pred?.risk_percentage ?? null;

      let priority = 'MONITOR';
      const attVal = s.attendance_pct != null ? Number(s.attendance_pct) : null;
      const intVal = s.internal_pct != null ? Number(s.internal_pct) : null;

      if ((attVal != null && attVal < 75) || (intVal != null && intVal < 50) || riskLevel === 'HIGH') {
        priority = 'HIGH';
      } else if ((attVal != null && attVal < 80) || (intVal != null && intVal < 60) || riskLevel === 'MEDIUM') {
        priority = 'MEDIUM';
      }

      return {
        ...s,
        prediction: pred,
        riskLevel,
        riskProb,
        priority,
      };
    });
  }, [scopedStudents, riskMap]);

  // Overall KPI metrics
  const kpis = useMemo(() => {
    const totalAssigned = subjects.length;
    const uniqueStudentsTaught = new Set(allStudents.map((s) => s.student_id)).size;

    let totalAttPctSum = 0;
    let totalAttCount = 0;
    let totalIntPctSum = 0;
    let totalIntCount = 0;

    allStudents.forEach((s) => {
      if (s.attendance_pct != null) {
        totalAttPctSum += Number(s.attendance_pct);
        totalAttCount++;
      }
      if (s.internal_pct != null) {
        totalIntPctSum += Number(s.internal_pct);
        totalIntCount++;
      }
    });

    const avgAttendance = totalAttCount > 0 ? totalAttPctSum / totalAttCount : null;
    const avgInternal = totalIntCount > 0 ? totalIntPctSum / totalIntCount : null;

    const needingAttention = enrichedStudents.filter(
      (s) => s.priority === 'HIGH' || s.priority === 'MEDIUM'
    ).length;

    const highRiskCount = enrichedStudents.filter((s) => s.riskLevel === 'HIGH').length;

    return {
      totalAssigned,
      uniqueStudentsTaught,
      avgAttendance,
      avgInternal,
      needingAttention,
      highRiskCount,
    };
  }, [subjects, allStudents, enrichedStudents]);

  // Filtered students for review table
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      const matchQuery =
        !searchQuery ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subject_code?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (filterConcern === 'ATTENDANCE') {
        return s.attendance_pct != null && Number(s.attendance_pct) < 75;
      }
      if (filterConcern === 'INTERNAL') {
        return s.internal_pct != null && Number(s.internal_pct) < 50;
      }
      if (filterConcern === 'HIGH_RISK') {
        return s.riskLevel === 'HIGH' || s.priority === 'HIGH';
      }
      return true;
    });
  }, [enrichedStudents, searchQuery, filterConcern]);

  // Chart data: Subject comparison (Internal % vs Attendance %)
  const subjectComparisonChartData = useMemo(() => {
    return subjectStats.map((st) => ({
      code: st.subject_code,
      name: st.subject_name,
      internalPct: st.avg_internal_pct != null ? parseFloat(st.avg_internal_pct) : 0,
      attendancePct: st.avg_attendance_pct != null ? parseFloat(st.avg_attendance_pct) : 0,
      students: parseInt(st.enrolled_students || 0, 10),
    }));
  }, [subjectStats]);

  // Chart data: Attendance distribution bands
  const attendanceDistributionData = useMemo(() => {
    let below75 = 0;
    let between75_85 = 0;
    let above85 = 0;

    scopedStudents.forEach((s) => {
      if (s.attendance_pct != null) {
        const val = Number(s.attendance_pct);
        if (val < 75) below75++;
        else if (val <= 85) between75_85++;
        else above85++;
      }
    });

    return [
      { name: '< 75% (Critical)', count: below75, fill: '#ef4444' },
      { name: '75% - 85% (Eligible)', count: between75_85, fill: '#3b82f6' },
      { name: '> 85% (Good)', count: above85, fill: '#10b981' },
    ];
  }, [scopedStudents]);

  // Dynamic Subject-Level Insights
  const dynamicInsights = useMemo(() => {
    const ins = [];

    if (subjectStats.length > 0) {
      const sortedByAtt = [...subjectStats].sort((a, b) => (Number(a.avg_attendance_pct) || 0) - (Number(b.avg_attendance_pct) || 0));
      const lowestAtt = sortedByAtt[0];
      if (lowestAtt && lowestAtt.avg_attendance_pct != null) {
        ins.push({
          icon: AlertTriangle,
          color: 'text-amber-400',
          text: `Attendance is lowest in ${lowestAtt.subject_name} (${lowestAtt.subject_code}) at ${fmt(lowestAtt.avg_attendance_pct)}% average.`,
        });
      }

      const totalLowInternal = subjectStats.reduce((sum, s) => sum + parseInt(s.low_internal_count || 0, 10), 0);
      if (totalLowInternal > 0) {
        ins.push({
          icon: Target,
          color: 'text-rose-400',
          text: `${totalLowInternal} student record(s) score below 50% (<20/40) on internal evaluations.`,
        });
      } else {
        ins.push({
          icon: CheckCircle,
          color: 'text-emerald-400',
          text: `All evaluated students in your assigned subjects currently meet the 50% internal benchmark.`,
        });
      }

      const elevatedRiskCount = enrichedStudents.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM').length;
      if (elevatedRiskCount > 0) {
        ins.push({
          icon: Brain,
          color: 'text-cyan-400',
          text: `${elevatedRiskCount} student(s) exhibit elevated predictive academic risk indicators requiring proactive advising.`,
        });
      }
    }

    if (ins.length === 0) {
      ins.push({
        icon: Activity,
        color: 'text-slate-400',
        text: 'Sufficient evaluation records are being tracked. No critical alerts found.',
      });
    }

    return ins;
  }, [subjectStats, enrichedStudents]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse pt-4">
        <div className="h-28 rounded-2xl bg-white/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/3" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-200">Failed to load Faculty Intelligence</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Student Risk Detail Drawer */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <FacultyStudentDrawer
            student={selectedStudentForDrawer}
            prediction={riskMap[selectedStudentForDrawer.student_id]}
            onClose={() => setSelectedStudentForDrawer(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 shadow-glow-sm">
              <Brain size={22} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Faculty Academic Intelligence
                </h2>
                <Badge variant="cyan" size="xs">AI / ML Scoped</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor student performance, identify emerging academic risk, and understand subject-level trends.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
            >
              <RefreshCw size={12} />
              Refresh Intelligence
            </button>
          </div>
        </div>

        {/* ── KPI Overview Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Assigned Subjects</span>
              <BookOpen size={14} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-display">{kpis.totalAssigned}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active curriculum modules</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Students Taught</span>
              <Users size={14} className="text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-display">{kpis.uniqueStudentsTaught}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Enrolled across sections</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Avg Internal</span>
              <Award size={14} className="text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400 mt-2 font-display">{pct(kpis.avgInternal)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Continuous evaluation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Avg Attendance</span>
              <Calendar size={14} className="text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 font-display ${kpis.avgAttendance != null && kpis.avgAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pct(kpis.avgAttendance)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Threshold: 75%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Attention Queue</span>
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-display">{kpis.needingAttention}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Attendance or marks concern</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-navy-900/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400">High ML Risk</span>
              <AlertOctagon size={14} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400 mt-2 font-display">{kpis.highRiskCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">From trained model</p>
          </motion.div>
        </div>

        {/* ── Subject Filter Pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSubjectId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSubjectId === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            All Assigned Subjects ({subjects.length})
          </button>
          {subjects.map((s) => (
            <button
              key={s.subject_id}
              onClick={() => setSelectedSubjectId(s.subject_id.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedSubjectId === s.subject_id.toString()
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              <span className="font-mono">{s.subject_code}</span>
              <span className="opacity-80">· {s.subject_name}</span>
            </button>
          ))}
        </div>

        {/* ── Subject Intelligence Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats
            .filter((st) => selectedSubjectId === 'ALL' || st.subject_id.toString() === selectedSubjectId)
            .map((st, i) => (
              <motion.div
                key={st.subject_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-navy-900/90 border border-white/5 rounded-2xl p-5 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <Badge variant="primary" size="xs" className="font-mono mb-1">{st.subject_code}</Badge>
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">{st.subject_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Section {st.section} • {st.enrolled_students} Enrolled</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-black/20 rounded-xl p-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Avg Internal</p>
                    <p className="text-base font-bold text-blue-400 mt-0.5">
                      {st.avg_internal_pct != null ? `${fmt(st.avg_internal_pct)}%` : '—'}
                    </p>
                    <p className="text-[9px] text-slate-600">{st.avg_internal_marks != null ? `${fmt(st.avg_internal_marks)}/40` : ''}</p>
                  </div>

                  <div className="bg-black/20 rounded-xl p-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Avg Attendance</p>
                    <p className={`text-base font-bold mt-0.5 ${st.avg_attendance_pct != null && Number(st.avg_attendance_pct) < 75 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {pct(st.avg_attendance_pct)}
                    </p>
                    <p className="text-[9px] text-slate-600">Threshold 75%</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Below Internal Threshold:</span>
                  <span className={`font-bold ${parseInt(st.low_internal_count || 0, 10) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {st.low_internal_count || 0} students
                  </span>
                </div>
              </motion.div>
            ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Subject Comparison Bar Chart */}
          <div className="bg-navy-900/90 border border-white/5 rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Subject Evaluation &amp; Attendance Benchmark</h3>
                <p className="text-xs text-slate-400 mt-0.5">Comparison across assigned subjects from live PostgreSQL records</p>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectComparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="code" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b121e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val, name) => [`${val}%`, name === 'internalPct' ? 'Internal Average' : 'Attendance Average']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="internalPct" name="Internal Marks %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendancePct" name="Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Distribution */}
          <div className="bg-navy-900/90 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white">Attendance Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Cohort breakdown by attendance tier</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b121e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                    {attendanceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Critical (&lt;75%):</span>
                <span className="font-bold text-red-400">{attendanceDistributionData[0].count} students</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Good Standing (&ge;75%):</span>
                <span className="font-bold text-emerald-400">
                  {attendanceDistributionData[1].count + attendanceDistributionData[2].count} students
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Academic Attention Queue & Review Table ── */}
        <div className="bg-navy-900/90 border border-white/5 rounded-2xl overflow-hidden shadow-card">
          <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target size={16} className="text-cyan-400" />
                Students to Review · Academic Attention Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized student list with live internal marks, session attendance, and ML risk estimates
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48"
                />
              </div>

              <select
                value={filterConcern}
                onChange={(e) => setFilterConcern(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Students</option>
                <option value="HIGH_RISK">High Priority Only</option>
                <option value="ATTENDANCE">Attendance &lt; 75%</option>
                <option value="INTERNAL">Internal &lt; 50%</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No students matching the selected criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-800/80 uppercase text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">Attendance</th>
                    <th className="px-4 py-3 text-center">Internal Score</th>
                    <th className="px-4 py-3 text-center">ML Risk</th>
                    <th className="px-4 py-3">Primary Signal</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredStudents.map((s, idx) => {
                    const rcfg = riskLevelColors[s.riskLevel] || riskLevelColors.UNKNOWN;
                    const isAttLow = s.attendance_pct != null && Number(s.attendance_pct) < 75;
                    const isIntLow = s.internal_pct != null && Number(s.internal_pct) < 50;

                    let signalText = 'Normal standing';
                    if (isAttLow && isIntLow) signalText = 'Low attendance & internal';
                    else if (isAttLow) signalText = 'Attendance shortage (<75%)';
                    else if (isIntLow) signalText = 'Internal score below 50%';
                    else if (s.riskLevel === 'HIGH') signalText = 'High longitudinal ML risk';
                    else if (s.riskLevel === 'MEDIUM') signalText = 'Moderate academic risk';

                    return (
                      <tr key={`${s.student_id}-${s.subject_id}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{s.first_name} {s.last_name}</p>
                          <p className="text-[10px] font-mono text-cyan-400 mt-0.5">{s.roll_no}</p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-200">{s.subject_code}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{s.subject_name}</p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${isAttLow ? 'text-red-400' : 'text-emerald-400'}`}>
                            {pct(s.attendance_pct)}
                          </span>
                          <p className="text-[9px] text-slate-600">
                            {s.attended_classes != null ? `${s.attended_classes}/${s.total_classes}` : '—'}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${isIntLow ? 'text-amber-400' : 'text-blue-400'}`}>
                            {pct(s.internal_pct)}
                          </span>
                          <p className="text-[9px] text-slate-600">
                            {s.internal_marks != null ? `${fmt(s.internal_marks)}/40` : '—'}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <RiskBadge level={s.riskLevel} probability={s.riskProb} size="xs" />
                        </td>

                        <td className="px-4 py-3">
                          <span className={`text-[11px] ${s.priority === 'HIGH' ? 'text-rose-300 font-medium' : s.priority === 'MEDIUM' ? 'text-amber-300' : 'text-slate-400'}`}>
                            {signalText}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedStudentForDrawer(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[11px] font-semibold transition-colors"
                          >
                            <Eye size={12} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Data-Grounded Subject Insights ── */}
        <div className="bg-navy-900/90 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Subject-Level Faculty Insights</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated observations generated from live classroom records</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {dynamicInsights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Icon size={14} className={`shrink-0 mt-0.5 ${ins.color}`} />
                  <p className="text-xs text-slate-300 leading-relaxed">{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

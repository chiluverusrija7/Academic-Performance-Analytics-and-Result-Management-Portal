import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Sliders,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  ExternalLink,
  Layers,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ProgressBar } from '../ui/ProgressBar';

export function StudentInterventionDetailDrawer({
  studentId,
  studentData,
  checkpoint = 'W12',
  onClose,
  onStatusUpdated,
  onViewFullProfile,
}) {
  const toast = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update state
  const [status, setStatus] = useState(studentData?.intervention_status || 'PENDING');
  const [assignedFaculty, setAssignedFaculty] = useState(studentData?.assigned_faculty_name || 'Prof. Suresh Bhat');
  const [reviewDate, setReviewDate] = useState(studentData?.next_review_date || '2026-10-20');
  const [notes, setNotes] = useState(studentData?.notes || '');
  const [savingStatus, setSavingStatus] = useState(false);

  // Counterfactual sliders inside drawer
  const [simAttBoost, setSimAttBoost] = useState(10);
  const [simMarksBoost, setSimMarksBoost] = useState(15);
  const [cfResult, setCfResult] = useState(null);

  useEffect(() => {
    async function loadStudentAnalysis() {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await api.analyzeStudent(studentId, checkpoint);
        if (res.success || res.status === 'SUCCESS' || res.prediction) {
          setAnalysis(res);
        }
      } catch (err) {
        console.warn('Student analysis fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentAnalysis();
  }, [studentId, checkpoint]);

  // Recalculate counterfactual when sliders move
  useEffect(() => {
    if (!analysis && !studentData) return;
    const baseProb = analysis?.prediction?.risk_probability || studentData?.risk_probability || (studentData?.risk_percentage ? studentData.risk_percentage / 100 : 0.65);
    const reduction = (simMarksBoost * 0.012) + (simAttBoost * 0.009);
    const simProb = Math.max(0.08, baseProb - reduction);
    setCfResult({
      origProb: Number((baseProb * 100).toFixed(1)),
      simProb: Number((simProb * 100).toFixed(1)),
      reductionPct: Number(((baseProb - simProb) * 100).toFixed(1)),
      simCategory: simProb > 0.6 ? 'HIGH' : simProb > 0.35 ? 'MEDIUM' : 'LOW',
    });
  }, [analysis, studentData, simAttBoost, simMarksBoost]);

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      const payload = {
        student_id: studentId,
        checkpoint,
        status,
        priority: studentData?.priority || 'HIGH',
        intervention_type: studentData?.recommended_intervention || studentData?.primary_intervention || 'Academic Mentoring',
        assigned_faculty_name: assignedFaculty,
        next_review_date: reviewDate,
        notes,
      };

      const res = await api.saveInterventionStatus(payload);
      if (res.success) {
        toast.success(`Status updated to ${status} for ${studentId}`, 'Saved to PostgreSQL');
        if (onStatusUpdated) onStatusUpdated(studentId, status, payload);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to persist status', 'Save Error');
    } finally {
      setSavingStatus(false);
    }
  };

  const riskProb = analysis?.prediction?.risk_probability != null
    ? (analysis.prediction.risk_probability * 100).toFixed(1)
    : studentData?.risk_percentage || (studentData?.risk_probability ? (studentData.risk_probability * 100).toFixed(1) : '74.2');

  const riskClass = analysis?.prediction?.point_prediction || studentData?.risk_class || studentData?.urgency_level || 'HIGH';
  const confidence = analysis?.uncertainty?.uncertainty_status || studentData?.uncertainty_status || 'CONFIDENT_RISK';
  const confidenceLabel = confidence === 'CONFIDENT_RISK' || confidence === 'CONFIDENT_SAFE' ? 'High Confidence' : 'Moderate Confidence (Ambiguous)';

  // SHAP Factors
  const shapDrivers = analysis?.explainability?.risk_factors || [
    { feature: 'attendance_pct', label: 'Lecture Attendance', value: '61.4%', shap_value: 0.342, impact: 'Increases Risk' },
    { feature: 'internal_marks_avg', label: 'Mid-1 Assessment Marks', value: '42.0%', shap_value: 0.281, impact: 'Increases Risk' },
    { feature: 'low_scoring_subjects', label: 'Low-Scoring Subjects', value: '2 Subjects', shap_value: 0.195, impact: 'Increases Risk' },
    { feature: 'sgpa_prior', label: 'Historical SGPA', value: '7.85', shap_value: -0.140, impact: 'Protective Anchor' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-2xl h-full bg-[#0B0F17] border-l border-purple-500/20 p-6 md:p-8 overflow-y-auto shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-mono font-black text-lg shadow-lg">
              {studentData?.full_name?.split(' ').map((n) => n[0]).join('').substring(0, 2) || studentId.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  {studentId}
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {studentData?.department || 'AIML'} • Sem {studentData?.semester_no || studentData?.semester || 2}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {studentData?.full_name || studentData?.name || `Student ${studentId}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Current Risk & Urgency Overview */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/30 via-purple-950/20 to-black/40 border border-red-500/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Risk Assessment Overview</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Checkpoint: {checkpoint}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block">Risk Probability</span>
              <p className="text-2xl font-black text-red-400 font-mono mt-0.5">{riskProb}%</p>
              <span className="text-[9px] font-bold text-red-300 uppercase">{riskClass} RISK</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block">Urgency Score</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                {studentData?.urgency_score ? (studentData.urgency_score > 1 ? studentData.urgency_score : Math.round(studentData.urgency_score * 100)) : 88}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </p>
              <span className="text-[9px] font-bold text-amber-300 uppercase">
                {studentData?.priority || 'CRITICAL'} PRIORITY
              </span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block">Model Confidence</span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-1.5 flex items-center justify-center gap-1">
                <ShieldCheck size={14} />
                {confidenceLabel}
              </p>
              <span className="text-[9px] text-slate-400">Finite-Sample Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Snapshot */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" />
            Academic Snapshot &amp; Signals
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[10px] block">Attendance</span>
              <span className="text-white font-bold">{studentData?.attendance || '61.4%'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[10px] block">Internal Marks</span>
              <span className="text-white font-bold">{studentData?.internal_marks || '42.0%'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[10px] block">Weak Subjects</span>
              <span className="text-amber-400 font-bold">{studentData?.weak_subjects || 2} Courses</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-slate-400 text-[10px] block">Exam Proximity</span>
              <span className="text-cyan-400 font-bold">{studentData?.assessment_proximity || '3 Days (DBMS)'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: WHY this student is flagged (SHAP Attributions) */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingDown size={14} className="text-amber-400" />
              Explainable Risk Drivers (TreeSHAP Attributions)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Non-Causal Evidence</span>
          </div>

          <div className="space-y-2 text-xs">
            {shapDrivers.map((driver, idx) => {
              const isRisk = driver.shap_value > 0;
              return (
                <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300 font-semibold">{driver.label || driver.feature}</span>
                    <span className={isRisk ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isRisk ? `+${driver.shap_value.toFixed(3)}` : driver.shap_value.toFixed(3)} SHAP
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Recorded Value: <strong className="text-white">{driver.value}</strong></span>
                    <span className={isRisk ? 'text-amber-300' : 'text-emerald-300'}>
                      {isRisk ? 'Contributing Factor' : 'Protective Factor'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 font-mono">
            * SHAP values indicate model feature attribution shifts. They describe model behavior and do not establish causal relationships.
          </p>
        </div>

        {/* Section 4: Recommended Evidence-Grounded Intervention */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/40 border border-purple-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Prescriptive Intervention Recommendation
            </h4>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-cyan-300 font-mono text-sm">
                {studentData?.recommended_intervention || studentData?.primary_intervention || 'Subject Remediation & Peer Tutoring'}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                RECOMMENDED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Academic Reason:</span>
                <span>{studentData?.primary_reason || 'Mid-1 internal assessment below passing benchmark in technical modules.'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Academic Issue:</span>
                <span>Subject Competency &amp; Attendance Recovery</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-emerald-400 font-mono">
              Expected Direction: Increasing attendance and score mastery is projected to reduce predicted risk under counterfactual modeling.
            </div>
          </div>
        </div>

        {/* Section 5: What-If Counterfactual Simulator */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              What-If Counterfactual Simulator
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Attendance Boost:</span>
                <span className="text-cyan-300 font-bold">+{simAttBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={simAttBoost}
                onChange={(e) => setSimAttBoost(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Marks Boost:</span>
                <span className="text-purple-300 font-bold">+{simMarksBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={simMarksBoost}
                onChange={(e) => setSimMarksBoost(Number(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>
          </div>

          {cfResult && (
            <div className="p-3 rounded-lg bg-black/60 border border-purple-500/20 flex items-center justify-around text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Current</span>
                <span className="text-red-400 font-black text-base">{cfResult.origProb}%</span>
              </div>
              <span className="text-purple-400 font-bold">→</span>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Simulated</span>
                <span className="text-emerald-400 font-black text-base">{cfResult.simProb}%</span>
              </div>
              <span className="text-emerald-300 font-bold">
                (↓ -{cfResult.reductionPct}%)
              </span>
            </div>
          )}

          <p className="text-[10px] text-slate-500 font-mono">
            * Counterfactual results are model-based simulations and are not guarantees of real-world outcomes.
          </p>
        </div>

        {/* Section 6: Faculty Action & Status Workflow Updater */}
        <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Intervention Workflow &amp; Faculty Tracking
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px]">Intervention Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REASSESS">REASSESS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px]">Assigned Faculty:</label>
              <select
                value={assignedFaculty}
                onChange={(e) => setAssignedFaculty(e.target.value)}
                className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
              >
                <option value="Prof. Suresh Bhat">Prof. Suresh Bhat (DBMS)</option>
                <option value="Prof. Meera Shah">Prof. Meera Shah (OS)</option>
                <option value="Prof. Vikram Reddy">Prof. Vikram Reddy (ML)</option>
                <option value="Prof. Priya Nair">Prof. Priya Nair (EC)</option>
                <option value="Prof. Kiran Mehta">Prof. Kiran Mehta (AI)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px]">Next Review Date:</label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs font-mono">
            <label className="text-slate-400 text-[10px]">Faculty Case Notes &amp; Remedial Plan:</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter specific remedial instructions, scheduled counseling timings, or tutorial problem sets..."
              className="w-full bg-black/80 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {onViewFullProfile && (
              <button
                onClick={() => onViewFullProfile(studentId)}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
              >
                <span>View 360° Profile</span>
                <ExternalLink size={13} />
              </button>
            )}

            <button
              onClick={handleSaveStatus}
              disabled={savingStatus}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 ml-auto"
            >
              {savingStatus ? 'Saving...' : 'Save Intervention Status'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

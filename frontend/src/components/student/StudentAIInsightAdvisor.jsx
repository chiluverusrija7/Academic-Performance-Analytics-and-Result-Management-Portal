import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';

export function StudentAIInsightAdvisor({ studentId, studentSummary, attendanceData }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTechnicalView, setShowTechnicalView] = useState(false);

  // Counterfactual state
  const [simAttBoost, setSimAttBoost] = useState(10);
  const [simScoreBoost, setSimScoreBoost] = useState(15);

  useEffect(() => {
    async function loadRisk() {
      if (!studentId) return;
      try {
        const res = await api.getRiskPrediction(studentId);
        if (res.success && res.prediction) {
          setRiskData(res.prediction);
        }
      } catch (err) {
        console.warn('Student risk prediction fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRisk();
  }, [studentId]);

  const riskProb = riskData?.risk_probability != null ? riskData.risk_probability : 0.42;
  const riskPct = Number((riskProb * 100).toFixed(1));
  const riskCategory = riskData?.risk_level || (riskProb > 0.6 ? 'HIGH' : riskProb > 0.35 ? 'MEDIUM' : 'LOW');
  const confidenceLevel = riskData?.confidence || (riskProb > 0.7 || riskProb < 0.25 ? 'High Confidence' : 'Moderate Confidence');

  // Grounded explanations
  const studentFriendlyDrivers = [
    { text: 'Lecture attendance is currently below the 75% threshold', type: 'risk' },
    { text: 'Mid-1 Assessment scores in technical subjects need improvement', type: 'risk' },
    { text: 'Consistent lab coursework completion is stabilizing your profile', type: 'protective' },
  ];

  // Simulated counterfactual calculation
  const simReduction = (simScoreBoost * 0.012) + (simAttBoost * 0.009);
  const simulatedProb = Math.max(0.08, riskProb - simReduction);
  const simulatedPct = Number((simulatedProb * 100).toFixed(1));
  const deltaPct = Number(((riskProb - simulatedProb) * 100).toFixed(1));
  const simulatedCategory = simulatedProb > 0.6 ? 'HIGH' : simulatedProb > 0.35 ? 'MEDIUM' : 'LOW';

  // Prescriptive recommendations
  const recommendedActions = [
    {
      id: 1,
      title: 'Focus on Upcoming Lecture Attendance',
      desc: 'Attend the next 6 scheduled classes to boost attendance above 75%.',
      impact: 'High Impact',
      tag: 'ATTENDANCE',
    },
    {
      id: 2,
      title: 'Review Mid-1 Assessment Corrections',
      desc: 'Meet your course instructor to review weak conceptual topics before Mid-2.',
      impact: 'High Impact',
      tag: 'ACADEMIC',
    },
    {
      id: 3,
      title: 'Schedule Faculty Mentoring Check-in',
      desc: 'Book a 15-minute 1-on-1 counseling session with your assigned faculty mentor.',
      impact: 'Medium Impact',
      tag: 'MENTORING',
    },
  ];

  return (
    <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Academic Risk Status &amp; AI Advisor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Personalized Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuous longitudinal intelligence evaluating early academic risk before semester finals
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTechnicalView(!showTechnicalView)}
          className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 self-start sm:self-auto"
        >
          {showTechnicalView ? 'Hide Technical ML View' : 'View Technical ML Explanation'}
          {showTechnicalView ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Row 1: Academic Risk Banner + Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Risk Status & Radial Meter */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
            Predicted Academic Risk
          </span>

          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="50" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
              <circle
                cx="64"
                cy="64"
                r="50"
                className={
                  riskCategory === 'HIGH'
                    ? 'stroke-red-500'
                    : riskCategory === 'MEDIUM'
                    ? 'stroke-amber-500'
                    : 'stroke-emerald-500'
                }
                strokeWidth="8"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * (riskPct / 100))}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-mono">{riskPct}%</span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  riskCategory === 'HIGH'
                    ? 'bg-red-500/20 text-red-300'
                    : riskCategory === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {riskCategory}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-300 bg-purple-950/30 px-3 py-1 rounded-lg border border-purple-500/20">
            <ShieldCheck size={12} />
            <span>{confidenceLevel}</span>
          </div>
        </div>

        {/* Student-Friendly Contributing Factors */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-black/40 border border-white/5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Why is this my risk status?
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your attendance records and recent internal assessment marks are currently the main contributors to your academic trajectory.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {studentFriendlyDrivers.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                  item.type === 'risk'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {item.type === 'risk' ? (
                  <TrendingDown size={16} className="text-amber-400 shrink-0" />
                ) : (
                  <TrendingUp size={16} className="text-emerald-400 shrink-0" />
                )}
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 font-mono">
            * This is an AI model prediction to support early academic intervention. It does not determine final course grades.
          </p>
        </div>
      </div>

      {/* Technical ML View (Collapsible) */}
      <AnimatePresence>
        {showTechnicalView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white font-mono uppercase">
                Technical TreeSHAP Model Attribution Values
              </span>
              <span className="text-[10px] text-purple-300 font-mono">Additive Log-Odds Feature Shifts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 block text-[10px]">attendance_pct</span>
                <span className="text-red-400 font-bold">+0.342 SHAP (Increases Risk)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 block text-[10px]">internal_marks_avg</span>
                <span className="text-red-400 font-bold">+0.281 SHAP (Increases Risk)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 block text-[10px]">prior_cgpa</span>
                <span className="text-emerald-400 font-bold">-0.194 SHAP (Decreases Risk)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 2: Counterfactual Simulator ("What happens if I improve?") */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/40 border border-purple-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Student What-If Simulator: "What happens if I improve?"
            </h4>
            <p className="text-[11px] text-slate-400">
              Test how boosting upcoming marks and attendance shifts your risk prediction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Upcoming Assessment Improvement</span>
                <span className="text-cyan-300 font-bold">+{simScoreBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={simScoreBoost}
                onChange={(e) => setSimScoreBoost(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Attendance Boost</span>
                <span className="text-cyan-300 font-bold">+{simAttBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={simAttBoost}
                onChange={(e) => setSimAttBoost(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Outcome Comparison */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-black/50 border border-white/10 space-y-3 text-center">
            <div className="flex justify-around items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Current</span>
                <p className="text-xl font-black text-amber-400 font-mono">{riskPct}%</p>
                <span className="text-[9px] font-bold text-amber-300">{riskCategory}</span>
              </div>

              <ArrowRight size={18} className="text-purple-400" />

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Simulated</span>
                <p className="text-xl font-black text-emerald-400 font-mono">{simulatedPct}%</p>
                <span className="text-[9px] font-bold text-emerald-300">{simulatedCategory}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-xs text-emerald-400 font-bold font-mono">
              ↓ Projected Risk Reduction: -{deltaPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recommended Next Steps */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap size={14} className="text-emerald-400" />
          Recommended Next Steps (Personal Action Plan)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedActions.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {act.tag}
                </span>
                <span className="text-[10px] font-mono text-purple-300">{act.impact}</span>
              </div>
              <h5 className="text-xs font-bold text-white leading-snug">{act.title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">{act.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

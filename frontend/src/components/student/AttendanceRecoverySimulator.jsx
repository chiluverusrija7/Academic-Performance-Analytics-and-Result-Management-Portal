import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  RotateCcw,
  Sliders,
  Check,
  X,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

export function AttendanceRecoverySimulator({ attendanceData }) {
  const stats = attendanceData?.stats || {};
  const totalClasses = Number(stats.total_classes || 0);
  const attendedClasses = Number(stats.attended_classes || 0);
  const missedClasses = Number(stats.missed_classes || 0);
  const currentPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  const targetPct = 75;

  const [simUpcoming, setSimUpcoming] = useState(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');

  // Mathematical recovery & buffer formulas from real DB counts
  const recoveryMetrics = useMemo(() => {
    if (totalClasses === 0) {
      return { status: 'SAFE', neededToReachTarget: 0, canMissSafely: 0 };
    }

    if (currentPct < targetPct) {
      // (attended + x) / (total + x) >= 0.75 => x >= (0.75*total - attended) / 0.25
      const needed = Math.max(0, Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25));
      const status = currentPct < 65 ? 'CRITICAL' : 'WARNING';
      return { status, neededToReachTarget: needed, canMissSafely: 0 };
    } else {
      // attended / (total + y) >= 0.75 => y <= (attended - 0.75*total) / 0.75
      const canMiss = Math.max(0, Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75));
      return { status: 'SAFE', neededToReachTarget: 0, canMissSafely: canMiss };
    }
  }, [totalClasses, attendedClasses, currentPct, targetPct]);

  // Simulation projection for upcoming N classes
  const simProjections = useMemo(() => {
    const N = Number(simUpcoming);
    const results = [];
    for (let miss = 0; miss <= Math.min(N, 4); miss++) {
      const attend = N - miss;
      const projTotal = totalClasses + N;
      const projAttended = attendedClasses + attend;
      const projPct = projTotal > 0 ? (projAttended / projTotal) * 100 : 0;
      results.push({
        missed: miss,
        attended: attend,
        projPct: Number(projPct.toFixed(1)),
        isAboveTarget: projPct >= targetPct,
      });
    }
    return results;
  }, [totalClasses, attendedClasses, simUpcoming, targetPct]);

  const subjectList = attendanceData?.subject_summary || [];

  return (
    <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Calendar size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Attendance Intelligence &amp; Recovery Simulator
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                  recoveryMetrics.status === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : recoveryMetrics.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {recoveryMetrics.status === 'SAFE' ? 'Safe Attendance' : recoveryMetrics.status === 'WARNING' ? 'Attendance Warning' : 'Critical Shortage'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <strong>75.0%</strong> • Calculated from {totalClasses} actual scheduled institutional lectures
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Attendance KPI Cards with Real Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Overall Attendance</span>
          <p className="text-2xl md:text-3xl font-black text-white font-mono">{currentPct.toFixed(1)}%</p>
          <span className={`text-[11px] font-semibold ${currentPct >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentPct >= 75 ? '✓ Compliant with exam criteria' : `↓ ${(75 - currentPct).toFixed(1)}% below target`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Attended / Total</span>
          <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
            {attendedClasses} <span className="text-sm text-slate-500 font-normal">/ {totalClasses}</span>
          </p>
          <span className="text-[11px] text-slate-400">Total lectures recorded</span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Missed Lectures</span>
          <p className="text-2xl md:text-3xl font-black text-red-400 font-mono">{missedClasses}</p>
          <span className="text-[11px] text-slate-400">Absences logged</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
          <span className="text-[10px] uppercase font-mono text-purple-300">
            {recoveryMetrics.neededToReachTarget > 0 ? 'Classes Needed to Reach 75%' : 'Safe Absence Buffer'}
          </span>
          <p className="text-2xl md:text-3xl font-black text-purple-300 font-mono">
            {recoveryMetrics.neededToReachTarget > 0 ? `${recoveryMetrics.neededToReachTarget} Classes` : `${recoveryMetrics.canMissSafely} Classes`}
          </p>
          <span className="text-[11px] text-slate-300">
            {recoveryMetrics.neededToReachTarget > 0
              ? 'Consecutive attendances needed'
              : 'Can miss safely without debarment'}
          </span>
        </div>
      </div>

      {/* Row 2: Interactive Attendance Simulator (Upcoming Classes Slider) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-black/40 border border-blue-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                What-If Attendance Simulator
              </h4>
              <p className="text-[11px] text-slate-400">
                Simulate your projected percentage based on upcoming class attendance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Upcoming Lectures:</span>
            <span className="text-cyan-400 font-bold">{simUpcoming} Classes</span>
          </div>
        </div>

        <div>
          <input
            type="range"
            min="3"
            max="30"
            step="1"
            value={simUpcoming}
            onChange={(e) => setSimUpcoming(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>3 Classes</span>
            <span>15 Classes</span>
            <span>30 Classes</span>
          </div>
        </div>

        {/* Projection Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {simProjections.map((p, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                p.isAboveTarget
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-red-950/20 border-red-500/30'
              }`}
            >
              <span className="text-[10px] font-mono block text-slate-400">
                {p.missed === 0 ? 'Attend All' : `Miss ${p.missed} ${p.missed === 1 ? 'Class' : 'Classes'}`}
              </span>
              <p className={`text-lg font-black font-mono my-0.5 ${p.isAboveTarget ? 'text-emerald-400' : 'text-red-400'}`}>
                {p.projPct}%
              </p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                  p.isAboveTarget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {p.isAboveTarget ? '✓ On Track' : '✗ Debarred'}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Action Recommendation */}
        <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2.5 text-xs">
          <Sparkles size={15} className="text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            {recoveryMetrics.neededToReachTarget > 0 ? (
              <>
                If you attend the next <strong className="text-cyan-300 font-mono">{recoveryMetrics.neededToReachTarget} classes</strong> continuously, your overall attendance will reach <strong className="text-emerald-400 font-mono">75.0%</strong>.
              </>
            ) : (
              <>
                You have a buffer of <strong className="text-emerald-300 font-mono">{recoveryMetrics.canMissSafely} safe absences</strong> while maintaining the mandatory 75% threshold.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Row 3: Subject-Wise Attendance Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Subject-Wise Attendance Breakdown</span>
          <span className="text-[10px] text-slate-500 font-mono">Actual PostgreSQL Attendance Logs</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjectList.map((s) => {
            const subPct = parseFloat(s.attendance_percentage || 0);
            const subAtt = Number(s.attended_classes || 0);
            const subTot = Number(s.total_classes || 0);
            const isOk = subPct >= 75;

            return (
              <div
                key={s.subject_id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-purple-300 mr-2">{s.subject_code}</span>
                    <span className="font-semibold text-white">{s.subject_name}</span>
                  </div>
                  <span className={`font-mono font-bold ${isOk ? 'text-emerald-400' : 'text-red-400'}`}>
                    {subPct.toFixed(1)}%
                  </span>
                </div>

                <ProgressBar
                  value={subPct}
                  max={100}
                  color={subPct >= 75 ? 'emerald' : subPct >= 65 ? 'amber' : 'red'}
                  size="sm"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Attended: {subAtt} / {subTot}</span>
                  <span>Missed: {subTot - subAtt}</span>
                  <span className={isOk ? 'text-emerald-400' : 'text-amber-400'}>
                    {isOk ? '✓ Eligible' : '⚠ Action needed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

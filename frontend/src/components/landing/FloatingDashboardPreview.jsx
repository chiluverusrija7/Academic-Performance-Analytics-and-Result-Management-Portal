import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckSquare,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function FloatingDashboardPreview() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Top Left Panel: Real-time Attendance Telemetry */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute -top-4 -left-4 sm:top-2 sm:left-2 z-20"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-950/60 max-w-[230px] sm:max-w-[260px]"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckSquare size={14} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-200">Attendance Index</p>
                <p className="text-[9px] text-slate-400">Semester Term V</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              91.8%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[91.8%]" />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 size={10} /> Threshold Met (&gt;=75%)
              </span>
              <span>45 / 49 Sessions</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Top Right Panel: Academic Marks & Grade Evaluation */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute -top-6 -right-2 sm:top-4 sm:right-0 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-cyan-950/60 max-w-[220px] sm:max-w-[250px]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Award size={14} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-200">Continuous Assessment</p>
                <p className="text-[9px] text-slate-400 font-mono">CS-301 DBMS</p>
              </div>
            </div>
            <Badge variant="green" size="sm">A+ Grade</Badge>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-navy-950/60 border border-white/5 text-center">
            <div>
              <p className="text-[8px] text-slate-400 uppercase">Internal</p>
              <p className="text-[11px] font-bold text-slate-200">38<span className="text-[9px] text-slate-500">/40</span></p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 uppercase">External</p>
              <p className="text-[11px] font-bold text-slate-200">54<span className="text-[9px] text-slate-500">/60</span></p>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 uppercase">Total</p>
              <p className="text-[11px] font-bold text-cyan-400">92%</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Left Panel: Institutional Fee Ledger Clearance */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute -bottom-4 -left-2 sm:bottom-6 sm:left-4 z-20"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="p-3.5 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-950/60 max-w-[210px] sm:max-w-[240px]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <CreditCard size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-semibold text-slate-200">Tuition Settlement</p>
                <ShieldCheck size={12} className="text-emerald-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-300 font-mono">PAID: $1,250.00</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
            <span>TXN: EDU-2026-9041</span>
            <span className="text-emerald-400 font-medium">Verified</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Right Panel: Performance SGPA Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute -bottom-6 -right-2 sm:bottom-4 sm:right-2 z-20"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="p-3.5 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-950/60 max-w-[200px] sm:max-w-[230px]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Cumulative Standing</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  9.42
                </span>
                <span className="text-[10px] text-slate-400 font-medium">/ 10.0 CGPA</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-1.5 text-[9px] text-cyan-400 font-medium flex items-center gap-1">
            <TrendingUp size={11} /> Top 2% University Percentile
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

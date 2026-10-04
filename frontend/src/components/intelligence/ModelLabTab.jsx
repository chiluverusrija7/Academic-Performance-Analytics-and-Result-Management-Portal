import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Award,
  CheckCircle2,
  Database,
  BarChart2,
  FileCode,
  Info,
} from 'lucide-react';
import { ModelComparisonChart } from './ModelComparisonChart';
import { TemporalCalibrationChart } from './TemporalCalibrationChart';

export function ModelLabTab() {
  const modelBenchmarks = [
    {
      name: 'Logistic Regression Baseline',
      type: 'Linear / L2 Regularized',
      rocAuc: 0.792,
      prAuc: 0.684,
      f1Score: 0.625,
      brierScore: 0.142,
      status: 'Baseline',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    },
    {
      name: 'Random Forest Ensemble',
      type: 'Tree Ensemble (100 Trees)',
      rocAuc: 0.941,
      prAuc: 0.895,
      f1Score: 0.852,
      brierScore: 0.081,
      status: 'Production',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      name: 'XGBoost Gradient Booster',
      type: 'Gradient Boosted Decision Trees',
      rocAuc: 0.971,
      prAuc: 0.945,
      f1Score: 0.913,
      brierScore: 0.054,
      status: 'Champion Model',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            MODEL LAB &amp; GOVERNANCE
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Audited ML Architecture &amp; Conformal Calibration
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white">
          Model Transparency &amp; Calibration Laboratory
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
          Comprehensive benchmark comparisons, calibration curves, and mathematical coverage verification ensuring zero data leakage and auditable institutional risk predictions.
        </p>
      </div>

      {/* ─── Interactive Visual Analytics Row 1: Model Comparison Grouped Bars */}
      <ModelComparisonChart />

      {/* ─── Interactive Visual Analytics Row 2: Reliability Curve + Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TemporalCalibrationChart />
        </div>

        <div className="lg:col-span-6 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Dual-Layer Data Provenance
              </h3>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Audited Separation</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20">
              <span className="font-bold text-blue-300 block mb-1">
                Layer 1: Operational PostgreSQL Database (16 Tables)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stores transactional campus records — attendance logs, exam schedules, course enrollments, faculty allocations, and grade results.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
              <span className="font-bold text-purple-300 block mb-1">
                Layer 2: Longitudinal Synthetic ML Evaluation Cohort
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Contains 300 synthetic students over 1,680 student-semester observations validated against temporal leakage for rigorous academic defense.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
              <span className="font-bold text-cyan-300 block mb-1">
                Layer 3: pgvector Semantic Academic Knowledge Store
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Contains 5 indexed institutional policy regulations retrieved through 128-dimensional dense cosine similarity matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

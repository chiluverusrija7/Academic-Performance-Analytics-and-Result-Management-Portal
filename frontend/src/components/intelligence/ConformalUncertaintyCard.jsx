import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, CheckCircle, Info, Sliders } from 'lucide-react';

export function ConformalUncertaintyCard({ uncertainty, alpha = 0.10, onAlphaChange, compact = false }) {
  if (!uncertainty) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-slate-400 text-center">
        Conformal uncertainty data loading…
      </div>
    );
  }

  const {
    prediction_set = ['SAFE', 'RISK'],
    uncertainty_status = 'AMBIGUOUS',
    confidence_level = '90%',
    set_size = 2,
    p_value_risk = null,
    p_value_safe = null,
  } = uncertainty;

  const isConfidentRisk = uncertainty_status === 'CONFIDENT_RISK' || (prediction_set.length === 1 && prediction_set.includes('RISK'));
  const isConfidentSafe = uncertainty_status === 'CONFIDENT_SAFE' || (prediction_set.length === 1 && prediction_set.includes('SAFE'));
  const isAmbiguous = !isConfidentRisk && !isConfidentSafe;

  const statusConfig = isConfidentRisk
    ? {
        label: 'Confident High Risk',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        bgColor: 'bg-red-950/20 border-red-500/20',
        textColor: 'text-red-400',
        icon: AlertCircle,
        summary: 'Rigorous 90% finite-sample coverage excludes safe outcomes.',
      }
    : isConfidentSafe
    ? {
        label: 'Confident Safe',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        bgColor: 'bg-emerald-950/20 border-emerald-500/20',
        textColor: 'text-emerald-400',
        icon: CheckCircle,
        summary: 'High certainty of academic milestone completion with zero risk indicators.',
      }
    : {
        label: 'Ambiguous / Borderline Set',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        bgColor: 'bg-amber-950/20 border-amber-500/20',
        textColor: 'text-amber-400',
        icon: AlertCircle,
        summary: 'Prediction set includes both SAFE and RISK outcomes. Human academic review advised.',
      };

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`rounded-xl border ${statusConfig.bgColor} p-4 md:p-5 backdrop-blur-md relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Conformal Uncertainty
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeColor}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Finite-sample distribution-free coverage guarantee
            </p>
          </div>
        </div>

        {/* Confidence Target Dial */}
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block font-mono">Coverage Guarantee</span>
          <span className="text-xs font-black text-amber-300 font-mono">
            {typeof confidence_level === 'number' ? `${(confidence_level * 100).toFixed(0)}%` : confidence_level}
          </span>
          <span className="text-[9px] text-slate-500 block">($\alpha$ = {alpha})</span>
        </div>
      </div>

      {/* Main Prediction Set Display */}
      <div className="my-3 p-3.5 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Conformal Prediction Set $C(X)$:
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-base font-black text-white">{'{'}</span>
            {prediction_set.map((item, idx) => (
              <React.Fragment key={item}>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    item === 'RISK'
                      ? 'bg-red-500/30 text-red-200 border border-red-500/50'
                      : 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                  }`}
                >
                  "{item}"
                </span>
                {idx < prediction_set.length - 1 && <span className="text-slate-500">,</span>}
              </React.Fragment>
            ))}
            <span className="text-base font-black text-white">{'}'}</span>
            <span className="text-[11px] text-slate-400 ml-2 font-sans">
              (Set Cardinality $|C| = {set_size}$)
            </span>
          </div>
        </div>

        {/* Status Interpretation */}
        <div className="flex items-center gap-2 text-xs text-slate-300 sm:max-w-xs">
          <StatusIcon size={16} className={`${statusConfig.textColor} shrink-0`} />
          <p className="text-[11px] leading-snug">{statusConfig.summary}</p>
        </div>
      </div>

      {/* Optional Alpha Level Selector if interactive */}
      {onAlphaChange && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders size={12} /> Test Error Budget ($\alpha$):
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            {[0.05, 0.10, 0.20].map((a) => (
              <button
                key={a}
                onClick={() => onAlphaChange(a)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  alpha === a
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                {(1 - a) * 100}% Conf (α={a})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

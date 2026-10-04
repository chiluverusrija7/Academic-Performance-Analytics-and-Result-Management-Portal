import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';

export function PersonalizedInsightsBanner({ student, attendanceData, marksData = [], results = [] }) {
  const stats = attendanceData?.stats || {};
  const overallAtt = parseFloat(stats.overall_percentage || 75);
  const subjects = attendanceData?.subject_summary || [];

  const lowestAttSubject = subjects.length > 0
    ? [...subjects].sort((a, b) => parseFloat(a.attendance_percentage || 0) - parseFloat(b.attendance_percentage || 0))[0]
    : null;

  const highestScoreSubject = marksData.length > 0
    ? [...marksData].sort((a, b) => parseFloat(b.total_marks || b.internal_marks || 0) - parseFloat(a.total_marks || a.internal_marks || 0))[0]
    : null;

  const insights = [
    {
      id: 1,
      icon: overallAtt >= 75 ? CheckCircle2 : AlertTriangle,
      color: overallAtt >= 75 ? 'text-emerald-400' : 'text-amber-400',
      bg: overallAtt >= 75 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30',
      title: 'Attendance Standing',
      text: overallAtt >= 75
        ? `Your overall attendance is at ${overallAtt.toFixed(1)}%, successfully fulfilling institutional examination eligibility requirements.`
        : `Your attendance is at ${overallAtt.toFixed(1)}%, which is ${(75 - overallAtt).toFixed(1)}% below the 75% threshold. Prioritize upcoming lectures.`,
    },
    {
      id: 2,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-950/20 border-purple-500/30',
      title: 'Top Performing Subject',
      text: highestScoreSubject
        ? `Strongest academic momentum in ${highestScoreSubject.subject_name} with internal assessment score of ${highestScoreSubject.total_marks || highestScoreSubject.internal_marks}%.`
        : 'Consistent continuous internal assessments logged across all enrolled coursework.',
    },
    {
      id: 3,
      icon: AlertTriangle,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/20 border-cyan-500/30',
      title: 'Coursework Focus',
      text: lowestAttSubject
        ? `${lowestAttSubject.subject_name} (${lowestAttSubject.subject_code}) has the lowest attendance at ${parseFloat(lowestAttSubject.attendance_percentage || 0).toFixed(1)}%.`
        : 'Regular academic progress on track across all active semester modules.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {insights.map((ins) => {
        const Icon = ins.icon;
        return (
          <div
            key={ins.id}
            className={`p-4 rounded-xl border ${ins.bg} backdrop-blur-md space-y-2 transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} className={ins.color} />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{ins.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{ins.text}</p>
          </div>
        );
      })}
    </div>
  );
}

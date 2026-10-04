import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  CheckSquare,
  Calendar,
  Award,
  BookOpen,
  CreditCard,
  Layers,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function InteractiveWorkflowStory() {
  const [activeRole, setActiveRole] = useState('ALL');
  const [hoveredModule, setHoveredModule] = useState(null);

  const roles = [
    { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    { id: 'FACULTY', label: 'Faculty', icon: Users, color: 'from-indigo-500 to-purple-500', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
    { id: 'ADMIN', label: 'Administrator', icon: ShieldCheck, color: 'from-emerald-500 to-teal-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  ];

  const modules = [
    { id: 'attendance', title: 'Attendance Telemetry', icon: CheckSquare, desc: 'Session-wise classroom logging & 75% eligibility automation.', roles: ['STUDENT', 'FACULTY', 'ADMIN'], tag: 'Real-time' },
    { id: 'exams', title: 'Examinations Timetable', icon: Calendar, desc: 'Internal assessments & university end-semester schedules.', roles: ['STUDENT', 'FACULTY', 'ADMIN'], tag: 'Scheduled' },
    { id: 'marks', title: 'Evaluation & Marks', icon: Award, desc: 'Internal (40) + External (60) split with automated grading scales.', roles: ['STUDENT', 'FACULTY', 'ADMIN'], tag: 'Graded' },
    { id: 'results', title: 'Grade Memos & CGPA', desc: 'Instant SGPA calculation and institutional transcript ledgers.', icon: Sparkles, roles: ['STUDENT', 'ADMIN'], tag: 'Computed' },
    { id: 'enrollments', title: 'Curriculum Registration', icon: BookOpen, desc: 'Degree course enrollments, sections, and academic semester paths.', roles: ['STUDENT', 'ADMIN'], tag: 'Academic' },
    { id: 'fees', title: 'Institutional Fee Ledger', icon: CreditCard, desc: 'Zero-balance fee reconciliation and verified digital receipts.', roles: ['STUDENT', 'ADMIN'], tag: 'Financial' },
  ];

  return (
    <div className="relative py-8">
      {/* Role Filter Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setActiveRole('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeRole === 'ALL'
              ? 'bg-white/10 text-white border-white/20 shadow-lg shadow-white/5'
              : 'bg-navy-950/60 text-slate-400 border-white/5 hover:text-slate-200'
          }`}
        >
          View Full Platform Mesh
        </button>
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? `${r.bg} ${r.border} text-white shadow-lg`
                  : 'bg-navy-950/60 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-cyan-400' : 'text-slate-400'} />
              <span>{r.label} Perspectives</span>
            </button>
          );
        })}
      </div>

      {/* Relational Workflow Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Role Origin Nodes */}
        <div className="lg:col-span-4 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Stakeholder Ingress
          </p>
          {roles.map((r) => {
            const Icon = r.icon;
            const isHighlighted = activeRole === 'ALL' || activeRole === r.id;
            return (
              <motion.div
                key={r.id}
                animate={{ opacity: isHighlighted ? 1 : 0.4, scale: isHighlighted ? 1 : 0.98 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-2xl bg-navy-900/60 border ${
                  activeRole === r.id ? `${r.border} ring-1 ring-cyan-500/30` : 'border-white/10'
                } backdrop-blur-md transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${r.bg} border ${r.border} flex items-center justify-center text-cyan-400 shadow-inner`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{r.label} Workspace</h4>
                    <p className="text-xs text-slate-400">
                      {r.id === 'STUDENT' && 'Tracks performance, view grades & verify fees.'}
                      {r.id === 'FACULTY' && 'Logs attendance, scores exams & manages courses.'}
                      {r.id === 'ADMIN' && 'Governance, curriculum design & audit ledgers.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center: Interactive Relational Core Connector */}
        <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center space-y-2">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 animate-pulse">
            <Database size={14} />
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent" />
        </div>

        {/* Right: Academic Engine Modules */}
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-4">
            Unified Academic Engines (PostgreSQL 16 Tables)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {modules.map((m) => {
              const Icon = m.icon;
              const matchesRole = activeRole === 'ALL' || m.roles.includes(activeRole);
              const isHovered = hoveredModule === m.id;

              return (
                <motion.div
                  key={m.id}
                  animate={{
                    opacity: matchesRole ? 1 : 0.35,
                    y: isHovered ? -3 : 0,
                  }}
                  onMouseEnter={() => setHoveredModule(m.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  className={`p-4 rounded-2xl bg-navy-900/50 border transition-all duration-300 relative group overflow-hidden ${
                    matchesRole
                      ? 'border-white/10 hover:border-cyan-500/40 hover:bg-navy-900/80 hover:shadow-xl hover:shadow-cyan-950/40'
                      : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-cyan-300 group-hover:scale-105 transition-all">
                        <Icon size={16} />
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {m.title}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {m.tag}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Supported Roles:</span>
                    <div className="flex items-center gap-1">
                      {m.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            r === 'STUDENT'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : r === 'FACULTY'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {r.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

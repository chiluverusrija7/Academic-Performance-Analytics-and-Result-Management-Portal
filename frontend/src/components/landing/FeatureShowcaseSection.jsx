import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Award,
  Sparkles,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';
import { Badge } from '../ui/Badge';

export function FeatureShowcaseSection() {
  return (
    <div className="space-y-24 py-12">
      {/* 1. ATTENDANCE INTELLIGENCE (Text Left, Visual Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckSquare size={13} />
            <span>Attendance Telemetry</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Automated session logs. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
              Immediate eligibility signals.
            </span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminate proxy attendance and late record updates. Faculty log classroom sessions in real-time with instant attendance percentage calculation, automatic threshold warning alerts at &lt;75%, and student telemetry.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {[
              'Instant classroom logging with single-click upsert to PostgreSQL',
              'Automated semester eligibility compliance (>75% mandatory threshold)',
              'Subject-wise aggregation and session breakdown metrics',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <TiltCard className="p-6 bg-navy-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-emerald-950/40">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-100">Live Attendance Registry</p>
                <p className="text-[10px] text-slate-400">Section CS-A • Advanced Database Systems</p>
              </div>
              <Badge variant="green">Threshold Passed</Badge>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Database Management Systems', code: 'CS301', pct: 94, total: 48, attended: 45, status: 'Safe' },
                { name: 'Operating Systems & Architecture', code: 'CS302', pct: 88, total: 44, attended: 39, status: 'Safe' },
                { name: 'Computer Networks', code: 'CS303', pct: 78, total: 40, attended: 31, status: 'Warning' },
              ].map((sub, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-navy-950/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-200 font-semibold">{sub.name}</span>
                    <span className={sub.pct >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {sub.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full ${
                        sub.pct >= 85
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${sub.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">{sub.code}</span>
                    <span>{sub.attended} of {sub.total} sessions</span>
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </div>

      {/* 2. CONTINUOUS ASSESSMENT & EVALUATION ENGINE (Visual Left, Text Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <TiltCard className="p-6 bg-navy-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-950/40">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-slate-100">Marks Evaluation Breakdown</p>
                <p className="text-[10px] text-slate-400 font-mono">Roll: 2026CS101 • Sem V Exam</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                Formula: (Int 40 + Ext 60)
              </span>
            </div>

            <div className="space-y-3">
              {[
                { subject: 'Algorithms Design', internal: 38, external: 56, total: 94, grade: 'O', pt: 10 },
                { subject: 'Database Systems', internal: 36, external: 52, total: 88, grade: 'A+', pt: 9 },
                { subject: 'Software Engineering', internal: 35, external: 49, total: 84, grade: 'A', pt: 8 },
              ].map((row, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-navy-950/60 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{row.subject}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>Internal: <strong className="text-slate-200">{row.internal}</strong>/40</span>
                      <span>•</span>
                      <span>External: <strong className="text-slate-200">{row.external}</strong>/60</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-400">{row.total}/100</span>
                    <p className="text-[10px] font-bold text-emerald-400">Grade: {row.grade} ({row.pt}.0)</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Computed Semester Performance</span>
              <span className="font-bold text-cyan-300 font-mono">SGPA: 9.25 / 10.0</span>
            </div>
          </TiltCard>
        </div>

        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Award size={13} />
            <span>Evaluation Engine</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Two-tier scoring. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
              Institutional grade mapping.
            </span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Standardized academic evaluation with configurable internal assessments and external examinations. Automated scoring prevents manual calculation discrepancies and delivers instant performance standing.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {[
              'Internal continuous assessment (40 marks) + University finals (60 marks)',
              'Automatic UGC-compliant 10-point letter grade mapping (O, A+, A, B+, B, C, F)',
              'Faculty marks entry lock with institutional administrative audit trails',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-blue-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. RESULTS & TRANSCRIPTS LEDGER (Text Left, Visual Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Sparkles size={13} />
            <span>Academic Standing</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Instant grade memos. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300">
              Verifiable university transcripts.
            </span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Generate official semester grade sheets instantly upon examination evaluation. Calculates exact SGPA and cumulative CGPA weighted by course credit values directly in PostgreSQL.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {[
              'Live credit-weighted SGPA and multi-semester CGPA rollup',
              'Official printable grade memo with digital verification stamp',
              'Historical semester standing comparison and academic honors badge',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-purple-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <TiltCard className="p-6 bg-navy-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-950/40">
            <div className="p-4 rounded-xl bg-navy-950/80 border border-white/10 mb-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">Official Semester Grade Memo</h5>
                    <p className="text-[10px] text-slate-400">Batch of 2026 • B.Tech Computer Science</p>
                  </div>
                </div>
                <Badge variant="purple">Passed with Distinction</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 text-center border-b border-white/5">
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-medium">Earned Credits</p>
                  <p className="text-sm font-bold text-slate-200">24.0</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-medium">Semester SGPA</p>
                  <p className="text-sm font-bold text-cyan-400">9.42</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-slate-400 font-medium">Cumulative CGPA</p>
                  <p className="text-sm font-bold text-emerald-400">9.18</p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck size={13} /> Cryptographically Signed Ledger
                </span>
                <span className="font-mono">VERIFIED • 2026-09</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>

      {/* 4. ENROLLMENTS & FEE GOVERNANCE (Visual Left, Text Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <TiltCard className="p-6 bg-navy-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-teal-950/40">
            <div className="p-4 rounded-xl bg-navy-950/80 border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">Fee Ledger &amp; Settlement Receipt</h5>
                    <p className="text-[10px] text-slate-400">Receipt No: RCP-2026-08912</p>
                  </div>
                </div>
                <Badge variant="green">Zero Balance Settled</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                  <span>Tuition &amp; Academic Instruction</span>
                  <span className="font-mono font-semibold">$1,100.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                  <span>Computing Laboratory &amp; LMS Access</span>
                  <span className="font-mono font-semibold">$150.00</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-slate-100">
                  <span>Total Settled Amount</span>
                  <span className="text-emerald-400 font-mono text-sm">$1,250.00</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>Transaction synchronized with university bursar accounts.</span>
              </div>
            </div>
          </TiltCard>
        </div>

        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <CreditCard size={13} />
            <span>Governance &amp; Ledgers</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Transparent finance. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
              Automated institutional audits.
            </span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminate reconciliation delays with automated fee invoice generation, instant payment logging, and verified digital transaction receipts for every student.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {[
              'Real-time balance tracking across total fees, paid amounts, and dues',
              'Verified digital PDF receipts with institutional transaction identifiers',
              'Administrator fee accounting ledger with search and department filtering',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-teal-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

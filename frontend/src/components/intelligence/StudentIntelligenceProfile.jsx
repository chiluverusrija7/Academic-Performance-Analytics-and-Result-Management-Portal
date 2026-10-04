import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Brain,
  Layers,
  ShieldCheck,
  Sliders,
  CheckSquare,
  Search,
  Activity,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../../services/api';
import { ShapAttributionChart } from './ShapAttributionChart';
import { ConformalUncertaintyCard } from './ConformalUncertaintyCard';
import { WhatIfSimulator } from './WhatIfSimulator';
import { PrescriptiveActionPlan } from './PrescriptiveActionPlan';
import { AttendancePerformanceScatter } from './AttendancePerformanceScatter';

export function StudentIntelligenceProfile({ initialStudentId = 'STU0016' }) {
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [checkpoint, setCheckpoint] = useState('W12');
  const [alpha, setAlpha] = useState(0.10);
  const [searchQuery, setSearchQuery] = useState('');

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      setSearchQuery(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.getIntelligenceStudents(100);
        if (res.success && res.students) {
          setStudentList(res.students);
        } else if (Array.isArray(res)) {
          setStudentList(res);
        }
      } catch (err) {
        setStudentList([
          { student_id: 'STU0016', full_name: 'Ananya Sharma', dept_name: 'AIML', current_semester: 2 },
          { student_id: 'STU0001', full_name: 'Rahul Verma', dept_name: 'CSE', current_semester: 4 },
          { student_id: 'STU0042', full_name: 'Karthik Rao', dept_name: 'ECE', current_semester: 3 },
          { student_id: 'STU0105', full_name: 'Priya Nair', dept_name: 'MECH', current_semester: 2 },
        ]);
      }
    }
    loadStudents();
  }, []);

  useEffect(() => {
    async function fetchStudentAnalysis() {
      if (!selectedStudentId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.analyzeStudent(selectedStudentId, checkpoint, null, alpha);
        if (res.success && res.analysis) {
          setAnalysisData(res.analysis);
        } else if (res.prediction) {
          setAnalysisData(res);
        } else {
          setAnalysisData(res);
        }
      } catch (err) {
        setError(`Unable to run analysis for ${selectedStudentId}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentAnalysis();
  }, [selectedStudentId, checkpoint, alpha]);

  const prediction = analysisData?.prediction || {};
  const uncertainty = analysisData?.uncertainty || {};
  const explainability = analysisData?.explainability || {};
  const counterfactual = analysisData?.counterfactual || {};
  const actions = analysisData?.prescriptive_actions || [];
  const provenance = analysisData?.data_provenance || 'Operational PostgreSQL Record';

  const riskProb = prediction.risk_probability != null ? prediction.risk_probability : 0.784;
  const riskPct = prediction.risk_percentage != null ? prediction.risk_percentage : Number((riskProb * 100).toFixed(1));
  const riskCategory = prediction.predicted_risk || analysisData?.risk_level || (riskProb > 0.6 ? 'HIGH' : riskProb > 0.3 ? 'MEDIUM' : 'LOW');

  // W4 -> W8 -> W12 Temporal Milestone Trajectory
  const milestoneTrendData = [
    { checkpoint: 'Week 4 (Initial)', attendance: 78, internalMarks: 64, riskProb: 34.2, lowScoringCount: 1 },
    { checkpoint: 'Week 8 (Mid-Term)', attendance: 71, internalMarks: 48, riskProb: 62.5, lowScoringCount: 2 },
    { checkpoint: 'Week 12 (Pre-Final)', attendance: 64, internalMarks: 42, riskProb: riskPct, lowScoringCount: 3 },
  ];

  const [searchOpen, setSearchOpen] = useState(false);

  const filteredStudents = studentList.filter((s) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    const id = (s.student_id || '').toLowerCase();
    const name = (s.full_name || s.name || '').toLowerCase();
    const roll = (s.roll_no || '').toLowerCase();
    const dept = (s.dept_name || s.dept_code || '').toLowerCase();
    return id.includes(q) || name.includes(q) || roll.includes(q) || dept.includes(q);
  }).slice(0, 8);

  const handleSelectStudent = (idOrQuery) => {
    if (!idOrQuery) return;
    const q = String(idOrQuery).trim();
    
    // Check if query matches a student in list
    const found = studentList.find(s => 
      s.student_id?.toLowerCase() === q.toLowerCase() ||
      s.roll_no?.toLowerCase() === q.toLowerCase() ||
      s.full_name?.toLowerCase().includes(q.toLowerCase())
    );

    let resolvedId = found ? found.student_id : q;
    
    // Normalize roll numbers like 23CSE001 -> STU0001 if needed
    if (resolvedId.toLowerCase().startsWith('23cse') || resolvedId.toLowerCase().startsWith('23ece')) {
      const match = resolvedId.match(/\d+$/);
      if (match) {
        resolvedId = `STU${parseInt(match[0], 10).toString().padStart(4, '0')}`;
      }
    } else if (/^\d+$/.test(resolvedId)) {
      resolvedId = `STU${parseInt(resolvedId, 10).toString().padStart(4, '0')}`;
    }

    setSelectedStudentId(resolvedId);
    setSearchQuery(resolvedId);
    setSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Student Selector Bar ───────────────────────────────── */}
      <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-4 md:p-5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30">
        {/* Search with Live Dropdown & Dedicated Search Button */}
        <div className="flex-1 min-w-0 max-w-md relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Student (e.g. STU0016, 23CSE001, Ananya)..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelectStudent(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSelectStudent(searchQuery)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 shrink-0"
            >
              <Search size={13} />
              <span>Search</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchOpen && filteredStudents.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e1322] border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              <div className="p-1.5 space-y-1">
                {filteredStudents.map((s) => (
                  <button
                    key={s.student_id}
                    type="button"
                    onClick={() => handleSelectStudent(s.student_id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-purple-600/20 border border-transparent hover:border-purple-500/30 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-white flex items-center gap-2">
                        <span>{s.student_id}</span>
                        {s.roll_no && <span className="text-[10px] text-purple-300">({s.roll_no})</span>}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.full_name || s.name || 'Student Observation'} • {s.dept_name || s.dept_code || 'Dept'}
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-400 font-mono">Select →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Student Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 font-mono mr-1">Demo Students:</span>
          {['STU0016', 'STU0001', 'STU0042', 'STU0105'].map((id) => (
            <button
              key={id}
              onClick={() => handleSelectStudent(id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                selectedStudentId === id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        {/* Checkpoint Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-mono">
          {['W4', 'W8', 'W12'].map((cp) => (
            <button
              key={cp}
              onClick={() => setCheckpoint(cp)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                checkpoint === cp
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cp} ({cp === 'W4' ? 'Initial' : cp === 'W8' ? 'Mid' : 'Pre-Final'})
            </button>
          ))}
        </div>
      </div>

      {/* ─── Student Profile & Radial Risk Visual Panel ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Radial Risk Score & Context */}
        <div className="lg:col-span-4 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {provenance}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Checkpoint: <strong className="text-blue-400">{checkpoint}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                {selectedStudentId.substring(0, 3)}
              </div>
              <div>
                <h2 className="text-base font-black text-white font-mono">{selectedStudentId}</h2>
                <p className="text-xs text-slate-400">
                  {analysisData?.department || 'AIML (Computer Science & AI)'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Semester {analysisData?.semester_no || 2} • Course: B.Tech
                </p>
              </div>
            </div>
          </div>

          {/* Large Radial Risk Gauge */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">
              Early Academic Risk Score
            </span>

            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className={
                    riskCategory === 'HIGH'
                      ? 'stroke-red-500'
                      : riskCategory === 'MEDIUM'
                      ? 'stroke-amber-500'
                      : 'stroke-emerald-500'
                  }
                  strokeWidth="10"
                  strokeDasharray="364.4"
                  strokeDashoffset={364.4 - (364.4 * (riskPct / 100))}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono">{riskPct}%</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                    riskCategory === 'HIGH'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : riskCategory === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {riskCategory} RISK
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              {riskCategory === 'HIGH'
                ? 'High probability of end-semester failure or academic backlog.'
                : riskCategory === 'MEDIUM'
                ? 'Moderate vulnerability. Early counseling recommended.'
                : 'Low probability of risk. Academic progress on track.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-500 block font-mono">Decision Threshold</span>
              <span className="font-mono font-bold text-slate-200">40.0% (Risk if p &gt; 0.40)</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-500 block font-mono">Model Engine</span>
              <span className="font-mono font-bold text-purple-300">XGBoost Champion</span>
            </div>
          </div>
        </div>

        {/* Right 8 cols: W4 -> W8 -> W12 Temporal Timeline Chart */}
        <div className="lg:col-span-8 bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                W4 → W8 → W12 In-Semester Numerical Progression Timeline
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Milestone Trend
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={milestoneTrendData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <XAxis dataKey="checkpoint" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="riskProb" name="Predicted Risk (%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="attendance" name="Attendance (%)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="internalMarks" name="Internal Marks Avg (%)" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Risk probability increased as Mid-1 assessment (48%) and Mid-2 (42%) signals were observed.</span>
            <span className="font-mono text-purple-300">Phase 2 Model Output</span>
          </div>
        </div>
      </div>

      {/* ─── Visual Analytics Row 2: Attendance Scatter + SHAP Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AttendancePerformanceScatter
            currentStudentAttendance={64.0}
            currentStudentMarks={42.0}
            studentId={selectedStudentId}
          />
        </div>
        <div className="lg:col-span-6">
          <ShapAttributionChart explainability={explainability} />
        </div>
      </div>

      {/* ─── Visual Analytics Row 3: Conformal Set + What-If Simulator */}
      <div className="space-y-6">
        <ConformalUncertaintyCard
          uncertainty={uncertainty}
          alpha={alpha}
          onAlphaChange={setAlpha}
        />

        <WhatIfSimulator
          studentId={selectedStudentId}
          semesterNo={analysisData?.semester_no || 2}
          checkpoint={checkpoint}
          baselineProbability={riskProb}
          baselineCategory={riskCategory}
          recommendedAction={counterfactual?.best_action}
        />

        <PrescriptiveActionPlan actions={actions} />
      </div>
    </div>
  );
}
